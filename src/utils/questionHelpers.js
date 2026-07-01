/**
 * Question Management Utilities
 * Helps with creating, validating, and formatting questions
 */

/**
 * Validates a question object against the schema
 */
export function validateQuestion(question) {
  const errors = []
  
  if (!question.id) errors.push('Missing required field: id')
  if (!question.title) errors.push('Missing required field: title')
  if (!question.question) errors.push('Missing required field: question')
  
  // Check answer field (old schema: string, new schema: object)
  if (!question.answer) {
    errors.push('Missing required field: answer')
  } else if (typeof question.answer === 'object') {
    if (!question.answer.content) errors.push('Missing answer.content in new schema')
  }
  
  if (!question.tags || !Array.isArray(question.tags)) {
    errors.push('Missing or invalid field: tags (should be array)')
  }
  
  if (!question.sublevel) errors.push('Missing required field: sublevel')
  
  // Validate code examples if present
  if (question.answer?.codeExamples) {
    question.answer.codeExamples.forEach((example, idx) => {
      if (!example.language) errors.push(`Code example ${idx}: missing language`)
      if (!example.code) errors.push(`Code example ${idx}: missing code`)
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Normalizes question to new schema format
 */
export function normalizeQuestion(question) {
  // If answer is a string, convert to new schema
  if (typeof question.answer === 'string') {
    return {
      ...question,
      answer: {
        summary: question.answer.split('\n')[0].substring(0, 100) + '...',
        content: question.answer,
        codeExamples: [],
        images: [],
        videos: [],
        resources: []
      }
    }
  }
  
  // Ensure all new schema fields exist
  return {
    ...question,
    answer: {
      summary: question.answer.summary || '',
      content: question.answer.content || question.answer.summary || '',
      codeExamples: question.answer.codeExamples || [],
      images: question.answer.images || [],
      videos: question.answer.videos || [],
      resources: question.answer.resources || []
    }
  }
}

/**
 * Generates a unique ID for a new question
 */
export function generateId(level, tech, index) {
  const techPrefix = tech.substring(0, 2).toLowerCase()
  const levelPrefix = level.substring(0, 2).toLowerCase()
  return `${techPrefix}-${levelPrefix}-${index + 1}`
}

/**
 * Creates a question template
 */
export function createQuestionTemplate(level, tech, sublevel) {
  return {
    id: generateId(level, tech, Date.now()),
    title: "Question Title",
    question: "Write your question here (supports **markdown**)",
    answer: {
      summary: "Brief summary of the answer",
      content: "Detailed answer with **markdown** support\n\nYou can use:\n- **Bold text**\n- *Italic text*\n- `code snippets`\n- Lists\n- And more!",
      codeExamples: [
        {
          language: "javascript",
          title: "Example 1",
          code: "// Your code here\nconsole.log('Hello World');",
          explanation: "Explanation of what this code does"
        }
      ],
      images: [],
      videos: [],
      resources: []
    },
    tags: ["tag1", "tag2"],
    sublevel: sublevel,
    years: 1,
    difficulty: level,
    lastUpdated: new Date().toISOString().split('T')[0]
  }
}

/**
 * Formats a question for display (handles both old and new schemas)
 */
export function formatQuestionForDisplay(question) {
  const normalized = normalizeQuestion(question)
  return normalized
}

/**
 * Extracts all unique topics from a list of questions
 */
export function extractTopics(questions) {
  const topics = new Set()
  questions.forEach(q => {
    if (q.sublevel) topics.add(q.sublevel)
    if (q.tags) q.tags.forEach(tag => topics.add(tag))
  })
  return Array.from(topics).sort()
}

/**
 * Filters questions by multiple criteria
 */
export function filterQuestions(questions, filters) {
  return questions.filter(q => {
    if (filters.level && q.difficulty !== filters.level) return false
    if (filters.sublevel && q.sublevel !== filters.sublevel) return false
    if (filters.tags && filters.tags.length > 0) {
      const hasTag = filters.tags.some(tag => q.tags?.includes(tag))
      if (!hasTag) return false
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const inTitle = q.title.toLowerCase().includes(searchLower)
      const inQuestion = q.question.toLowerCase().includes(searchLower)
      const inAnswer = q.answer?.content?.toLowerCase().includes(searchLower)
      if (!inTitle && !inQuestion && !inAnswer) return false
    }
    return true
  })
}
