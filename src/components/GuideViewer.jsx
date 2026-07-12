import React, { useEffect, useState, useMemo } from 'react'
import { marked, Renderer } from 'marked'

// ── Slug helper (must match heading IDs we write) ──────────────────
function slugify(text) {
  return text
    .replace(/<[^>]*>/g, '')   // strip HTML tags
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

// ── Custom renderer: adds id= to every heading ─────────────────────
const renderer = new Renderer()
renderer.heading = function ({ text, depth }) {
  const id = slugify(text)
  return `<h${depth} id="${id}">${text}</h${depth}>\n`
}
marked.use({ renderer, breaks: true, gfm: true })

// ── Parse only h2 headings for the sidebar TOC ────────────────────
function parseH2Headings(md) {
  return md
    .split('\n')
    .filter(line => /^##\s+/.test(line) && !/^###/.test(line))
    .map(line => line.replace(/^##\s+/, '').replace(/[#*`]/g, '').trim())
}

export default function GuideViewer({ basePath }) {
  const [guides, setGuides]         = useState([])
  const [activeGuide, setActiveGuide] = useState(null)
  const [markdown, setMarkdown]     = useState('')
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [activeHeading, setActiveHeading] = useState(null)

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
    setActiveHeading(null)
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

  // Highlight active heading on scroll
  useEffect(() => {
    if (!markdown) return
    const handleScroll = () => {
      const els = document.querySelectorAll('.guide-markdown h2')
      let current = null
      els.forEach(el => {
        if (el.getBoundingClientRect().top <= 110) current = el.id
      })
      setActiveHeading(current)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [markdown])

  // Intercept internal anchor clicks → smooth scroll instead of URL jump
  const handleContentClick = (e) => {
    const anchor = e.target.closest('a[href^="#"]')
    if (!anchor) return
    e.preventDefault()
    const id = anchor.getAttribute('href').slice(1)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const h2Headings = useMemo(() => parseH2Headings(markdown), [markdown])

  const scrollTo = (text) => {
    const el = document.getElementById(slugify(text))
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
      {/* Sidebar */}
      <aside className="guides-sidebar">
        {/* Guide selector — only if multiple guides */}
        {guides.length > 1 && (
          <>
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
            <div className="guides-toc-divider" />
          </>
        )}

        {/* Single guide header */}
        {guides.length === 1 && activeGuide && (
          <div className="guides-sidebar-header">
            <span className="guides-sidebar-icon">❄️</span>
            <span className="guides-sidebar-title">{activeGuide.title}</span>
          </div>
        )}

        {/* TOC — h2 topics only */}
        {!loading && h2Headings.length > 0 && (
          <nav className="guide-toc" aria-label="Table of contents">
            <ul className="guide-toc-list">
              {h2Headings.map((text, i) => (
                <li key={i} className="guide-toc-h2-item">
                  <button
                    className={`guide-toc-btn guide-toc-h2${activeHeading === slugify(text) ? ' toc-active' : ''}`}
                    onClick={() => scrollTo(text)}
                  >
                    {text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
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
