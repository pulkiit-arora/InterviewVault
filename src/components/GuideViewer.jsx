import React, { useEffect, useState } from 'react'
import { marked, Renderer } from 'marked'

// ── Slug helper ───────────────────────────────────────────────────
function slugify(text) {
  return text
    .replace(/<[^>]*>/g, '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') // Collapse multiple hyphens
}

// ── Custom renderer: adds id= to every heading ────────────────────
const renderer = new Renderer()
renderer.heading = function ({ text, depth }) {
  const id = slugify(text)
  return `<h${depth} id="${id}">${text}</h${depth}>\n`
}
marked.use({ renderer, breaks: true, gfm: true })



export default function GuideViewer({ basePath }) {
  const [guides, setGuides]           = useState([])
  const [activeGuide, setActiveGuide] = useState(null)
  const [markdown, setMarkdown]       = useState('')
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)

  // Load notes manifest
  useEffect(() => {
    fetch(`${basePath}notes/manifest.json`)
      .then(r => r.json())
      .then(data => {
        setGuides(data.guides)
        if (data.guides.length > 0) setActiveGuide(data.guides[0])
      })
      .catch(e => setError(e.message))
  }, [basePath])

  // Load guide markdown when active guide changes
  useEffect(() => {
    if (!activeGuide) return
    setLoading(true)
    setMarkdown('')
    fetch(`${basePath}notes/${activeGuide.file}`)
      .then(r => r.text())
      .then(text => {
        setMarkdown(text)
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [activeGuide, basePath])

  // Auto-scroll to hash on initial load once markdown rendering is complete
  useEffect(() => {
    if (loading || !markdown) return
    const hash = window.location.hash
    if (hash) {
      const id = decodeURIComponent(hash.slice(1))
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 150)
    }
  }, [loading, markdown])

  // Intercept internal anchor clicks → smooth scroll instead of URL jump
  const handleContentClick = (e) => {
    const anchor = e.target.closest('a[href^="#"]')
    if (!anchor) return
    e.preventDefault()
    const id = anchor.getAttribute('href').slice(1)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (error) {
    return (
      <div className="guide-error">
        <span>⚠️ Failed to load guide: {error}</span>
      </div>
    )
  }

  return (
    <div className="guides-layout">
      {/* Sidebar — guide list only */}
      <aside className="guides-sidebar">
        <div className="guides-sidebar-header">
          <span className="guides-sidebar-icon">📚</span>
          <span className="guides-sidebar-title">Study Guides</span>
        </div>
        <ul className="guides-list">
          {guides.map(g => (
            <li key={g.id}>
              <button
                className={`guide-item-btn${activeGuide?.id === g.id ? ' active' : ''}`}
                onClick={() => setActiveGuide(g)}
              >
                <span className="guide-item-title">{g.title}</span>
                {g.subtitle && <span className="guide-item-sub">{g.subtitle}</span>}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Content */}
      <main className="guides-content">
        {loading ? (
          <div className="guide-loading">
            <div className="guide-loading-spinner" />
            <span>Loading guide…</span>
          </div>
        ) : (
          <article
            className="guide-markdown"
            onClick={handleContentClick}
            dangerouslySetInnerHTML={{ __html: marked.parse(markdown) }}
          />
        )}
      </main>
    </div>
  )
}
