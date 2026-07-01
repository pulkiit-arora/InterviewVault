import React, { useEffect, useState } from 'react'
import { getTechs, loadAllQuestions, getQuestionCounts, formatLabel } from '../utils/manifest'

export default function HomeDetails({ manifest, onSelect }) {
  const [allQuestions, setAllQuestions] = useState(null)
  const [questionCounts, setQuestionCounts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [allTopics, setAllTopics] = useState([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const questions = await loadAllQuestions(manifest)
        setAllQuestions(questions)
        
        const counts = getQuestionCounts(manifest, questions)
        setQuestionCounts(counts)
        
        // Extract all unique topics across all questions
        const topics = new Set()
        Object.values(questions).forEach(levelQuestions => {
          Object.values(levelQuestions).forEach(techQuestions => {
            techQuestions.forEach(q => {
              if (q.sublevel) topics.add(q.sublevel)
              if (q.tags) q.tags.forEach(tag => topics.add(tag))
            })
          })
        })
        setAllTopics(Array.from(topics).sort())
      } catch (e) {
        console.error('Error loading questions:', e)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [manifest])

  if (loading) {
    return (
      <div className="home-details">
        <div className="home-details-content">
          <h2>Loading Interview Vault...</h2>
        </div>
      </div>
    )
  }

  const levels = Object.keys(manifest.levels)
  const totalQuestions = Object.values(questionCounts || {}).reduce((acc, level) => {
    return acc + Object.values(level).reduce((sum, tech) => sum + tech.total, 0)
  }, 0)

  return (
    <div className="home-details">
      <div className="home-details-content">
        <div className="home-hero">
          <h1>Welcome to InterviewVault</h1>
          <p>Your comprehensive interview preparation resource with {totalQuestions} questions across {levels.length} experience levels</p>
        </div>

        <div className="home-stats">
          <div className="stat-card">
            <div className="stat-number">{totalQuestions}</div>
            <div className="stat-label">Total Questions</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{levels.length}</div>
            <div className="stat-label">Experience Levels</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{allTopics.length}</div>
            <div className="stat-label">Topics Covered</div>
          </div>
        </div>

        <div className="home-sections">
          <div className="home-section">
            <h2>Experience Levels</h2>
            <div className="level-grid">
              {levels.map(level => (
                <div key={level} className="level-summary-card">
                  <h3>{level}</h3>
                  <div className="level-techs">
                    {getTechs(manifest, level).map(tech => {
                      const count = questionCounts?.[level]?.[tech]?.total || 0
                      const topics = questionCounts?.[level]?.[tech]?.topics || []
                      return (
                        <button
                          key={tech}
                          className="tech-summary-btn"
                          onClick={() => onSelect(level, tech)}
                        >
                          <span className="tech-icon">{tech.charAt(0).toUpperCase()}</span>
                          <div className="tech-info">
                            <span className="tech-name">{formatLabel(tech)}</span>
                            <span className="tech-count">{count} questions</span>
                          </div>
                          <span className="tech-arrow">→</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="home-section">
            <h2>All Topics</h2>
            <div className="topics-cloud">
              {allTopics.map(topic => (
                <span key={topic} className="topic-tag">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
