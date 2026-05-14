import { logRequest } from '../../../lib/logger'
import axios from 'axios'

export default async function handler(req, res) {
  logRequest(req)

  const { username } = req.query
  if (!username) return res.status(400).json({ success: false, message: 'Parameter username wajib diisi.' })

  try {
    // Fetch profile info + recent videos secara paralel
    const [profileRes, videosRes] = await Promise.all([
      axios.get(`https://www.tikwm.com/api/user/info?unique_id=${username}`),
      axios.get(`https://www.tikwm.com/api/user/posts?unique_id=${username}&count=10&cursor=0`)
    ])

    const profileData = profileRes.data
    const videosData = videosRes.data

    if (!profileData || profileData.code !== 0) {
      return res.status(400).json({ success: false, message: 'User tidak ditemukan.' })
    }

    const u = profileData.data?.user
    const s = profileData.data?.stats

    // Format tanggal akun dibuat
    const createdAt = u?.createTime
      ? new Date(u.createTime * 1000).toISOString().slice(0, 10)
      : null

    // Recent videos
    const videos = (videosData?.code === 0 && videosData?.data?.videos) 
      ? videosData.data.videos.map(v => ({
          id: v.id,
          title: v.title || v.desc || null,
          cover: v.cover,
          playUrl: v.play,
          duration: v.duration,
          ratio: v.ratio,
          createdAt: v.create_time
            ? new Date(v.create_time * 1000).toISOString().slice(0, 10)
            : null,
          stats: {
            plays: v.play_count,
            likes: v.digg_count,
            comments: v.comment_count,
            shares: v.share_count,
            downloads: v.download_count,
          }
        }))
      : []

    return res.status(200).json({
      success: true,
      data: {
        // ── Identitas ──
        userId: u?.id,
        secUid: u?.secUid,
        username: u?.uniqueId,
        nickname: u?.nickname,

        // ── Profil ──
        bio: u?.signature,
        bioLink: u?.bioLink?.link || null,
        avatar: u?.avatarLarger,
        avatarThumb: u?.avatarThumb,

        // ── Status akun ──
        verified: u?.verified ?? false,
        privateAccount: u?.privateAccount ?? false,
        openFavorite: u?.openFavorite ?? false,
        commentSetting: u?.commentSetting ?? null,   // 0=everyone, 1=friends, 2=off
        duetSetting: u?.duetSetting ?? null,
        stitchSetting: u?.stitchSetting ?? null,

        // ── Info regional ──
        region: u?.region || null,
        language: u?.language || null,

        // ── Live ──
        isLive: u?.roomId ? true : false,
        roomId: u?.roomId || null,

        // ── Tanggal akun dibuat ──
        accountCreatedAt: createdAt,

        // ── Statistik ──
        stats: {
          followers: s?.followerCount ?? 0,
          following: s?.followingCount ?? 0,
          likes: s?.heartCount ?? 0,
          videos: s?.videoCount ?? 0,
          friends: s?.friendCount ?? 0,
        },

        // ── Video terbaru (10 video) ──
        recentVideos: videos,
      },
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message })
  }
}
