import React from 'react'
import { usePortfolioContent } from '../ContentContext'

export default function Education() {
  const { content } = usePortfolioContent()
  const education = content.education
  return (
    <section className="section section-alt" id="education">
      <div className="container">
        <div className="animate-in">
          <span className="section-label">Education</span>
          <h2 className="section-title">Academic <span>Background</span></h2>
          <p className="section-sub">My educational journey and qualifications.</p>
        </div>

        <div className="edu-list">
          {education.map(e => (
            <div className="edu-card animate-in" key={e.degree}>
              <div className="edu-card-icon">{e.icon}</div>
              <div className="edu-card-body">
                <div className="edu-card-label">
                  {e.label} <span className="edu-dot">·</span> {e.year}
                </div>
                <div className="edu-card-degree">{e.degree}</div>
                <div className="edu-card-school">
                  {e.school}
                  <span className="edu-card-loc">
                    <i className="fas fa-map-marker-alt"></i> {e.location}
                  </span>
                </div>
                <p className="edu-card-desc">{e.desc}</p>
                <div className="edu-card-tags">
                  {e.tags.map(t => (
                    <span className="edu-tag" key={t}>{t}</span>
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
