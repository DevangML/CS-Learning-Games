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
            (2, 1, 'UI/UX Designer')`
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