#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to update table names in SQL queries
function updateTableNames(content) {
    // Update table names to use proper Prisma naming
    let updated = content;
    
    // Replace table names with proper quoted names
    updated = updated.replace(/FROM employees/g, 'FROM "Employee"');
    updated = updated.replace(/FROM departments/g, 'FROM "Department"');
    updated = updated.replace(/FROM employee_projects/g, 'FROM "employee_projects"');
    updated = updated.replace(/FROM projects/g, 'FROM "Project"');
    updated = updated.replace(/FROM logs/g, 'FROM "Log"');
    updated = updated.replace(/FROM weather/g, 'FROM "Weather"');
    updated = updated.replace(/FROM activity/g, 'FROM "Activity"');
    
    // Update column names to use proper casing
    updated = updated.replace(/department_id/g, '"departmentId"');
    updated = updated.replace(/manager_id/g, '"managerId"');
    updated = updated.replace(/hire_date/g, '"hire_date"');
    updated = updated.replace(/employee_id/g, '"employeeId"');
    updated = updated.replace(/project_id/g, '"projectId"');
    updated = updated.replace(/record_date/g, '"record_date"');
    updated = updated.replace(/activity_date/g, '"activity_date"');
    updated = updated.replace(/activity_type/g, '"activity_type"');
    updated = updated.replace(/session_id/g, '"session_id"');
    updated = updated.replace(/user_id/g, '"user_id"');
    updated = updated.replace(/start_date/g, '"start_date"');
    updated = updated.replace(/end_date/g, '"end_date"');
    
    // Update table aliases in JOIN clauses
    updated = updated.replace(/employees e/g, '"Employee" e');
    updated = updated.replace(/departments d/g, '"Department" d');
    updated = updated.replace(/employee_projects ep/g, '"employee_projects" ep');
    updated = updated.replace(/projects p/g, '"Project" p');
    
    // Update table references in subqueries
    updated = updated.replace(/employees e1/g, '"Employee" e1');
    updated = updated.replace(/employees e2/g, '"Employee" e2');
    updated = updated.replace(/employees m/g, '"Employee" m');
    updated = updated.replace(/departments d1/g, '"Department" d1');
    updated = updated.replace(/departments d2/g, '"Department" d2');
    
    return updated;
}

// Files to update
const files = [
    'public/src/data/learningLevels.js',
    'public/src/data/learningLevels.11level.js',
    'public/src/data/theoryLevels.js',
    'public/src/data/essentialsLevels.js'
];

console.log('🔄 Updating quiz queries to use correct Prisma table names...\n');

files.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        console.log(`📝 Updating ${filePath}...`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        content = updateTableNames(content);
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated ${filePath}`);
        } else {
            console.log(`⏭️  No changes needed for ${filePath}`);
        }
    } else {
        console.log(`⚠️  File not found: ${filePath}`);
    }
});

console.log('\n🎉 Quiz query updates completed!');
