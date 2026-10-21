import React from 'react'
import { usePortfolioContent } from '../ContentContext'

/* ── per-project theme config ─────────────────────────────────────────────── */
const THEMES = {
  'Contact Info Extractor': {
    ca: '#6C63FF', cb: '#43E8D8',
    icon: 'fas fa-database',
    scene: 'data',
  },
  'Payment Receipt Generator': {
    ca: '#FF6B6B', cb: '#FFD93D',
    icon: 'fas fa-file-invoice-dollar',
    scene: 'receipt',
  },
}
const DEFAULT_THEME = { ca: '#6C63FF', cb: '#43E8D8', icon: 'fas fa-code', scene: 'code' }

/* ── 3-D scene components ─────────────────────────────────────────────────── */

/** Floating data-cube with orbiting rings — for data/scraping projects */
function SceneData({ ca, cb }) {
  return (
    <div className="p3d-scene" style={{ '--ca': ca, '--cb': cb }}>
      {/* background grid */}
      <div className="p3d-grid" />

      {/* central cube */}
      <div className="p3d-cube-wrap">
        <div className="p3d-cube">
          <div className="p3d-face p3d-front"><i className="fas fa-database" /></div>
          <div className="p3d-face p3d-back"  />
          <div className="p3d-face p3d-left"  />
          <div className="p3d-face p3d-right" />
          <div className="p3d-face p3d-top"   />
          <div className="p3d-face p3d-bot"   />
        </div>
      </div>

      {/* orbiting ring */}
      <div className="p3d-orbit p3d-orbit-1" />
      <div className="p3d-orbit p3d-orbit-2" />

      {/* floating particles */}
      <div className="p3d-dot p3d-dot-1" />
      <div className="p3d-dot p3d-dot-2" />
      <div className="p3d-dot p3d-dot-3" />
      <div className="p3d-dot p3d-dot-4" />

      {/* glow beneath */}
      <div className="p3d-glow" />
    </div>
  )
}

/** Floating document with gear — for utility/generator projects */
function SceneReceipt({ ca, cb }) {
  return (
    <div className="p3d-scene" style={{ '--ca': ca, '--cb': cb }}>
      <div className="p3d-grid" />

      {/* document card */}
      <div className="p3d-doc-wrap">
        <div className="p3d-doc">
          <div className="p3d-doc-line" />
          <div className="p3d-doc-line p3d-doc-line--short" />
          <div className="p3d-doc-line" />
          <div className="p3d-doc-line p3d-doc-line--short" />
          <div className="p3d-doc-amount">₹</div>
        </div>
      </div>

      {/* spinning gear */}
      <div className="p3d-gear-wrap">
        <i className="fas fa-cog p3d-gear" />
      </div>

      <div className="p3d-dot p3d-dot-1" />
      <div className="p3d-dot p3d-dot-2" />
      <div className="p3d-dot p3d-dot-3" />
      <div className="p3d-glow" />
    </div>
  )
}

/** Generic code scene fallback */
function SceneCode({ ca, cb }) {
  return (
    <div className="p3d-scene" style={{ '--ca': ca, '--cb': cb }}>
      <div className="p3d-grid" />
      <div className="p3d-cube-wrap">
        <div className="p3d-cube">
          <div className="p3d-face p3d-front"><i className="fas fa-code" /></div>
          <div className="p3d-face p3d-back"  />
          <div className="p3d-face p3d-left"  />
          <div className="p3d-face p3d-right" />
          <div className="p3d-face p3d-top"   />
          <div className="p3d-face p3d-bot"   />
        </div>
      </div>
      <div className="p3d-orbit p3d-orbit-1" />
      <div className="p3d-dot p3d-dot-1" />
      <div className="p3d-dot p3d-dot-2" />
      <div className="p3d-glow" />
    </div>
  )
}

function ProjectThumb({ name }) {
  const t = THEMES[name] || DEFAULT_THEME
  if (t.scene === 'data')    return <SceneData    ca={t.ca} cb={t.cb} />
  if (t.scene === 'receipt') return <SceneReceipt ca={t.ca} cb={t.cb} />
  return                            <SceneCode    ca={t.ca} cb={t.cb} />
}

/* ── main component ───────────────────────────────────────────────────────── */
export default function Projects() {
  const { content } = usePortfolioContent()
  const projects = content.projects || []

  return (
    <section className="section section-alt" id="projects">
      <div className="container">
        <div className="animate-in">
          <span className="section-label">Projects</span>
          <h2 className="section-title">My <span>Work</span></h2>
          <p className="section-sub">Projects I've built while learning and during my internship.</p>
        </div>

        <div className="projects-grid">
          {projects.map(p => (
            <div className="project-card animate-in" key={p.name}>
              <ProjectThumb name={p.name} />
              <div className="project-body">
                <div className="project-cat">{p.category}</div>
                <div className="project-name">{p.name}</div>
                <p className="project-desc">{p.desc}</p>
                <div className="project-tags">
                  {(p.tags || []).map(t => <span className="project-tag" key={t}>{t}</span>)}
                </div>
                <div className="project-links">
                  {p.github && (
                    <a href={p.github} className="project-link" target="_blank" rel="noreferrer">
                      <i className="fab fa-github"></i> GitHub
                    </a>
                  )}
                  {p.demo && (
                    <a href={p.demo} className="project-link" target="_blank" rel="noreferrer">
                      <i className="fas fa-external-link-alt"></i> Live
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* placeholder */}
          <div className="project-card project-future animate-in">
            <i className="fas fa-rocket"></i>
            <h3>Coming Soon</h3>
            <p>Next project in progress — stay tuned!</p>
          </div>
        </div>
      </div>
    </section>
  )
}
