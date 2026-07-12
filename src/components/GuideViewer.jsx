import React, { useEffect, useState } from 'react'
import { marked } from 'marked'

marked.setOptions({
  breaks: true,
  gfm: true,
})

export default function GuideViewer({ basePath }) {
  const [guides, setGuides] = useState([])
  const [activeGuide, setActiveGuide] = useState(null)
  const [markdown, setMarkdown] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
                {g.subtitle && (
                  <span className="guide-item-sub">{g.subtitle}</span>
                )}
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
            dangerouslySetInnerHTML={{ __html: marked.parse(markdown) }}
          />
        )}
      </main>
    </div>
  )
}
