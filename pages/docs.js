import Head from 'next/head'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import endpoints from '../config/endpoints'

const AVATAR = 'https://raw.githubusercontent.com/kyleee-max/mutsumi-file/refs/heads/main/IMG-20260513-WA0005.jpg'
const VIDEO_URL = 'https://raw.githubusercontent.com/kyleee-max/mutsumi-file/refs/heads/main/anime.mp4'

function AnimatedBanner() {
  return (
    <div style={{
      position: 'relative', width: '100%', paddingTop: '56.25%',
      borderRadius: 14, overflow: 'hidden', background: '#000',
    }}>
      <video
        src={VIDEO_URL}
        autoPlay muted loop playsInline
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />

    </div>
  )
}

const grouped = endpoints.reduce((acc, ep) => {
  if (!acc[ep.category]) acc[ep.category] = []
  acc[ep.category].push(ep)
  return acc
}, {})

function useScrollReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

function EpCard({ ep, index, onClick }) {
  const [ref, visible] = useScrollReveal()
  const [hovered, setHovered] = useState(false)
  return (
    <div ref={ref} onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#1a2332' : '#161b22',
        border: hovered ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14, padding: '16px 18px', marginBottom: 10, cursor: 'pointer',
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        opacity: visible ? 1 : 0,
        transition: `transform 0.4s ease ${index * 0.06}s, opacity 0.4s ease ${index * 0.06}s, background 0.2s, border 0.2s, box-shadow 0.2s`,
        boxShadow: hovered ? '0 8px 24px rgba(255,255,255,0.08)' : 'none',
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 5, color: hovered ? '#f0f6fc' : '#e6edf3', transition: 'color 0.2s' }}>{ep.name}</div>
      <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.5, marginBottom: 14 }}>{ep.desc}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: hovered ? 'linear-gradient(135deg, #ffffff, #e2e8f0)' : 'linear-gradient(135deg, #38bdf8, #ffffff)',
          borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 800, color: '#fff',
          fontFamily: 'JetBrains Mono, monospace', transition: 'background 0.2s',
        }}>&lt;/&gt; GET</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: ep.status === 'error' ? '#f87171' : '#10b981' }}>
          <div style={{ width: 8, height: 8, background: ep.status === 'error' ? '#f87171' : '#10b981', borderRadius: '50%', animation: ep.status === 'error' ? 'none' : 'blink 2s infinite' }} />
          {ep.status === 'error' ? 'Error' : 'Ready'}
        </div>
      </div>
    </div>
  )
}

function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i, size: Math.random() * 3 + 1, x: Math.random() * 100,
    delay: Math.random() * 8, duration: Math.random() * 10 + 12, opacity: Math.random() * 0.4 + 0.1,
  }))
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', width: p.size, height: p.size, background: '#ffffff',
          borderRadius: '50%', left: `${p.x}%`, bottom: '-10px', opacity: p.opacity,
          animation: `floatUp ${p.duration}s ${p.delay}s infinite linear`,
        }} />
      ))}
    </div>
  )
}

export default function Docs() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [params, setParams] = useState({})
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)

  const filtered = search
    ? endpoints.filter(ep => ep.name.toLowerCase().includes(search.toLowerCase()) || ep.desc.toLowerCase().includes(search.toLowerCase()))
    : null

  const openModal = (ep) => { setModal(ep); setParams({}); setResponse(null); setLoading(false) }
  const closeModal = () => setModal(null)

  const getUrl = () => {
    if (!modal) return ''
    const q = modal.params.map(p => `${p.key}=${encodeURIComponent(params[p.key] || p.placeholder || '')}`).join('&')
    return `https://api.furina.my.id${modal.path}?${q}`
  }

  const sendRequest = async () => {
    setLoading(true); setResponse(null)
    const q = modal.params.map(p => params[p.key] ? `${p.key}=${encodeURIComponent(params[p.key])}` : '').filter(Boolean).join('&')
    try {
      const res = await fetch(`${window.location.origin}${modal.path}?${q}`)
      const contentType = res.headers.get('content-type') || ''
      if (contentType.startsWith('image/')) {
        const blob = await res.blob()
        const blobUrl = URL.createObjectURL(blob)
        setResponse({ ok: true, isImage: true, blobUrl, contentType })
      } else {
        const data = await res.json()
        setResponse({ ok: data.success, isImage: false, data })
      }
    } catch (e) {
      setResponse({ ok: false, isImage: false, data: { error: e.message } })
    }
    setLoading(false)
  }

  const downloadImage = () => {
    if (!response?.blobUrl) return
    const ext = response.contentType?.includes('png') ? 'png' : 'jpg'
    const a = document.createElement('a')
    a.href = response.blobUrl
    a.download = `furina-apis-result.${ext}`
    a.click()
  }

  const copyUrl = () => navigator.clipboard.writeText(getUrl())

  const renderList = (eps, offset = 0) => eps.map((ep, i) => (
    <EpCard key={i} ep={ep} index={i + offset} onClick={() => openModal(ep)} />
  ))

  return (
    <>
      <Head>
        <title>Furina Apis — Docs</title>
        <link rel="icon" href={AVATAR} />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <Particles />

      <nav style={s.nav}>
        <div style={s.navLogo} onClick={() => router.push('/')}>
          <img src={AVATAR} style={s.navAvatar} alt="Furina Apis" />
        </div>
        <div style={s.navSearch}>
          <span style={s.searchIcon}>🔍</span>
          <input style={s.searchInput} placeholder="Search API..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={s.navNotif}>
          🔔
          <div style={s.notifDot} />
        </div>
      </nav>

      <main style={s.main}>
        <div style={s.header}>
          <div style={s.titleRow}>
            <span style={s.titleText}>Furina Apis</span>
            <span style={s.versionBadge}>v1.0.0</span>
          </div>
          <p style={s.headerSub}>Simple and easy to use API.</p>
          <div style={s.bannerWrap}>
            <AnimatedBanner />
          </div>
        </div>

        <div style={s.availableWrap}>
          <h2 style={s.availableTitle}>Available APIs</h2>
          <div style={s.availableLine} />
          <p style={s.availableSub}>Explore our collection of powerful and easy-to-use APIs.</p>
        </div>

        <div style={s.epList}>
          {search ? (
            filtered.length > 0 ? renderList(filtered) : <p style={s.noResult}>Tidak ada endpoint yang cocok.</p>
          ) : (
            Object.entries(grouped).map(([cat, eps], ci) => (
              <div key={cat}>
                <div style={s.catLabel}>
                  <div style={s.catBar} />
                  <span style={s.catName}>{cat}</span>
                </div>
                {renderList(eps, ci * 10)}
              </div>
            ))
          )}
        </div>
      </main>

      {modal && (
        <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <div>
                <div style={s.modalTitle}>{modal.name}</div>
                <div style={s.modalDesc}>{modal.desc}</div>
              </div>
              <button style={s.modalX} onClick={closeModal}>✕</button>
            </div>

            <div style={s.modalBody}>
              <div style={s.epLabelRow}>
                <span style={s.epLabelTxt}>Endpoint</span>
                <button style={s.copyBtn} onClick={copyUrl}>⧉</button>
              </div>
              <div style={s.urlBox}>
                <div style={s.urlText}>{getUrl()}</div>
                <div style={s.urlLine} />
              </div>

              <div style={s.paramsBox}>
                <div style={s.paramsHead}>⚙️ Parameters</div>
                {modal.params.map((p, i) => (
                  <div key={i} style={s.paramBlock}>
                    <div style={s.paramRow}>
                      <span style={s.paramKey}>{p.key}</span>
                      <span style={s.paramStar}>*</span>
                      <div style={s.paramInfo}>i</div>
                    </div>
                    {p.type === 'select' ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                        {p.options.map(opt => (
                          <div
                            key={opt.value}
                            onClick={() => setParams({ ...params, [p.key]: opt.value })}
                            style={{
                              padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                              cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
                              background: params[p.key] === opt.value ? '#ffffff' : 'transparent',
                              borderColor: params[p.key] === opt.value ? '#ffffff' : 'rgba(255,255,255,0.15)',
                              color: params[p.key] === opt.value ? '#0d1117' : '#8b949e',
                            }}
                          >
                            {opt.label}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <input
                        style={s.paramInput}
                        placeholder={p.placeholder}
                        value={params[p.key] || ''}
                        onChange={e => setParams({ ...params, [p.key]: e.target.value })}
                      />
                    )}
                  </div>
                ))}
              </div>

              {loading && (
                <div style={s.loadingArea}>
                  <div style={s.spinner} />
                  <span style={s.loadingTxt}>Processing request...</span>
                </div>
              )}

              {response && !loading && (
                response.isImage ? (
                  <div style={s.imgRespBox}>
                    <img src={response.blobUrl} style={s.imgPreview} alt="result" />
                    <button style={s.dlBtn} onClick={downloadImage}>⬇ Download</button>
                  </div>
                ) : (
                  <div style={s.respWrap}>
                    <div style={s.respHead}>
                      <span style={s.respLabel}>Response</span>
                      <button style={s.respCopyBtn} onClick={() => navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))}>⧉ Copy</button>
                    </div>
                    <div style={{...s.respBox, color: response.ok ? '#ffffff' : '#f87171'}}>
                      {JSON.stringify(response.data, null, 2)}
                    </div>
                  </div>
                )
              )}
            </div>

            <div style={s.modalFoot}>
              <button style={{...s.sendBtn, ...(loading ? { opacity: 0.7, cursor: 'not-allowed' } : {})}} onClick={sendRequest} disabled={loading}>
                {loading ? '↺ Processing...' : '↺ Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes floatUp {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100vh) translateX(30px); opacity: 0; }
        }
        @keyframes popIn { from{opacity:0;transform:scale(0.96) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
      `}</style>
    </>
  )
}

const s = {
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 14px', height: 56, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(13,17,23,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)', fontFamily: 'Plus Jakarta Sans, sans-serif' },
  navLogo: { cursor: 'pointer', flexShrink: 0 },
  navAvatar: { width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', objectFit: 'cover', display: 'block' },
  navSearch: { flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 22, padding: '9px 14px' },
  searchIcon: { color: '#ffffff', fontSize: 14, flexShrink: 0 },
  searchInput: { flex: 1, background: 'none', border: 'none', outline: 'none', color: '#f0f6fc', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13 },
  navNotif: { width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, cursor: 'pointer', position: 'relative', flexShrink: 0 },
  notifDot: { position: 'absolute', top: 4, right: 4, width: 9, height: 9, background: '#f97316', borderRadius: '50%', border: '2px solid #0d1117' },
  main: { paddingTop: 56, background: '#0d1117', minHeight: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif', position: 'relative', zIndex: 1 },
  header: { padding: '28px 16px 0', textAlign: 'center', background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)' },
  titleRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 },
  titleText: { fontSize: 30, fontWeight: 900, letterSpacing: -0.8, background: 'linear-gradient(135deg, #ffffff, #e2e8f0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  versionBadge: { padding: '4px 12px', background: '#ffffff', borderRadius: 8, fontSize: 13, fontWeight: 800, color: '#0d1117', fontFamily: 'JetBrains Mono, monospace' },
  headerSub: { fontSize: 13, color: '#8b949e', marginBottom: 22 },
  bannerWrap: { margin: '0 0 8px 0' },
  availableWrap: { padding: '28px 16px 0' },
  availableTitle: { fontSize: 24, fontWeight: 900, letterSpacing: -0.5, display: 'inline-block', marginBottom: 8 },
  availableLine: { width: 40, height: 3, background: '#ffffff', borderRadius: 2, marginBottom: 10 },
  availableSub: { fontSize: 13, color: '#8b949e' },
  epList: { padding: '0 16px 100px' },
  noResult: { color: '#484f58', fontSize: 13, marginTop: 20 },
  catLabel: { display: 'flex', alignItems: 'center', gap: 10, margin: '24px 0 12px' },
  catBar: { width: 4, height: 24, background: '#ffffff', borderRadius: 2 },
  catName: { fontSize: 20, fontWeight: 900, letterSpacing: -0.3 },
  overlay: { position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal: { width: '100%', maxWidth: 460, background: '#1e2d47', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, overflow: 'hidden', fontFamily: 'Plus Jakarta Sans, sans-serif', maxHeight: '90vh', display: 'flex', flexDirection: 'column', animation: 'popIn 0.25s ease' },
  modalHead: { padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexShrink: 0 },
  modalTitle: { fontSize: 19, fontWeight: 900, letterSpacing: -0.4, marginBottom: 4 },
  modalDesc: { fontSize: 12, color: '#7a8fa8', lineHeight: 1.5 },
  modalX: { width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#7a8fa8', cursor: 'pointer', flexShrink: 0 },
  modalBody: { padding: '18px 20px', overflowY: 'auto', flex: 1 },
  epLabelRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, marginBottom: 8 },
  epLabelTxt: { fontSize: 13, fontWeight: 800 },
  copyBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#4b5a72', fontSize: 17, padding: 0 },
  urlBox: { background: '#0e1929', borderRadius: 10, padding: '13px 14px', marginBottom: 16, position: 'relative', overflow: 'hidden' },
  urlText: { fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#c8d8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  urlLine: { position: 'absolute', bottom: 0, left: 0, height: 2, width: '65%', background: 'linear-gradient(90deg, #ffffff, #e2e8f0)' },
  paramsBox: { background: '#0e1929', borderRadius: 12, padding: '14px 16px', marginBottom: 16 },
  paramsHead: { fontSize: 14, fontWeight: 800, marginBottom: 14 },
  paramBlock: { marginBottom: 12 },
  paramRow: { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 },
  paramKey: { fontSize: 13, fontWeight: 700, color: '#f0f6fc' },
  paramStar: { color: '#f87171', fontSize: 13 },
  paramInfo: { width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#4b5a72' },
  paramInput: { width: '100%', background: '#1a2a45', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, padding: '10px 13px', color: '#f0f6fc', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, outline: 'none' },
  loadingArea: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '24px 0' },
  spinner: { width: 38, height: 38, border: '3px solid rgba(255,255,255,0.15)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 0.75s linear infinite' },
  loadingTxt: { fontSize: 13, color: '#7a8fa8' },
  respWrap: { marginTop: 4 },
  respHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  respLabel: { fontSize: 11, fontWeight: 700, color: '#4b5a72', textTransform: 'uppercase', letterSpacing: 0.5 },
  respCopyBtn: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#ffffff', cursor: 'pointer' },
  respBox: { background: '#0e1929', borderRadius: 10, padding: 13, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, maxHeight: 180, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.6 },
  modalFoot: { padding: '14px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 },
  sendBtn: { padding: '12px 28px', background: 'linear-gradient(135deg, #ffffff, #e2e8f0)', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 800, color: '#0d1117', cursor: 'pointer', minWidth: 160, textAlign: 'center' },
  imgRespBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 4 },
  imgPreview: { width: '100%', maxHeight: 280, objectFit: 'contain', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'repeating-conic-gradient(#1e2d47 0% 25%, #0e1929 0% 50%) 0 0 / 16px 16px' },
  dlBtn: { width: '100%', padding: '10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 9, fontSize: 13, fontWeight: 700, color: '#ffffff', cursor: 'pointer' },
}
