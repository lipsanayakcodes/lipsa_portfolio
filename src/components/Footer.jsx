import React from 'react'

export default function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">

          {/* Left — branding */}
          <div className="footer-left">
            <h2 className="footer-heading">Lipsa Nayak</h2>
            <p className="footer-sub">© {new Date().getFullYear()}Have a question or an idea? I'd love to hear from you. Let's connect and share our ideas!
</p>
          </div>

          {/* Right — back to top */}
          <button className="footer-back-top" onClick={scrollTop} aria-label="Back to top">
            <i className="fas fa-arrow-up"></i>
          </button>

        </div>
      </div>
    </footer>
  )
}
