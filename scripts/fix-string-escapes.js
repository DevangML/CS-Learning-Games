#!/usr/bin/env node

const fs = require('fs');

function fixStringEscapes(content) {
    let fixed = content;
    
    // Fix all instances where quoted column names are not properly escaped
    // Pattern: "departmentId" -> \"departmentId\"
    fixed = fixed.replace(/"departmentId"/g, '\\"departmentId\\"');
    fixed = fixed.replace(/"hire_date"/g, '\\"hire_date\\"');
    fixed = fixed.replace(/"employeeId"/g, '\\"employeeId\\"');
    fixed = fixed.replace(/"projectId"/g, '\\"projectId\\"');
    fixed = fixed.replace(/"managerId"/g, '\\"managerId\\"');
    fixed = fixed.replace(/"user_id"/g, '\\"user_id\\"');
    fixed = fixed.replace(/"session_id"/g, '\\"session_id\\"');
    fixed = fixed.replace(/"activity_date"/g, '\\"activity_date\\"');
    fixed = fixed.replace(/"activity_type"/g, '\\"activity_type\\"');
    fixed = fixed.replace(/"record_date"/g, '\\"record_date\\"');
    fixed = fixed.replace(/"start_date"/g, '\\"start_date\\"');
    fixed = fixed.replace(/"end_date"/g, '\\"end_date\\"');
    
    // Fix unescaped table names in SQL strings
    fixed = fixed.replace(/"Department"/g, '\\"Department\\"');
    fixed = fixed.replace(/"Employee"/g, '\\"Employee\\"');
    fixed = fixed.replace(/"Project"/g, '\\"Project\\"');
    fixed = fixed.replace(/"employee_projects"/g, '\\"employee_projects\\"');
    fixed = fixed.replace(/"Log"/g, '\\"Log\\"');
    fixed = fixed.replace(/"Weather"/g, '\\"Weather\\"');
    fixed = fixed.replace(/"Activity"/g, '\\"Activity\\"');
    
    return fixed;
}

const files = [
    'public/src/data/learningLevels.js',
    'public/src/data/learningLevels.11level.js',
    'public/src/data/theoryLevels.js',
    'public/src/data/essentialsLevels.js'
];

console.log('🔧 Fixing string escape issues in quiz files...\n');

files.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        console.log(`📝 Fixing ${filePath}...`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        content = fixStringEscapes(content);
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Fixed ${filePath}`);
        } else {
            console.log(`⏭️  No changes needed for ${filePath}`);
        }
    } else {
        console.log(`⚠️  File not found: ${filePath}`);
    }
});

console.log('\n🎉 String escape fixes completed!');
