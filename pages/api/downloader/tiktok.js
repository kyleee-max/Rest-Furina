import { logRequest } from '../../../lib/logger'
import axios from 'axios'

export default async function handler(req, res) {
  logRequest(req)

  const { url } = req.query
  if (!url) return res.status(400).json({ success: false, message: 'Parameter url wajib diisi.' })

  try {
    const response = await axios.post('https://www.tikwm.com/api/', { url, hd: 1 })
    const data = response.data

    if (!data || data.code !== 0) {
      return res.status(400).json({ success: false, message: 'Gagal mengambil video. Pastikan URL valid.' })
    }

    const v = data.data
    return res.status(200).json({
      success: true,
      data: {
        id: v.id,
        title: v.title,
        author: { username: v.author?.unique_id, nickname: v.author?.nickname, avatar: v.author?.avatarThumb },
        video: { noWatermark: v.play, withWatermark: v.wmplay, hd: v.hdplay },
        audio: v.music,
        thumbnail: v.cover,
        duration: v.duration,
        stats: { likes: v.digg_count, comments: v.comment_count, shares: v.share_count, views: v.play_count },
      },
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message })
  }
}
