import React from 'react'

const navLinks = ['Home', 'About', 'Projects', 'Experience', 'Education', 'Contact']

const socials = [
  { icon: 'fab fa-linkedin-in', href: 'https://www.linkedin.com/in/lipsa-nayak-dev', label: 'LinkedIn' },
  { icon: 'fab fa-github',      href: 'https://github.com/lipsanayakcodes',          label: 'GitHub' },
  { icon: 'fas fa-envelope',    href: 'mailto:lipsanayak7855@gmail.com',              label: 'Email' },
]

export default function Footer() {
  const scrollTo = (id) => {
    const el = document.getElementById(id.toLowerCase())
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="footer">
      <div className="container">

        {/* Top — name + tagline */}
        <div className="footer-top">
          <h2 className="footer-logo">Lipsa Nayak</h2>
          <p className="footer-tagline">BCA Student &amp; Aspiring Web Developer</p>
        </div>

        {/* Middle — nav links */}
        <nav className="footer-nav" aria-label="Footer navigation">
          {navLinks.map(l => (
            <button key={l} className="footer-nav-link" onClick={() => scrollTo(l)}>
              {l}
            </button>
          ))}
        </nav>

        {/* Social icons */}
        <div className="footer-socials">
          {socials.map(s => (
            <a key={s.label} href={s.href}
              target={s.href.startsWith('http') ? '_blank' : undefined}
              rel={s.href.startsWith('http') ? 'noreferrer' : undefined}
              className="footer-social-btn" aria-label={s.label}>
              <i className={s.icon}></i>
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="footer-divider" />

      </div>
    </footer>
  )
}
