#!/usr/bin/env node

// Load environment variables from .env file
require('dotenv').config({ path: '.env' });

const { getDbPool } = require('../lib/sql-exec');

async function testQuizQueries() {
    console.log('🧪 Testing Quiz Queries with Prisma Database...\n');

    const pool = getDbPool();

    // Test cases for different quiz levels
    const testCases = [
        // Level 1: Basic SELECT
        {
            name: 'Level 1 - Basic SELECT',
            query: 'SELECT * FROM "Department"',
            expected: 'Should return all departments'
        },
        {
            name: 'Level 1 - SELECT specific columns',
            query: 'SELECT name, "managerId" FROM "Department"',
            expected: 'Should return department names and manager IDs'
        },
        {
            name: 'Level 1 - SELECT with WHERE',
            query: 'SELECT * FROM "Employee" WHERE "departmentId" = 1',
            expected: 'Should return employees from Engineering department'
        },

        // Level 2: WHERE conditions
        {
            name: 'Level 2 - WHERE with string comparison',
            query: "SELECT * FROM \"Employee\" WHERE name = 'John Doe'",
            expected: 'Should return John Doe employee'
        },
        {
            name: 'Level 2 - WHERE with numeric comparison',
            query: 'SELECT * FROM "Employee" WHERE salary > 70000',
            expected: 'Should return employees with salary > 70000'
        },
        {
            name: 'Level 2 - WHERE with multiple conditions',
            query: 'SELECT * FROM "Employee" WHERE "departmentId" = 1 AND salary > 70000',
            expected: 'Should return Engineering employees with salary > 70000'
        },

        // Level 3: JOIN operations
        {
            name: 'Level 3 - INNER JOIN',
            query: 'SELECT e.name, d.name as department FROM "Employee" e JOIN "Department" d ON e."departmentId" = d.id',
            expected: 'Should return employees with their department names'
        },
        {
            name: 'Level 3 - LEFT JOIN',
            query: 'SELECT d.name, COUNT(e.id) as employee_count FROM "Department" d LEFT JOIN "Employee" e ON d.id = e."departmentId" GROUP BY d.id, d.name',
            expected: 'Should return departments with employee counts'
        },

        // Level 4: Aggregation
        {
            name: 'Level 4 - COUNT',
            query: 'SELECT COUNT(*) as total_employees FROM "Employee"',
            expected: 'Should return total number of employees'
        },
        {
            name: 'Level 4 - AVG',
            query: 'SELECT AVG(salary) as avg_salary FROM "Employee"',
            expected: 'Should return average salary'
        },
        {
            name: 'Level 4 - SUM',
            query: 'SELECT SUM(salary) as total_salary FROM "Employee"',
            expected: 'Should return total salary'
        },
        {
            name: 'Level 4 - MAX/MIN',
            query: 'SELECT MAX(salary) as max_salary, MIN(salary) as min_salary FROM "Employee"',
            expected: 'Should return max and min salaries'
        },

        // Level 5: GROUP BY
        {
            name: 'Level 5 - GROUP BY with COUNT',
            query: 'SELECT "departmentId", COUNT(*) as employee_count FROM "Employee" GROUP BY "departmentId"',
            expected: 'Should return employee count per department'
        },
        {
            name: 'Level 5 - GROUP BY with AVG',
            query: 'SELECT "departmentId", AVG(salary) as avg_salary FROM "Employee" GROUP BY "departmentId"',
            expected: 'Should return average salary per department'
        },

        // Level 6: HAVING
        {
            name: 'Level 6 - HAVING with COUNT',
            query: 'SELECT "departmentId", COUNT(*) as employee_count FROM "Employee" GROUP BY "departmentId" HAVING COUNT(*) > 1',
            expected: 'Should return departments with more than 1 employee'
        },
        {
            name: 'Level 6 - HAVING with AVG',
            query: 'SELECT "departmentId", AVG(salary) as avg_salary FROM "Employee" GROUP BY "departmentId" HAVING AVG(salary) > 60000',
            expected: 'Should return departments with average salary > 60000'
        },

        // Level 7: ORDER BY
        {
            name: 'Level 7 - ORDER BY ASC',
            query: 'SELECT name, salary FROM "Employee" ORDER BY salary ASC',
            expected: 'Should return employees ordered by salary ascending'
        },
        {
            name: 'Level 7 - ORDER BY DESC',
            query: 'SELECT name, salary FROM "Employee" ORDER BY salary DESC',
            expected: 'Should return employees ordered by salary descending'
        },
        {
            name: 'Level 7 - ORDER BY multiple columns',
            query: 'SELECT name, "departmentId", salary FROM "Employee" ORDER BY "departmentId" ASC, salary DESC',
            expected: 'Should return employees ordered by department then salary'
        },

        // Level 8: LIMIT
        {
            name: 'Level 8 - LIMIT',
            query: 'SELECT name, salary FROM "Employee" ORDER BY salary DESC LIMIT 3',
            expected: 'Should return top 3 highest paid employees'
        },
        {
            name: 'Level 8 - LIMIT with OFFSET',
            query: 'SELECT name, salary FROM "Employee" ORDER BY salary DESC LIMIT 2 OFFSET 1',
            expected: 'Should return 2nd and 3rd highest paid employees'
        },

        // Level 9: Subqueries
        {
            name: 'Level 9 - Subquery in WHERE',
            query: 'SELECT name, salary FROM "Employee" WHERE salary > (SELECT AVG(salary) FROM "Employee")',
            expected: 'Should return employees with above average salary'
        },
        {
            name: 'Level 9 - Subquery in SELECT',
            query: 'SELECT name, salary, (SELECT AVG(salary) FROM "Employee") as avg_salary FROM "Employee"',
            expected: 'Should return employees with average salary in each row'
        },

        // Level 10: Complex queries
        {
            name: 'Level 10 - Complex JOIN with aggregation',
            query: 'SELECT d.name, COUNT(e.id) as employee_count, AVG(e.salary) as avg_salary FROM "Department" d LEFT JOIN "Employee" e ON d.id = e."departmentId" GROUP BY d.id, d.name HAVING COUNT(e.id) > 0 ORDER BY avg_salary DESC',
            expected: 'Should return departments with employee count and average salary, ordered by avg salary'
        },

        // Level 11: Advanced features
        {
            name: 'Level 11 - CASE statement',
            query: "SELECT name, salary, CASE WHEN salary > 70000 THEN 'High' WHEN salary > 60000 THEN 'Medium' ELSE 'Low' END as salary_level FROM \"Employee\"",
            expected: 'Should return employees with salary level classification'
        },
        {
            name: 'Level 11 - String functions',
            query: "SELECT UPPER(name) as upper_name, LENGTH(name) as name_length FROM \"Employee\"",
            expected: 'Should return uppercase names and name lengths'
        },

        // Parameterized queries
        {
            name: 'Parameterized Query - Department by ID',
            query: 'SELECT * FROM "Department" WHERE id = ?',
            params: [1],
            expected: 'Should return department with ID 1'
        },
        {
            name: 'Parameterized Query - Employees by department',
            query: 'SELECT * FROM "Employee" WHERE "departmentId" = ? AND salary > ?',
            params: [1, 70000],
            expected: 'Should return Engineering employees with salary > 70000'
        },
        {
            name: 'Parameterized Query - Employee by name',
            query: "SELECT * FROM \"Employee\" WHERE name LIKE ?",
            params: ['%John%'],
            expected: 'Should return employees with John in their name'
        }
    ];

    let passedTests = 0;
    let failedTests = 0;

    for (const testCase of testCases) {
        try {
            console.log(`📝 Testing: ${testCase.name}`);
            console.log(`   Query: ${testCase.query}`);
            if (testCase.params) {
                console.log(`   Params: [${testCase.params.join(', ')}]`);
            }
            console.log(`   Expected: ${testCase.expected}`);

            const result = await pool.execute(testCase.query, testCase.params || []);
            
            if (result && result[0] && Array.isArray(result[0])) {
                console.log(`   ✅ PASSED - Returned ${result[0].length} rows`);
                console.log(`   📊 Sample data: ${JSON.stringify(result[0].slice(0, 2), null, 2)}`);
                passedTests++;
            } else {
                console.log(`   ✅ PASSED - Query executed successfully`);
                console.log(`   📊 Result: ${JSON.stringify(result, null, 2)}`);
                passedTests++;
            }
        } catch (error) {
            console.log(`   ❌ FAILED - ${error.message}`);
            failedTests++;
        }
        console.log(''); // Empty line for readability
    }

    console.log('📊 Test Summary:');
    console.log(`   ✅ Passed: ${passedTests}`);
    console.log(`   ❌ Failed: ${failedTests}`);
    console.log(`   📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);

    if (failedTests === 0) {
        console.log('\n🎉 All quiz queries are working perfectly!');
    } else {
        console.log('\n⚠️  Some queries failed. Check the errors above.');
    }
}

// Run the test
testQuizQueries().catch(console.error);
