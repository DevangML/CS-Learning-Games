#!/usr/bin/env node

// Test the SQL formatter improvements
const SQLFormatter = require('../lib/sql-formatter');

const formatter = new SQLFormatter();

console.log('🧪 Testing SQL Formatter Improvements...\n');

// Test cases
const testCases = [
    {
        name: 'Table name casing correction',
        input: 'SELECT name, salary, salary * 0.10 AS bonus, salary + (salary * 0.10) AS total_compensation FROM "employee";',
        expected: 'SELECT name, salary, salary * 0.10 AS bonus, salary + (salary * 0.10) AS total_compensation FROM "Employee";'
    },
    {
        name: 'Department table casing correction',
        input: 'SELECT * FROM "department" WHERE id = 1;',
        expected: 'SELECT * FROM "Department" WHERE id = 1;'
    },
    {
        name: 'Mixed case corrections',
        input: 'SELECT e.name FROM "employee" e JOIN "department" d ON e.departmentId = d.id;',
        expected: 'SELECT e.name FROM "Employee" e JOIN "Department" d ON e."departmentId" = d.id;'
    }
];

testCases.forEach((testCase, index) => {
    console.log(`📝 Test ${index + 1}: ${testCase.name}`);
    console.log(`   Input:    ${testCase.input}`);
    
    const corrected = formatter.autoCorrect(testCase.input);
    console.log(`   Corrected: ${corrected}`);
    
    const passed = corrected.includes('"Employee"') && !corrected.includes('"employee"');
    console.log(`   ✅ ${passed ? 'PASSED' : 'FAILED'}`);
    console.log('');
});

console.log('🎉 SQL Formatter test completed!');
