import axios from 'axios'

// creator: KaelTzy

export default async function handler(req, res) {
  const { tag } = req.query
  if (!tag) return res.status(400).json({ success: false, creator: 'KaelTzy', message: 'Parameter tag wajib diisi.' })

  try {
    const response = await axios.get(`https://www.tiktok.com/api/challenge/detail/?challengeName=${encodeURIComponent(tag)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://www.tiktok.com/',
      }
    })

    const data = response.data
    if (data.status_code !== 0) {
      return res.status(400).json({ success: false, creator: 'KaelTzy', message: 'Hashtag tidak ditemukan.' })
    }

    const ch = data.challengeInfo.challenge
    const stats = data.challengeInfo.statsV2

    return res.status(200).json({
      success: true,
      creator: 'KaelTzy',
      data: {
        id: ch.id,
        title: ch.title,
        desc: ch.desc,
        cover: {
          thumb: ch.coverThumb,
          medium: ch.coverMedium,
          large: ch.coverLarger,
        },
        stats: {
          videoCount: stats.videoCount,
          viewCount: stats.viewCount,
        },
        isCommerce: ch.isCommerce,
      },
    })
  } catch (err) {
    return res.status(500).json({ success: false, creator: 'KaelTzy', message: 'Server error: ' + err.message })
  }
}
