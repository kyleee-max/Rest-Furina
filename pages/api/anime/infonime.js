import { logRequest } from '../../../lib/logger'
import axios from 'axios'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export default async function handler(req, res) {
  logRequest(req)

  let { day } = req.query

  // Kalau gak ada param day, pakai hari ini
  if (!day) {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    day = today
  }

  day = day.toLowerCase()
  if (!DAYS.includes(day)) {
    return res.status(400).json({
      success: false,
      message: `Hari tidak valid. Gunakan: ${DAYS.join(', ')}`,
    })
  }

  try {
    const { data } = await axios.get(`https://api.jikan.moe/v4/schedules?filter=${day}&limit=25`, {
      timeout: 10000,
    })

    const animes = (data?.data || []).map(a => ({
      malId: a.mal_id,
      title: a.title,
      titleEnglish: a.title_english || null,
      titleJapanese: a.title_japanese || null,
      episodes: a.episodes || '?',
      status: a.status,
      score: a.score || null,
      rating: a.rating || null,
      synopsis: a.synopsis ? a.synopsis.slice(0, 200) + '...' : null,
      image: a.images?.jpg?.image_url || null,
      url: a.url || null,
      broadcast: a.broadcast?.string || null,
      genres: (a.genres || []).map(g => g.name),
      studios: (a.studios || []).map(s => s.name),
    }))

    return res.status(200).json({
      success: true,
      day: day.charAt(0).toUpperCase() + day.slice(1),
      total: animes.length,
      data: animes,
    })
  } catch (err) {
    if (err.response?.status === 429) {
      return res.status(429).json({ success: false, message: 'Rate limit Jikan API, coba lagi beberapa detik.' })
    }
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message })
  }
      }
        
