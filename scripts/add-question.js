#!/usr/bin/env node

/**
 * Question Generator Script
 * Run with: node scripts/add-question.js <level> <tech> <sublevel>
 * Example: node scripts/add-question.js Junior javascript "Async"
 */

const fs = require('fs');
const path = require('path');

const LEVELS = ['Junior', 'Mid', 'Senior'];
const TECHS = ['javascript', 'python', 'java'];

function generateId(level, tech, index) {
  const techPrefix = tech.substring(0, 2).toLowerCase();
  const levelPrefix = level.substring(0, 2).toLowerCase();
  return `${techPrefix}-${levelPrefix}-${index + 1}`;
}

function createQuestionTemplate(level, tech, sublevel) {
  return {
    id: generateId(level, tech, Date.now()),
    title: "Question Title",
    question: "Write your question here (supports **markdown**)\n\nYou can use:\n- **Bold text**\n- *Italic text*\n- `code snippets`\n- Lists\n- And more!",
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
  };
}

function loadExistingQuestions(level, tech) {
  const filePath = path.join(__dirname, '..', 'public', 'questions', level, `${tech}.json`);
  
  if (!fs.existsSync(filePath)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return [];
  }
}

function saveQuestions(level, tech, questions) {
  const dirPath = path.join(__dirname, '..', 'public', 'questions', level);
  const filePath = path.join(dirPath, `${tech}.json`);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  // Sort questions by ID
  const sorted = questions.sort((a, b) => a.id.localeCompare(b.id));
  
  fs.writeFileSync(filePath, JSON.stringify(sorted, null, 2), 'utf8');
  console.log(`✓ Saved ${questions.length} questions to ${filePath}`);
}

function updateManifest(level, tech, sublevel) {
  const manifestPath = path.join(__dirname, '..', 'public', 'questions', 'manifest.json');
  
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Ensure level exists
    if (!manifest.levels[level]) {
      manifest.levels[level] = {};
    }
    
    // Ensure tech exists
    if (!manifest.levels[level][tech]) {
      manifest.levels[level][tech] = {};
    }
    
    // Ensure sublevel exists
    if (!manifest.levels[level][tech][sublevel]) {
      manifest.levels[level][tech][sublevel] = [];
    }
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`✓ Updated manifest with new sublevel: ${level}/${tech}/${sublevel}`);
  } catch (error) {
    console.error(`Error updating manifest: ${error.message}`);
  }
}

function getNextIndex(questions) {
  if (questions.length === 0) return 0;
  
  // Extract indices from existing IDs (format: tech-level-number)
  const indices = questions.map(q => {
    const match = q.id.match(/-(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  });
  
  return Math.max(...indices) + 1;
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('Usage: node scripts/add-question.js <level> <tech> <sublevel>');
    console.log('Example: node scripts/add-question.js Junior javascript "Async"');
    console.log('\nAvailable levels:', LEVELS.join(', '));
    console.log('Available techs:', TECHS.join(', '));
    process.exit(1);
  }
  
  const [level, tech, sublevel] = args;
  
  // Validate inputs
  if (!LEVELS.includes(level)) {
    console.error(`Invalid level: ${level}. Available: ${LEVELS.join(', ')}`);
    process.exit(1);
  }
  
  if (!TECHS.includes(tech)) {
    console.error(`Invalid tech: ${tech}. Available: ${TECHS.join(', ')}`);
    process.exit(1);
  }
  
  // Load existing questions
  const existingQuestions = loadExistingQuestions(level, tech);
  const nextIndex = getNextIndex(existingQuestions);
  
  // Create new question
  const newQuestion = createQuestionTemplate(level, tech, sublevel);
  newQuestion.id = generateId(level, tech, nextIndex);
  
  // Add to existing questions
  existingQuestions.push(newQuestion);
  
  // Save
  saveQuestions(level, tech, existingQuestions);
  
  // Update manifest to include new sublevel
  updateManifest(level, tech, sublevel);
  
  console.log('\n✓ New question added successfully!');
  console.log(`  ID: ${newQuestion.id}`);
  console.log(`  Level: ${level}`);
  console.log(`  Tech: ${tech}`);
  console.log(`  Sublevel: ${sublevel}`);
  console.log(`\nEdit the question at: questions/${level}/${tech}.json`);
  console.log(`\nNote: The UI will automatically reflect the new question and topic on page refresh.`);
}

if (require.main === module) {
  main();
}

module.exports = { createQuestionTemplate, loadExistingQuestions, saveQuestions };
