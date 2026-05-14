import Head from 'next/head'
import { useState, useEffect, useRef } from 'react'

const AVATAR = 'https://raw.githubusercontent.com/kyleee-max/mutsumi-file/refs/heads/main/IMG-20260513-WA0005.jpg'

function useMonaco(containerRef, value, onChange) {
  const editorRef = useRef(null)
  useEffect(() => {
    if (!containerRef.current || editorRef.current) return
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js'
    script.onload = () => {
      window.require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } })
      window.require(['vs/editor/editor.main'], () => {
        window.monaco.editor.defineTheme('dark-custom', {
          base: 'vs-dark', inherit: true, rules: [],
          colors: { 'editor.background': '#0d1117' },
        })
        editorRef.current = window.monaco.editor.create(containerRef.current, {
          value, language: 'javascript', theme: 'dark-custom',
          fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false,
          automaticLayout: true, wordWrap: 'on', fontFamily: 'JetBrains Mono, monospace',
        })
        editorRef.current.onDidChangeModelContent(() => onChange(editorRef.current.getValue()))
      })
    }
    document.head.appendChild(script)
    return () => { if (editorRef.current) { editorRef.current.dispose(); editorRef.current = null } }
  }, [])
  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== value) editorRef.current.setValue(value)
  }, [value])
}

function api(action, opts = {}) {
  const token = sessionStorage.getItem('admin_token')
  return fetch(`/api/admin/exec?action=${action}`, {
    headers: { 'x-admin-token': token, 'Content-Type': 'application/json' }, ...opts,
  }).then(r => r.json())
}

function LoginPage({ onLogin }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async () => {
    setLoading(true); setErr('')
    sessionStorage.setItem('admin_token', pw)
    const res = await api('list').catch(() => null)
    if (res?.ok) { onLogin() } else { setErr('Password salah.'); sessionStorage.removeItem('admin_token') }
    setLoading(false)
  }
  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 360, padding: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src={AVATAR} style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', marginBottom: 14 }} />
          <div style={{ fontSize: 22, fontWeight: 900, color: '#f0f6fc', letterSpacing: -0.5 }}>Admin Panel</div>
          <div style={{ fontSize: 13, color: '#484f58', marginTop: 4 }}>Furina Apis</div>
        </div>
        <div style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#8b949e', marginBottom: 8 }}>PASSWORD</div>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Masukkan password admin"
            style={{ width: '100%', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', color: '#f0f6fc', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'JetBrains Mono, monospace' }} />
          {err && <div style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>{err}</div>}
          <button onClick={submit} disabled={loading}
            style={{ width: '100%', marginTop: 16, padding: '13px', background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
            {loading ? 'Checking...' : '🔐 Login'}
          </button>
        </div>
      </div>
    </div>
  )
}

function FileTree({ files, active, onSelect }) {
  const grouped = {}
  files.forEach(f => {
    const parts = f.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '__root__'
    if (!grouped[dir]) grouped[dir] = []
    grouped[dir].push(f)
  })
  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      {Object.entries(grouped).map(([dir, fs]) => (
        <div key={dir}>
          {dir !== '__root__' && (
            <div style={{ padding: '8px 16px 4px', fontSize: 10, fontWeight: 700, color: '#484f58', textTransform: 'uppercase', letterSpacing: 0.8 }}>{dir}</div>
          )}
          {fs.map(f => (
            <button key={f} onClick={() => onSelect(f)}
              style={{ width: '100%', textAlign: 'left', padding: '7px 16px', background: active === f ? 'rgba(56,189,248,0.15)' : 'none', border: 'none', borderLeft: active === f ? '2px solid #38bdf8' : '2px solid transparent', color: active === f ? '#38bdf8' : '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {f.split('/').pop()}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

function EditorPanel({ file, onSaved }) {
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const containerRef = useRef(null)
  useMonaco(containerRef, content, setContent)
  useEffect(() => {
    if (!file) return
    api(`read&file=${encodeURIComponent(file)}`).then(r => { if (r.ok) setContent(r.content) })
  }, [file])
  const save = async () => {
    setSaving(true)
    const res = await api('save', { method: 'POST', body: JSON.stringify({ file, content }) })
    setSaving(false)
    if (res.ok) { setToast({ ok: true, msg: '✓ Saved!' }); onSaved() } else setToast({ ok: false, msg: '✗ Gagal save' })
    setTimeout(() => setToast(null), 2500)
  }
  if (!file) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#484f58', fontSize: 13 }}>Pilih file dari sidebar</div>
  )
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 12, color: '#8b949e', fontFamily: 'JetBrains Mono, monospace' }}>{file}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {toast && <span style={{ fontSize: 12, color: toast.ok ? '#4ade80' : '#f87171' }}>{toast.msg}</span>}
          <button onClick={save} disabled={saving}
            style={{ padding: '7px 18px', background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
            {saving ? 'Saving...' : '💾 Save'}
          </button>
        </div>
      </div>
      <div ref={containerRef} style={{ flex: 1 }} />
    </div>
  )
}

function LogsPanel() {
  const [logs, setLogs] = useState([])
  useEffect(() => {
    const fetch_ = () => api('logs').then(r => r.ok && setLogs(r.logs))
    fetch_()
    const t = setInterval(fetch_, 5000)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#8b949e', marginBottom: 12 }}>Request Log (in-memory, max 200)</div>
      {logs.length === 0 && <div style={{ color: '#484f58', fontSize: 12 }}>Belum ada request masuk.</div>}
      {logs.map((l, i) => (
        <div key={i} style={{ padding: '8px 12px', background: '#161b22', borderRadius: 8, marginBottom: 6, display: 'flex', gap: 10, alignItems: 'center', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
          <span style={{ color: '#38bdf8', fontWeight: 700, flexShrink: 0 }}>{l.method}</span>
          <span style={{ color: '#f0f6fc', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.url}</span>
          <span style={{ color: '#484f58', flexShrink: 0 }}>{l.ip}</span>
          <span style={{ color: '#484f58', flexShrink: 0 }}>{l.time?.slice(11, 19)}</span>
        </div>
      ))}
    </div>
  )
}

function btnStyle(bg, color) {
  return { padding: '6px 12px', background: bg, border: `1px solid ${color}33`, borderRadius: 8, fontSize: 12, fontWeight: 700, color, cursor: 'pointer' }
}

function Dashboard({ onLogout }) {
  const [tab, setTab] = useState('editor')
  const [files, setFiles] = useState([])
  const [activeFile, setActiveFile] = useState(null)
  const [output, setOutput] = useState('')
  const [outputLoading, setOutputLoading] = useState(false)
  useEffect(() => { api('list').then(r => r.ok && setFiles(r.files)) }, [])
  const runAction = async (action, label) => {
    setOutput(`Running ${label}...`); setOutputLoading(true)
    const res = await api(action)
    setOutput(res.output || (res.ok ? 'Done.' : res.message || 'Error'))
    setOutputLoading(false)
  }
  const backup = () => {
    const token = sessionStorage.getItem('admin_token')
    fetch('/api/admin/exec?action=backup', { headers: { 'x-admin-token': token } })
      .then(r => r.blob()).then(blob => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `backup-${Date.now()}.zip`; a.click()
        URL.revokeObjectURL(url)
      })
  }
  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', flexDirection: 'column', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <nav style={{ height: 52, background: '#161b22', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0, flexWrap: 'wrap' }}>
        <img src={AVATAR} style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' }} />
        <span style={{ fontSize: 14, fontWeight: 800, color: '#f0f6fc' }}>Furina Apis <span style={{ color: '#38bdf8' }}>Admin</span></span>
        <div style={{ flex: 1 }} />
        <button onClick={() => runAction('build', 'Build')} style={btnStyle('#1e3a4a', '#38bdf8')}>🔨 Build</button>
        <button onClick={() => runAction('stop', 'Stop')} style={btnStyle('#3a1e1e', '#f87171')}>⏹ Stop</button>
        <button onClick={() => runAction('start', 'Start')} style={btnStyle('#1e3a1e', '#4ade80')}>▶ Start</button>
        <button onClick={backup} style={btnStyle('#2a1e3a', '#c084fc')}>📦 Backup</button>
        <button onClick={onLogout} style={btnStyle('#1e1e2a', '#8b949e')}>🚪 Logout</button>
      </nav>
      {output && (
        <div style={{ background: '#0e1929', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '8px 16px', fontSize: 11, color: outputLoading ? '#38bdf8' : '#4ade80', fontFamily: 'JetBrains Mono, monospace', maxHeight: 80, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
          {output}
        </div>
      )}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#161b22', flexShrink: 0 }}>
        {[{ key: 'editor', label: '📝 Editor' }, { key: 'logs', label: '📋 Logs' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: '10px 18px', background: 'none', border: 'none', borderBottom: tab === t.key ? '2px solid #38bdf8' : '2px solid transparent', color: tab === t.key ? '#38bdf8' : '#8b949e', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {tab === 'editor' && (
          <>
            <div style={{ width: 220, background: '#161b22', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
              <div style={{ padding: '10px 16px 6px', fontSize: 10, fontWeight: 700, color: '#484f58', textTransform: 'uppercase', letterSpacing: 0.8 }}>Files</div>
              <FileTree files={files} active={activeFile} onSelect={setActiveFile} />
            </div>
            <EditorPanel file={activeFile} onSaved={() => api('list').then(r => r.ok && setFiles(r.files))} />
          </>
        )}
        {tab === 'logs' && <LogsPanel />}
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  useEffect(() => {
    const token = sessionStorage.getItem('admin_token')
    if (token) api('list').then(r => { if (r?.ok) setAuthed(true) })
  }, [])
  const logout = () => { sessionStorage.removeItem('admin_token'); setAuthed(false) }
  return (
    <>
      <Head>
        <title>Admin — Furina Apis</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      {authed ? <Dashboard onLogout={logout} /> : <LoginPage onLogin={() => setAuthed(true)} />}
    </>
  )
}
