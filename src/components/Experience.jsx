import React from 'react'
import { usePortfolioContent } from '../ContentContext'

export default function Experience() {
  const { content } = usePortfolioContent()
  const experiences = content.experience

  return (
    <section className="section" id="experience">
      <div className="container">
        <div className="animate-in">
          <span className="section-label">Experience</span>
          <h2 className="section-title">Work <span>Experience</span></h2>
          <p className="section-sub">Hands-on experience gained through internships and training.</p>
        </div>

        <div className="exp-list">
          {experiences.map(e => (
            <div className="exp-card animate-in" key={e.company}>

              {/* Left: Logo */}
              <div className="exp-logo-col">
                <div className="exp-logo">
                  <img
                    src={e.logo}
                    alt={e.company}
                    onError={ev => {
                      ev.target.style.display = 'none'
                      ev.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <span className="exp-logo-fallback">{e.logoFallback}</span>
                </div>
                <div className="exp-company-name">{e.company}</div>
                <div className="exp-company-desc">{e.companyDesc}</div>
              </div>

              {/* Divider */}
              <div className="exp-divider" />

              {/* Right: Content */}
              <div className="exp-body">
                <div className="exp-header">
                  <div>
                    <div className="exp-role">{e.role}</div>
                    <div className="exp-date">
                      <i className="fas fa-calendar-alt"></i> {e.period}
                    </div>
                  </div>
                  <span className="exp-badge">{e.type}</span>
                </div>

                <p className="exp-desc">{e.desc}</p>

                <ul className="exp-highlights">
                  {e.highlights.map(h => (
                    <li key={h}>
                      <span className="exp-bullet">▸</span> {h}
                    </li>
                  ))}
                </ul>

                <div className="exp-tags">
                  {e.tags.map(t => (
                    <span className="exp-tag" key={t}>{t}</span>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
