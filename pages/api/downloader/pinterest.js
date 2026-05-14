import { logRequest } from '../../../lib/logger'
import axios from 'axios'
import qs from 'qs'

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': '*/*',
  'Accept-Language': 'id,en;q=0.9',
  'X-Requested-With': 'XMLHttpRequest',
  'Origin': 'https://ilovepin.net',
  'Referer': 'https://ilovepin.net/id'
}

export default async function handler(req, res) {
  logRequest(req)

  const { url } = req.query
  if (!url) return res.status(400).json({ success: false, message: 'Parameter url wajib diisi.' })

  try {
    // Ambil cookie dulu
    const mainPage = await axios.get('https://ilovepin.net/id', {
      headers: { 'User-Agent': headers['User-Agent'] }
    })
    const rawCookies = mainPage.headers['set-cookie']
    const cookieString = rawCookies ? rawCookies.join('; ') : ''

    // Hit proxy.php
    const { data } = await axios.post('https://ilovepin.net/proxy.php', qs.stringify({ url }), {
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': cookieString
      }
    })

    if (!data.api || data.api.status !== 'OK') {
      return res.status(400).json({ success: false, message: 'Gagal mengambil data.' })
    }

    const api = data.api
    const items = api.mediaItems || []

    const videos = items.filter(i => i.type?.toLowerCase() === 'video')
    const images = items.filter(i => i.type?.toLowerCase() === 'image')

    const media = videos.length > 0
      ? videos.map(v => ({
          type: 'video',
          quality: v.mediaQuality === 'HD' ? 'HD' : `SD (${v.mediaRes})`,
          extension: v.mediaExtension,
          size: v.mediaFileSize,
          url: v.mediaUrl
        }))
      : images.map(img => ({
          type: 'image',
          quality: 'Original',
          extension: img.mediaExtension,
          size: img.mediaFileSize,
          url: img.mediaUrl
        }))

    return res.status(200).json({
      success: true,
      data: {
        title: api.title,
        description: api.description?.trim() || '-',
        type: videos.length > 0 ? 'video' : 'image',
        author: {
          name: api.userInfo?.name,
          username: api.userInfo?.username,
          avatar: api.userInfo?.userAvatar
        },
        stats: {
          likes: api.mediaStats?.likesCount,
          shares: api.mediaStats?.sharesCount
        },
        media
      }
    })

  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message })
  }
        }
