export function getTechs(manifest, level) {
  return Object.keys(manifest?.levels?.[level] || {})
}

export function getSublevels(manifest, level, tech, questions = null) {
  // If questions are provided (even if empty), derive sublevels from them
  if (questions !== null) {
    const sublevels = new Set()
    questions.forEach(q => {
      if (q.sublevel) sublevels.add(q.sublevel)
    })
    return Array.from(sublevels).sort()
  }
  // Fallback to manifest only when questions parameter is not provided
  return Object.keys(manifest?.levels?.[level]?.[tech] || {})
}

export function filterQuestionsBySublevel(questions, sublevel) {
  if (!sublevel) return questions
  const normalized = sublevel.toLowerCase().replace(/\s+/g, '')
  return questions.filter(q => {
    if (q.sublevel) return q.sublevel === sublevel
    return q.tags?.some(t => t.toLowerCase().replace(/\s+/g, '') === normalized)
  })
}

export function formatLabel(key) {
  return key.charAt(0).toUpperCase() + key.slice(1)
}

export async function loadAllQuestions(manifest) {
  const allQuestions = {}
  const levels = Object.keys(manifest.levels)
  
  for (const level of levels) {
    allQuestions[level] = {}
    const techs = getTechs(manifest, level)
    
    for (const tech of techs) {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}questions/${level}/${tech}.json`)
        const questions = await response.json()
        allQuestions[level][tech] = questions
      } catch (e) {
        allQuestions[level][tech] = []
      }
    }
  }
  
  return allQuestions
}

export function extractTopicsFromQuestions(questions) {
  const topics = new Set()
  Object.values(questions).forEach(levelQuestions => {
    Object.values(levelQuestions).forEach(techQuestions => {
      techQuestions.forEach(q => {
        if (q.sublevel) {
          topics.add(q.sublevel)
        }
        if (q.tags) {
          q.tags.forEach(tag => topics.add(tag))
        }
      })
    })
  })
  return Array.from(topics).sort()
}

export function getQuestionCounts(manifest, allQuestions) {
  const counts = {}
  const levels = Object.keys(manifest.levels)
  
  levels.forEach(level => {
    counts[level] = {}
    const techs = getTechs(manifest, level)
    
    techs.forEach(tech => {
      const questions = allQuestions[level]?.[tech] || []
      counts[level][tech] = {
        total: questions.length,
        topics: extractTopicsFromQuestions({ [level]: { [tech]: questions } })
      }
    })
  })
  
  return counts
}
