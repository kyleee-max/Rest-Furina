import { logRequest } from '../../../lib/logger'
import axios from 'axios'

export default async function handler(req, res) {
  logRequest(req)

  const { url } = req.query
  if (!url) return res.status(400).json({ success: false, message: 'Parameter url wajib diisi.' })

  try {
    // Ambil track ID dari URL
    const match = url.match(/track\/([a-zA-Z0-9]+)/)
    if (!match) return res.status(400).json({ success: false, message: 'URL Spotify tidak valid. Gunakan URL track.' })

    const trackId = match[1]

    // Pakai spotifydown API
    const response = await axios.get(`https://api.spotifydown.com/download/${trackId}`, {
      headers: {
        'Origin': 'https://spotifydown.com',
        'Referer': 'https://spotifydown.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    const data = response.data
    if (!data.success) {
      return res.status(400).json({ success: false, message: 'Gagal download. ' + (data.message || '') })
    }

    return res.status(200).json({
      success: true,
      data: {
        title: data.metadata?.title,
        artist: data.metadata?.artists,
        album: data.metadata?.album,
        cover: data.metadata?.cover,
        downloadUrl: data.link,
      },
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message })
  }
}
