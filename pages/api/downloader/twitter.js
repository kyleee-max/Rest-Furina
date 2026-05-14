import { logRequest } from '../../../lib/logger'
import axios from 'axios'

export default async function handler(req, res) {
  logRequest(req)

  const { url } = req.query
  if (!url) return res.status(400).json({ success: false, message: 'Parameter url wajib diisi.' })

  try {
    // Normalize URL x.com → twitter.com
    const normalized = url.replace('x.com', 'twitter.com')

    const { data } = await axios.get(`https://api.twitterdown.net/api?url=${encodeURIComponent(normalized)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 15000,
    })

    if (!data?.medias?.length) {
      // Fallback: twitsave
      const res2 = await axios.get(`https://twitsave.com/info?url=${encodeURIComponent(normalized)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 15000,
      })

      const videos = []
      const matches = res2.data.matchAll(/href="(https:\/\/video\.twimg\.com[^"]+)"/g)
      for (const m of matches) videos.push(m[1])

      if (!videos.length) throw new Error('Video tidak ditemukan.')

      const title = res2.data.match(/<title>([^<]+)<\/title>/)?.[1] || 'Twitter/X Video'

      return res.status(200).json({
        success: true,
        data: {
          title,
          medias: videos.map((v, i) => ({ quality: i === 0 ? 'HD' : 'SD', url: v, type: 'video' })),
        },
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        title: data.title || 'Twitter/X Video',
        thumbnail: data.thumbnail || null,
        medias: data.medias.map(m => ({ quality: m.quality || 'Video', url: m.url, type: 'video' })),
      },
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}
