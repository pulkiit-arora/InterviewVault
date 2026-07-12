import React, { useState, useRef, useEffect } from 'react'
import { getTechs, getSublevels, formatLabel, loadAllQuestions } from '../utils/manifest'

export default function Header({
  appName,
  levels,
  level,
  setLevel,
  toggleTheme,
  manifest,
  tech,
  setTech,
  sublevel,
  setSublevel,
  onReset,
  onOpenGuides,
  view,
}) {
  const [openLevel, setOpenLevel] = useState(null)
  const [hoveredTech, setHoveredTech] = useState(null)
  const [allQuestions, setAllQuestions] = useState({})
  const navRef = useRef(null)

  useEffect(() => {
    const loadQuestions = async () => {
      if (manifest) {
        const questions = await loadAllQuestions(manifest)
        setAllQuestions(questions)
      }
    }
    loadQuestions()
  }, [manifest])

  useEffect(() => {
    const handleClickOutside = e => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenLevel(null)
        setHoveredTech(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNavigate = (l, t, s) => {
    setLevel(l)
    setTech(t)
    setSublevel(s)
    setOpenLevel(null)
    setHoveredTech(null)
  }

  const handleLevelClick = l => {
    if (openLevel === l) {
      setOpenLevel(null)
      setHoveredTech(null)
    } else {
      setOpenLevel(l)
      setHoveredTech(null)
    }
  }

  const hasSelection = level && tech

  return (
    <header className="app-header">
      <div className="brand">
        <a
          className="logo"
          href="#"
          onClick={e => {
            e.preventDefault()
            onReset?.()
          }}
        >
          {appName}
        </a>
      </div>

      <div className="header-nav-wrap" ref={navRef}>
        <nav className="level-nav" aria-label="Main navigation">
          <ul>
            {levels.map(l => {
              const isActive = l === level
              const isOpen = openLevel === l
              const techs = getTechs(manifest, l)

              return (
                <li
                  key={l}
                  className={`nav-level-item${isActive ? ' active' : ''}${isOpen ? ' open' : ''}`}
                >
                  <button
                    className="nav-level-btn"
                    onClick={() => handleLevelClick(l)}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                  >
                    <span>{l}</span>
                    <svg className="nav-chevron" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M3 4.5L6 7.5L9 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {isActive && <span className="nav-active-indicator" />}
                  </button>

                  {isOpen && (
                    <div className="nav-mega-menu">
                      <div className="nav-mega-inner">
                        <div className="nav-mega-techs">
                          <span className="nav-mega-label">{l} — Technologies</span>
                          <ul>
                            {techs.map(t => {
                              const isTechActive = level === l && tech === t
                              const isTechHovered = hoveredTech === t
                              const sublevels = getSublevels(manifest, l, t, allQuestions[l]?.[t] || [])

                              return (
                                <li
                                  key={t}
                                  className={`nav-tech-item${isTechActive ? ' active' : ''}${isTechHovered ? ' hovered' : ''}`}
                                  onMouseEnter={() => setHoveredTech(t)}
                                >
                                  <button
                                    className="nav-tech-btn"
                                    onClick={() => {
                                      if (sublevels.length === 1) {
                                        handleNavigate(l, t, sublevels[0])
                                      } else if (sublevels.length === 0) {
                                        handleNavigate(l, t, null)
                                      } else {
                                        setHoveredTech(t)
                                      }
                                    }}
                                  >
                                    <span className="nav-tech-icon">{t.charAt(0).toUpperCase()}</span>
                                    <span>{formatLabel(t)}</span>
                                    {sublevels.length > 0 && (
                                      <svg className="nav-tech-arrow" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                                        <path d="M3.5 1.5L7 5L3.5 8.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    )}
                                  </button>
                                </li>
                              )
                            })}
                          </ul>
                        </div>

                        {hoveredTech && (
                          <div className="nav-mega-sublevels">
                            <span className="nav-mega-label">
                              {formatLabel(hoveredTech)} — Topics
                            </span>
                            <ul>
                              {getSublevels(manifest, openLevel, hoveredTech, allQuestions[openLevel]?.[hoveredTech] || []).map((s, idx) => {
                                const isSubActive = level === openLevel && tech === hoveredTech && sublevel === s
                                return (
                                  <li key={s} style={{ animationDelay: `${idx * 0.04}s` }}>
                                    <button
                                      className={`nav-sublevel-btn${isSubActive ? ' active' : ''}`}
                                      onClick={() => handleNavigate(openLevel, hoveredTech, s)}
                                    >
                                      <span className="nav-sublevel-dot" />
                                      {s}
                                    </button>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              )
            })}

            {/* Guides — inline with nav items */}
            <li className={`nav-level-item guides-nav-item${view === 'guides' ? ' active' : ''}`}>
              <button
                className="nav-level-btn guides-nav-pill"
                onClick={() => {
                  onOpenGuides?.()
                  setOpenLevel(null)
                  setHoveredTech(null)
                }}
                aria-label="Study Guides"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{marginRight:'0.25rem'}}>
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                <span>Guides</span>
                {view === 'guides' && <span className="nav-active-indicator" />}
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <div className="header-controls">
        <button 
          className="home-icon-btn" 
          onClick={() => onReset?.()} 
          aria-label="Home"
          title="View Home Details"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </button>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          🌙
        </button>
      </div>
    </header>
  )
}
