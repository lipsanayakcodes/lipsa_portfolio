import React, { useState } from 'react'
import emailjs from '@emailjs/browser'

export default function Contact() {
  const [form, setForm]           = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors]       = useState({})
  const [sent, setSent]           = useState(false)
  const [sendError, setSendError] = useState('')
  const [loading, setLoading]     = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name  = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.message.trim()) e.message = 'Message is required'
    return e
  }

  const handleChange = e => {
    if (sent) setSent(false)
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true); setSendError('')
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        { from_name: form.name, from_email: form.email, subject: form.subject || `Message from ${form.name}`, message: form.message, to_email: 'lipsanayak7855@gmail.com' },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      setSent(true)
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      console.error('EmailJS error:', err)
      setSendError('Something went wrong. Please try again or email me directly.')
    } finally { setLoading(false) }
  }

  return (
    <section className="section contact-bg" id="contact">
      <div className="container">

        {/* Header */}
        <div className="animate-in" style={{ marginBottom: 40 }}>
          <span className="section-label">Contact</span>
          <h2 className="section-title">Get In <span>Touch</span></h2>
          <p className="section-sub">Let's have a chat...</p>
        </div>

        {/* Form */}
        <div className="ct-form-card animate-in">
          {sent && (
            <div className="form-success">
              <i className="fas fa-check-circle"></i> Message sent! I'll get back to you soon.
            </div>
          )}
          {sendError && (
            <div className="form-error">
              <i className="fas fa-exclamation-circle"></i> {sendError}
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" placeholder="Your name"
                  value={form.name} onChange={handleChange} className={errors.name ? 'err' : ''} />
                {errors.name && <span className="form-err">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" placeholder="your@email.com"
                  value={form.email} onChange={handleChange} className={errors.email ? 'err' : ''} />
                {errors.email && <span className="form-err">{errors.email}</span>}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input id="subject" name="subject" placeholder="What's this about?"
                value={form.subject} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" placeholder="Your message..."
                value={form.message} onChange={handleChange} className={errors.message ? 'err' : ''} />
              {errors.message && <span className="form-err">{errors.message}</span>}
            </div>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading
                ? <><i className="fas fa-spinner fa-spin"></i> Sending…</>
                : <><i className="fas fa-paper-plane"></i> Send Message</>}
            </button>
          </form>
        </div>

      </div>
    </section>
  )
}
