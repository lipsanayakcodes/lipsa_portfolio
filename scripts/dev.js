// Kills any process on PORT (default 3001) then starts the server.
// Run via: npm run dev
import { execSync, spawn } from 'node:child_process'

const PORT = process.env.PORT || 3001

try {
  const out = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8' })
  const pids = new Set()
  for (const line of out.split('\n')) {
    const parts = line.trim().split(/\s+/)
    const pid = parts[parts.length - 1]
    if (pid && /^\d+$/.test(pid) && pid !== '0') pids.add(pid)
  }
  for (const pid of pids) {
    try {
      execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' })
      console.log(`Killed stale process PID ${pid} on port ${PORT}.`)
    } catch {}
  }
} catch {
  // netstat found nothing — port is free, continue
}

const child = spawn('node', ['server/index.js'], {
  stdio: 'inherit',
  shell: false,
})

child.on('exit', code => process.exit(code ?? 0))
process.on('SIGINT',  () => child.kill('SIGINT'))
process.on('SIGTERM', () => child.kill('SIGTERM'))
