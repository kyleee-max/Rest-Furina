import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Custom404() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const c = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(c); router.push('/'); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(c)
  }, [])

  return (
    <>
      <Head>
        <title>404 — Furina Apis</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: '250px', height: '250px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.08), transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          marginBottom: '48px',
          cursor: 'pointer',
        }} onClick={() => router.push('/')}>
          <img src="https://files.catbox.moe/t3ij34.jpg" alt="Furina Apis" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
          <span style={{ fontWeight: 700, fontSize: '18px', color: '#0f172a' }}>Furina Apis</span>
        </div>

        {/* 404 illustration area */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          padding: '48px 56px',
          textAlign: 'center',
          maxWidth: '460px',
          width: '100%',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          {/* Big 404 */}
          <div style={{
            fontSize: '96px',
            fontWeight: 800,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px',
            letterSpacing: '-4px',
          }}>
            404
          </div>

          {/* Emoji */}
          <div style={{ fontSize: '40px', marginBottom: '20px' }}>🔍</div>

          <h1 style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 10px',
          }}>
            Halaman Tidak Ditemukan
          </h1>

          <p style={{
            fontSize: '14px',
            color: '#64748b',
            lineHeight: 1.7,
            margin: '0 0 28px',
          }}>
            Endpoint atau halaman yang kamu cari tidak ada.<br />
            Cek kembali URL atau kunjungi dokumentasi kami.
          </p>

          {/* Countdown bar */}
          <div style={{
            background: '#f1f5f9',
            borderRadius: '8px',
            padding: '10px 16px',
            marginBottom: '24px',
            fontSize: '13px',
            color: '#64748b',
          }}>
            Redirect otomatis ke home dalam{' '}
            <span style={{ color: '#6366f1', fontWeight: 700 }}>{countdown} detik</span>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => router.push('/')}
              style={{
                flex: 1,
                padding: '11px 20px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.target.style.opacity = '0.85'}
              onMouseLeave={e => e.target.style.opacity = '1'}
            >
              ← Ke Home
            </button>
            <button
              onClick={() => router.push('/docs')}
              style={{
                flex: 1,
                padding: '11px 20px',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                color: '#374151',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.target.style.borderColor = '#6366f1'}
              onMouseLeave={e => e.target.style.borderColor = '#e2e8f0'}
            >
              Lihat Docs →
            </button>
          </div>
        </div>

        {/* Footer */}
        <p style={{
          marginTop: '32px',
          fontSize: '13px',
          color: '#94a3b8',
        }}>
          © 2026 Furina Apis · Made with ☕ in Indonesia
        </p>
      </div>
    </>
  )
}
