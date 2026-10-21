import React, { useState } from 'react'

export default function Hero() {
  const [imgError, setImgError] = useState(false)
  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero" id="home">
      <div className="hero-bg">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
      </div>

      <div className="container">
        {/* Text */}
        <div className="hero-content">
          <h1 className="hero-name">
            <span className="hero-greeting">Hi, I'm</span>
            <span className="hi">Lipsa</span>
          </h1>

          <p className="hero-title">
            <i className="fas fa-laptop-code" style={{ marginRight: 8, color: 'var(--primary)' }}></i>
            Student &amp; Aspiring Web Developer
          </p>

          <p className="hero-desc">
            I'm a BCA student passionate about building web applications and learning new technologies.
            Currently exploring full-stack development with React and Node.js.
          </p>

          <div className="hero-actions">
            <a href="public/lipsa-resume.pdf" download className="btn btn-primary">
              <i className="fas fa-download"></i> Download Resume
            </a>
            <button className="btn btn-outline" onClick={() => scrollTo('contact')}>
              <i className="fas fa-envelope"></i> Contact Me
            </button>
          </div>
        </div>

        {/* Photo */}
        <div className="hero-img-wrap">
          <div className="hero-avatar-ring-wrap">
            <div className="hero-avatar-ring" />
            <div className="hero-avatar">
              {!imgError ? (
                <img
                  src="/profile.png"
                  alt="Lipsa"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="hero-avatar-fallback" style={{ display: 'flex' }}>👩‍💻</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
