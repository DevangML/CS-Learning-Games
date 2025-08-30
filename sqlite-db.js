const Database = require('better-sqlite3');
const path = require('path');

class SQLiteDatabase {
    constructor() {
        this.db = null;
        this.connectionPool = null;
        console.log('🗄️  Initializing SQLite database...');
    }

    initialize() {
        try {
            // Create in-memory database for the SQL tutor
            this.db = new Database(':memory:');
            
            // Create tables and insert sample data
            this.createTables();
            this.insertSampleData();
            
            // Create connection pool interface (compatible with MySQL-style API)
            this.connectionPool = {
                execute: async (sql, params = []) => {
                    return this.executeQuery(sql, params);
                },
                getConnection: async () => {
                    return {
                        ping: async () => Promise.resolve(),
                        release: () => Promise.resolve(),
                        execute: async (sql, params = []) => {
                            return this.executeQuery(sql, params);
                        }
                    };
                }
            };
            
            console.log('✅ SQLite database initialized with sample data');
        } catch (error) {
            console.error('❌ SQLite database initialization failed:', error);
            throw error;
        }
    }

    createTables() {
        const tables = [
            `CREATE TABLE departments (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                manager_id INTEGER
            )`,
            
            `CREATE TABLE employees (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                department_id INTEGER,
                salary REAL,
                hire_date TEXT,
                FOREIGN KEY (department_id) REFERENCES departments(id)
            )`,

            `CREATE TABLE projects (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                budget REAL,
                start_date TEXT,
                end_date TEXT
            )`,

            `CREATE TABLE employee_projects (
                employee_id INTEGER,
                project_id INTEGER,
                role TEXT,
                PRIMARY KEY (employee_id, project_id),
                FOREIGN KEY (employee_id) REFERENCES employees(id),
                FOREIGN KEY (project_id) REFERENCES projects(id)
            )`,

            `CREATE TABLE logs (
                id INTEGER PRIMARY KEY,
                num INTEGER
            )`,

            `CREATE TABLE weather (
                id INTEGER PRIMARY KEY,
                record_date TEXT,
                temperature INTEGER
            )`,

            `CREATE TABLE activity (
                user_id INTEGER,
                session_id INTEGER,
                activity_date TEXT,
                activity_type TEXT,
                PRIMARY KEY(user_id, session_id, activity_date)
            )`
        ];

        tables.forEach(table => {
            this.db.exec(table);
        });
    }

    insertSampleData() {
        const data = [
            // Departments
            `INSERT INTO departments (id, name, manager_id) VALUES
            (1, 'Engineering', 1),
            (2, 'Marketing', 2),
            (3, 'Sales', 3),
            (4, 'HR', 4)`,

            // Employees
            `INSERT INTO employees (id, name, department_id, salary, hire_date) VALUES
            (1, 'John Doe', 1, 75000.00, '2020-01-15'),
            (2, 'Jane Smith', 2, 65000.00, '2019-03-22'),
            (3, 'Mike Johnson', 1, 80000.00, '2021-06-10'),
            (4, 'Sarah Wilson', 3, 55000.00, '2022-02-01'),
            (5, 'David Brown', 1, 70000.00, '2020-09-15'),
            (6, 'Lisa Davis', 2, 60000.00, '2021-11-30'),
            (7, 'Tom Anderson', 4, 50000.00, '2023-01-20'),
            (8, 'Emily White', 3, 58000.00, '2022-08-15')`,

            // Projects
            `INSERT INTO projects (id, name, budget, start_date, end_date) VALUES
            (1, 'Website Redesign', 100000.00, '2023-01-01', '2023-06-30'),
            (2, 'Mobile App', 150000.00, '2023-03-15', '2023-12-31'),
            (3, 'Database Migration', 80000.00, '2023-02-01', '2023-08-31')`,

            // Employee Projects
            `INSERT INTO employee_projects (employee_id, project_id, role) VALUES
            (1, 1, 'Lead Developer'),
            (3, 1, 'Frontend Developer'),
            (5, 2, 'Backend Developer'),
            (1, 3, 'Database Architect'),
            (2, 1, 'UI/UX Designer')`,

            // Logs
            `INSERT INTO logs (id, num) VALUES
            (1, 1), (2, 1), (3, 1), (4, 2), (5, 1), (6, 2), (7, 2)`,

            // Weather
            `INSERT INTO weather (id, record_date, temperature) VALUES
            (1, '2015-01-01', 10), (2, '2015-01-02', 25), (3, '2015-01-03', 20), (4, '2015-01-04', 30)`,

            // Activity
            `INSERT INTO activity (user_id, session_id, activity_date, activity_type) VALUES
            (1, 1, '2019-07-20', 'open_session'),
            (1, 1, '2019-07-20', 'scroll_down'),
            (1, 1, '2019-07-20', 'end_session'),
            (1, 2, '2019-07-21', 'open_session'),
            (1, 2, '2019-07-21', 'send_message'),
            (1, 2, '2019-07-21', 'end_session'),
            (2, 4, '2019-07-21', 'open_session'),
            (2, 4, '2019-07-21', 'send_message'),
            (2, 4, '2019-07-21', 'end_session'),
            (3, 5, '2019-07-22', 'open_session'),
            (3, 5, '2019-07-22', 'send_message'),
            (3, 5, '2019-07-22', 'end_session')`
        ];

        data.forEach(insert => {
            try {
                this.db.exec(insert);
            } catch (error) {
                // If there's a constraint error, try with INSERT OR IGNORE
                if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
                    const insertOrIgnore = insert.replace('INSERT INTO', 'INSERT OR IGNORE INTO');
                    this.db.exec(insertOrIgnore);
                } else {
                    throw error;
                }
            }
        });
    }

    async executeQuery(sql, params = []) {
        try {
            const query = sql.toLowerCase().trim();
            
            // Handle simple test queries
            if (query.includes('select 1') || query.includes('select 1 as test')) {
                return [[{ test: 1 }]];
            }
            
            // Handle SHOW TABLES
            if (query.startsWith('show tables')) {
                const tables = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
                return [tables.map(t => ({ Tables_in_sqlite_db: t.name }))];
            }
            
            // Handle DESCRIBE/DESC
            if (query.startsWith('describe') || query.startsWith('desc ')) {
                const tableMatch = query.match(/describe\s+(\w+)|desc\s+(\w+)/i);
                if (tableMatch) {
                    const tableName = tableMatch[1] || tableMatch[2];
                    return [this.getTableSchema(tableName)];
                }
                return [[]];
            }
            
            // Handle all other queries (SELECT, INSERT, UPDATE, DELETE, CREATE, etc.)
            if (query.startsWith('select')) {
                const stmt = this.db.prepare(sql);
                const rows = stmt.all(params);
                return [rows];
            } else {
                // For non-SELECT queries (INSERT, UPDATE, DELETE, CREATE, etc.)
                const stmt = this.db.prepare(sql);
                const result = stmt.run(params);
                return [{ 
                    affectedRows: result.changes || 0, 
                    insertId: result.lastInsertRowid || null 
                }];
            }
            
        } catch (error) {
            throw new Error(`SQLite Error: ${error.message}`);
        }
    }

    getTableSchema(tableName) {
        try {
            const schema = this.db.prepare(`PRAGMA table_info(${tableName})`).all();
            return schema.map(col => ({
                Field: col.name,
                Type: col.type,
                Null: col.notnull ? 'NO' : 'YES',
                Key: col.pk ? 'PRI' : '',
                Default: col.dflt_value,
                Extra: ''
            }));
        } catch (error) {
            return [];
        }
    }

    createPool() {
        return this.connectionPool;
    }
}

// Create singleton instance
const sqliteDB = new SQLiteDatabase();
sqliteDB.initialize();

// Export as MySQL-compatible interface
module.exports = {
    createPool: (config) => sqliteDB.createPool(config),
    createConnection: (config) => sqliteDB.createPool(config)
};
