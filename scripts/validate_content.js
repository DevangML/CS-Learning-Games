#!/usr/bin/env node
// Enhanced content validation script for Authentic Knowledge Rule compliance
// Supports both JSON and JavaScript content files with DBMS-specific validation

const fs = require('fs');
const path = require('path');

console.log('🔎 Content Validation Script - Authentic Knowledge Rule Enforcement\n');

function validateFile(filePath) {
  console.log(`Validating: ${filePath}`);
  
  try {
    let content;
    const isJSFile = filePath.endsWith('.js');
    const isJSONFile = filePath.endsWith('.json');
    
    if (isJSONFile) {
      const raw = fs.readFileSync(filePath, 'utf8');
      content = JSON.parse(raw);
    } else if (isJSFile) {
      // Handle JavaScript content files
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Extract different content patterns
      const topicsMatch = fileContent.match(/const\s+THEORY_TOPICS\s*=\s*({[\s\S]*?});/);
      const levelsMatch = fileContent.match(/const\s+(?:LEARNING_LEVELS|ESSENTIALS_LEVELS|THEORY_LEVELS)\s*=\s*({[\s\S]*?});/);
      const quizzesMatch = fileContent.match(/const\s+THEORY_QUIZZES\s*=\s*({[\s\S]*?});/);
      
      if (topicsMatch) {
        eval(`content = ${topicsMatch[1]}`);
      } else if (levelsMatch) {
        eval(`content = ${levelsMatch[1]}`);
      } else if (quizzesMatch) {
        eval(`content = ${quizzesMatch[1]}`);
      } else {
        throw new Error('No recognizable content pattern found');
      }
    } else {
      throw new Error('Unsupported file format. Use .json or .js files.');
    }
    
    // Determine content type for validation rules
    const isTheoryContent = filePath.includes('theoryTopics') || filePath.includes('theoryLevels');
    const isSQLContent = filePath.includes('learningLevels') || filePath.includes('essentialsLevels');
    
    let totalItems = 0;
    let verifiedItems = 0;
    let sourcedItems = 0;
    let gfgReferencedItems = 0;
    const errors = [];
    const warnings = [];
    
    // Validate each level/topic
    Object.keys(content).forEach(key => {
      const item = content[key];
      if (!item || typeof item !== 'object') return;
      
      totalItems++;
      
      // Check verification status
      const hasVerified = item.verified === true;
      const hasSources = item.sources && Array.isArray(item.sources) && item.sources.length > 0;
      
      if (hasVerified) verifiedItems++;
      if (hasSources) sourcedItems++;
      
      // Theory content specific validation
      if (isTheoryContent) {
        // Require verification for theory content
        if (!hasVerified && !hasSources) {
          errors.push(`${key}: Theory content missing verification (verified: true) or sources array`);
        }
        
        // Check for GeeksforGeeks references
        const hasGfGReference = (item.content && item.content.includes('GeeksforGeeks')) || 
                              (item.content && item.content.includes('geeksforgeeks')) ||
                              (hasSources && item.sources.some(s => 
                                  (typeof s === 'string' && s.toLowerCase().includes('geeksforgeeks')) ||
                                  (typeof s === 'object' && s.name && s.name.toLowerCase().includes('geeksforgeeks'))
                              ));
        
        if (hasGfGReference) gfgReferencedItems++;
        
        if (!hasGfGReference) {
          warnings.push(`${key}: DBMS theory should reference GeeksforGeeks as authoritative source`);
        }
        
        // Check for reference links section
        if (item.content && !item.content.includes('📚 References:')) {
          warnings.push(`${key}: Theory topics should include References section`);
        }
        
        // Validate quiz questions within theory topics
        if (item.quiz && Array.isArray(item.quiz)) {
          item.quiz.forEach((q, idx) => {
            if (!q.explanation) {
              errors.push(`${key} Quiz ${idx}: Missing explanation`);
            }
            if (!q.verified && !q.sources) {
              warnings.push(`${key} Quiz ${idx}: Should include source attribution`);
            }
          });
        }
      }
      
      // SQL content validation
      if (isSQLContent && item.questions) {
        item.questions.forEach((q, idx) => {
          // Basic schema validation
          const baseOk = q && typeof q.question === 'string' && 
                        typeof q.hint === 'string' && 
                        typeof q.solution === 'string' && 
                        q.concept && 
                        typeof q.concept.title === 'string' && 
                        typeof q.concept.content === 'string';
          
          if (!baseOk) {
            errors.push(`${key} Q${idx}: Schema invalid - missing required fields`);
          }
          
          // SQL-specific validation
          if (q.solution && !q.solution.trim().toLowerCase().includes('select')) {
            warnings.push(`${key} Q${idx}: SQL practice should include executable SELECT statement`);
          }
        });
      }
    });
    
    // Report results
    console.log(`📊 Validation Results for ${path.basename(filePath)}:`);
    console.log(`   Total items: ${totalItems}`);
    console.log(`   Verified: ${verifiedItems} (${Math.round(verifiedItems/totalItems*100)}%)`);
    console.log(`   With sources: ${sourcedItems} (${Math.round(sourcedItems/totalItems*100)}%)`);
    
    if (isTheoryContent) {
      console.log(`   GeeksforGeeks referenced: ${gfgReferencedItems} (${Math.round(gfgReferencedItems/totalItems*100)}%)`);
    }
    
    if (errors.length === 0 && warnings.length === 0) {
      console.log('   ✅ PASSED - All content compliant with Authentic Knowledge Rule');
    } else {
      if (errors.length > 0) {
        console.log(`\n❌ ${errors.length} ERRORS:`);
        errors.forEach(e => console.log(`   - ${e}`));
      }
      
      if (warnings.length > 0) {
        console.log(`\n⚠️  ${warnings.length} WARNINGS:`);
        warnings.forEach(w => console.log(`   - ${w}`));
      }
      
      if (errors.length > 0) {
        process.exitCode = 1;
      }
    }
    
    console.log(''); // Add spacing between files
    
  } catch (error) {
    console.error(`❌ Validation failed for ${filePath}: ${error.message}`);
    process.exitCode = 1;
  }
}

// Main execution
if (process.argv.length < 3) {
  console.log('Usage: node scripts/validate_content.js <content.js|content.json> [more files...]');
  console.log('Example: npm run validate-content src/data/theoryTopics.js');
  console.log('\nSupported files:');
  console.log('   • theoryTopics.js - DBMS theory content with GeeksforGeeks references');
  console.log('   • learningLevels.js - SQL practice levels with executable queries');
  console.log('   • Any JSON file with structured content');
  process.exit(1);
}

console.log('🔎 Validating content against Authentic Knowledge Rule...\n');

for (let i = 2; i < process.argv.length; i++) {
  const filePath = process.argv[i];
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exitCode = 1;
    continue;
  }
  validateFile(filePath);
}

if (process.exitCode === 1) {
  console.log('❌ Validation failed. Fix errors before content release.');
  console.log('\n📋 Authentic Knowledge Rule Requirements:');
  console.log('   • Theory content: verified: true OR sources: [] with reputable references');
  console.log('   • DBMS topics: Must reference GeeksforGeeks as authoritative source');
  console.log('   • SQL practice: Verified by canonical execution (automatic)');
  console.log('   • All content: Transparent sourcing and verification indicators');
} else {
  console.log('✅ All content validated successfully!');
  console.log('🔎 Ready for learner consumption with authentic knowledge guarantee.');
}

