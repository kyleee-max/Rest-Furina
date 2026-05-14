import { logRequest } from '../../../lib/logger'
import axios from 'axios'

export default async function handler(req, res) {
  logRequest(req)

  const { url } = req.query
  if (!url) return res.status(400).json({ success: false, message: 'Parameter url (URL gambar/screenshot anime) wajib diisi.' })

  try {
    const { data } = await axios.get(`https://api.trace.moe/search?url=${encodeURIComponent(url)}&anilistInfo`, {
      timeout: 15000,
    })

    if (!data?.result?.length) {
      return res.status(404).json({ success: false, message: 'Anime tidak ditemukan dari gambar ini.' })
    }

    const results = data.result.slice(0, 5).map(r => ({
      anilistId: r.anilist?.id || null,
      title: {
        romaji: r.anilist?.title?.romaji || null,
        english: r.anilist?.title?.english || null,
        native: r.anilist?.title?.native || null,
      },
      episode: r.episode || null,
      timestamp: {
        from: r.from ? formatTime(r.from) : null,
        to: r.to ? formatTime(r.to) : null,
      },
      similarity: r.similarity ? `${(r.similarity * 100).toFixed(1)}%` : null,
      isAdult: r.anilist?.isAdult || false,
      preview: {
        image: r.image || null,
        video: r.video || null,
      },
    }))

    return res.status(200).json({
      success: true,
      frameCount: data.frameCount || null,
      total: results.length,
      data: results,
    })
  } catch (err) {
    if (err.response?.status === 429) {
      return res.status(429).json({ success: false, message: 'Rate limit trace.moe, coba lagi beberapa detik.' })
    }
    if (err.response?.status === 400) {
      return res.status(400).json({ success: false, message: 'URL gambar tidak valid atau tidak bisa diakses.' })
    }
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message })
  }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}
