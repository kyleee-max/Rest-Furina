import ytdl from '@distube/ytdl-core'

// creator: KaelTzy

export default async function handler(req, res) {
  const { url } = req.query
  if (!url) return res.status(400).json({ success: false, creator: 'KaelTzy', message: 'Parameter url wajib diisi.' })

  if (!ytdl.validateURL(url)) {
    return res.status(400).json({ success: false, creator: 'KaelTzy', message: 'URL YouTube tidak valid.' })
  }

  try {
    const info = await ytdl.getInfo(url)
    const details = info.videoDetails

    const videoFormats = ytdl.filterFormats(info.formats, 'videoandaudio').map(f => ({
      quality: f.qualityLabel,
      mimeType: f.mimeType,
      url: f.url,
      contentLength: f.contentLength,
    }))

    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly').map(f => ({
      bitrate: f.audioBitrate,
      mimeType: f.mimeType,
      url: f.url,
      contentLength: f.contentLength,
    }))

    return res.status(200).json({
      success: true,
      creator: 'KaelTzy',
      data: {
        id: details.videoId,
        title: details.title,
        description: details.shortDescription,
        duration: details.lengthSeconds,
        thumbnail: details.thumbnails?.at(-1)?.url,
        author: {
          name: details.author?.name,
          channel: details.author?.channel_url,
        },
        stats: {
          views: details.viewCount,
          likes: details.likes,
        },
        formats: {
          video: videoFormats,
          audio: audioFormats,
        },
      },
    })
  } catch (err) {
    return res.status(500).json({ success: false, creator: 'KaelTzy', message: 'Server error: ' + err.message })
  }
}
