import { logRequest } from '../../../lib/logger'
import axios from 'axios'
import FormData from 'form-data'

export default async function handler(req, res) {
  logRequest(req)

  const { url } = req.query
  if (!url) return res.status(400).json({ success: false, message: 'Parameter url wajib diisi. Masukkan URL gambar.' })

  try {
    // Step 1 — Ambil token & taskId dari iloveimg
    const html = await axios.get('https://www.iloveimg.com/remove-background', {
      headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' }
    })
    const token = html.data.match(/"token":"([^"]+)"/)?.[1]
    const task = html.data.match(/taskId\s*=\s*'([^']+)'/)?.[1]

    if (!token || !task) {
      return res.status(500).json({ success: false, message: 'Gagal ambil token dari server.' })
    }

    // Step 2 — Download gambar dari URL
    const imgRes = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })
    const imageBuffer = Buffer.from(imgRes.data)
    const filename = url.split('/').pop().split('?')[0] || 'image.jpg'

    // Step 3 — Upload gambar ke iloveimg
    const up = new FormData()
    up.append('name', filename)
    up.append('chunk', '0')
    up.append('chunks', '1')
    up.append('task', task)
    up.append('preview', '1')
    up.append('pdfinfo', '0')
    up.append('pdfforms', '0')
    up.append('pdfresetforms', '0')
    up.append('v', 'web.0')
    up.append('file', imageBuffer, { filename, contentType: 'image/jpeg' })

    const upload = await axios.post('https://api5g.iloveimg.com/v1/upload', up, {
      headers: {
        ...up.getHeaders(),
        Authorization: `Bearer ${token}`,
        origin: 'https://www.iloveimg.com',
        referer: 'https://www.iloveimg.com/',
      }
    })

    // Step 4 — Proses remove background
    const proses = await axios.post(
      'https://api5g.iloveimg.com/v1/removebackground',
      new URLSearchParams({ task, server_filename: upload.data.server_filename }).toString(),
      {
        responseType: 'arraybuffer',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          origin: 'https://www.iloveimg.com',
          referer: 'https://www.iloveimg.com/',
        }
      }
    )

    // Step 5 — Upload hasil ke uguu.se buat dapet URL
    const ug = new FormData()
    ug.append('files[]', Buffer.from(proses.data), { filename: 'output.png', contentType: 'image/png' })

    const uguu = await axios.post('https://uguu.se/upload', ug, {
      headers: { ...ug.getHeaders() }
    })

    const resultUrl = uguu.data.files?.[0]?.url
    if (!resultUrl) return res.status(500).json({ success: false, message: 'Gagal upload hasil ke server.' })

    return res.status(200).json({
      success: true,
      data: {
        original: url,
        result: resultUrl,
        note: 'File tersedia selama 24 jam di uguu.se',
      },
    })

  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error: ' + err.message })
  }
}
