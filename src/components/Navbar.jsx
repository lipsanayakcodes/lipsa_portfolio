import React, { useState, useEffect } from 'react'

const links = ['Home', 'About', 'Projects', 'Experience', 'Education', 'Contact']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('Home')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    const el = document.getElementById(id.toLowerCase())
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setActive(id)
    setOpen(false)
  }

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="container">
        <span className="nav-logo" onClick={() => scrollTo('Home')}><h3>Portfolio</h3></span>

        <ul className={`nav-links${open ? ' open' : ''}`}>
          {links.map(l => (
            <li key={l}>
              <a className={active === l ? 'active' : ''} onClick={() => scrollTo(l)}>{l}</a>
            </li>
          ))}
          <li>
            <a className="nav-resume" href="/admin">
              <i className="fas fa-lock" style={{ marginRight: 4 }}></i> Admin Login
            </a>
          </li>
        </ul>

        <button className={`nav-toggle${open ? ' open' : ''}`} onClick={() => setOpen(!open)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>
    </nav>
  )
}
