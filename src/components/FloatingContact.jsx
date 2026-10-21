import React, { useState } from 'react'

const PHONE = '917855866309' // WhatsApp needs country code (91 = India)
const PHONE_DISPLAY = '+91 78558 66309'

export default function FloatingContact() {
  const [open, setOpen] = useState(false)

  return (
    <div className={`fc-root${open ? ' fc-open' : ''}`}>
      {/* Options */}
      <div className="fc-options" aria-hidden={!open}>
        {/* WhatsApp */}
        <a
          className="fc-option fc-whatsapp"
          href={`https://wa.me/${PHONE}`}
          target="_blank"
          rel="noreferrer"
          tabIndex={open ? 0 : -1}
          aria-label="Chat on WhatsApp"
          onClick={() => setOpen(false)}
        >
          <span className="fc-option-icon">
            <i className="fab fa-whatsapp"></i>
          </span>
          <span className="fc-option-label">WhatsApp</span>
        </a>

        {/* Call */}
        <a
          className="fc-option fc-call"
          href={`tel:+917855866309`}
          tabIndex={open ? 0 : -1}
          aria-label="Call me"
          onClick={() => setOpen(false)}
        >
          <span className="fc-option-icon">
            <i className="fas fa-phone-alt"></i>
          </span>
          <span className="fc-option-label">Call</span>
        </a>

        {/* Number hint */}
        <span className="fc-number">{PHONE_DISPLAY}</span>
      </div>

      {/* Toggle button */}
      <button
        className="fc-toggle"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close contact options' : 'Open contact options'}
        aria-expanded={open}
      >
        <i className={`fas ${open ? 'fa-times' : 'fa-comment-dots'}`}></i>
      </button>
    </div>
  )
}
