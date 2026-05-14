import { logRequest } from '../../../lib/logger'
import axios from 'axios'

function extractFileId(url) {
  // Format: /file/d/FILE_ID/view atau ?id=FILE_ID
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/open\?id=([a-zA-Z0-9_-]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export default async function handler(req, res) {
  logRequest(req)

  const { url } = req.query
  if (!url) return res.status(400).json({ success: false, message: 'Parameter url wajib diisi.' })

  const fileId = extractFileId(url)
  if (!fileId) return res.status(400).json({ success: false, message: 'URL Google Drive tidak valid.' })

  try {
    // Cek metadata file via Google Drive API (public)
    const metaRes = await axios.get(`https://drive.google.com/uc`, {
      params: { id: fileId, export: 'download' },
      headers: { 'User-Agent': 'Mozilla/5.0' },
      maxRedirects: 0,
      timeout: 10000,
      validateStatus: (s) => s < 400,
    }).catch(e => e.response)

    // Ambil info dari halaman file
    const pageRes = await axios.get(`https://drive.google.com/file/d/${fileId}/view`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 10000,
    })

    const filename = pageRes.data.match(/<title>([^<]+) - Google Drive<\/title>/)?.[1] || 'Google Drive File'
    const thumbnail = pageRes.data.match(/"og:image" content="([^"]+)"/)?.[1] || null

    // Build direct download URL
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`

    // Cek apakah file bisa diakses (public)
    const checkRes = await axios.head(downloadUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 8000,
      validateStatus: (s) => s < 500,
    }).catch(() => null)

    if (checkRes?.status === 403) {
      return res.status(403).json({ success: false, message: 'File private atau tidak bisa diakses publik.' })
    }

    return res.status(200).json({
      success: true,
      data: {
        title: filename,
        fileId,
        thumbnail,
        medias: [
          { quality: 'Download', url: downloadUrl, type: 'file' },
          { quality: 'Direct View', url: `https://drive.google.com/file/d/${fileId}/view`, type: 'link' },
        ],
      },
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}
