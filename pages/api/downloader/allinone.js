import { logRequest } from '../../../lib/logger'
import axios from 'axios'

// ── Detect platform dari URL ──────────────────────────────────
function detectPlatform(url) {
  try {
    const u = new URL(url)
    const host = u.hostname.toLowerCase().replace('www.', '')

    if (host.includes('tiktok.com') || host.includes('vt.tiktok.com')) return 'tiktok'
    if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube'
    if (host.includes('instagram.com')) return 'instagram'
    if (host.includes('pinterest.com') || host.includes('pin.it')) return 'pinterest'
    if (host.includes('mediafire.com')) return 'mediafire'
    if (host.includes('spotify.com')) return 'spotify'
    if (host.includes('facebook.com') || host.includes('fb.watch') || host.includes('fb.com')) return 'facebook'
    if (host.includes('twitter.com') || host.includes('x.com') || host.includes('t.co')) return 'twitter'
    if (host.includes('soundcloud.com')) return 'soundcloud'
    if (host.includes('drive.google.com')) return 'gdrive'

    return null
  } catch {
    return null
  }
}

// ── Downloader functions ──────────────────────────────────────
async function dlTiktok(url) {
  const { data } = await axios.get('https://api.tiklydown.eu.org/api/download', {
    params: { url },
    timeout: 15000,
  })
  if (!data) throw new Error('Gagal fetch TikTok')
  return {
    platform: 'tiktok',
    title: data.title || 'TikTok Video',
    author: data.author?.nickname || '-',
    thumbnail: data.cover || null,
    medias: [
      { quality: 'Video (No Watermark)', url: data.video?.noWatermark, type: 'video' },
      { quality: 'Video (Watermark)', url: data.video?.watermark, type: 'video' },
      { quality: 'Audio', url: data.music, type: 'audio' },
    ].filter(m => m.url),
  }
}

async function dlYoutube(url) {
  const res = await axios.get(`https://yt-dlp-api.vercel.app/api?url=${encodeURIComponent(url)}`, { timeout: 15000 }).catch(() => null)
  if (!res?.data) throw new Error('Gagal fetch YouTube')

  return {
    platform: 'youtube',
    title: res.data.title || 'YouTube Video',
    author: res.data.channel || '-',
    thumbnail: res.data.thumbnail || null,
    duration: res.data.duration || null,
    medias: [
      res.data.mp4 && { quality: 'Video 720p', url: res.data.mp4, type: 'video' },
      res.data.mp3 && { quality: 'Audio MP3', url: res.data.mp3, type: 'audio' },
    ].filter(Boolean),
  }
}

async function dlInstagram(url) {
  const { data } = await axios.get('https://api.instagramdl.net/api', {
    params: { url },
    timeout: 15000,
  }).catch(() => ({ data: null }))

  const res2 = await axios.get(`https://api.snapinsta.app/api`, {
    params: { url },
    timeout: 15000,
  }).catch(() => ({ data: null }))

  const result = data || res2.data
  if (!result) throw new Error('Gagal fetch Instagram')

  return {
    platform: 'instagram',
    title: result.title || 'Instagram Media',
    author: result.author || '-',
    thumbnail: result.thumbnail || null,
    medias: (result.medias || result.links || []).map(m => ({
      quality: m.quality || m.type || 'Media',
      url: m.url || m.link,
      type: m.type?.includes('video') ? 'video' : 'image',
    })).filter(m => m.url),
  }
}

async function dlPinterest(url) {
  const { data } = await axios.get('https://api.pinterestdown.com/api', {
    params: { url },
    timeout: 15000,
  }).catch(() => ({ data: null }))

  if (!data) throw new Error('Gagal fetch Pinterest')
  const isVideo = data.type === 'video' || data.url?.includes('.mp4')

  return {
    platform: 'pinterest',
    title: data.title || 'Pinterest Media',
    thumbnail: data.thumbnail || data.url || null,
    medias: [{ quality: isVideo ? 'Video' : 'Image', url: data.url, type: isVideo ? 'video' : 'image' }].filter(m => m.url),
  }
}

async function dlMediafire(url) {
  const res = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    timeout: 15000,
  }).catch(() => ({ data: '' }))

  const dlUrl = res.data?.match(/href="(https:\/\/download[^"]+)"/)?.[1]
  const fname = res.data?.match(/class="filename[^>]*>([^<]+)</)?.[1]?.trim()
  const fsize = res.data?.match(/class="details[^>]*><li>([^<]+)</)?.[1]?.trim()

  if (!dlUrl) throw new Error('Gagal fetch Mediafire')

  return {
    platform: 'mediafire',
    title: fname || 'Mediafire File',
    size: fsize || null,
    medias: [{ quality: 'Download', url: dlUrl, type: 'file' }],
  }
}

async function dlSpotify(url) {
  const { data } = await axios.get('https://api.spotifydown.com/download/' + url.split('/track/')[1]?.split('?')[0], {
    headers: { 'User-Agent': 'Mozilla/5.0', origin: 'https://spotifydown.com', referer: 'https://spotifydown.com/' },
    timeout: 15000,
  }).catch(() => ({ data: null }))

  if (!data?.success) throw new Error('Gagal fetch Spotify')

  return {
    platform: 'spotify',
    title: data.metadata?.title || 'Spotify Track',
    author: data.metadata?.artists || '-',
    thumbnail: data.metadata?.cover || null,
    medias: [{ quality: 'Audio MP3', url: data.link, type: 'audio' }].filter(m => m.url),
  }
}

// ── Main handler ──────────────────────────────────────────────
export default async function handler(req, res) {
  logRequest(req)
  const { url } = req.query
  if (!url) {
    return res.status(400).json({
      success: false,
      message: 'Parameter url wajib diisi.',
      supported: ['tiktok', 'youtube', 'instagram', 'pinterest', 'mediafire', 'spotify', 'facebook', 'twitter', 'soundcloud', 'gdrive'],
    })
  }

  const platform = detectPlatform(url)
  if (!platform) {
    return res.status(400).json({
      success: false,
      message: 'Platform tidak dikenali atau belum didukung.',
      supported: ['tiktok', 'youtube', 'instagram', 'pinterest', 'mediafire', 'spotify', 'facebook', 'twitter', 'soundcloud', 'gdrive'],
    })
  }

  try {
    let result

    switch (platform) {
      case 'tiktok':    result = await dlTiktok(url); break
      case 'youtube':   result = await dlYoutube(url); break
      case 'instagram': result = await dlInstagram(url); break
      case 'pinterest': result = await dlPinterest(url); break
      case 'mediafire': result = await dlMediafire(url); break
      case 'spotify':   result = await dlSpotify(url); break
      default:
        return res.status(400).json({ success: false, message: `Platform ${platform} belum didukung.` })
    }

    return res.status(200).json({ success: true, data: result })

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}
