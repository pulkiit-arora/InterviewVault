import React, { useEffect, useState } from 'react'
import QuestionCard from './QuestionCard'
import { getSublevels, filterQuestionsBySublevel, formatLabel } from '../utils/manifest'

export default function QuestionList({ manifest, level, tech, sublevel, setSublevel, onBack }) {
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

  const filtered = filterQuestionsBySublevel(questions, sublevel)

  return (
    <div className="question-list">
      <div className="questions-header">
        <div className="header-top">
          <button className="back-button" onClick={onBack} title="Back to subtopic selection">
            <span className="back-arrow">←</span>
          </button>
          <div className="questions-breadcrumb">
            <span className="breadcrumb-item">{level}</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item">{formatLabel(tech)}</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item active">{sublevel}</span>
          </div>
          <span className="question-count">{loading ? '…' : `${filtered.length} question${filtered.length !== 1 ? 's' : ''}`}</span>
        </div>
        <div className="topics sublevel-tabs">
          {sublevels.map(s => (
            <button 
              key={s} 
              className={`topic-tab${s === sublevel ? ' active' : ''}`}
              onClick={() => setSublevel?.(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="cards">
        {loading && <p className="empty-state">Loading questions…</p>}
        {!loading && filtered.length === 0 && (
          <p className="empty-state">No questions found for this subtopic yet.</p>
        )}
        {filtered.map(q => (
          <QuestionCard key={q.id} q={q} />
        ))}
      </div>
    </div>
  )
}
