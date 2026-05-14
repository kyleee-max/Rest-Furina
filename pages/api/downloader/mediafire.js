import { logRequest } from '../../../lib/logger'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default async function handler(req, res) {
  logRequest(req)

  const { url } = req.query
  if (!url) return res.status(400).json({ success: false, message: 'Parameter url wajib diisi.' })

  try {
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    })

    const $ = cheerio.load(response.data)

    const downloadUrl = $('#downloadButton').attr('href') || $('a.input[href*="download"]').attr('href')
    const fileName = $('#filename').text().trim() || $('.dl-btn-label').text().trim()
    const fileSize = $('.details-container .details li').first().text().trim()
    const uploadDate = $('.details-container .details li').eq(1).text().trim()

    if (!downloadUrl) {
      return res.status(400).json({ success: false, message: 'File tidak ditemukan atau link expired.' })
    }

    return res.status(200).json({
      success: true,
      data: {
        fileName,
        fileSize,
        uploadDate,
        downloadUrl,
      },
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message })
  }
}
