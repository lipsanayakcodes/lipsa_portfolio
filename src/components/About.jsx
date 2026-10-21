import React from 'react'
import { usePortfolioContent } from '../ContentContext'

export default function About() {
  const { content } = usePortfolioContent()
  const skills = content.skills
  return (
    <section className="section" id="about">
      <div className="container">
        {/* Content — no photo */}
        <div className="animate-in">
          <span className="section-label">About Me</span>
          <h2 className="section-title">Who I <span>Am</span></h2>

          <p className="about-text">
            I'm a front-end developer now working with React and NodeJS. Reach out if you'd like to learn more!
          </p>
          
        </div>

        {/* Skills Grid */}
        <div className="animate-in" style={{ marginTop: 48 }}>
          <div className="about-skills-title">
            <i className="fas fa-code" style={{ marginRight: 8, color: 'var(--primary)' }}></i>
            My Skills &amp; current proficiency.
          </div>

          <div className="skills-cards-grid">
            {skills.map((s, i) => (
              <div className="skill-big-card" key={s.name} style={{ '--sc': s.color }}>
                <div className="sbc-top">
                  <i className={`${s.icon} sbc-icon`}></i>
                  <span className="sbc-num">0{i + 1}</span>
                </div>
                <div className="sbc-name">{s.name}</div>
                <div className="sbc-desc">{s.desc}</div>
                <div className="sbc-bar-bg">
                  <div className="sbc-bar-fill" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
