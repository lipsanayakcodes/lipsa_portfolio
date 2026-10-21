import { createServer } from 'node:http'
import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { extname, resolve, sep } from 'node:path'
import { timingSafeEqual, randomBytes, createHmac } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { DEFAULT_CONTENT } from '../src/defaultContent.js'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const dataDir = resolve(root, 'server', 'data')
const dataFile = resolve(dataDir, 'content.json')
const production = process.env.NODE_ENV === 'production'
const sessions = new Map()
const loginAttempts = new Map()
const SESSION_TTL = 8 * 60 * 60 * 1000
const MAX_BODY = 1024 * 1024

function parseEnv(text) {
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (!match || process.env[match[1]]) continue
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
  }
}

async function loadEnvironment() {
  const envFile = resolve(root, '.env')
  try { parseEnv(await readFile(envFile, 'utf8')) } catch {}

  const missingPassword = !process.env.ADMIN_PASSWORD
  const missingSecret = !process.env.SESSION_SECRET
  if (missingPassword || missingSecret) {
    const values = []
    if (!process.env.ADMIN_USERNAME) values.push('ADMIN_USERNAME=admin')
    if (missingPassword) values.push(`ADMIN_PASSWORD=${randomBytes(18).toString('base64url')}`)
    if (missingSecret) values.push(`SESSION_SECRET=${randomBytes(48).toString('base64url')}`)
    await writeFile(envFile, `${values.join('\n')}\n`, { flag: 'a', mode: 0o600 })
    parseEnv(values.join('\n'))
    if (missingPassword) {
      console.log(`\nAdmin account created. Username: ${process.env.ADMIN_USERNAME}\nPassword: ${process.env.ADMIN_PASSWORD}\nSave this password. It is stored in the local .env file.\n`)
    }
  }
  if (!process.env.ADMIN_USERNAME) process.env.ADMIN_USERNAME = 'admin'
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left))
  const b = Buffer.from(String(right))
  return a.length === b.length && timingSafeEqual(a, b)
}

function sessionKey(sid) {
  return createHmac('sha256', process.env.SESSION_SECRET).update(sid).digest('hex')
}

function sendJson(res, status, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload)
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body), 'Cache-Control': 'no-store', ...extraHeaders })
  res.end(body)
}

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    let body = ''
    let size = 0
    let tooLarge = false
    req.on('data', chunk => {
      if (tooLarge) return
      size += chunk.length
      if (size > MAX_BODY) {
        tooLarge = true
        reject(Object.assign(new Error('Request is too large'), { status: 413 }))
        return
      }
      body += chunk
    })
    req.on('end', () => {
      if (tooLarge) return
      try { resolveBody(JSON.parse(body || '{}')) } catch { reject(Object.assign(new Error('Invalid JSON body'), { status: 400 })) }
    })
    req.on('error', reject)
  })
}

function cookieValue(req, key) {
  const pair = (req.headers.cookie || '').split(';').map(part => part.trim()).find(part => part.startsWith(`${key}=`))
  return pair ? decodeURIComponent(pair.slice(key.length + 1)) : ''
}

function currentSession(req) {
  const sid = cookieValue(req, 'portfolio_session')
  const key = sessionKey(sid)
  const session = sessions.get(key)
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(key)
    return null
  }
  session.expiresAt = Date.now() + SESSION_TTL
  return { sid, session }
}

function checkOrigin(req) {
  if (!req.headers.origin) return true
  try {
    const origin = new URL(req.headers.origin)
    // In development allow any localhost origin (port may differ between
    // Vite dev server and the Node API server)
    if (!production && (origin.hostname === 'localhost' || origin.hostname === '127.0.0.1')) return true
    return origin.host === req.headers.host
  } catch {
    return false
  }
}

const schemas = {
  projects: { required: ['name'], fields: { emoji: 'text', bg: 'text', category: 'text', name: 'text', desc: 'text', tags: 'list', github: 'text', demo: 'text' } },
  skills: { required: ['name'], fields: { name: 'text', icon: 'icon', color: 'color', pct: 'number', desc: 'text' } },
  education: { required: ['degree', 'school'], fields: { icon: 'text', label: 'text', degree: 'text', school: 'text', location: 'text', year: 'text', desc: 'text', tags: 'list' } },
  experience: { required: ['company', 'role'], fields: { logo: 'path', logoFallback: 'text', company: 'text', companyDesc: 'text', role: 'text', period: 'text', type: 'text', desc: 'text', highlights: 'list', tags: 'list' } },
}

function validateContent(value) {
  if (!value || typeof value !== 'object') throw Object.assign(new Error('Invalid content'), { status: 400 })
  const result = {}
  for (const [section, schema] of Object.entries(schemas)) {
    if (!Array.isArray(value[section]) || value[section].length > 100) throw Object.assign(new Error(`Invalid ${section} list`), { status: 400 })
    result[section] = value[section].map((item, index) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) throw Object.assign(new Error(`Invalid ${section} item ${index + 1}`), { status: 400 })
      const clean = {}
      for (const [field, type] of Object.entries(schema.fields)) {
        const input = item[field]
        if (input === undefined || input === null) { clean[field] = type === 'number' ? 0 : type === 'list' ? [] : ''; continue }
        if (type === 'number') {
          const number = Number(input)
          if (!Number.isFinite(number) || number < 0 || number > 100) throw Object.assign(new Error(`Invalid ${field} value`), { status: 400 })
          clean[field] = Math.round(number)
        } else if (type === 'list') {
          if (!Array.isArray(input) || input.length > 50 || input.some(entry => typeof entry !== 'string')) throw Object.assign(new Error(`Invalid ${field} list`), { status: 400 })
          clean[field] = input.map(entry => entry.trim().slice(0, 300)).filter(Boolean)
        } else {
          if (typeof input !== 'string' || input.length > 1200) throw Object.assign(new Error(`Invalid ${field} value`), { status: 400 })
          const text = input.trim()
          if (type === 'icon' && text && !/^[a-z0-9 -]+$/i.test(text)) throw Object.assign(new Error('Icon may contain only letters, numbers, spaces, and hyphens'), { status: 400 })
          if (type === 'color' && text && !/^#[0-9a-f]{3,8}$/i.test(text)) throw Object.assign(new Error('Use a hex color such as #6c63ff'), { status: 400 })
          if (type === 'path' && text && !(text.startsWith('/') && !text.startsWith('//'))) throw Object.assign(new Error('Logo must be a site path beginning with /'), { status: 400 })
          clean[field] = text
        }
      }
      for (const field of schema.required) {
        if (!clean[field]) throw Object.assign(new Error(`${field} is required`), { status: 400 })
      }
      return clean
    })
  }
  return result
}

async function loadContent() {
  await mkdir(dataDir, { recursive: true })
  try { return JSON.parse(await readFile(dataFile, 'utf8')) } catch (error) {
    if (error.code !== 'ENOENT') throw error
    await writeFile(dataFile, `${JSON.stringify(DEFAULT_CONTENT, null, 2)}\n`, { flag: 'wx' })
    return structuredClone(DEFAULT_CONTENT)
  }
}

function contentType(file) {
  return ({ '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.pdf': 'application/pdf', '.ico': 'image/x-icon' })[extname(file).toLowerCase()] || 'application/octet-stream'
}

async function serveStatic(req, res, vite) {
  if (vite) {
    vite.middlewares(req, res, error => {
      if (error && !res.headersSent) sendJson(res, 500, { error: 'Development server error' })
      else if (!res.writableEnded && !res.headersSent) sendJson(res, 404, { error: 'Not found' })
    })
    return
  }

  let decoded
  try { decoded = decodeURIComponent(new URL(req.url, 'http://localhost').pathname) } catch {
    return sendJson(res, 400, { error: 'Invalid path' })
  }
  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '')
  const base = resolve(root, 'dist')
  let file = resolve(base, relative)
  if (file !== base && !file.startsWith(`${base}${sep}`)) return sendJson(res, 400, { error: 'Invalid path' })
  try { await access(file) } catch { file = resolve(base, 'index.html') }
  res.writeHead(200, { 'Content-Type': contentType(file), 'Cache-Control': file.endsWith('index.html') ? 'no-cache' : 'public, max-age=3600' })
  createReadStream(file).pipe(res)
}

await loadEnvironment()
await loadContent()
let vite = null
if (!production) {
  const { createServer: createViteServer } = await import('vite')
  vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' })
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  if (!url.pathname.startsWith('/api/')) {
    if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { error: 'Method not allowed' })
    return serveStatic(req, res, vite)
  }

  if (!checkOrigin(req)) return sendJson(res, 403, { error: 'Origin not allowed' })

  try {
    if (url.pathname === '/api/content' && req.method === 'GET') return sendJson(res, 200, await loadContent(), { 'Cache-Control': 'no-store' })
    if (url.pathname === '/api/session' && req.method === 'GET') return sendJson(res, 200, { authenticated: Boolean(currentSession(req)) })
    if (url.pathname === '/api/login' && req.method === 'POST') {
      const ip = req.socket.remoteAddress || 'unknown'
      const attempts = loginAttempts.get(ip) || { count: 0, started: Date.now() }
      if (Date.now() - attempts.started > 15 * 60 * 1000) { attempts.count = 0; attempts.started = Date.now() }
      if (attempts.count >= 10) return sendJson(res, 429, { error: 'Too many login attempts. Try again in 15 minutes.' })
      const body = await readBody(req)
      if (!safeEqual(body.username || '', process.env.ADMIN_USERNAME) || !safeEqual(body.password || '', process.env.ADMIN_PASSWORD)) {
        attempts.count += 1
        loginAttempts.set(ip, attempts)
        return sendJson(res, 401, { error: 'Incorrect username or password' })
      }
      loginAttempts.delete(ip)
      const sid = randomBytes(32).toString('base64url')
      sessions.set(sessionKey(sid), { expiresAt: Date.now() + SESSION_TTL })
      const secure = production ? '; Secure' : ''
      return sendJson(res, 200, { authenticated: true }, { 'Set-Cookie': `portfolio_session=${sid}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL / 1000}${secure}` })
    }
    if (url.pathname === '/api/logout' && req.method === 'POST') {
      const sid = cookieValue(req, 'portfolio_session')
      sessions.delete(sessionKey(sid))
      return sendJson(res, 200, { authenticated: false }, { 'Set-Cookie': 'portfolio_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' })
    }
    if (url.pathname === '/api/content' && req.method === 'PUT') {
      if (!currentSession(req)) return sendJson(res, 401, { error: 'Please log in again' })
      const content = validateContent(await readBody(req))
      await writeFile(`${dataFile}.tmp`, `${JSON.stringify(content, null, 2)}\n`)
      const { rename } = await import('node:fs/promises')
      await rename(`${dataFile}.tmp`, dataFile)
      return sendJson(res, 200, content)
    }
    return sendJson(res, 404, { error: 'Not found' })
  } catch (error) {
    if (!res.headersSent) sendJson(res, error.status || 500, { error: error.status ? error.message : 'Server error' })
    if (!error.status) console.error(error)
  }
})

const requestedPort = Number(process.env.PORT || 3001)
const fixedPort = Boolean(process.env.PORT)
function listen(port) {
  server.once('error', error => {
    if (error.code === 'EADDRINUSE' && !fixedPort && port < requestedPort + 10) {
      console.warn(`Port ${port} is busy; trying ${port + 1}.`)
      return listen(port + 1)
    }
    console.error(`Could not start the portfolio server on port ${port}: ${error.message}`)
    process.exit(1)
  })
  server.listen(port, '127.0.0.1', () => {
    const actualPort = server.address().port
    console.log(`Portfolio server listening at http://localhost:${actualPort}${production ? '' : ' (development)'}`)
  })
}
listen(requestedPort)

for (const timer of [setInterval(() => {
  const now = Date.now()
  for (const [sid, session] of sessions) if (session.expiresAt < now) sessions.delete(sid)
  for (const [ip, attempt] of loginAttempts) if (now - attempt.started > 15 * 60 * 1000) loginAttempts.delete(ip)
}, 60 * 1000)]) timer.unref()

process.on('SIGINT', async () => { await vite?.close(); server.close(() => process.exit(0)) })
process.on('SIGTERM', async () => { await vite?.close(); server.close(() => process.exit(0)) })
