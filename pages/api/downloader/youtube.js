import { logRequest } from '../../../lib/logger'
import axios from 'axios'

const HEADERS = {
  'origin': 'https://frame.y2meta-uk.com',
  'referer': 'https://frame.y2meta-uk.com/',
  'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36',
  'accept': '*/*',
  'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
}

async function getKey() {
  const { data } = await axios.get('https://cnv.cx/v2/sanity/key', {
    headers: { ...HEADERS, 'content-type': 'application/json' },
    timeout: 10000,
  })
  return data?.key
}

async function getMeta(url) {
  try {
    const { data } = await axios.get(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`, { timeout: 8000 })
    return data
  } catch { return null }
}

export default async function handler(req, res) {
  logRequest(req)

  const { url, format = 'mp4', quality = '720' } = req.query
  if (!url) return res.status(400).json({ success: false, message: 'Parameter url wajib diisi.' })

  try {
    // Step 1 — ambil key fresh tiap request
    const key = await getKey()
    if (!key) throw new Error('Gagal ambil key dari server')

    // Step 2 — convert
    const { data } = await axios.post(
      'https://cnv.cx/v2/converter',
      new URLSearchParams({
        link: url,
        format: format === 'mp3' ? 'mp3' : 'mp4',
        audioBitrate: '320',
        videoQuality: quality,
        filenameStyle: 'pretty',
        vCodec: 'h264',
      }).toString(),
      {
        headers: {
          ...HEADERS,
          'content-type': 'application/x-www-form-urlencoded',
          'key': key,
        },
        timeout: 30000,
      }
    )

    if (!data?.url) throw new Error('Gagal mendapatkan link download')

    // Step 3 — ambil metadata via oembed
    const meta = await getMeta(url)

    return res.status(200).json({
      success: true,
      data: {
        title: meta?.title || data.filename?.replace(/\.[^/.]+$/, '') || 'YouTube Video',
        author: meta?.author_name || '-',
        thumbnail: meta?.thumbnail_url || null,
        filename: data.filename,
        url: data.url,
        format: format === 'mp3' ? 'mp3' : 'mp4',
        mp4: format !== 'mp3' ? data.url : null,
        mp3: format === 'mp3' ? data.url : null,
      },
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, creator: "Kael"})
  }
}
