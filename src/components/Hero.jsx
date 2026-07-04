import React, { useEffect, useState } from 'react'
import { loadAllQuestions, getTechs } from '../utils/manifest'

export default function Hero({ manifest }){
  const [stats, setStats] = useState({
    totalQuestions: 0,
    experienceLevels: 0,
    languages: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const allQuestions = await loadAllQuestions(manifest)
        
        // Calculate total questions
        let totalQuestions = 0
        const allTechs = new Set()
        
        Object.values(allQuestions).forEach(levelQuestions => {
          Object.keys(levelQuestions).forEach(tech => {
            allTechs.add(tech)
            totalQuestions += levelQuestions[tech].length
          })
        })
        
        setStats({
          totalQuestions,
          experienceLevels: Object.keys(manifest.levels).length,
          languages: allTechs.size
        })
      } catch (e) {
        console.error('Error loading stats:', e)
      } finally {
        setLoading(false)
      }
    }
    
    if (manifest) {
      loadStats()
    }
  }, [manifest])

  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1>InterviewVault</h1>
        <p>Master your next interview with curated questions and detailed answers across junior, mid, and senior levels. Covering Java and Databases.</p>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-num">{loading ? '…' : stats.totalQuestions}</span>
            <span className="stat-label">Questions</span>
          </div>
          <div className="stat">
            <span className="stat-num">{loading ? '…' : stats.experienceLevels}</span>
            <span className="stat-label">Experience Levels</span>
          </div>
          <div className="stat">
            <span className="stat-num">{loading ? '…' : stats.languages}</span>
            <span className="stat-label">Languages</span>
          </div>
        </div>
      </div>
    </section>
  )
}
