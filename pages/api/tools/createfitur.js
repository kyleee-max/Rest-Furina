import { logRequest } from '../../../lib/logger'

export default async function handler(req, res) {
  logRequest(req)

  const {
    q,
    platform = 'whatsapp',    // whatsapp | telegram
    type = 'esm',              // esm | cjs
    style = 'plugins',         // plugins | case
  } = req.query

  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Parameter q wajib diisi. Contoh: ?q=buatkan fitur .group close/open di dalam group wa',
    })
  }

  if (!['whatsapp', 'telegram'].includes(platform)) {
    return res.status(400).json({ success: false, message: 'Parameter platform harus: whatsapp atau telegram' })
  }
  if (!['esm', 'cjs'].includes(type)) {
    return res.status(400).json({ success: false, message: 'Parameter type harus: esm atau cjs' })
  }
  if (!['plugins', 'case'].includes(style)) {
    return res.status(400).json({ success: false, message: 'Parameter style harus: plugins atau case' })
  }

  // ── Build system prompt sesuai pilihan ──────────────────
  const platformGuide = platform === 'whatsapp'
    ? `Platform: WhatsApp Bot menggunakan library @whiskeysockets/baileys.
Struktur message object (m):
- m.chat = JID chat (group/private)
- m.sender = JID pengirim
- m.isGroup = boolean, apakah di grup
- m.isOwner = boolean, apakah owner bot
- m.q = argumen setelah command (string)
- m.args = array argumen
- m.reply(text) = reply pesan
- m.react(emoji) = react ke pesan
- sock = baileys socket instance
- sock.sendMessage(jid, content) = kirim pesan
- sock.groupSettingUpdate(jid, 'announcement'|'not_announcement') = lock/unlock grup
- sock.groupMetadata(jid) = ambil info grup`
    : `Platform: Telegram Bot menggunakan library grammy atau node-telegram-bot-api.
Struktur:
- ctx.chat.id = ID chat
- ctx.from.id = ID pengirim
- ctx.message.text = teks pesan
- ctx.reply(text) = reply pesan
- ctx.api.restrictChatMember() = restrict member
- ctx.api.setChatPermissions() = set permissions grup`

  const styleGuide = style === 'plugins'
    ? `Format output: PLUGINS OBJECT
Tulis sebagai property di dalam object plugins, contoh:
const plugins = {
  async commandname(m, sock) {
    // logic disini
  }
}
export default plugins  // kalau ESM
module.exports = plugins  // kalau CJS`
    : `Format output: SWITCH CASE
Tulis sebagai case di dalam switch(command), contoh:
case 'commandname': {
  // logic disini
  break
}`

  const moduleGuide = type === 'esm'
    ? `Module system: ES Module (ESM) — gunakan import/export`
    : `Module system: CommonJS (CJS) — gunakan require/module.exports`

  const systemPrompt = `Kamu adalah expert bot developer yang ahli membuat plugin/command untuk bot chat.

${platformGuide}

${styleGuide}

${moduleGuide}

Rules penting:
1. Tulis code yang LENGKAP, BERSIH, dan SIAP DIPAKAI
2. Tambahkan komentar singkat di bagian penting
3. Handle error dengan try/catch
4. Validasi input user (cek apakah di grup, cek permission, dll)
5. Balas HANYA dengan code saja, tanpa penjelasan di luar code
6. Jangan pakai markdown code block (\`\`\`) — langsung code saja
7. Buat se-complete mungkin sesuai request user`

  const userPrompt = `Buatkan code untuk fitur berikut:
${q}

Platform: ${platform}
Module: ${type.toUpperCase()}
Style: ${style}`

  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ success: false, message: 'GROQ_API_KEY belum diset di server.' })
    }

    const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 4000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    })

    const rawText = await aiRes.text()
    let aiData
    try {
      aiData = JSON.parse(rawText)
    } catch {
      return res.status(500).json({ success: false, message: 'Groq API error: ' + rawText.substring(0, 200) })
    }

    if (aiData.error) {
      return res.status(500).json({ success: false, message: 'Groq error: ' + (aiData.error?.message || JSON.stringify(aiData.error)) })
    }

    if (!aiData.choices?.[0]?.message?.content) {
      return res.status(500).json({ success: false, message: 'AI gagal generate code.' })
    }

    // Bersihkan markdown kalau ada
    let code = aiData.choices[0].message.content
    code = code.replace(/^```[\w]*\n?/gm, '').replace(/```$/gm, '').trim()

    return res.status(200).json({
      success: true,
      data: {
        platform,
        type,
        style,
        code,
      },
    })

  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message })
  }
      }
