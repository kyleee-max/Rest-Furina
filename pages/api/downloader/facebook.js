import { logRequest } from '../../../lib/logger'
import axios from 'axios'

export default async function handler(req, res) {
  logRequest(req)

  const { url } = req.query
  if (!url) return res.status(400).json({ success: false, message: 'Parameter url wajib diisi.' })

  try {
    const { data } = await axios.get(`https://api.fbdown.net/api?url=${encodeURIComponent(url)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 15000,
    })

    if (!data?.links) throw new Error('Gagal fetch video Facebook')

    return res.status(200).json({
      success: true,
      data: {
        title: data.title || 'Facebook Video',
        thumbnail: data.thumbnail || null,
        medias: [
          data.links.hd && { quality: 'HD', url: data.links.hd, type: 'video' },
          data.links.sd && { quality: 'SD', url: data.links.sd, type: 'video' },
        ].filter(Boolean),
      },
    })
  } catch (err) {
    // Fallback scrape manual
    try {
      const res2 = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 15000,
      })

      const hdUrl = res2.data.match(/"hd_src_no_ratelimit":"([^"]+)"/)?.[1]?.replace(/\\u0025/g, '%').replace(/\\/g, '')
      const sdUrl = res2.data.match(/"sd_src_no_ratelimit":"([^"]+)"/)?.[1]?.replace(/\\u0025/g, '%').replace(/\\/g, '')
      const title = res2.data.match(/<title>([^<]+)<\/title>/)?.[1] || 'Facebook Video'

      if (!hdUrl && !sdUrl) throw new Error('Video tidak ditemukan atau private.')

      return res.status(200).json({
        success: true,
        data: {
          title,
          medias: [
            hdUrl && { quality: 'HD', url: hdUrl, type: 'video' },
            sdUrl && { quality: 'SD', url: sdUrl, type: 'video' },
          ].filter(Boolean),
        },
      })
    } catch (e) {
      return res.status(500).json({ success: false, message: e.message })
    }
  }
}
