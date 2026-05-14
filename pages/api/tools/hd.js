import { logRequest } from '../../../lib/logger'
import axios from 'axios'
import FormData from 'form-data'

async function uploadImage(imageBuffer, filename) {
  const form = new FormData()
  form.append('file', imageBuffer, { filename, contentType: 'image/jpeg' })
  form.append('type', 13)
  form.append('scaleRadio', 2)

  const headers = {
    ...form.getHeaders(),
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'origin': 'https://imglarger.com',
    'referer': 'https://imglarger.com/',
    'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36',
  }

  const { data } = await axios.post('https://photoai.imglarger.com/api/PhoAi/Upload', form, { headers })
  return data.data
}

async function checkStatus(code) {
  const headers = {
    'accept': 'application/json, text/plain, */*',
    'content-type': 'application/json',
    'origin': 'https://imglarger.com',
    'referer': 'https://imglarger.com/',
    'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36',
  }

  const { data } = await axios.post(
    'https://photoai.imglarger.com/api/PhoAi/CheckStatus',
    { code, type: 13 },
    { headers }
  )
  return data.data
}

export default async function handler(req, res) {
  logRequest(req)

  const { url } = req.query
  if (!url) return res.status(400).json({ success: false, message: 'Parameter url wajib diisi. Masukkan URL gambar.' })

  try {
    // Download gambar dari URL
    const imgRes = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })
    const imageBuffer = Buffer.from(imgRes.data)
    const filename = url.split('/').pop().split('?')[0] || 'image.jpg'

    // Upload ke imglarger
    const uploadData = await uploadImage(imageBuffer, filename)
    if (!uploadData?.code) {
      return res.status(500).json({ success: false, message: 'Gagal upload gambar ke server.' })
    }

    // Polling status sampai selesai (max 30 detik)
    let result = null
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 2000))
      const status = await checkStatus(uploadData.code)
      if (status?.outputImg) {
        result = status
        break
      }
    }

    if (!result?.outputImg) {
      return res.status(500).json({ success: false, message: 'Timeout. Gambar terlalu besar atau server sibuk.' })
    }

    return res.status(200).json({
      success: true,
      data: {
        original: url,
        result: result.outputImg,
        scale: '2x',
      },
    })

  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error: ' + err.message })
  }
}
