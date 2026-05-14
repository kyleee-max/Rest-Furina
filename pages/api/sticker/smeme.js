import { logRequest } from '../../../lib/logger'

export default async function handler(req, res) {
  logRequest(req)

  const { top = '', bottom = '', image } = req.query

  if (!top && !bottom) return res.status(400).json({ success: false, message: 'Parameter top atau bottom wajib diisi.' })
  if (!image) return res.status(400).json({ success: false, message: 'Parameter image (URL gambar) wajib diisi.' })

  try {
    // Encode teks — memegen pakai format khusus
    const encode = (text) => encodeURIComponent(
      text
        .replace(/_/g, '__')
        .replace(/ /g, '_')
        .replace(/\?/g, '~q')
        .replace(/%/g, '~p')
        .replace(/#/g, '~h')
        .replace(/\//g, '~s')
        .replace(/\\/g, '~b')
        .replace(/</g, '~l')
        .replace(/>/g, '~g')
        .replace(/"/g, "'")
    )

    const topEncoded = top ? encode(top) : '_'
    const bottomEncoded = bottom ? encode(bottom) : '_'
    const imageEncoded = encodeURIComponent(image)
    const memeUrl = `https://api.memegen.link/images/custom/${topEncoded}/${bottomEncoded}.png?style=${encodeURIComponent(background)}`
    return res.status(200).json({
      success: true,
      data: {
        url: memeUrl,
        top: top || null,
        bottom: bottom || null,
        image,
      },
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message })
  }
}
  
