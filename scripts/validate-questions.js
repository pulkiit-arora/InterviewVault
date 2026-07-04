#!/usr/bin/env node

/**
 * Question Validation Script
 * Validates all question files against the schema
 * Run with: node scripts/validate-questions.js
 */

const fs = require('fs');
const path = require('path');

const LEVELS = ['Junior', 'Mid', 'Senior'];
const TECHS = ['java', 'database'];

function validateQuestion(question) {
  const errors = [];
  const warnings = [];
  
  if (!question.id) errors.push('Missing required field: id');
  if (!question.title) errors.push('Missing required field: title');
  if (!question.question) errors.push('Missing required field: question');
  
  // Check answer field (old schema: string, new schema: object)
  if (!question.answer) {
    errors.push('Missing required field: answer');
  } else if (typeof question.answer === 'object') {
    if (!question.answer.content) errors.push('Missing answer.content in new schema');
  }
  
  if (!question.tags || !Array.isArray(question.tags)) {
    errors.push('Missing or invalid field: tags (should be array)');
  }
  
  if (!question.sublevel) errors.push('Missing required field: sublevel');
  
  // Validate code examples if present
  if (question.answer?.codeExamples) {
    question.answer.codeExamples.forEach((example, idx) => {
      if (!example.language) errors.push(`Code example ${idx}: missing language`);
      if (!example.code) errors.push(`Code example ${idx}: missing code`);
    });
  }
  
  // Warnings for optional but recommended fields
  if (!question.years) warnings.push('Missing recommended field: years');
  if (!question.difficulty) warnings.push('Missing recommended field: difficulty');
  
  return { isValid: errors.length === 0, errors, warnings };
}

function loadQuestions(level, tech) {
  const dirPath = path.join(__dirname, '..', 'public', 'questions', level);
  const filePath = path.join(__dirname, '..', 'public', 'questions', level, `${tech}.json`);
  
  if (!fs.existsSync(filePath)) {
    return { questions: [], error: null };
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(content);
    return { questions, error: null };
  } catch (error) {
    return { questions: [], error: error.message };
  }
}

function validateAllQuestions() {
  let totalQuestions = 0;
  let validQuestions = 0;
  let totalErrors = 0;
  let totalWarnings = 0;
  const allErrors = [];
  const allWarnings = [];
  
  console.log('🔍 Validating all questions...\n');
  
  LEVELS.forEach(level => {
    TECHS.forEach(tech => {
      const { questions, error } = loadQuestions(level, tech);
      
      if (error) {
        console.log(`❌ ${level}/${tech}.json: ${error}`);
        return;
      }
      
      if (questions.length === 0) {
        console.log(`⚠️  ${level}/${tech}.json: No questions found`);
        return;
      }
      
      console.log(`📄 ${level}/${tech}.json: ${questions.length} questions`);
      
      questions.forEach((question, idx) => {
        totalQuestions++;
        const validation = validateQuestion(question);
        
        if (validation.isValid) {
          validQuestions++;
        } else {
          totalErrors += validation.errors.length;
          validation.errors.forEach(err => {
            allErrors.push(`${level}/${tech}.json [${idx}]: ${err}`);
          });
        }
        
        totalWarnings += validation.warnings.length;
        validation.warnings.forEach(warn => {
          allWarnings.push(`${level}/${tech}.json [${idx}]: ${warn}`);
        });
      });
    });
  });
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Validation Summary');
  console.log('='.repeat(50));
  console.log(`Total Questions: ${totalQuestions}`);
  console.log(`Valid Questions: ${validQuestions}`);
  console.log(`Invalid Questions: ${totalQuestions - validQuestions}`);
  console.log(`Total Errors: ${totalErrors}`);
  console.log(`Total Warnings: ${totalWarnings}`);
  
  if (allErrors.length > 0) {
    console.log('\n❌ Errors:');
    allErrors.forEach(err => console.log(`  - ${err}`));
  }
  
  if (allWarnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    allWarnings.forEach(warn => console.log(`  - ${warn}`));
  }
  
  if (totalErrors === 0) {
    console.log('\n✅ All questions are valid!');
  } else {
    console.log('\n❌ Some questions have errors. Please fix them.');
    process.exit(1);
  }
}

function validateSingleFile(filePath) {
  console.log(`🔍 Validating ${filePath}...\n`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(content);
    
    let validCount = 0;
    const allErrors = [];
    const allWarnings = [];
    
    questions.forEach((question, idx) => {
      const validation = validateQuestion(question);
      
      if (validation.isValid) {
        validCount++;
      } else {
        validation.errors.forEach(err => {
          allErrors.push(`[${idx}]: ${err}`);
        });
      }
      
      validation.warnings.forEach(warn => {
        allWarnings.push(`[${idx}]: ${warn}`);
      });
    });
    
    console.log(`Total Questions: ${questions.length}`);
    console.log(`Valid: ${validCount}`);
    console.log(`Invalid: ${questions.length - validCount}`);
    
    if (allErrors.length > 0) {
      console.log('\n❌ Errors:');
      allErrors.forEach(err => console.log(`  - ${err}`));
    }
    
    if (allWarnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      allWarnings.forEach(warn => console.log(`  - ${warn}`));
    }
    
    if (allErrors.length === 0) {
      console.log('\n✅ All questions are valid!');
    } else {
      console.log('\n❌ Some questions have errors.');
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Error parsing file: ${error.message}`);
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Validate specific file
    validateSingleFile(args[0]);
  } else {
    // Validate all questions
    validateAllQuestions();
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateQuestion, loadQuestions };
