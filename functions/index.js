import { onRequest } from 'firebase-functions/v2/https'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { timingSafeEqual, randomBytes, createHmac } from 'node:crypto'

// ---------- paths ----------
// Cloud Functions only have a writable filesystem at /tmp
const dataDir = '/tmp/portfolio-data'
const dataFile = resolve(dataDir, 'content.json')

// defaultContent bundled alongside the function
const { DEFAULT_CONTENT } = await import('./defaultContent.js')

// ---------- env ----------
// These are set via functions/.env.lipsa-portfolio (Firebase env file, not Secret Manager)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''
const SESSION_SECRET = process.env.SESSION_SECRET || randomBytes(48).toString('base64url')

// ---------- in-memory state (survives warm instances) ----------
const sessions = new Map()
const loginAttempts = new Map()
const SESSION_TTL = 8 * 60 * 60 * 1000
const MAX_BODY = 1024 * 1024

// ---------- helpers ----------
function safeEqual(left, right) {
  const a = Buffer.from(String(left))
  const b = Buffer.from(String(right))
  return a.length === b.length && timingSafeEqual(a, b)
}

function sessionKey(sid) {
  return createHmac('sha256', SESSION_SECRET).update(sid).digest('hex')
}

function sendJson(res, status, payload, extraHeaders = {}) {
  res.status(status).set({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...extraHeaders,
  }).send(JSON.stringify(payload))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    try {
      const raw = req.rawBody
      if (!raw || raw.length === 0) return resolve({})
      if (raw.length > MAX_BODY) return reject(Object.assign(new Error('Request is too large'), { status: 413 }))
      resolve(JSON.parse(raw.toString('utf8')))
    } catch {
      reject(Object.assign(new Error('Invalid JSON body'), { status: 400 }))
    }
  })
}

function cookieValue(req, key) {
  const pair = (req.headers.cookie || '').split(';').map(p => p.trim()).find(p => p.startsWith(`${key}=`))
  return pair ? decodeURIComponent(pair.slice(key.length + 1)) : ''
}

function currentSession(req) {
  const sid = cookieValue(req, 'portfolio_session')
  const key = sessionKey(sid)
  const session = sessions.get(key)
  if (!session || session.expiresAt < Date.now()) { sessions.delete(key); return null }
  session.expiresAt = Date.now() + SESSION_TTL
  return { sid, session }
}

function checkOrigin(req) {
  if (!req.headers.origin) return true
  try {
    const origin = new URL(req.headers.origin)
    return origin.host === req.headers.host
  } catch { return false }
}

// ---------- content schema ----------
const schemas = {
  skills: { required: ['name'], fields: { name: 'text', icon: 'icon', color: 'color', pct: 'number', desc: 'text' } },
  education: { required: ['degree', 'school'], fields: { icon: 'text', label: 'text', degree: 'text', school: 'text', location: 'text', year: 'text', desc: 'text', tags: 'list' } },
  experience: { required: ['company', 'role'], fields: { logo: 'path', logoFallback: 'text', company: 'text', companyDesc: 'text', role: 'text', period: 'text', type: 'text', desc: 'text', highlights: 'list', tags: 'list' } },
}

function validateContent(value) {
  if (!value || typeof value !== 'object') throw Object.assign(new Error('Invalid content'), { status: 400 })
  const result = {}
  for (const [section, schema] of Object.entries(schemas)) {
    if (!Array.isArray(value[section]) || value[section].length > 100)
      throw Object.assign(new Error(`Invalid ${section} list`), { status: 400 })
    result[section] = value[section].map((item, index) => {
      if (!item || typeof item !== 'object' || Array.isArray(item))
        throw Object.assign(new Error(`Invalid ${section} item ${index + 1}`), { status: 400 })
      const clean = {}
      for (const [field, type] of Object.entries(schema.fields)) {
        const input = item[field]
        if (input === undefined || input === null) {
          clean[field] = type === 'number' ? 0 : type === 'list' ? [] : ''
          continue
        }
        if (type === 'number') {
          const number = Number(input)
          if (!Number.isFinite(number) || number < 0 || number > 100)
            throw Object.assign(new Error(`Invalid ${field} value`), { status: 400 })
          clean[field] = Math.round(number)
        } else if (type === 'list') {
          if (!Array.isArray(input) || input.length > 50 || input.some(e => typeof e !== 'string'))
            throw Object.assign(new Error(`Invalid ${field} list`), { status: 400 })
          clean[field] = input.map(e => e.trim().slice(0, 300)).filter(Boolean)
        } else {
          if (typeof input !== 'string' || input.length > 1200)
            throw Object.assign(new Error(`Invalid ${field} value`), { status: 400 })
          const text = input.trim()
          if (type === 'icon' && text && !/^[a-z0-9 -]+$/i.test(text))
            throw Object.assign(new Error('Icon may contain only letters, numbers, spaces, and hyphens'), { status: 400 })
          if (type === 'color' && text && !/^#[0-9a-f]{3,8}$/i.test(text))
            throw Object.assign(new Error('Use a hex color such as #6c63ff'), { status: 400 })
          if (type === 'path' && text && !(text.startsWith('/') && !text.startsWith('//')))
            throw Object.assign(new Error('Logo must be a site path beginning with /'), { status: 400 })
          clean[field] = text
        }
      }
      for (const required of schema.required) {
        if (!clean[required]) throw Object.assign(new Error(`${required} is required`), { status: 400 })
      }
      return clean
    })
  }
  return result
}

async function loadContent() {
  await mkdir(dataDir, { recursive: true })
  try {
    return JSON.parse(await readFile(dataFile, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    await writeFile(dataFile, `${JSON.stringify(DEFAULT_CONTENT, null, 2)}\n`, { flag: 'wx' })
    return structuredClone(DEFAULT_CONTENT)
  }
}

// ---------- Cloud Function ----------
export const api = onRequest(
  {
    region: 'us-central1',
    invoker: 'public',
    cors: false,
  },
  async (req, res) => {
    const url = new URL(req.url, `https://${req.headers.host}`)

    if (!url.pathname.startsWith('/api/')) {
      return sendJson(res, 404, { error: 'Not found' })
    }

    if (!checkOrigin(req)) return sendJson(res, 403, { error: 'Origin not allowed' })

    try {
      if (url.pathname === '/api/content' && req.method === 'GET') {
        return sendJson(res, 200, await loadContent())
      }

      if (url.pathname === '/api/session' && req.method === 'GET') {
        return sendJson(res, 200, { authenticated: Boolean(currentSession(req)) })
      }

      if (url.pathname === '/api/login' && req.method === 'POST') {
        const ip = req.ip || 'unknown'
        const attempts = loginAttempts.get(ip) || { count: 0, started: Date.now() }
        if (Date.now() - attempts.started > 15 * 60 * 1000) { attempts.count = 0; attempts.started = Date.now() }
        if (attempts.count >= 10) return sendJson(res, 429, { error: 'Too many login attempts. Try again in 15 minutes.' })
        const body = await readBody(req)
        if (!safeEqual(body.username || '', ADMIN_USERNAME) || !safeEqual(body.password || '', ADMIN_PASSWORD)) {
          attempts.count += 1
          loginAttempts.set(ip, attempts)
          return sendJson(res, 401, { error: 'Incorrect username or password' })
        }
        loginAttempts.delete(ip)
        const sid = randomBytes(32).toString('base64url')
        sessions.set(sessionKey(sid), { expiresAt: Date.now() + SESSION_TTL })
        return sendJson(res, 200, { authenticated: true }, {
          'Set-Cookie': `portfolio_session=${sid}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL / 1000}; Secure`,
        })
      }

      if (url.pathname === '/api/logout' && req.method === 'POST') {
        const sid = cookieValue(req, 'portfolio_session')
        sessions.delete(sessionKey(sid))
        return sendJson(res, 200, { authenticated: false }, {
          'Set-Cookie': 'portfolio_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0',
        })
      }

      if (url.pathname === '/api/content' && req.method === 'PUT') {
        if (!currentSession(req)) return sendJson(res, 401, { error: 'Please log in again' })
        const content = validateContent(await readBody(req))
        const { rename } = await import('node:fs/promises')
        await writeFile(`${dataFile}.tmp`, `${JSON.stringify(content, null, 2)}\n`)
        await rename(`${dataFile}.tmp`, dataFile)
        return sendJson(res, 200, content)
      }

      return sendJson(res, 404, { error: 'Not found' })
    } catch (error) {
      if (!res.headersSent) sendJson(res, error.status || 500, { error: error.status ? error.message : 'Server error' })
      if (!error.status) console.error(error)
    }
  }
)
