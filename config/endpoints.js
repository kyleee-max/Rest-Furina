// Config semua endpoint — docs page auto-baca file ini
// creator: KaelTzy

const endpoints = [
  // ─── DOWNLOADER ───
  {
    category: 'Downloader',
    name: 'TikTok Downloader',
    status: 'ready',
    desc: 'Download video TikTok tanpa watermark beserta info lengkap.',
    path: '/api/downloader/tiktok',
    method: 'GET',
    params: [
      { key: 'url', desc: 'URL video TikTok', placeholder: 'https://vt.tiktok.com/xxx' }
    ],
  },
  {
    category: 'Downloader',
    name: 'YouTube Downloader',
    status: 'ready',
    desc: 'Download video YouTube berbagai kualitas + audio MP3. Powered by ytdl-core.',
    path: '/api/downloader/youtube',
    method: 'GET',
    params: [
      { key: 'url', desc: 'URL video YouTube', placeholder: 'https://youtu.be/xxx' }
    ],
  },

  // ─── HASTAG ───
  {
    category: 'Hastag',
    name: 'TikTok Hashtag Info',
    status: 'ready',
    desc: 'Info lengkap hashtag TikTok — total video, total views, dan detail challenge.',
    path: '/api/hastag/tiktok',
    method: 'GET',
    params: [
      { key: 'tag', desc: 'Nama hashtag (tanpa #)', placeholder: 'fyp' }
    ],
  },
// ─── TOOLS ───
  {
    category: 'Tools',
    name: 'Image HD Upscaler',
    status: 'ready',
    desc: 'Perbesar resolusi gambar jadi HD menggunakan AI. Powered by iLoveIMG.',
    path: '/api/tools/hd',
    method: 'GET',
    params: [
      { key: 'url', desc: 'URL gambar yang mau di-upscale', placeholder: 'https://example.com/image.jpg' },
      { key: 'scale', desc: 'Skala upscale: 2 atau 4 (default: 2)', placeholder: '2' }
    ],
  },
{
    category: 'Tools',
    name: 'Remove Background',
    status: 'ready',
    desc: 'Hapus background foto secara otomatis dengan AI. Output PNG transparan. Powered by Pixelcut.',
    path: '/api/tools/removebg',
    method: 'GET',
    params: [
      { key: 'url', desc: 'URL gambar yang mau dihapus backgroundnya', placeholder: 'https://example.com/photo.jpg' }
    ],
  },
// ─── STALKER ───
  {
    category: 'Stalker',
    name: 'TikTok User Info',
    status: 'ready',
    desc: 'Info profil lengkap user TikTok — followers, following, likes, total video, dan statistik.',
    path: '/api/stalker/tiktok',
    method: 'GET',
    params: [
      { key: 'username', desc: 'Username TikTok (tanpa @)', placeholder: 'charlidamelio' }
    ],
  },
]
export default endpoints
