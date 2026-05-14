import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'

const AVATAR = 'https://raw.githubusercontent.com/kyleee-max/mutsumi-file/refs/heads/main/IMG-20260513-WA0005.jpg'
const WA_CHANNEL = 'https://whatsapp.com/channel/0029Vb7lbO7Bvvsiv17r9Q47'

function RevealDiv({ children, delay = 0, style = {} }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.08 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      ...style,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
    }}>
      {children}
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [heroVisible, setHeroVisible] = useState(false)
  const menuRef = useRef(null)
  const [showWaPopup, setShowWaPopup] = useState(false)

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100)
    const alreadyShown = sessionStorage.getItem('wa_popup_shown')
    if (!alreadyShown) {
      setTimeout(() => {
        setShowWaPopup(true)
        sessionStorage.setItem('wa_popup_shown', '1')
      }, 4000)
    }
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const navItems = [
    { label: '🏠 Home', path: '/' },
    { label: '📖 Docs', path: '/docs' },
  ]

  return (
    <>
      <Head>
        <title>Furina Apis — REST API Platform</title>
        <meta name="description" content="Platform REST API siap pakai untuk developer Indonesia." />
        <link rel="icon" href={AVATAR} />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <div style={s.bg}>
        <div style={s.bgGrid} />
        <div style={{...s.blob, ...s.blob1}} />
        <div style={{...s.blob, ...s.blob2}} />
      </div>

      {/* NAVBAR */}
      <nav style={s.nav}>
        <div style={s.navLogo} onClick={() => router.push('/')}>
          <img src={AVATAR} style={s.navAvatar} alt="Furina Apis" />
          <span style={s.navName}>Furina Apis</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <button style={s.navDocsBtn} onClick={() => router.push('/docs')}>📖 Docs</button>
          <div style={s.menuWrap} ref={menuRef}>
            <button style={s.navMenu} onClick={() => setMenuOpen(!menuOpen)}>
              <span style={{...s.menuLine, ...(menuOpen ? s.menuLine1Open : {})}} />
              <span style={{...s.menuLine, ...(menuOpen ? s.menuLine2Open : {})}} />
              <span style={{...s.menuLine, ...(menuOpen ? s.menuLine3Open : {})}} />
            </button>
            {menuOpen && (
              <div style={s.dropdown}>
                <div style={s.dropdownArrow} />
                {navItems.map((item, i) => (
                  <button key={i} style={{...s.dropdownItem, ...(i < navItems.length - 1 ? s.dropdownItemBorder : {})}}
                    onClick={() => { router.push(item.path); setMenuOpen(false) }}>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      <main style={s.main}>
        {/* HERO */}
        <section style={s.hero}>
          <div style={{ ...s.eyebrow, opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease 0.1s' }}>
            <div style={s.eyebrowDot} />
            REST API Platform
          </div>
          <img src={AVATAR} style={{ ...s.heroAvatar, opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'scale(1)' : 'scale(0.8)', transition: 'all 0.6s ease 0.2s' }} alt="Furina Apis" />
          <h1 style={{ ...s.heroTitle, opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease 0.3s' }}>
            <span style={s.titleGrad}>Furina Apis</span>
          </h1>
          <p style={{ ...s.heroDesc, opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease 0.4s' }}>
            Powerful, scalable, dan developer-friendly REST API platform. Build aplikasi keren dengan puluhan endpoint siap pakai. Gratis, tanpa login, tanpa API key.
          </p>
          <div style={{ ...s.btnGroup, opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease 0.5s' }}>
            <button style={s.btnMain} onClick={() => router.push('/docs')}>📖 View Documentation</button>
          </div>
        </section>

        {/* WHY SECTION */}
        <section style={s.whySection}>
          <RevealDiv delay={0}><h2 style={s.whyTitle}>Why Choose Furina Apis?</h2></RevealDiv>
          <div style={s.whyList}>
            {[
              { icon: '⚡', title: 'Fast & Reliable', desc: 'Response cepat dengan uptime 99.9%. Server di-optimize buat developer Indonesia.' },
              { icon: '🆓', title: 'Gratis Selamanya', desc: 'Tidak perlu daftar atau API key. Langsung pakai, semua endpoint tersedia gratis.' },
              { icon: '📦', title: 'Banyak Endpoint', desc: 'Downloader, stalker, tools AI, dan sticker generator dalam satu platform.' },
              { icon: '💬', title: 'Support via WA', desc: 'Ada masalah? Langsung chat support via WhatsApp. Respons cepat!' },
            ].map((item, i) => (
              <RevealDiv key={i} delay={i * 0.08}>
                <WhyCard item={item} />
              </RevealDiv>
            ))}
          </div>
        </section>

        {/* STATS */}
        <div style={s.stats}>
          {[
            { num: '11+', label: 'Endpoints' },
            { num: '4', label: 'Kategori' },
            { num: 'Free', label: 'Forever' },
          ].map((s2, i) => (
            <RevealDiv key={i} delay={i * 0.1} style={{flex: 1}}>
              <div style={{...s.stat, ...(i < 2 ? s.statBorder : {})}}>
                <div style={s.statNum}>{s2.num}</div>
                <div style={s.statLabel}>{s2.label}</div>
              </div>
            </RevealDiv>
          ))}
        </div>

        <footer style={s.footer}>© 2026 Furina Apis · Made with ☕ in Indonesia</footer>
      </main>

      {/* POPUP WA CHANNEL */}
      {showWaPopup && (
        <div style={s.overlay} onClick={() => setShowWaPopup(false)}>
          <div style={s.waPopup} onClick={e => e.stopPropagation()}>
            <button style={s.popupClose} onClick={() => setShowWaPopup(false)}>✕</button>
            <div style={s.popupIcon}>📢</div>
            <div style={s.popupTitle}>Ikuti Channel Update</div>
            <div style={s.popupDesc}>Dapetin notifikasi endpoint baru, update fitur, dan info maintenance langsung di WhatsApp kamu.</div>
            <a href={WA_CHANNEL} target="_blank" rel="noreferrer" style={s.popupBtn}>
              📲 Ikuti Sekarang
            </a>
            <button style={s.popupSkip} onClick={() => setShowWaPopup(false)}>Nanti aja</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blobFloat { 0%,100%{transform:translate(0,0)} 50%{transform:translate(10px,-10px)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes dropDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popupIn { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>
    </>
  )
}

function WhyCard({ item }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? '#1a2332' : '#161b22', border: hovered ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 14, transition: 'all 0.2s', boxShadow: hovered ? '0 6px 20px rgba(255,255,255,0.07)' : 'none' }}>
      <div style={{ width: 42, height: 42, flexShrink: 0, background: hovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, transition: 'all 0.2s' }}>{item.icon}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{item.title}</div>
        <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.5 }}>{item.desc}</div>
      </div>
    </div>
  )
}

const s = {
  bg: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 },
  bgGrid: { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '40px 40px' },
  blob: { position: 'absolute', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.2, animation: 'blobFloat 12s ease-in-out infinite' },
  blob1: { width: 500, height: 500, background: '#38bdf8', top: -200, left: -150 },
  blob2: { width: 400, height: 400, background: '#0ea5e9', bottom: -100, right: -100, animationDelay: '-6s' },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 16px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(13,17,23,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)', fontFamily: 'Plus Jakarta Sans, sans-serif' },
  navLogo: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' },
  navAvatar: { width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', objectFit: 'cover' },
  navName: { fontSize: 16, fontWeight: 800, color: '#f0f6fc' },
  navDocsBtn: { padding: '8px 16px', background: 'linear-gradient(135deg, #ffffff, #e2e8f0)', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, color: '#0d1117', cursor: 'pointer' },
  menuWrap: { position: 'relative' },
  navMenu: { display: 'flex', flexDirection: 'column', gap: 5, background: 'none', border: 'none', padding: 6, cursor: 'pointer', borderRadius: 8 },
  menuLine: { width: 20, height: 2, background: '#8b949e', borderRadius: 2, display: 'block', transition: 'all 0.2s', transformOrigin: 'center' },
  menuLine1Open: { transform: 'translateY(7px) rotate(45deg)', background: '#ffffff' },
  menuLine2Open: { opacity: 0 },
  menuLine3Open: { transform: 'translateY(-7px) rotate(-45deg)', background: '#ffffff' },
  dropdown: { position: 'absolute', top: 'calc(100% + 12px)', right: 0, background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 6, minWidth: 160, boxShadow: '0 16px 40px rgba(0,0,0,0.5)', zIndex: 200, animation: 'dropDown 0.15s ease' },
  dropdownArrow: { position: 'absolute', top: -6, right: 14, width: 12, height: 12, background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none', borderRight: 'none', transform: 'rotate(45deg)' },
  dropdownItem: { width: '100%', padding: '11px 14px', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 14, fontWeight: 600, color: '#8b949e', cursor: 'pointer', textAlign: 'left', display: 'block' },
  dropdownItemBorder: {},
  main: { paddingTop: 58, position: 'relative', zIndex: 1, fontFamily: 'Plus Jakarta Sans, sans-serif' },
  hero: { minHeight: 'calc(100vh - 58px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px 60px', textAlign: 'center' },
  eyebrow: { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 100, fontSize: 12, fontWeight: 600, color: '#ffffff', marginBottom: 24 },
  eyebrowDot: { width: 6, height: 6, background: '#ffffff', borderRadius: '50%', animation: 'blink 2s infinite' },
  heroAvatar: { width: 110, height: 110, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)', objectFit: 'cover', marginBottom: 20, boxShadow: '0 0 0 8px rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.4)' },
  heroTitle: { fontSize: 42, fontWeight: 900, letterSpacing: -1.5, lineHeight: 1.05, marginBottom: 16 },
  titleGrad: { background: 'linear-gradient(135deg, #ffffff, #e2e8f0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroDesc: { fontSize: 15, color: '#8b949e', lineHeight: 1.65, maxWidth: 340, margin: '0 auto 36px' },
  btnGroup: { width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 10 },
  btnMain: { width: '100%', padding: '15px', background: 'linear-gradient(135deg, #ffffff, #e2e8f0)', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, color: '#0d1117', boxShadow: '0 6px 20px rgba(255,255,255,0.25)', cursor: 'pointer' },
  whySection: { padding: '60px 24px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  whyTitle: { fontSize: 24, fontWeight: 900, textAlign: 'center', letterSpacing: -0.5, marginBottom: 28 },
  whyList: { display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 420, margin: '0 auto' },
  stats: { display: 'flex', justifyContent: 'center', padding: '40px 24px', maxWidth: 420, margin: '0 auto' },
  stat: { flex: 1, textAlign: 'center', padding: '0 16px' },
  statBorder: { borderRight: '1px solid rgba(255,255,255,0.08)' },
  statNum: { fontSize: 26, fontWeight: 900, fontFamily: 'JetBrains Mono, monospace', letterSpacing: -1, background: 'linear-gradient(135deg, #ffffff, #e2e8f0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  statLabel: { fontSize: 11, color: '#484f58', marginTop: 3 },
  footer: { padding: '28px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: '#484f58' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  waPopup: { background: '#161b22', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '32px 24px', maxWidth: 340, width: '100%', textAlign: 'center', position: 'relative', animation: 'popupIn 0.3s ease', fontFamily: 'Plus Jakarta Sans, sans-serif' },
  popupClose: { position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 30, height: 30, color: '#8b949e', fontSize: 13, cursor: 'pointer' },
  popupIcon: { fontSize: 36, marginBottom: 12 },
  popupTitle: { fontSize: 18, fontWeight: 800, color: '#f0f6fc', marginBottom: 8 },
  popupDesc: { fontSize: 13, color: '#8b949e', lineHeight: 1.6, marginBottom: 20 },
  popupBtn: { display: 'block', width: '100%', padding: '13px', background: 'linear-gradient(135deg, #ffffff, #e2e8f0)', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, color: '#0d1117', cursor: 'pointer', textDecoration: 'none', marginBottom: 10, boxShadow: '0 4px 14px rgba(255,255,255,0.2)' },
  popupSkip: { background: 'none', border: 'none', color: '#484f58', fontSize: 12, cursor: 'pointer', padding: 4 },
}
