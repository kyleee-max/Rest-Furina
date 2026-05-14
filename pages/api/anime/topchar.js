import { logRequest } from '../../../lib/logger'
import axios from 'axios'

export default async function handler(req, res) {
  logRequest(req)

  const { gender = 'female', limit = '10' } = req.query

  if (!['female', 'male'].includes(gender.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Parameter gender harus "female" atau "male".' })
  }

  const limitNum = Math.min(Math.max(parseInt(limit) || 10, 1), 25)

  try {
    const { data } = await axios.get(`https://api.jikan.moe/v4/characters?order_by=favorites&sort=desc&limit=${limitNum}`, {
      timeout: 10000,
    })

    const raw = data?.data || []

    // Filter by gender
    const filtered = raw
      .filter(c => c.gender && c.gender.toLowerCase() === gender.toLowerCase())
      .slice(0, limitNum)

    // Kalau hasil filter kurang, fetch lebih banyak
    let result = filtered
    if (filtered.length < limitNum) {
      const { data: data2 } = await axios.get(`https://api.jikan.moe/v4/characters?order_by=favorites&sort=desc&limit=25&page=2`, {
        timeout: 10000,
      })
      const extra = (data2?.data || []).filter(c => c.gender && c.gender.toLowerCase() === gender.toLowerCase())
      result = [...filtered, ...extra].slice(0, limitNum)
    }

    const chars = result.map((c, i) => ({
      rank: i + 1,
      malId: c.mal_id,
      name: c.name,
      nameKanji: c.name_kanji || null,
      gender: c.gender || null,
      favorites: c.favorites || 0,
      image: c.images?.jpg?.image_url || null,
      url: c.url || null,
      animes: (c.anime || []).slice(0, 3).map(a => ({
        title: a.anime?.title || null,
        role: a.role || null,
      })),
    }))

    return res.status(200).json({
      success: true,
      gender: gender.toLowerCase(),
      total: chars.length,
      data: chars,
    })
  } catch (err) {
    if (err.response?.status === 429) {
      return res.status(429).json({ success: false, message: 'Rate limit Jikan API, coba lagi beberapa detik.' })
    }
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message })
  }
  }
  
