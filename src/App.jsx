import React, { useEffect, useState } from 'react'
import { ContentProvider } from './ContentContext'
import AdminPanel from './components/AdminPanel'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Education from './components/Education'
import Contact from './components/Contact'
import Footer from './components/Footer'
import FloatingContact from './components/FloatingContact'

function AppView() {
  const [pathname, setPathname] = useState(window.location.pathname)

  useEffect(() => {
    const onLocationChange = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', onLocationChange)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    const els = document.querySelectorAll('.animate-in')
    els.forEach(el => observer.observe(el))
    return () => {
      observer.disconnect()
      window.removeEventListener('popstate', onLocationChange)
    }
  }, [])

  useEffect(() => {
    document.title = pathname.startsWith('/admin') ? 'Admin | Lipsa Portfolio' : 'Lipsa | Portfolio'
  }, [pathname])

  if (pathname.startsWith('/admin')) return <AdminPanel />

  return (
    <div>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Education />
        <Contact />
      </main>
      <Footer />
      <FloatingContact />
    </div>
  )
}

export default function App() {
  return <ContentProvider><AppView /></ContentProvider>
}
