import { logRequest } from '../../../lib/logger'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default async function handler(req, res) {
  logRequest(req)
  const { url, lang = 'javascript' } = req.query

  if (!url) {
    return res.status(400).json({ success: false, message: 'Parameter url wajib diisi.' })
  }

  if (!['javascript', 'python'].includes(lang)) {
    return res.status(400).json({ success: false, message: 'Parameter lang harus javascript atau python.' })
  }

  try {
    // Step 1 — Fetch halaman target
    const pageRes = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 10000,
      maxContentLength: 500000,
    })

    // Step 2 — Parse HTML
    const $ = cheerio.load(pageRes.data)

    $('script, style, svg, noscript, iframe').remove()

    const title = $('title').text().trim()
    const metaDesc = $('meta[name="description"]').attr('content') || ''
    const bodyHtml = $('body').html()?.substring(0, 8000) || ''

    // Ambil semua form fields
    const forms = []
    $('form').each((i, el) => {
      const inputs = []
      $(el).find('input, select, textarea').each((j, inp) => {
        inputs.push({
          tag: $(inp).prop('tagName'),
          name: $(inp).attr('name'),
          type: $(inp).attr('type'),
          id: $(inp).attr('id'),
        })
      })
      forms.push({
        action: $(el).attr('action'),
        method: $(el).attr('method'),
        inputs,
      })
    })

    // Ambil struktur heading
    const headings = []
    $('h1, h2, h3').each((i, el) => {
      headings.push({
        tag: $(el).prop('tagName'),
        text: $(el).text().trim().substring(0, 100),
      })
    })

    // Ambil semua link
    const links = []
    $('a[href]').each((i, el) => {
      const href = $(el).attr('href')
      const text = $(el).text().trim()
      if (href && !href.startsWith('#')) {
        links.push({ href, text: text.substring(0, 80) })
      }
    })

    // Ambil semua input/button
    const buttons = []
    $('button, input[type="submit"], input[type="button"]').each((i, el) => {
      buttons.push({
        tag: $(el).prop('tagName'),
        text: $(el).text().trim() || $(el).attr('value') || '',
        type: $(el).attr('type') || '',
      })
    })

    // Deteksi tipe website otomatis
    const bodyText = $('body').text().toLowerCase()
    const allHtml = $.html().toLowerCase()

    let websiteType = 'general'
    let scrapingFocus = ''

    if (allHtml.includes('upload') || allHtml.includes('file') || forms.some(f => f.inputs.some(i => i.type === 'file'))) {
      websiteType = 'upload'
      scrapingFocus = `Website ini adalah platform UPLOAD FILE. Fokus scraping pada:
- Form upload (input type file, endpoint action)
- API endpoint upload jika ada
- Response format setelah upload (URL file, CDN link)
- File size limit, tipe file yang diizinkan
- Cara penggunaan API upload (jika ada dokumentasi)`
    } else if (bodyText.includes('price') || bodyText.includes('harga') || bodyText.includes('buy') || bodyText.includes('cart') || bodyText.includes('product')) {
      websiteType = 'ecommerce'
      scrapingFocus = `Website ini adalah ECOMMERCE/TOKO ONLINE. Fokus scraping pada:
- Nama produk, harga, stok
- Gambar produk
- Rating dan review
- Kategori produk
- Pagination produk`
    } else if (bodyText.includes('article') || bodyText.includes('news') || bodyText.includes('berita') || bodyText.includes('blog') || $('article').length > 0) {
      websiteType = 'news'
      scrapingFocus = `Website ini adalah BERITA/BLOG/ARTIKEL. Fokus scraping pada:
- Judul artikel
- Isi konten artikel
- Tanggal publish
- Penulis/author
- Kategori/tag
- Thumbnail/gambar`
    } else if (bodyText.includes('endpoint') || bodyText.includes('api') || bodyText.includes('request') || bodyText.includes('response') || allHtml.includes('swagger')) {
      websiteType = 'api-docs'
      scrapingFocus = `Website ini adalah DOKUMENTASI API. Fokus scraping pada:
- Daftar endpoint (GET, POST, PUT, DELETE)
- Parameter yang dibutuhkan
- Contoh request dan response
- Authentication method
- Base URL`
    } else if (bodyText.includes('login') || bodyText.includes('register') || bodyText.includes('signup') || forms.some(f => f.inputs.some(i => i.type === 'password'))) {
      websiteType = 'auth'
      scrapingFocus = `Website ini memiliki sistem AUTH/LOGIN. Fokus scraping pada:
- Form login (field username/email/password)
- Form register
- Endpoint form action
- CSRF token jika ada
- Cara simulasi login dengan axios`
    } else {
      scrapingFocus = `Website general. Scrape semua data penting yang tersedia:
- Semua teks konten utama
- Link-link penting
- Data terstruktur (tabel, list)
- Gambar dan metadata
- Informasi kontak jika ada`
    }

    // Step 3 — Kirim ke Groq AI dengan prompt yang lebih pintar
    const prompt = `Kamu adalah expert web scraper developer.

Analisis website berikut dan buatkan scraper code yang lengkap dan siap pakai.

URL Target: ${url}
Title: ${title}
Description: ${metaDesc}
Tipe Website Terdeteksi: ${websiteType}

${scrapingFocus}

Struktur Heading:
${headings.map(h => `${h.tag}: ${h.text}`).join('\n')}

Form yang ditemukan:
${JSON.stringify(forms, null, 2)}

Button/Input yang ditemukan:
${JSON.stringify(buttons, null, 2)}

Link penting:
${JSON.stringify(links.slice(0, 20), null, 2)}

HTML Structure (sample):
${bodyHtml}

Buatkan scraper code dalam bahasa ${lang === 'javascript' ? 'JavaScript (Node.js dengan axios + cheerio)' : 'Python (dengan requests + BeautifulSoup4)'}.

Requirements:
1. Code harus lengkap, siap dijalankan
2. Scrape semua data yang RELEVAN sesuai tipe website (${websiteType})
3. Tambahkan komentar penjelasan
4. Handle error dengan try/catch
5. Output berupa JSON yang terstruktur
6. Kalau ada pagination, handle juga
7. Kalau ada form upload/submit, tunjukkan cara pakainya lengkap
8. Kalau ada API endpoint yang terdeteksi, tunjukkan cara hit endpoint nya

Balas HANYA dengan code saja, tanpa penjelasan tambahan di luar code. Gunakan comment di dalam code untuk penjelasan.`

    const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const aiData = await aiRes.json()

    if (!aiData.choices?.[0]?.message?.content) {
      return res.status(500).json({
        success: false,
        message: 'AI gagal generate scraper.',
        debug: { error: aiData.error || null }
      })
    }

    let code = aiData.choices[0].message.content
    code = code.replace(/^```[\w]*\n?/gm, '').replace(/```$/gm, '').trim()

    return res.status(200).json({
      success: true,
      data: {
        url,
        lang,
        title,
        websiteType,
        code,
        meta: {
          headingsFound: headings.length,
          formsFound: forms.length,
          linksFound: links.length,
          buttonsFound: buttons.length,
        },
      },
    })

  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      return res.status(400).json({ success: false, message: 'URL tidak bisa diakses. Pastikan URL valid dan bisa diakses publik.' })
    }
    if (err.response?.status === 403) {
      return res.status(400).json({ success: false, message: 'Website memblokir akses scraper.' })
    }
    if (err.code === 'ETIMEDOUT') {
      return res.status(408).json({ success: false, message: 'Request timeout. Website terlalu lambat.' })
    }
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message })
  }
      }
    
