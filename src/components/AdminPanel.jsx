import React, { useEffect, useState } from 'react'
import { usePortfolioContent } from '../ContentContext'

/* ── section config ───────────────────────────────────────────── */
const SECTIONS = {
  projects: {
    title: 'Projects',
    icon: 'fas fa-rocket',
    singular: 'project',
    key: (r) => r.name,
    fields: [
      { id: 'name',     label: 'Project name',           type: 'text' },
      { id: 'category', label: 'Category',               type: 'text' },
      { id: 'emoji',    label: 'Emoji icon',             type: 'text' },
      { id: 'bg',       label: 'Card gradient (CSS)',    type: 'text' },
      { id: 'desc',     label: 'Description',            type: 'textarea' },
      { id: 'tags',     label: 'Tags (one per line)',    type: 'list' },
      { id: 'github',   label: 'GitHub URL',             type: 'text' },
      { id: 'demo',     label: 'Live demo URL',          type: 'text' },
    ],
    blank: { emoji: '🚀', bg: 'linear-gradient(135deg,#1a1a35,#0d0d1a)', category: '', name: '', desc: '', tags: [], github: '', demo: '' },
  },
  skills: {
    title: 'Skills',
    icon: 'fas fa-code',
    singular: 'skill',
    key: (r) => r.name,
    fields: [
      { id: 'name',  label: 'Skill name',             type: 'text' },
      { id: 'icon',  label: 'Font Awesome class',     type: 'text' },
      { id: 'color', label: 'Card colour (hex)',      type: 'color-text' },
      { id: 'pct',   label: 'Proficiency (0 – 100)', type: 'number' },
      { id: 'desc',  label: 'Description',            type: 'textarea' },
    ],
    blank: { name: '', icon: 'fas fa-code', color: '#6c63ff', pct: 60, desc: '' },
  },
  education: {
    title: 'Education',
    icon: 'fas fa-graduation-cap',
    singular: 'entry',
    key: (r) => r.degree,
    fields: [
      { id: 'degree',   label: 'Degree / qualification', type: 'text' },
      { id: 'school',   label: 'School / institution',   type: 'text' },
      { id: 'label',    label: 'Category label',         type: 'text' },
      { id: 'icon',     label: 'Emoji icon',             type: 'text' },
      { id: 'location', label: 'Location',               type: 'text' },
      { id: 'year',     label: 'Years attended',         type: 'text' },
      { id: 'desc',     label: 'Description',            type: 'textarea' },
      { id: 'tags',     label: 'Tags (one per line)',    type: 'list' },
    ],
    blank: { icon: '🎓', label: 'EDUCATION', degree: '', school: '', location: '', year: '', desc: '', tags: [] },
  },
  experience: {
    title: 'Experience',
    icon: 'fas fa-briefcase',
    singular: 'entry',
    key: (r) => r.company,
    fields: [
      { id: 'company',      label: 'Company',                       type: 'text' },
      { id: 'role',         label: 'Role / title',                  type: 'text' },
      { id: 'type',         label: 'Position type',                 type: 'text' },
      { id: 'period',       label: 'Dates',                         type: 'text' },
      { id: 'companyDesc',  label: 'Company description',           type: 'text' },
      { id: 'logo',         label: 'Logo path (e.g. /co.png)',     type: 'text' },
      { id: 'logoFallback', label: 'Logo initials',                 type: 'text' },
      { id: 'desc',         label: 'Description',                   type: 'textarea' },
      { id: 'highlights',   label: 'Highlights (one per line)',     type: 'list' },
      { id: 'tags',         label: 'Skills / tools (one per line)', type: 'list' },
    ],
    blank: { logo: '', logoFallback: '', company: '', companyDesc: '', role: '', period: '', type: 'Internship', desc: '', highlights: [], tags: [] },
  },
}

function clone(v) { return JSON.parse(JSON.stringify(v)) }

function fieldValue(record, field) {
  const v = record[field.id]
  if (field.type === 'list') return (v || []).join('\n')
  return v ?? ''
}

function parseField(value, type) {
  if (type === 'number') return Number(value)
  if (type === 'list')   return value.split('\n').map(s => s.trim()).filter(Boolean)
  return value
}

/* ── Login screen ─────────────────────────────────────────────── */
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [busy, setBusy]         = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setError('')
    const apiBase = import.meta.env.VITE_API_URL || ''
    try {
      const res = await fetch(`${apiBase}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      onLogin()
      setPassword('')
    } catch (err) {
      setError(err.message || 'Could not connect to server.')
    } finally { setBusy(false) }
  }

  return (
    <main className="adm-page">
      <div className="adm-login-wrap">
        <a className="adm-back" href="/"><i className="fas fa-arrow-left"></i> Back to portfolio</a>
        <div className="adm-login-card">
          <div className="adm-login-logo"><i className="fas fa-shield-alt"></i></div>
          <h1 className="adm-login-title">Admin <span>Login</span></h1>
          <p className="adm-login-sub">Sign in to manage your portfolio content.</p>

          {error && (
            <div className="adm-alert adm-alert-error">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          <form onSubmit={submit} className="adm-login-form">
            <div className="adm-input-group">
              <i className="fas fa-user adm-input-icon"></i>
              <input placeholder="Username" autoComplete="username"
                value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="adm-input-group">
              <i className="fas fa-lock adm-input-icon"></i>
              <input type="password" placeholder="Password" autoComplete="current-password"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button className="adm-login-btn" disabled={busy}>
              {busy
                ? <><i className="fas fa-circle-notch fa-spin"></i> Signing in…</>
                : <><i className="fas fa-sign-in-alt"></i> Sign in</>}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

/* ── Record card ──────────────────────────────────────────────── */
function RecordCard({ sectionKey, config, record, index, onChange, onRemove }) {
  const [logoErr, setLogoErr] = useState(false)
  const displayTitle = config.key(record) || `New ${config.singular}`

  return (
    <div className="adm-record">
      <div className="adm-record-header">
        <div className="adm-record-title">
          {sectionKey === 'projects' && record.emoji && (
            <span className="adm-record-emoji">{record.emoji}</span>
          )}
          {sectionKey === 'skills' && record.icon && (
            <i className={`${record.icon} adm-record-ico`} style={{ color: record.color || 'var(--primary)' }}></i>
          )}
          {sectionKey === 'education' && record.icon && (
            <span className="adm-record-emoji">{record.icon}</span>
          )}
          {sectionKey === 'experience' && (
            <div className="adm-record-logo-sm">
              {record.logo && !logoErr
                ? <img src={record.logo} alt="" onError={() => setLogoErr(true)} />
                : <span style={{ display: 'flex' }}>{record.logoFallback || '?'}</span>}
            </div>
          )}
          <span>{displayTitle}</span>
        </div>
        {/* confirm before deleting to avoid accidental data loss */}
        <button className="adm-remove-btn"
          onClick={() => {
            if (window.confirm(`Remove this ${config.singular}? This cannot be undone.`)) {
              onRemove(index)
            }
          }}
          title="Remove">
          <i className="fas fa-trash"></i> Remove
        </button>
      </div>

      <div className="adm-fields">
        {config.fields.map(field => (
          <label
            key={field.id}
            className={`adm-field ${field.type === 'textarea' || field.type === 'list' ? 'adm-field-full' : ''}`}
          >
            <span className="adm-field-label">{field.label}</span>

            {field.type === 'textarea' && (
              <textarea rows={3}
                value={fieldValue(record, field)}
                onChange={e => onChange(index, field.id, e.target.value, field.type)} />
            )}
            {field.type === 'list' && (
              <textarea rows={4} placeholder="One item per line"
                value={fieldValue(record, field)}
                onChange={e => onChange(index, field.id, e.target.value, field.type)} />
            )}
            {field.type === 'color-text' && (
              <div className="adm-color-row">
                <input type="color"
                  value={record[field.id] || '#6c63ff'}
                  onChange={e => onChange(index, field.id, e.target.value, 'text')}
                  className="adm-color-swatch" />
                <input type="text" placeholder="#6c63ff"
                  value={record[field.id] || ''}
                  onChange={e => onChange(index, field.id, e.target.value, 'text')} />
              </div>
            )}
            {(field.type === 'text' || field.type === 'number') && (
              <input
                type={field.type}
                min={field.type === 'number' ? 0   : undefined}
                max={field.type === 'number' ? 100 : undefined}
                value={fieldValue(record, field)}
                onChange={e => onChange(index, field.id, e.target.value, field.type)} />
            )}
          </label>
        ))}
      </div>
    </div>
  )
}

/* ── Main panel ───────────────────────────────────────────────── */
export default function AdminPanel() {
  const { content, setContent } = usePortfolioContent()

  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking]           = useState(true)
  const [section, setSection]             = useState('projects')
  const [draft, setDraft]                 = useState(() => clone(content))
  const [message, setMessage]             = useState('')
  const [error, setError]                 = useState('')
  const [busy, setBusy]                   = useState(false)

  /* resume-specific state */
  const [resumeFile, setResumeFile]       = useState(null)
  const [resumeBusy, setResumeBusy]       = useState(false)
  const [resumeMessage, setResumeMessage] = useState('')
  const [resumeError, setResumeError]     = useState('')

  /* check existing session on mount */
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || ''
    fetch(`${apiBase}/api/session`)
      .then(r => r.json())
      .then(d => setAuthenticated(Boolean(d.authenticated)))
      .catch(() => setError('Could not connect to the portfolio server.'))
      .finally(() => setChecking(false))
  }, [])

  /* load fresh content once authenticated */
  useEffect(() => {
    if (!authenticated) return
    const apiBase = import.meta.env.VITE_API_URL || ''
    fetch(`${apiBase}/api/content`)
      .then(r => { if (!r.ok) throw new Error('Failed to load content'); return r.json() })
      .then(data => { setContent(data); setDraft(clone(data)) })
      .catch(() => setError('Could not load saved portfolio content.'))
  }, [authenticated]) // setContent is a stable setter — intentionally omitted from deps

  /* derive records directly — no useMemo needed for a trivial lookup */
  const config  = section !== 'resume' ? SECTIONS[section] : null
  const records = section !== 'resume' ? (draft[section] ?? []) : []

  function switchSection(key) {
    setSection(key)
    setMessage(''); setError('')
    setResumeMessage(''); setResumeError('')
  }

  function updateField(index, field, value, type) {
    setDraft(cur => {
      const next = clone(cur)
      next[section][index][field] = parseField(value, type)
      return next
    })
    setMessage('')
  }

  function addRecord() {
    if (!config) return
    setDraft(cur => ({ ...cur, [section]: [clone(config.blank), ...cur[section]] }))
    setMessage('')
  }

  function removeRecord(index) {
    if (!config) return
    setDraft(cur => ({ ...cur, [section]: cur[section].filter((_, i) => i !== index) }))
    setMessage('')
  }

  async function save() {
    setBusy(true); setError(''); setMessage('')
    const apiBase = import.meta.env.VITE_API_URL || ''
    try {
      const res = await fetch(`${apiBase}/api/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not save changes')
      setContent(data)
      setDraft(clone(data))
      setMessage('✓ Changes saved and published to your portfolio.')
    } catch (err) {
      setError(err.message || 'Could not save changes.')
    } finally { setBusy(false) }
  }

  async function uploadResume() {
    if (!resumeFile) return
    setResumeBusy(true); setResumeError(''); setResumeMessage('')
    const apiBase = import.meta.env.VITE_API_URL || ''
    try {
      const formData = new FormData()
      formData.append('resume', resumeFile)
      const res = await fetch(`${apiBase}/api/resume`, { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setResumeMessage('✓ Resume updated! Visitors will now download the new version.')
      setResumeFile(null)
      const input = document.getElementById('resume-file-input')
      if (input) input.value = ''
    } catch (err) {
      setResumeError(err.message || 'Upload failed.')
    } finally { setResumeBusy(false) }
  }

  async function logout() {
    const apiBase = import.meta.env.VITE_API_URL || ''
    await fetch(`${apiBase}/api/logout`, { method: 'POST' }).catch(() => {})
    setAuthenticated(false)
    setDraft(clone(content))
  }

  /* ── Loading state ── */
  if (checking) {
    return (
      <main className="adm-page adm-center">
        <div className="adm-spinner">
          <i className="fas fa-circle-notch fa-spin"></i>
          <span>Checking session…</span>
        </div>
      </main>
    )
  }

  if (!authenticated) return <LoginScreen onLogin={() => setAuthenticated(true)} />

  /* ── Main UI ── */
  return (
    <main className="adm-page">
      <div className="adm-shell">

        {/* top bar */}
        <header className="adm-topbar">
          <div className="adm-topbar-left">
            <a className="adm-back" href="/"><i className="fas fa-arrow-left"></i> Portfolio</a>
            <div className="adm-topbar-title">
              <span className="adm-topbar-label">Admin Panel</span>
              <h1>Portfolio <span>Manager</span></h1>
            </div>
          </div>
          <button className="adm-logout-btn" onClick={logout}>
            <i className="fas fa-sign-out-alt"></i> Sign out
          </button>
        </header>

        <div className="adm-layout">

          {/* sidebar */}
          <aside className="adm-sidebar">
            <p className="adm-sidebar-label">Sections</p>

            {Object.entries(SECTIONS).map(([key, cfg]) => (
              <button key={key}
                className={`adm-nav-btn${section === key ? ' active' : ''}`}
                onClick={() => switchSection(key)}>
                <span className="adm-nav-left">
                  <i className={cfg.icon}></i> {cfg.title}
                </span>
                <span className="adm-nav-badge">{(draft[key] || []).length}</span>
              </button>
            ))}

            {/* Resume tab */}
            <button
              className={`adm-nav-btn${section === 'resume' ? ' active' : ''}`}
              onClick={() => switchSection('resume')}>
              <span className="adm-nav-left">
                <i className="fas fa-file-pdf"></i> Resume
              </span>
            </button>

            <div className="adm-sidebar-save">
              <button className="adm-save-btn" onClick={save} disabled={busy || section === 'resume'}>
                {busy
                  ? <><i className="fas fa-circle-notch fa-spin"></i> Saving…</>
                  : <><i className="fas fa-cloud-upload-alt"></i> Publish</>}
              </button>
            </div>
          </aside>

          {/* editor area */}
          <section className="adm-editor">

            {/* ── Resume panel ── */}
            {section === 'resume' && (
              <>
                <div className="adm-editor-head">
                  <div>
                    <h2><i className="fas fa-file-pdf"></i> Resume</h2>
                    <p>Upload a new PDF to replace the resume visitors download from your portfolio.</p>
                  </div>
                </div>

                {resumeMessage && (
                  <div className="adm-alert adm-alert-success">
                    <i className="fas fa-check-circle"></i> {resumeMessage}
                  </div>
                )}
                {resumeError && (
                  <div className="adm-alert adm-alert-error">
                    <i className="fas fa-exclamation-circle"></i> {resumeError}
                  </div>
                )}

                <div className="adm-record">
                  <div className="adm-fields">
                    <label className="adm-field adm-field-full">
                      <span className="adm-field-label">Current resume</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                        <a href="/lipsa-resume.pdf" target="_blank" rel="noreferrer"
                          className="btn btn-outline"
                          style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}>
                          <i className="fas fa-eye"></i> Preview current PDF
                        </a>
                      </div>
                    </label>

                    <label className="adm-field adm-field-full">
                      <span className="adm-field-label">Upload new resume (PDF, max 10 MB)</span>
                      <input id="resume-file-input" type="file" accept="application/pdf,.pdf"
                        style={{ marginTop: '0.35rem' }}
                        onChange={e => {
                          setResumeFile(e.target.files[0] || null)
                          setResumeMessage(''); setResumeError('')
                        }} />
                    </label>

                    {resumeFile && (
                      <div className="adm-field adm-field-full">
                        <span className="adm-field-label">Selected file</span>
                        <p style={{ marginTop: '0.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          <i className="fas fa-file-pdf" style={{ color: '#e74c3c', marginRight: 6 }}></i>
                          {resumeFile.name} ({(resumeFile.size / 1024).toFixed(1)} KB)
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="adm-footer-save" style={{ marginTop: '1.5rem' }}>
                    <span>The download link on your portfolio stays the same — only the file changes.</span>
                    <button className="adm-save-btn" onClick={uploadResume}
                      disabled={resumeBusy || !resumeFile}>
                      {resumeBusy
                        ? <><i className="fas fa-circle-notch fa-spin"></i> Uploading…</>
                        : <><i className="fas fa-upload"></i> Upload &amp; Replace</>}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── Content section editors ── */}
            {section !== 'resume' && config && (
              <>
                <div className="adm-editor-head">
                  <div>
                    <h2><i className={config.icon}></i> {config.title}</h2>
                    <p>Manage the {config.title.toLowerCase()} shown on your portfolio.</p>
                  </div>
                  <button className="adm-add-btn" onClick={addRecord}>
                    <i className="fas fa-plus"></i> Add {config.singular}
                  </button>
                </div>

                {message && (
                  <div className="adm-alert adm-alert-success">
                    <i className="fas fa-check-circle"></i> {message}
                  </div>
                )}
                {error && (
                  <div className="adm-alert adm-alert-error">
                    <i className="fas fa-exclamation-circle"></i> {error}
                  </div>
                )}

                {records.length === 0 && (
                  <div className="adm-empty">
                    <i className={config.icon}></i>
                    <p>No {config.title.toLowerCase()} yet. Click <strong>Add {config.singular}</strong> to get started.</p>
                  </div>
                )}

                <div className="adm-record-list">
                  {records.map((record, i) => (
                    <RecordCard
                      key={config.key(record) || `${section}-${i}`}
                      sectionKey={section}
                      config={config}
                      record={record}
                      index={i}
                      onChange={updateField}
                      onRemove={removeRecord}
                    />
                  ))}
                </div>

                {records.length > 0 && (
                  <div className="adm-footer-save">
                    <span>Save to publish all changes to the live portfolio.</span>
                    <button className="adm-save-btn" onClick={save} disabled={busy}>
                      {busy
                        ? <><i className="fas fa-circle-notch fa-spin"></i> Saving…</>
                        : <><i className="fas fa-cloud-upload-alt"></i> Save &amp; Publish</>}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
