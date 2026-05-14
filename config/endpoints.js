// Config semua endpoint — docs page auto-baca file ini
// Untuk nambah endpoint baru, cukup tambah di sini aja

const endpoints = [
  // ─── DOWNLOADER ───
  {
    category: 'Downloader',
    name: 'All In One Downloader',
    status: 'ready',
    desc: 'Auto detect & download dari TikTok, YouTube, Instagram, Pinterest, Mediafire, Spotify — cukup satu endpoint.',
    path: '/api/downloader/allinone',
    method: 'GET',
    params: [
      { key: 'url', desc: 'URL dari platform manapun yang didukung', placeholder: 'https://vt.tiktok.com/xxx' }
      ],
  },
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
    desc: 'Download video YouTube berbagai kualitas (720p, 480p, 360p) + audio MP3.',
    path: '/api/downloader/youtube',
    method: 'GET',
    params: [
      { key: 'url', desc: 'URL video YouTube', placeholder: 'https://youtu.be/xxx' }
      ],
  },
  {
    category: 'Downloader',
    name: 'Instagram Downloader',
    status: 'error',
    desc: 'Download reels, foto, dan carousel Instagram beserta audio MP3.',
    path: '/api/downloader/instagram',
    method: 'GET',
    params: [
      { key: 'url', desc: 'URL post/reels Instagram', placeholder: 'https://www.instagram.com/reel/xxx' }
      ],
  },
  {
    category: 'Downloader',
    name: 'Pinterest Downloader',
    status: 'error',
    desc: 'Download foto dan video dari Pinterest pin URL.',
    path: '/api/downloader/pinterest',
    method: 'GET',
    params: [
      { key: 'url', desc: 'URL pin Pinterest', placeholder: 'https://pin.it/xxx' }
      ],
  },
  {
    category: 'Downloader',
    name: 'Mediafire Downloader',
    status: 'ready',
    desc: 'Ambil link download langsung dari Mediafire beserta info file.',
    path: '/api/downloader/mediafire',
    method: 'GET',
    params: [
      { key: 'url', desc: 'URL halaman Mediafire', placeholder: 'https://www.mediafire.com/file/xxx' }
      ],
  },
  {
    category: 'Downloader',
    name: 'Spotify Downloader',
    status: 'error',
    desc: 'Download lagu Spotify ke MP3/FLAC beserta metadata lengkap.',
    path: '/api/downloader/spotify',
    method: 'GET',
    params: [
      { key: 'url', desc: 'URL track Spotify', placeholder: 'https://open.spotify.com/track/xxx' }
      ],
  },

  {
    category: 'Downloader',
    name: 'Facebook Downloader',
    status: 'error',
    desc: 'Download video dari Facebook & FB Reels.',
    path: '/api/downloader/facebook',
    method: 'GET',
    params: [
      { key: 'url', desc: 'URL video Facebook', placeholder: 'https://www.facebook.com/watch?v=xxx' }
      ],
  },
  {
    category: 'Downloader',
    name: 'Twitter/X Downloader',
    status: 'error',
    desc: 'Download video dari Twitter / X.',
    path: '/api/downloader/twitter',
    method: 'GET',
    params: [
      { key: 'url', desc: 'URL tweet', placeholder: 'https://x.com/user/status/xxx' }
      ],
  },
  {
    category: 'Downloader',
    name: 'SoundCloud Downloader',
    status: 'error',
    desc: 'Download audio dari SoundCloud.',
    path: '/api/downloader/soundcloud',
    method: 'GET',
    params: [
      { key: 'url', desc: 'URL track SoundCloud', placeholder: 'https://soundcloud.com/artist/track' }
      ],
  },
  {
    category: 'Downloader',
    name: 'Google Drive Downloader',
    status: 'ready',
    desc: 'Ambil direct download link dari Google Drive (file publik).',
    path: '/api/downloader/gdrive',
    method: 'GET',
    params: [
      { key: 'url', desc: 'URL Google Drive', placeholder: 'https://drive.google.com/file/d/xxx/view' }
      ],
  },

  // ─── STALKER ───
  {
    category: 'Stalker',
    name: 'TikTok User Info',
    status: 'ready',
    desc: 'Info profil lengkap user TikTok — followers, following, likes, dan statistik.',
    path: '/api/stalker/tiktok',
    method: 'GET',
    params: [
      { key: 'username', desc: 'Username TikTok (tanpa @)', placeholder: 'charlidamelio' }
      ],
  },
  {
  category: 'Stalker',
  name: 'YouTube Channel Info',
  status: 'ready',
  desc: 'Info lengkap channel YouTube — nama, subscriber, jumlah video, avatar, banner, dan deskripsi. Tanpa API key YouTube.',
  path: '/api/stalker/youtube',
  method: 'GET',
  params: [
    { key: 'channel', desc: 'Username channel (dengan atau tanpa @), channel ID, atau URL channel', placeholder: '@PewDiePie' }
      ],
},

  // ─── TOOLS ───
  {
    category: 'Tools',
    name: 'Image HD Upscaler',
    status: 'ready',
    desc: 'Perbesar resolusi gambar jadi HD menggunakan AI.',
    path: '/api/tools/hd',
    method: 'GET',
    params: [
      { key: 'url', desc: 'URL gambar yang mau di-upscale', placeholder: 'https://example.com/image.jpg' }
      ],
  },
  {
    category: 'Tools',
    name: 'Remove Background',
    status: 'ready',
    desc: 'Hapus background foto secara otomatis dengan AI. Output PNG transparan.',
    path: '/api/tools/removebg',
    method: 'GET',
    params: [
      { key: 'url', desc: 'URL gambar yang mau dihapus backgroundnya', placeholder: 'https://example.com/photo.jpg' }
      ],
  },
  {
    category: 'Tools',
    name: 'Video Enhancer',
    status: 'error',
    desc: 'Tingkatkan kualitas video hingga 4K menggunakan AI. Returns job_id untuk polling status.',
    path: '/api/tools/enhance',
    method: 'GET',
    params: [
      { key: 'url', desc: 'URL video yang mau di-enhance', placeholder: 'https://example.com/video.mp4' },
      { key: 'resolution', desc: 'Target resolusi (4k/2k/1080p)', placeholder: '4k' }
      ],
  },


  {
    category: 'Tools',
    name: 'AI Scraper Generator',
    status: 'ready',
    desc: 'Generate scraper code otomatis dari URL target menggunakan AI. Support JavaScript & Python.',
    path: '/api/tools/scraper',
    method: 'GET',
    params: [
      { key: 'url', desc: 'URL website yang mau di-scrape', placeholder: 'https://example.com' },
      { key: 'lang', desc: 'Bahasa output: javascript atau python', placeholder: 'javascript' }
      ],
  },
  {
    category: 'Tools',
    name: 'Base Bot Generator',
    status: 'error',
    desc: 'Generate base code WhatsApp bot (Baileys) yang sudah include semua command NanaApis. Tinggal run!',
    path: '/api/tools/basebot',
    method: 'GET',
    params: [
      { key: 'prefix', desc: 'Prefix command bot', placeholder: '.' },
      { key: 'owner', desc: 'Nomor WA owner (tanpa +)', placeholder: '628xxxxxxxxxx' }
      ],
  },

  {
    category: 'Tools',
    name: 'Create Fitur Bot',
    status: 'ready',
    desc: 'Generate plugin/command code untuk bot WA atau Telegram otomatis pake AI. Support ESM/CJS & format plugins/case.',
    path: '/api/tools/createfitur',
    method: 'GET',
    params: [
      { key: 'q', desc: 'Deskripsi fitur yang mau dibuat', placeholder: 'buatkan fitur .group close/open di dalam group wa' },
      { key: 'platform', desc: 'Platform bot: whatsapp atau telegram', placeholder: 'whatsapp' },
      { key: 'type', desc: 'Module system: esm atau cjs', placeholder: 'esm' },
      { key: 'style', desc: 'Format output: plugins atau case', placeholder: 'plugins' }
      ],
  },

  // ─── STICKER ───
  {
  category: 'Sticker',
  name: 'Meme Generator',
  status: 'ready',
  desc: 'Buat meme dengan teks atas & bawah dari gambar custom. Powered by Memegen API.',
  path: '/api/sticker/smeme',
  method: 'GET',
  params: [
    { key: 'image', desc: 'URL gambar background', placeholder: 'https://example.com/image.jpg' },
    { key: 'top', desc: 'Teks bagian atas (opsional)', placeholder: 'PERASAAN GW' },
    { key: 'bottom', desc: 'Teks bagian bawah (opsional)', placeholder: 'GAK ENAK' }
      ],
},

// ──── ANIME ─────
// ─── ANIME ───
{
  category: 'Anime',
  name: 'Jadwal Tayang Anime',
  status: 'ready',
  desc: 'Jadwal tayang anime minggu ini per hari. Powered by Jikan API (MyAnimeList).',
  path: '/api/anime/infonime',
  method: 'GET',
  params: [
    {
      key: 'day',
      desc: 'Pilih hari tayang',
      type: 'select',
      options: [
        { label: 'Senin', value: 'monday' },
        { label: 'Selasa', value: 'tuesday' },
        { label: 'Rabu', value: 'wednesday' },
        { label: 'Kamis', value: 'thursday' },
        { label: 'Jumat', value: 'friday' },
        { label: 'Sabtu', value: 'saturday' },
        { label: 'Minggu', value: 'sunday' }
      ],
    }
      ],
},
{
  category: 'Anime',
  name: 'What Anime (Reverse Search)',
  status: 'ready',
  desc: 'Cari judul anime dari screenshot/gambar. Return judul, episode, timestamp scene, dan similarity score. Powered by trace.moe.',
  path: '/api/anime/whatanime',
  method: 'GET',
  params: [
    { key: 'url', desc: 'URL screenshot/gambar anime', placeholder: 'https://example.com/screenshot.jpg' }
      ],
},  
{
  category: 'Anime',
  name: 'Top Anime Characters',
  status: 'error',
  desc: 'Top karakter anime berdasarkan favorites, bisa filter by gender. Powered by Jikan API.',
  path: '/api/anime/topchar',
  method: 'GET',
  params: [
    {
      key: 'gender',
      desc: 'Filter gender karakter',
      type: 'select',
      options: [
        { label: 'Female', value: 'female' },
        { label: 'Male', value: 'male' }
      ],
    },
    { key: 'limit', desc: 'Jumlah karakter (max 25)', placeholder: '10' }
      ],
},
]
export default endpoints
