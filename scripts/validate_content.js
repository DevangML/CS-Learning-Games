#!/usr/bin/env node
// Lightweight validator for game content JSON produced by prompts.
// Validates schema and flags items lacking verification metadata.

const fs = require('fs');

function validateFile(path) {
  const raw = fs.readFileSync(path, 'utf8');
  let data;
  try { data = JSON.parse(raw); } catch (e) {
    console.error(`Invalid JSON: ${path}`);
    process.exitCode = 1;
    return;
  }
  const levels = Object.keys(data);
  const errors = [];
  levels.forEach(lvl => {
    const L = data[lvl];
    if (!L || !Array.isArray(L.questions) || L.questions.length !== 4) {
      errors.push(`Level ${lvl}: must have 4 questions`);
      return;
    }
    L.questions.forEach((q, idx) => {
      const baseOk = q && typeof q.question === 'string' && typeof q.hint === 'string' && typeof q.solution === 'string' && q.concept && typeof q.concept.title === 'string' && typeof q.concept.content === 'string' && Array.isArray(q.tags);
      if (!baseOk) errors.push(`Level ${lvl} Q${idx}: schema invalid`);
      // Authentic knowledge: require verification for non-SQL theory content input
      if (!(q.verified === true || (Array.isArray(q.sources) && q.sources.length > 0))) {
        errors.push(`Level ${lvl} Q${idx}: missing verification (verified:true or sources[])`);
      }
    });
  });
  if (errors.length) {
    console.log(`\n${path}:`);
    errors.forEach(e => console.log(` - ${e}`));
    process.exitCode = 1;
  } else {
    console.log(`${path}: OK`);
  }
}

if (process.argv.length < 3) {
  console.log('Usage: node scripts/validate_content.js <content.json> [more.json ...]');
  process.exit(1);
}

for (let i = 2; i < process.argv.length; i++) {
  validateFile(process.argv[i]);
}

