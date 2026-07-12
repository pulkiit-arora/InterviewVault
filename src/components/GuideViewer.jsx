import React, { useEffect, useState, useMemo } from 'react'
import { marked } from 'marked'

marked.setOptions({ breaks: true, gfm: true })

// Slugify heading text to match marked's anchor IDs
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

// Parse headings from markdown into a nested structure
function parseHeadings(md) {
  const lines = md.split('\n')
  const headings = []

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)/)
    const h3 = line.match(/^###\s+(.+)/)
    if (h2) {
      headings.push({ level: 2, text: h2[1].replace(/[#*`]/g, '').trim(), children: [] })
    } else if (h3 && headings.length > 0) {
      headings[headings.length - 1].children.push({
        level: 3,
        text: h3[1].replace(/[#*`]/g, '').trim(),
      })
    }
  }
  return headings
}

export default function GuideViewer({ basePath }) {
  const [guides, setGuides] = useState([])
  const [activeGuide, setActiveGuide] = useState(null)
  const [markdown, setMarkdown] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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

  // Track scroll position to highlight active heading
  useEffect(() => {
    if (!markdown) return
    const handleScroll = () => {
      const headingEls = document.querySelectorAll('.guide-markdown h2, .guide-markdown h3')
      let current = null
      headingEls.forEach(el => {
        if (el.getBoundingClientRect().top <= 100) current = el.id
      })
      setActiveHeading(current)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [markdown])

  const headings = useMemo(() => parseHeadings(markdown), [markdown])

  const scrollTo = (text) => {
    const id = slugify(text)
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
      {/* Sidebar */}
      <aside className="guides-sidebar">
        {/* Guide selector (if multiple guides exist) */}
        {guides.length > 1 && (
          <div className="guides-selector">
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
          </div>
        )}

        {/* Single guide header when only one */}
        {guides.length === 1 && activeGuide && (
          <div className="guides-sidebar-header">
            <span className="guides-sidebar-icon">❄️</span>
            <span className="guides-sidebar-title">{activeGuide.title}</span>
          </div>
        )}

        {/* Hierarchical TOC */}
        {!loading && headings.length > 0 && (
          <nav className="guide-toc" aria-label="Table of contents">
            <ul className="guide-toc-list">
              {headings.map((h2, i) => (
                <li key={i} className="guide-toc-h2-item">
                  <button
                    className={`guide-toc-btn guide-toc-h2${activeHeading === slugify(h2.text) ? ' toc-active' : ''}`}
                    onClick={() => scrollTo(h2.text)}
                  >
                    {h2.text}
                  </button>
                  {h2.children.length > 0 && (
                    <ul className="guide-toc-sub">
                      {h2.children.map((h3, j) => (
                        <li key={j}>
                          <button
                            className={`guide-toc-btn guide-toc-h3${activeHeading === slugify(h3.text) ? ' toc-active' : ''}`}
                            onClick={() => scrollTo(h3.text)}
                          >
                            <span className="toc-h3-dot" />
                            {h3.text}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
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
            dangerouslySetInnerHTML={{ __html: marked.parse(markdown) }}
          />
        )}
      </main>
    </div>
  )
}
