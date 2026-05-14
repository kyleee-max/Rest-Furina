import { logRequest } from '../../../lib/logger'
import axios from 'axios'

export default async function handler(req, res) {
  logRequest(req)

  const { url } = req.query
  if (!url) return res.status(400).json({ success: false, message: 'Parameter url wajib diisi.' })

  try {
    // Ambil client_id dari SoundCloud
    const scPage = await axios.get('https://soundcloud.com', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 10000,
    })

    const scriptUrls = [...scPage.data.matchAll(/src="(https:\/\/a-v2\.sndcdn\.com\/assets\/[^"]+\.js)"/g)].map(m => m[1])
    let clientId = null

    for (const scriptUrl of scriptUrls.slice(-3)) {
      const script = await axios.get(scriptUrl, { timeout: 8000 }).catch(() => ({ data: '' }))
      const match = script.data.match(/client_id:"([a-zA-Z0-9]+)"/)
      if (match) { clientId = match[1]; break }
    }

    if (!clientId) throw new Error('Gagal ambil client_id SoundCloud.')

    // Resolve track info
    const resolveRes = await axios.get('https://api-v2.soundcloud.com/resolve', {
      params: { url, client_id: clientId },
      timeout: 15000,
    })

    const track = resolveRes.data
    if (track.kind !== 'track') throw new Error('URL bukan track SoundCloud.')

    // Ambil stream URL
    const transcoding = track.media?.transcodings?.find(t => t.format?.protocol === 'progressive')
    if (!transcoding) throw new Error('Stream tidak tersedia.')

    const streamRes = await axios.get(transcoding.url, {
      params: { client_id: clientId },
      timeout: 10000,
    })

    return res.status(200).json({
      success: true,
      data: {
        title: track.title,
        author: track.user?.username || '-',
        thumbnail: track.artwork_url?.replace('large', 't500x500') || null,
        duration: Math.floor(track.duration / 1000),
        playCount: track.playback_count,
        likeCount: track.likes_count,
        medias: [{ quality: 'Audio MP3', url: streamRes.data.url, type: 'audio' }],
      },
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}
