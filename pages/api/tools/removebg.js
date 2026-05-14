
import axios from 'axios'

import FormData from 'form-data'

import Jimp from 'jimp'

// creator: KaelTzy

export default async function handler(req, res) {

  const { url } = req.query

  if (!url) return res.status(400).json({ success: false, creator: 'KaelTzy', message: 'Parameter url wajib diisi.' })

  try {

    // 1. Download image dari URL

    const imgRes = await axios.get(url, { responseType: 'arraybuffer' })

    let buffer = Buffer.from(imgRes.data)

    // 2. Resize kalau resolusi di atas 2000px

    let img = await Jimp.read(buffer)

    if (img.getWidth() > 2000 || img.getHeight() > 2000) {

      img.resize(2000, Jimp.AUTO)

    }

    buffer = await img.getBufferAsync(Jimp.MIME_JPEG)

    // 3. Upload ke Pixelcut

    const form = new FormData()

    form.append('image', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' })

    form.append('format', 'png')

    form.append('model', 'v1')

    const result = await axios.post('https://api2.pixelcut.app/image/matte/v1', form, {

      headers: {

        ...form.getHeaders(),

        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',

        'Accept': 'application/json, text/plain, */*',

        'x-client-version': 'web:pixa.com:4a5b0af2',

        'origin': 'https://www.pixa.com',

        'referer': 'https://www.pixa.com/'

      },

      responseType: 'arraybuffer'

    })

    const finalBuffer = Buffer.from(result.data)

    // 4. Return image PNG transparan

    res.setHeader('Content-Type', 'image/png')

    res.setHeader('Content-Disposition', 'inline; filename="removebg-result.png"')

    res.setHeader('X-Creator', 'KaelTzy')

    return res.status(200).send(finalBuffer)

  } catch (err) {

    if (err.response?.data) {

      console.error('API Error:', Buffer.from(err.response.data).toString())

    }

    return res.status(500).json({ success: false, creator: 'KaelTzy', message: 'Server error: ' + err.message })

  }

}

