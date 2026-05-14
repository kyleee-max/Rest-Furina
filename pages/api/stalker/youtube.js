import { logRequest } from '../../../lib/logger'
import axios from 'axios'

export default async function handler(req, res) {
  logRequest(req)

  const { channel } = req.query
  if (!channel) return res.status(400).json({ success: false, message: 'Parameter channel wajib diisi. Bisa username (@namachannel), channel ID, atau URL channel.' })

  try {
    let identifier = channel.trim()
    if (identifier.includes('youtube.com/')) {
      const match = identifier.match(/youtube\.com\/(?:channel\/|@|user\/)([^/?&\s]+)/)
      if (match) identifier = match[1]
    }

    const handle = identifier.startsWith('@') ? identifier : `@${identifier}`
    const url = `https://www.youtube.com/${handle}`

    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000,
    })

    const match = html.match(/var ytInitialData\s*=\s*(\{.+?\});<\/script>/)
    if (!match) return res.status(404).json({ success: false, message: 'Channel tidak ditemukan atau tidak bisa di-scrape.' })

    const ytData = JSON.parse(match[1])

    const header = ytData?.header?.pageHeaderRenderer || ytData?.header?.c4TabbedHeaderRenderer
    const metadata = ytData?.metadata?.channelMetadataRenderer

    if (!metadata) return res.status(404).json({ success: false, message: 'Channel tidak ditemukan.' })

    // Subscriber count — regex langsung dari raw HTML paling reliable
    let subscriberCount = null
    try {
      const patterns = [
        /"subscriberCountText":\{"simpleText":"([^"]+)"/,
        /"subscriberCountText":\{"runs":\[\{"text":"([^"]+)"\}/,
        /"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]+)"\}/,
      ]
      for (const pat of patterns) {
        const m = html.match(pat)
        if (m) { subscriberCount = m[1]; break }
      }
      // Fallback dari ytData header
      if (!subscriberCount) {
        subscriberCount = header?.subscriberCountText?.simpleText
          || header?.subscriberCountText?.runs?.[0]?.text
          || null
      }
      // Fallback pageHeaderRenderer metadata rows
      if (!subscriberCount) {
        const rows = ytData?.header?.pageHeaderRenderer?.metadata?.pageHeaderMetadataRenderer?.metadataRows || []
        for (const row of rows) {
          const contents = row?.metadataRowRenderer?.contents || []
          for (const c of contents) {
            const txt = c?.metadataRowContentRenderer?.text?.runs?.[0]?.text
            if (txt) { subscriberCount = txt; break }
          }
          if (subscriberCount) break
        }
      }
    } catch (_) {}

    // Video count — regex dari raw HTML
    let videoCount = null
    try {
      const patterns = [
        /"videosCountText":\{"runs":\[\{"text":"([^"]+)"\}/,
        /"videoCountText":\{"runs":\[\{"text":"([^"]+)"\}/,
        /"videosCountText":\{"simpleText":"([^"]+)"/,
      ]
      for (const pat of patterns) {
        const m = html.match(pat)
        if (m) { videoCount = m[1]; break }
      }
    } catch (_) {}

    // Avatar
    let avatar = null
    try {
      const thumbs = header?.avatar?.thumbnails || metadata?.avatar?.thumbnails
      if (thumbs?.length) avatar = thumbs[thumbs.length - 1]?.url
    } catch (_) {}

    // Banner
    let banner = null
    try {
      const bannerThumbs = header?.banner?.thumbnails
        || header?.pageHeaderBanner?.imageBannerViewModel?.image?.sources
      if (bannerThumbs?.length) banner = bannerThumbs[bannerThumbs.length - 1]?.url
    } catch (_) {}

    return res.status(200).json({
      success: true,
      creator: "Kael",
      data: {
        channelId: metadata?.externalId || null,
        name: metadata?.title || null,
        handle: metadata?.vanityUrl || handle,
        description: metadata?.description || null,
        avatar,
        banner,
        url: metadata?.channelUrl || url,
        isFamilySafe: metadata?.isFamilySafe ?? null,
        keywords: metadata?.keywords || null,
        stats: {
          subscribers: subscriberCount,
          videos: videoCount,
        },
      },
    })
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ success: false, message: 'Channel tidak ditemukan.' })
    }
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message })
  }
}
