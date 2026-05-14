import { logRequest } from '../../../lib/logger'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default async function handler(req, res) {
  logRequest(req)

  const { url } = req.query
  if (!url) return res.status(400).json({ success: false, message: 'Parameter url wajib diisi.' })

  try {
    const response = await axios.post(
      'https://reelsvideo.io/api/instagram',
      new URLSearchParams({ url }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    )

    const data = response.data
    if (!data || !data.links) {
      return res.status(400).json({ success: false, message: 'Gagal mengambil konten. Pastikan URL valid dan akun tidak private.' })
    }

    return res.status(200).json({
      success: true,
      data: {
        title: data.title || '',
        thumbnail: data.thumbnail || '',
        links: data.links,
      },
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message })
  }
}
