import axios from 'axios'
import FormData from 'form-data'

// creator: KaelTzy

export default async function handler(req, res) {
  let { url, scale } = req.query
  if (!url) return res.status(400).json({ success: false, creator: 'KaelTzy', message: 'Parameter url wajib diisi.' })
  if (!['2', '4'].includes(scale)) scale = '2'

  try {
    // 1. Download image dari URL
    const imgRes = await axios.get(url, { responseType: 'arraybuffer' })
    const imgBuffer = Buffer.from(imgRes.data)
    const contentType = imgRes.headers['content-type'] || 'image/jpeg'

    // 2. Ambil token & taskId dari iLoveIMG
    const html = await axios.get('https://www.iloveimg.com/upscale-image').then(r => r.data)
    const token = html.match(/"token":"(eyJ[^"]+)"/)?.[1]
    const task = html.match(/ilovepdfConfig\.taskId\s*=\s*'([^']+)'/)?.[1]
    if (!token || !task) throw new Error('Gagal mengambil session token')

    // 3. Upload image ke iLoveIMG
    const formUp = new FormData()
    formUp.append('name', 'image.jpg')
    formUp.append('chunk', '0')
    formUp.append('chunks', '1')
    formUp.append('task', task)
    formUp.append('preview', '1')
    formUp.append('v', 'web.0')
    formUp.append('file', imgBuffer, { filename: 'image.jpg', contentType })

    const resUp = await axios.post('https://api29g.iloveimg.com/v1/upload', formUp, {
      headers: {
        ...formUp.getHeaders(),
        'Authorization': `Bearer ${token}`,
        'Origin': 'https://www.iloveimg.com',
        'Referer': 'https://www.iloveimg.com/'
      }
    })
    const serverFilename = resUp.data.server_filename

    // 4. Proses upscale & ambil hasilnya
    const formDo = new FormData()
    formDo.append('task', task)
    formDo.append('server_filename', serverFilename)
    formDo.append('scale', scale)

    const resDone = await axios.post('https://api29g.iloveimg.com/v1/upscale', formDo, {
      headers: {
        ...formDo.getHeaders(),
        'Authorization': `Bearer ${token}`,
        'Origin': 'https://www.iloveimg.com',
        'Referer': 'https://www.iloveimg.com/'
      },
      responseType: 'arraybuffer'
    })

    const finalBuffer = Buffer.from(resDone.data)

    // 5. Return image langsung
    res.setHeader('Content-Type', 'image/jpeg')
    res.setHeader('Content-Disposition', 'inline; filename="hd-result.jpg"')
    res.setHeader('X-Creator', 'KaelTzy')
    return res.status(200).send(finalBuffer)

  } catch (err) {
    return res.status(500).json({ success: false, creator: 'KaelTzy', message: 'Server error: ' + err.message })
  }
}
