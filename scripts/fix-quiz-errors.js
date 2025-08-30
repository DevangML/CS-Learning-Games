#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to fix common error patterns in quiz files
function fixQuizErrors(content) {
    let fixed = content;
    
    // Fix 1: Remove quotes around column names in questions (not in solutions)
    // Pattern: "departmentId"=1 -> departmentId=1
    fixed = fixed.replace(/"departmentId"=/g, 'departmentId=');
    fixed = fixed.replace(/"hire_date"/g, 'hire_date');
    fixed = fixed.replace(/"employeeId"/g, 'employeeId');
    fixed = fixed.replace(/"projectId"/g, 'projectId');
    fixed = fixed.replace(/"managerId"/g, 'managerId');
    fixed = fixed.replace(/"user_id"/g, 'user_id');
    fixed = fixed.replace(/"session_id"/g, 'session_id');
    fixed = fixed.replace(/"activity_date"/g, 'activity_date');
    fixed = fixed.replace(/"activity_type"/g, 'activity_type');
    fixed = fixed.replace(/"record_date"/g, 'record_date');
    fixed = fixed.replace(/"start_date"/g, 'start_date');
    fixed = fixed.replace(/"end_date"/g, 'end_date');
    
    // Fix 2: Fix "Employee" in questions (should be "employees")
    fixed = fixed.replace(/"Employee" earning/g, 'employees earning');
    fixed = fixed.replace(/"Employee" earn/g, 'employees earn');
    fixed = fixed.replace(/"Employee" in questions/g, 'employees in questions');
    
    // Fix 3: Fix "departmentId" can be anything -> department_id can be anything
    fixed = fixed.replace(/"departmentId" can be anything/g, 'department_id can be anything');
    fixed = fixed.replace(/"departmentId" can be anything including NULL/g, 'department_id can be anything including NULL');
    
    // Fix 4: Fix "Employee" in hints (should be "employees")
    fixed = fixed.replace(/Count how many "Employee" earn/g, 'Count how many employees earn');
    
    // Fix 5: Fix "Employee" in questions (should be "employees")
    fixed = fixed.replace(/Find "Employee"/g, 'Find employees');
    fixed = fixed.replace(/Find departments where ALL "Employee"/g, 'Find departments where ALL employees');
    
    // Fix 6: Fix "departmentId" in questions (should be "department_id")
    fixed = fixed.replace(/"departmentId"=1/g, 'department_id=1');
    fixed = fixed.replace(/"departmentId"=2/g, 'department_id=2');
    fixed = fixed.replace(/"departmentId"=3/g, 'department_id=3');
    fixed = fixed.replace(/"departmentId"=4/g, 'department_id=4');
    
    // Fix 7: Fix "departmentId" in questions (should be "department_id")
    fixed = fixed.replace(/dept_id=1/g, 'department_id=1');
    fixed = fixed.replace(/dept_id=2/g, 'department_id=2');
    fixed = fixed.replace(/dept_id=3/g, 'department_id=3');
    fixed = fixed.replace(/dept_id=4/g, 'department_id=4');
    
    // Fix 8: Fix "departmentId" in questions (should be "department_id")
    fixed = fixed.replace(/Engineering \("departmentId"=1\)/g, 'Engineering (department_id=1)');
    fixed = fixed.replace(/Marketing \(dept_id=2\)/g, 'Marketing (department_id=2)');
    fixed = fixed.replace(/Sales \(dept_id=3\)/g, 'Sales (department_id=3)');
    fixed = fixed.replace(/HR department \(dept_id=4\)/g, 'HR department (department_id=4)');
    
    // Fix 9: Fix "departmentId" in questions (should be "department_id")
    fixed = fixed.replace(/employees whose "departmentId"/g, 'employees whose department_id');
    fixed = fixed.replace(/employees without "departmentId"/g, 'employees without department_id');
    fixed = fixed.replace(/employees where "departmentId"/g, 'employees where department_id');
    
    // Fix 10: Fix "departmentId" in questions (should be "department_id")
    fixed = fixed.replace(/same month as their department was created \(simulated with "departmentId"\)/g, 'same month as their department was created (simulated with department_id)');
    
    // Fix 11: Fix "departmentId" in hints (should be "department_id")
    fixed = fixed.replace(/Use RANK\(\) with PARTITION BY "departmentId"/g, 'Use RANK() with PARTITION BY department_id');
    
    // Fix 12: Fix "departmentId" in hints (should be "department_id")
    fixed = fixed.replace(/Count how many "Employee" earn more to determine hierarchy level/g, 'Count how many employees earn more to determine hierarchy level');
    
    return fixed;
}

// Files to fix
const files = [
    'public/src/data/learningLevels.js',
    'public/src/data/learningLevels.11level.js',
    'public/src/data/theoryLevels.js',
    'public/src/data/essentialsLevels.js'
];

console.log('🔧 Fixing common error patterns in quiz files...\n');

files.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        console.log(`📝 Fixing ${filePath}...`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        content = fixQuizErrors(content);
        
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

console.log('\n🎉 Quiz error fixes completed!');
