import React from 'react'

const links = [
  { icon: 'fas fa-envelope',    label: 'lipsanayak7855@gmail.com',        href: 'mailto:lipsanayak7855@gmail.com' },
  { icon: 'fab fa-linkedin-in', label: 'linkedin.com/in/lipsa-nayak-dev', href: 'https://www.linkedin.com/in/lipsa-nayak-dev' },
  { icon: 'fab fa-github',      label: 'github.com/lipsanayakcodes',      href: 'https://github.com/lipsanayakcodes' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">

          {/* Left — heading */}
          <div className="footer-left">
            <h2 className="footer-heading">Let's Connect</h2>
            <p className="footer-sub">Feel free to reach out!</p>
          </div>

          {/* Right — contact links + back to top */}
          <div className="footer-right">
            <div className="footer-links">
              {links.map(l => (
                <a key={l.label} href={l.href}
                  className="footer-link-row"
                  target={l.href.startsWith('http') ? '_blank' : undefined}
                  rel={l.href.startsWith('http') ? 'noreferrer' : undefined}>
                  <i className={l.icon}></i>
                  <span>{l.label}</span>
                </a>
              ))}
            </div>
            <button className="footer-top-btn"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top">
              <i className="fas fa-arrow-up"></i>
            </button>
          </div>

        </div>
      </div>
    </footer>
  )
}
