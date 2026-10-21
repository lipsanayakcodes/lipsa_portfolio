import React, { createContext, useContext, useEffect, useState } from 'react'
import { DEFAULT_CONTENT } from './defaultContent'

const ContentContext = createContext(null)

export function ContentProvider({ children }) {
  const [content, setContent] = useState(DEFAULT_CONTENT)

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || ''
    fetch(`${apiBase}/api/content`)
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (data && Array.isArray(data.projects) && Array.isArray(data.skills) && Array.isArray(data.education) && Array.isArray(data.experience)) {
          setContent(data)
        }
      })
      .catch(() => {})
  }, [])

  return <ContentContext.Provider value={{ content, setContent }}>{children}</ContentContext.Provider>
}

export function usePortfolioContent() {
  const value = useContext(ContentContext)
  if (!value) throw new Error('usePortfolioContent must be used inside ContentProvider')
  return value
}
