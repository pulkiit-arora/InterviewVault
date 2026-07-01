import React, { useEffect, useState } from 'react'
import { loadAllQuestions } from '../utils/manifest'

export default function Footer({ manifest }){
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const allQuestions = await loadAllQuestions(manifest)
        
        let total = 0
        Object.values(allQuestions).forEach(levelQuestions => {
          Object.values(levelQuestions).forEach(questions => {
            total += questions.length
          })
        })
        
        setTotalQuestions(total)
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
    <footer className="app-footer">
      <div>
        <strong>InterviewVault</strong> — Master your interview prep with {loading ? '…' : `${totalQuestions}+`} curated questions
      </div>
      <div>
        <a href="#" style={{color:'inherit', textDecoration:'none'}}>GitHub</a> • <a href="#" style={{color:'inherit', textDecoration:'none'}}>Feedback</a> • © {new Date().getFullYear()}
      </div>
    </footer>
  )
}
