import axios from 'axios'

// creator: KaelTzy

const fx = n => Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' }).format(n || 0) + ` (${n || 0})`

const rel = (timestamp) => {
  if (!timestamp || timestamp === 0) return '-'
  const diff = Date.now() - (timestamp * 1000)
  const sec = Math.floor(diff / 1000), min = Math.floor(sec / 60),
        hour = Math.floor(min / 60), day = Math.floor(hour / 24)
  if (day > 0) return `${day} hari lalu`
  if (hour > 0) return `${hour} jam lalu`
  if (min > 0) return `${min} menit lalu`
  return 'Baru saja'
}

export default async function handler(req, res) {
  const { username } = req.query
  if (!username) return res.status(400).json({ success: false, creator: 'KaelTzy', message: 'Parameter username wajib diisi.' })

  try {
    const response = await axios.get(`https://www.tikwm.com/api/user/info?unique_id=${username}`)
    if (response.data.code !== 0) {
      return res.status(400).json({ success: false, creator: 'KaelTzy', message: response.data.msg || 'Username tidak ditemukan.' })
    }

    const { user: u, stats } = response.data.data

    return res.status(200).json({
      success: true,
      creator: 'KaelTzy',
      data: {
        id: u.id,
        nickname: u.nickname || '-',
        username: u.uniqueId,
        bio: u.signature || '-',
        instagram: u.ins_id || '-',
        avatar: {
          thumb: u.avatarThumb,
          medium: u.avatarMedium,
          large: u.avatarLarger,
        },
        stats: {
          followers: fx(stats.followerCount),
          following: fx(stats.followingCount),
          likes: fx(stats.heart),
          videos: fx(stats.videoCount),
        },
        verified: u.verified,
        private: u.secret,
        createdAt: rel(u.createTime),
      },
    })
  } catch (err) {
    return res.status(500).json({ success: false, creator: 'KaelTzy', message: 'Server error: ' + err.message })
  }
}
