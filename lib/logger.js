export function logRequest(req) {
  if (typeof global._reqLog === 'undefined') global._reqLog = []
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'
  global._reqLog.unshift({ method: req.method, url: req.url, ip, time: new Date().toISOString() })
  if (global._reqLog.length > 200) global._reqLog.pop()
}
