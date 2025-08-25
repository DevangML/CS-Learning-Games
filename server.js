const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

let connection;

const connectDB = async () => {
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD || undefined,
            database: process.env.DB_NAME
        });
        console.log('Connected to MySQL database');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

const createTables = async () => {
    try {
        const sqlStatements = [
            `CREATE TABLE IF NOT EXISTS departments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                manager_id INT
            )`,
            
            `CREATE TABLE IF NOT EXISTS employees (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                department_id INT,
                salary DECIMAL(10,2),
                hire_date DATE
            )`,

            `CREATE TABLE IF NOT EXISTS projects (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                budget DECIMAL(15,2),
                start_date DATE,
                end_date DATE
            )`,

            `CREATE TABLE IF NOT EXISTS employee_projects (
                employee_id INT,
                project_id INT,
                role VARCHAR(50),
                PRIMARY KEY (employee_id, project_id),
                FOREIGN KEY (employee_id) REFERENCES employees(id),
                FOREIGN KEY (project_id) REFERENCES projects(id)
            )`,

            `INSERT IGNORE INTO departments (id, name, manager_id) VALUES
            (1, 'Engineering', 1),
            (2, 'Marketing', 2),
            (3, 'Sales', 3),
            (4, 'HR', 4)`,

            `INSERT IGNORE INTO employees (id, name, department_id, salary, hire_date) VALUES
            (1, 'John Doe', 1, 75000.00, '2020-01-15'),
            (2, 'Jane Smith', 2, 65000.00, '2019-03-22'),
            (3, 'Mike Johnson', 1, 80000.00, '2021-06-10'),
            (4, 'Sarah Wilson', 3, 55000.00, '2022-02-01'),
            (5, 'David Brown', 1, 70000.00, '2020-09-15'),
            (6, 'Lisa Davis', 2, 60000.00, '2021-11-30'),
            (7, 'Tom Anderson', 4, 50000.00, '2023-01-20'),
            (8, 'Emily White', 3, 58000.00, '2022-08-15')`,

            `INSERT IGNORE INTO projects (id, name, budget, start_date, end_date) VALUES
            (1, 'Website Redesign', 100000.00, '2023-01-01', '2023-06-30'),
            (2, 'Mobile App', 150000.00, '2023-03-15', '2023-12-31'),
            (3, 'Database Migration', 80000.00, '2023-02-01', '2023-08-31')`,

            `INSERT IGNORE INTO employee_projects (employee_id, project_id, role) VALUES
            (1, 1, 'Lead Developer'),
            (3, 1, 'Frontend Developer'),
            (5, 2, 'Backend Developer'),
            (1, 3, 'Database Architect'),
            (2, 1, 'UI/UX Designer')`,

            // Additional tables for LeetCode patterns
            `CREATE TABLE IF NOT EXISTS logs (
                id INT PRIMARY KEY AUTO_INCREMENT,
                num INT
            )`,

            `INSERT IGNORE INTO logs (id, num) VALUES
            (1, 1), (2, 1), (3, 1), (4, 2), (5, 1), (6, 2), (7, 2)`,

            `CREATE TABLE IF NOT EXISTS weather (
                id INT PRIMARY KEY AUTO_INCREMENT,
                record_date DATE,
                temperature INT
            )`,

            `INSERT IGNORE INTO weather (id, record_date, temperature) VALUES
            (1, '2015-01-01', 10), (2, '2015-01-02', 25), (3, '2015-01-03', 20), (4, '2015-01-04', 30)`,

            `CREATE TABLE IF NOT EXISTS activity (
                user_id INT,
                session_id INT,
                activity_date DATE,
                activity_type VARCHAR(50),
                PRIMARY KEY(user_id, session_id, activity_date)
            )`,

            `INSERT IGNORE INTO activity (user_id, session_id, activity_date, activity_type) VALUES
            (1, 1, '2019-07-20', 'open_session'),
            (1, 1, '2019-07-20', 'scroll_down'),
            (1, 1, '2019-07-20', 'end_session'),
            (1, 2, '2019-07-21', 'open_session'),
            (1, 2, '2019-07-21', 'send_message'),
            (1, 2, '2019-07-21', 'end_session'),
            (2, 4, '2019-07-21', 'open_session'),
            (2, 4, '2019-07-21', 'send_message'),
            (2, 4, '2019-07-21', 'end_session')`
        ];

        for (const sql of sqlStatements) {
            await connection.execute(sql);
        }
        
        console.log('Database tables created and populated');
    } catch (error) {
        console.error('Error creating tables:', error);
    }
};

const expectedResults = {
    // Basic queries
    'SELECT * FROM employees': [
        { id: 1, name: 'John Doe', department_id: 1, salary: '75000.00', hire_date: '2020-01-15' },
        { id: 2, name: 'Jane Smith', department_id: 2, salary: '65000.00', hire_date: '2019-03-22' },
        { id: 3, name: 'Mike Johnson', department_id: 1, salary: '80000.00', hire_date: '2021-06-10' },
        { id: 4, name: 'Sarah Wilson', department_id: 3, salary: '55000.00', hire_date: '2022-02-01' },
        { id: 5, name: 'David Brown', department_id: 1, salary: '70000.00', hire_date: '2020-09-15' },
        { id: 6, name: 'Lisa Davis', department_id: 2, salary: '60000.00', hire_date: '2021-11-30' },
        { id: 7, name: 'Tom Anderson', department_id: 4, salary: '50000.00', hire_date: '2023-01-20' },
        { id: 8, name: 'Emily White', department_id: 3, salary: '58000.00', hire_date: '2022-08-15' }
    ],
    
    // Arithmetic operations
    'SELECT name, salary, salary * 0.10 as bonus, salary + (salary * 0.10) as total_compensation FROM employees': [
        { name: 'John Doe', salary: '75000.00', bonus: '7500.000000', total_compensation: '82500.000000' },
        { name: 'Jane Smith', salary: '65000.00', bonus: '6500.000000', total_compensation: '71500.000000' },
        { name: 'Mike Johnson', salary: '80000.00', bonus: '8000.000000', total_compensation: '88000.000000' },
        { name: 'Sarah Wilson', salary: '55000.00', bonus: '5500.000000', total_compensation: '60500.000000' },
        { name: 'David Brown', salary: '70000.00', bonus: '7000.000000', total_compensation: '77000.000000' },
        { name: 'Lisa Davis', salary: '60000.00', bonus: '6000.000000', total_compensation: '66000.000000' },
        { name: 'Tom Anderson', salary: '50000.00', bonus: '5000.000000', total_compensation: '55000.000000' },
        { name: 'Emily White', salary: '58000.00', bonus: '5800.000000', total_compensation: '63800.000000' }
    ],
    
    // Comparison operations
    'SELECT * FROM employees WHERE salary = 75000': [
        { id: 1, name: 'John Doe', department_id: 1, salary: '75000.00', hire_date: '2020-01-15' }
    ],
    
    'SELECT * FROM employees WHERE salary != 50000': [
        { id: 1, name: 'John Doe', department_id: 1, salary: '75000.00', hire_date: '2020-01-15' },
        { id: 2, name: 'Jane Smith', department_id: 2, salary: '65000.00', hire_date: '2019-03-22' },
        { id: 3, name: 'Mike Johnson', department_id: 1, salary: '80000.00', hire_date: '2021-06-10' },
        { id: 4, name: 'Sarah Wilson', department_id: 3, salary: '55000.00', hire_date: '2022-02-01' },
        { id: 5, name: 'David Brown', department_id: 1, salary: '70000.00', hire_date: '2020-09-15' },
        { id: 6, name: 'Lisa Davis', department_id: 2, salary: '60000.00', hire_date: '2021-11-30' },
        { id: 8, name: 'Emily White', department_id: 3, salary: '58000.00', hire_date: '2022-08-15' }
    ],
    
    // Logical operations
    'SELECT * FROM employees WHERE department_id = 1 AND salary > 70000': [
        { id: 1, name: 'John Doe', department_id: 1, salary: '75000.00', hire_date: '2020-01-15' },
        { id: 3, name: 'Mike Johnson', department_id: 1, salary: '80000.00', hire_date: '2021-06-10' }
    ],
    
    'SELECT * FROM employees WHERE department_id = 2 OR department_id = 3': [
        { id: 2, name: 'Jane Smith', department_id: 2, salary: '65000.00', hire_date: '2019-03-22' },
        { id: 4, name: 'Sarah Wilson', department_id: 3, salary: '55000.00', hire_date: '2022-02-01' },
        { id: 6, name: 'Lisa Davis', department_id: 2, salary: '60000.00', hire_date: '2021-11-30' },
        { id: 8, name: 'Emily White', department_id: 3, salary: '58000.00', hire_date: '2022-08-15' }
    ],
    
    // Pattern matching
    'SELECT * FROM employees WHERE name LIKE "J%"': [
        { id: 1, name: 'John Doe', department_id: 1, salary: '75000.00', hire_date: '2020-01-15' },
        { id: 2, name: 'Jane Smith', department_id: 2, salary: '65000.00', hire_date: '2019-03-22' }
    ],
    
    // Range operations
    'SELECT * FROM employees WHERE salary BETWEEN 60000 AND 80000': [
        { id: 1, name: 'John Doe', department_id: 1, salary: '75000.00', hire_date: '2020-01-15' },
        { id: 2, name: 'Jane Smith', department_id: 2, salary: '65000.00', hire_date: '2019-03-22' },
        { id: 3, name: 'Mike Johnson', department_id: 1, salary: '80000.00', hire_date: '2021-06-10' },
        { id: 5, name: 'David Brown', department_id: 1, salary: '70000.00', hire_date: '2020-09-15' },
        { id: 6, name: 'Lisa Davis', department_id: 2, salary: '60000.00', hire_date: '2021-11-30' }
    ],
    
    'SELECT * FROM employees WHERE department_id IN (1, 3)': [
        { id: 1, name: 'John Doe', department_id: 1, salary: '75000.00', hire_date: '2020-01-15' },
        { id: 3, name: 'Mike Johnson', department_id: 1, salary: '80000.00', hire_date: '2021-06-10' },
        { id: 4, name: 'Sarah Wilson', department_id: 3, salary: '55000.00', hire_date: '2022-02-01' },
        { id: 5, name: 'David Brown', department_id: 1, salary: '70000.00', hire_date: '2020-09-15' },
        { id: 8, name: 'Emily White', department_id: 3, salary: '58000.00', hire_date: '2022-08-15' }
    ],
    
    // NULL handling
    'SELECT * FROM employees WHERE department_id IS NOT NULL': [
        { id: 1, name: 'John Doe', department_id: 1, salary: '75000.00', hire_date: '2020-01-15' },
        { id: 2, name: 'Jane Smith', department_id: 2, salary: '65000.00', hire_date: '2019-03-22' },
        { id: 3, name: 'Mike Johnson', department_id: 1, salary: '80000.00', hire_date: '2021-06-10' },
        { id: 4, name: 'Sarah Wilson', department_id: 3, salary: '55000.00', hire_date: '2022-02-01' },
        { id: 5, name: 'David Brown', department_id: 1, salary: '70000.00', hire_date: '2020-09-15' },
        { id: 6, name: 'Lisa Davis', department_id: 2, salary: '60000.00', hire_date: '2021-11-30' },
        { id: 7, name: 'Tom Anderson', department_id: 4, salary: '50000.00', hire_date: '2023-01-20' },
        { id: 8, name: 'Emily White', department_id: 3, salary: '58000.00', hire_date: '2022-08-15' }
    ],
    
    // String operations
    'SELECT name, LENGTH(name) as name_length FROM employees': [
        { name: 'John Doe', name_length: 8 },
        { name: 'Jane Smith', name_length: 10 },
        { name: 'Mike Johnson', name_length: 12 },
        { name: 'Sarah Wilson', name_length: 12 },
        { name: 'David Brown', name_length: 11 },
        { name: 'Lisa Davis', name_length: 10 },
        { name: 'Tom Anderson', name_length: 12 },
        { name: 'Emily White', name_length: 11 }
    ],
    
    // Bitwise operations  
    'SELECT * FROM employees WHERE department_id & 1 = 1': [
        { id: 1, name: 'John Doe', department_id: 1, salary: '75000.00', hire_date: '2020-01-15' },
        { id: 3, name: 'Mike Johnson', department_id: 1, salary: '80000.00', hire_date: '2021-06-10' },
        { id: 4, name: 'Sarah Wilson', department_id: 3, salary: '55000.00', hire_date: '2022-02-01' },
        { id: 5, name: 'David Brown', department_id: 1, salary: '70000.00', hire_date: '2020-09-15' },
        { id: 8, name: 'Emily White', department_id: 3, salary: '58000.00', hire_date: '2022-08-15' }
    ],
    
    // Join operations
    'SELECT e.name, d.name as dept_name FROM employees e INNER JOIN departments d ON e.department_id = d.id': [
        { name: 'John Doe', dept_name: 'Engineering' },
        { name: 'Jane Smith', dept_name: 'Marketing' },
        { name: 'Mike Johnson', dept_name: 'Engineering' },
        { name: 'Sarah Wilson', dept_name: 'Sales' },
        { name: 'David Brown', dept_name: 'Engineering' },
        { name: 'Lisa Davis', dept_name: 'Marketing' },
        { name: 'Tom Anderson', dept_name: 'HR' },
        { name: 'Emily White', dept_name: 'Sales' }
    ],
    
    // Normalization examples
    "SELECT 'Transitive dependency exists: employee_id -> department_id -> department_name' as violation": [
        { violation: 'Transitive dependency exists: employee_id -> department_id -> department_name' }
    ],
    
    // Advanced aggregations  
    'SELECT d.name, GROUP_CONCAT(e.name SEPARATOR \', \') as employees FROM departments d LEFT JOIN employees e ON d.id = e.department_id GROUP BY d.id, d.name': [
        { name: 'Engineering', employees: 'John Doe, Mike Johnson, David Brown' },
        { name: 'Marketing', employees: 'Jane Smith, Lisa Davis' },
        { name: 'Sales', employees: 'Sarah Wilson, Emily White' },
        { name: 'HR', employees: 'Tom Anderson' }
    ],
    
    'SELECT d.name, SUM(CASE WHEN e.salary < 60000 THEN 1 ELSE 0 END) as low_salary, SUM(CASE WHEN e.salary BETWEEN 60000 AND 80000 THEN 1 ELSE 0 END) as mid_salary, SUM(CASE WHEN e.salary > 80000 THEN 1 ELSE 0 END) as high_salary FROM departments d LEFT JOIN employees e ON d.id = e.department_id GROUP BY d.id, d.name': [
        { name: 'Engineering', low_salary: 0, mid_salary: 2, high_salary: 1 },
        { name: 'Marketing', low_salary: 0, mid_salary: 2, high_salary: 0 },
        { name: 'Sales', low_salary: 2, mid_salary: 0, high_salary: 0 },
        { name: 'HR', low_salary: 1, mid_salary: 0, high_salary: 0 }
    ],
    
    // Relational algebra operations
    'SELECT * FROM employees WHERE salary > 70000': [
        { id: 1, name: 'John Doe', department_id: 1, salary: '75000.00', hire_date: '2020-01-15' },
        { id: 3, name: 'Mike Johnson', department_id: 1, salary: '80000.00', hire_date: '2021-06-10' }
    ],
    
    'SELECT DISTINCT name, salary FROM employees': [
        { name: 'John Doe', salary: '75000.00' },
        { name: 'Jane Smith', salary: '65000.00' },
        { name: 'Mike Johnson', salary: '80000.00' },
        { name: 'Sarah Wilson', salary: '55000.00' },
        { name: 'David Brown', salary: '70000.00' },
        { name: 'Lisa Davis', salary: '60000.00' },
        { name: 'Tom Anderson', salary: '50000.00' },
        { name: 'Emily White', salary: '58000.00' }
    ],
    
    'SELECT e.name as employee_name, d.name as department_name FROM employees e JOIN departments d ON e.department_id = d.id': [
        { employee_name: 'John Doe', department_name: 'Engineering' },
        { employee_name: 'Jane Smith', department_name: 'Marketing' },
        { employee_name: 'Mike Johnson', department_name: 'Engineering' },
        { employee_name: 'Sarah Wilson', department_name: 'Sales' },
        { employee_name: 'David Brown', department_name: 'Engineering' },
        { employee_name: 'Lisa Davis', department_name: 'Marketing' },
        { employee_name: 'Tom Anderson', department_name: 'HR' },
        { employee_name: 'Emily White', department_name: 'Sales' }
    ],

    // Window Functions & Ranking
    'SELECT name, department_id, salary, RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as salary_rank FROM employees': [
        { name: 'Mike Johnson', department_id: 1, salary: '80000.00', salary_rank: 1 },
        { name: 'John Doe', department_id: 1, salary: '75000.00', salary_rank: 2 },
        { name: 'David Brown', department_id: 1, salary: '70000.00', salary_rank: 3 },
        { name: 'Jane Smith', department_id: 2, salary: '65000.00', salary_rank: 1 },
        { name: 'Lisa Davis', department_id: 2, salary: '60000.00', salary_rank: 2 },
        { name: 'Emily White', department_id: 3, salary: '58000.00', salary_rank: 1 },
        { name: 'Sarah Wilson', department_id: 3, salary: '55000.00', salary_rank: 2 },
        { name: 'Tom Anderson', department_id: 4, salary: '50000.00', salary_rank: 1 }
    ],

    // Advanced Subqueries
    'SELECT e1.name, e1.salary, e1.department_id FROM employees e1 WHERE e1.salary > (SELECT AVG(e2.salary) FROM employees e2 WHERE e2.department_id = e1.department_id)': [
        { name: 'Mike Johnson', salary: '80000.00', department_id: 1 },
        { name: 'Jane Smith', salary: '65000.00', department_id: 2 },
        { name: 'Emily White', salary: '58000.00', department_id: 3 }
    ],

    'SELECT DISTINCT d.name FROM departments d WHERE 50000 < ALL (SELECT e.salary FROM employees e WHERE e.department_id = d.id)': [
        { name: 'Engineering' },
        { name: 'Marketing' }
    ],

    // Date & Time Functions
    'SELECT YEAR(hire_date) as hire_year, COUNT(*) as employees_hired FROM employees GROUP BY YEAR(hire_date) ORDER BY hire_year': [
        { hire_year: 2019, employees_hired: 1 },
        { hire_year: 2020, employees_hired: 2 },
        { hire_year: 2021, employees_hired: 2 },
        { hire_year: 2022, employees_hired: 2 },
        { hire_year: 2023, employees_hired: 1 }
    ],

    // Complex Conditional Logic
    'SELECT name, salary, CASE WHEN salary >= 80000 THEN \'Senior\' WHEN salary >= 60000 THEN \'Mid-Level\' WHEN salary >= 40000 THEN \'Junior\' ELSE \'Entry-Level\' END as salary_tier FROM employees': [
        { name: 'John Doe', salary: '75000.00', salary_tier: 'Mid-Level' },
        { name: 'Jane Smith', salary: '65000.00', salary_tier: 'Mid-Level' },
        { name: 'Mike Johnson', salary: '80000.00', salary_tier: 'Senior' },
        { name: 'Sarah Wilson', salary: '55000.00', salary_tier: 'Junior' },
        { name: 'David Brown', salary: '70000.00', salary_tier: 'Mid-Level' },
        { name: 'Lisa Davis', salary: '60000.00', salary_tier: 'Mid-Level' },
        { name: 'Tom Anderson', salary: '50000.00', salary_tier: 'Junior' },
        { name: 'Emily White', salary: '58000.00', salary_tier: 'Junior' }
    ],

    // Advanced Grouping
    'SELECT d.name, AVG(e.salary) as avg_salary FROM departments d JOIN employees e ON d.id = e.department_id GROUP BY d.id, d.name HAVING AVG(e.salary) > (SELECT AVG(salary) FROM employees)': [
        { name: 'Engineering', avg_salary: '75000.0000' }
    ],

    // Self-Joins
    'SELECT DISTINCT e1.name FROM employees e1 JOIN employees e2 ON e1.department_id = e2.department_id AND e1.salary > e2.salary': [
        { name: 'Mike Johnson' },
        { name: 'John Doe' },
        { name: 'Jane Smith' },
        { name: 'Emily White' }
    ],

    // String Operations
    'SELECT name, CONCAT(name, \'@company.com\') as email, SUBSTRING_INDEX(CONCAT(name, \'@company.com\'), \'@\', -1) as domain FROM employees': [
        { name: 'John Doe', email: 'John Doe@company.com', domain: 'company.com' },
        { name: 'Jane Smith', email: 'Jane Smith@company.com', domain: 'company.com' },
        { name: 'Mike Johnson', email: 'Mike Johnson@company.com', domain: 'company.com' },
        { name: 'Sarah Wilson', email: 'Sarah Wilson@company.com', domain: 'company.com' },
        { name: 'David Brown', email: 'David Brown@company.com', domain: 'company.com' },
        { name: 'Lisa Davis', email: 'Lisa Davis@company.com', domain: 'company.com' },
        { name: 'Tom Anderson', email: 'Tom Anderson@company.com', domain: 'company.com' },
        { name: 'Emily White', email: 'Emily White@company.com', domain: 'company.com' }
    ],

    // LeetCode Patterns
    'SELECT DISTINCT salary as SecondHighestSalary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 2': [
        { SecondHighestSalary: '70000.00' }
    ],

    'SELECT d.name as Department, e.name as Employee, e.salary as Salary FROM employees e JOIN departments d ON e.department_id = d.id WHERE (e.department_id, e.salary) IN (SELECT department_id, MAX(salary) FROM employees GROUP BY department_id)': [
        { Department: 'Engineering', Employee: 'Mike Johnson', Salary: '80000.00' },
        { Department: 'Marketing', Employee: 'Jane Smith', Salary: '65000.00' },
        { Department: 'Sales', Employee: 'Emily White', Salary: '58000.00' },
        { Department: 'HR', Employee: 'Tom Anderson', Salary: '50000.00' }
    ],

    'SELECT DISTINCT l1.id FROM logs l1 JOIN logs l2 ON l1.id = l2.id - 1 JOIN logs l3 ON l2.id = l3.id - 1 WHERE l1.num = l2.num AND l2.num = l3.num': [
        { id: 1 }
    ]
};

app.post('/execute-query', async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Query is required' });
        }

        const sanitizedQuery = query.trim();
        
        // Allow SELECT, EXPLAIN, and some DDL commands for advanced tutorials
        const allowedCommands = ['select', 'explain', 'create view', 'create index', 'create table', 'alter table'];
        const queryLower = sanitizedQuery.toLowerCase();
        const isAllowed = allowedCommands.some(cmd => queryLower.startsWith(cmd));
        
        if (!isAllowed) {
            return res.status(400).json({ error: 'Only SELECT, EXPLAIN, CREATE VIEW, CREATE INDEX, CREATE TABLE, and ALTER TABLE queries are allowed' });
        }

        const [rows] = await connection.execute(sanitizedQuery);
        
        const normalizedQuery = sanitizedQuery.toLowerCase().replace(/\s+/g, ' ').trim();
        let expectedResult = null;
        
        for (const [expectedQuery, expected] of Object.entries(expectedResults)) {
            const normalizedExpected = expectedQuery.toLowerCase().replace(/\s+/g, ' ').trim();
            if (normalizedQuery === normalizedExpected) {
                expectedResult = expected;
                break;
            }
        }

        let comparison = null;
        if (expectedResult) {
            comparison = {
                matches: JSON.stringify(rows) === JSON.stringify(expectedResult),
                expected: expectedResult,
                actual: rows,
                differences: []
            };
            
            if (!comparison.matches) {
                if (rows.length !== expectedResult.length) {
                    comparison.differences.push(`Row count mismatch: expected ${expectedResult.length}, got ${rows.length}`);
                } else {
                    for (let i = 0; i < rows.length; i++) {
                        const actualRow = rows[i];
                        const expectedRow = expectedResult[i];
                        for (const key in expectedRow) {
                            if (String(actualRow[key]) !== String(expectedRow[key])) {
                                comparison.differences.push(`Row ${i + 1}, column '${key}': expected '${expectedRow[key]}', got '${actualRow[key]}'`);
                            }
                        }
                    }
                }
            }
        }

        res.json({
            success: true,
            results: rows,
            rowCount: rows.length,
            comparison: comparison
        });

    } catch (error) {
        console.error('Query execution error:', error);
        res.status(500).json({ 
            error: 'Query execution failed',
            message: error.message 
        });
    }
});

app.get('/test-connection', async (req, res) => {
    try {
        await connection.execute('SELECT 1');
        res.json({ success: true, message: 'Database connection is working' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const startServer = async () => {
    await connectDB();
    await createTables();
    
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

startServer().catch(console.error);