import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'

const execAsync = promisify(exec)
const PM2_APP = 'yorutech-api'
const ROOT = process.cwd()

function auth(req, res) {
  const token = req.headers['x-admin-token']
  if (token !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ ok: false, message: 'Unauthorized' })
    return false
  }
  return true
}

function walk(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  let files = []
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name
    if (e.isDirectory()) files = files.concat(walk(path.join(dir, e.name), rel))
    else files.push(rel)
  }
  return files
}

export default async function handler(req, res) {
  if (!auth(req, res)) return
  const { action } = req.query

  if (action === 'list') {
    const files = walk(path.join(ROOT, 'pages'))
    return res.json({ ok: true, files })
  }

  if (action === 'read') {
    const { file } = req.query
    const full = path.resolve(ROOT, 'pages', file)
    if (!full.startsWith(path.join(ROOT, 'pages'))) return res.status(400).json({ ok: false })
    const content = fs.readFileSync(full, 'utf8')
    return res.json({ ok: true, content })
  }

  if (action === 'save' && req.method === 'POST') {
    const { file, content } = req.body
    const full = path.resolve(ROOT, 'pages', file)
    if (!full.startsWith(path.join(ROOT, 'pages'))) return res.status(400).json({ ok: false })
    fs.writeFileSync(full, content, 'utf8')
    return res.json({ ok: true })
  }

  if (action === 'build') {
    try {
      const { stdout, stderr } = await execAsync('npm run build', { cwd: ROOT, timeout: 120000 })
      return res.json({ ok: true, output: stdout + stderr })
    } catch (e) {
      return res.json({ ok: false, output: (e.stdout || '') + (e.stderr || '') })
    }
  }

  if (action === 'stop') {
    try {
      const { stdout } = await execAsync(`pm2 stop ${PM2_APP}`)
      return res.json({ ok: true, output: stdout })
    } catch (e) {
      return res.json({ ok: false, output: e.message })
    }
  }

  if (action === 'start') {
    try {
      const { stdout } = await execAsync(`pm2 start ${PM2_APP}`)
      return res.json({ ok: true, output: stdout })
    } catch (e) {
      return res.json({ ok: false, output: e.message })
    }
  }

  if (action === 'logs') {
    return res.json({ ok: true, logs: global._reqLog || [] })
  }

  if (action === 'backup') {
    const archiver = (await import('archiver')).default
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename=backup-${Date.now()}.zip`)
    const archive = archiver('zip', { zlib: { level: 9 } })
    archive.pipe(res)
    archive.directory(path.join(ROOT, 'pages', 'api'), 'api')
    archive.directory(path.join(ROOT, 'config'), 'config')
    await archive.finalize()
    return
  }

  return res.status(400).json({ ok: false, message: 'Unknown action' })
}

export const config = { api: { bodyParser: { sizeLimit: '2mb' } } }
