import React, { useEffect, useState } from 'react'
import { getSublevels, formatLabel } from '../utils/manifest'

export default function SelectSublevels({ level, tech, manifest, onSelect, onBack }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  const sublevels = getSublevels(manifest, level, tech, questions)

  useEffect(() => {
    if (!level || !tech) return
    setLoading(true)
    fetch(`${import.meta.env.BASE_URL}questions/${level}/${tech}.json`)
      .then(r => r.json())
      .then(setQuestions)
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false))
  }, [level, tech])

  return (
    <section className="sublevel-selection">
      <div className="sublevel-header">
        <div className="header-top">
          <button className="back-button" onClick={onBack} title="Back to tech selection">
            <span className="back-arrow">←</span>
          </button>
          <div className="sublevel-breadcrumb">
            <span className="breadcrumb-item">{level}</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item active">{formatLabel(tech)}</span>
          </div>
        </div>
      </div>

      <div className="sublevel-container">
        <h2>Choose a Subtopic</h2>
        {loading ? (
          <p className="empty-state">Loading topics...</p>
        ) : sublevels.length === 0 ? (
          <p className="empty-state">No topics found for this technology yet.</p>
        ) : (
          <div className="sublevels-grid">
            {sublevels.map((sub, idx) => (
              <button
                key={sub}
                className="sublevel-card"
                onClick={() => onSelect(sub)}
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className="sublevel-index">{String(idx + 1).padStart(2, '0')}</div>
                <h3>{sub}</h3>
                <div className="sublevel-arrow">→</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
