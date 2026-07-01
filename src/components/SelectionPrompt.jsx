import React from 'react'
import { getTechs, formatLabel } from '../utils/manifest'

export default function SelectionPrompt({ levels, manifest, onSelect }) {
  return (
    <div className="selection-prompt">
      <div className="prompt-content">
        <h2>Select Your Interview Level & Topic</h2>
        <p>Choose your experience level and programming language to get started</p>

        <div className="prompt-grid">
          {levels.map((level, levelIdx) => (
            <div
              key={level}
              className="level-card"
              style={{ animationDelay: `${levelIdx * 0.1}s` }}
            >
              <h3>{level}</h3>
              <div className="topics-list">
                {getTechs(manifest, level).map(topic => (
                  <button
                    key={topic}
                    className="topic-btn"
                    onClick={() => onSelect(level, topic)}
                  >
                    <span className="topic-btn-icon">{topic.charAt(0).toUpperCase()}</span>
                    {formatLabel(topic)}
                    <span className="topic-btn-arrow">→</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
