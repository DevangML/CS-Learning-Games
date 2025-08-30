// Virtual database implementation - no external dependencies needed

// Virtual database with sample data
class VirtualDatabase {
    constructor() {
        this.tables = this.initializeTables();
        this.connectionPool = null;
        console.log('🗄️  Virtual database initialized with sample data');
    }

    initializeTables() {
        return {
            departments: [
                { id: 1, name: 'Engineering', manager_id: 1 },
                { id: 2, name: 'Marketing', manager_id: 2 },
                { id: 3, name: 'Sales', manager_id: 3 },
                { id: 4, name: 'HR', manager_id: 4 }
            ],
            employees: [
                { id: 1, name: 'John Doe', department_id: 1, salary: 75000.00, hire_date: '2020-01-15' },
                { id: 2, name: 'Jane Smith', department_id: 2, salary: 65000.00, hire_date: '2019-03-22' },
                { id: 3, name: 'Mike Johnson', department_id: 1, salary: 80000.00, hire_date: '2021-06-10' },
                { id: 4, name: 'Sarah Wilson', department_id: 3, salary: 55000.00, hire_date: '2022-02-01' },
                { id: 5, name: 'David Brown', department_id: 1, salary: 70000.00, hire_date: '2020-09-15' },
                { id: 6, name: 'Lisa Davis', department_id: 2, salary: 60000.00, hire_date: '2021-11-30' },
                { id: 7, name: 'Tom Anderson', department_id: 4, salary: 50000.00, hire_date: '2023-01-20' },
                { id: 8, name: 'Emily White', department_id: 3, salary: 58000.00, hire_date: '2022-08-15' }
            ],
            projects: [
                { id: 1, name: 'Website Redesign', budget: 100000.00, start_date: '2023-01-01', end_date: '2023-06-30' },
                { id: 2, name: 'Mobile App', budget: 150000.00, start_date: '2023-03-15', end_date: '2023-12-31' },
                { id: 3, name: 'Database Migration', budget: 80000.00, start_date: '2023-02-01', end_date: '2023-08-31' }
            ],
            employee_projects: [
                { employee_id: 1, project_id: 1, role: 'Lead Developer' },
                { employee_id: 3, project_id: 1, role: 'Frontend Developer' },
                { employee_id: 5, project_id: 2, role: 'Backend Developer' },
                { employee_id: 1, project_id: 3, role: 'Database Architect' },
                { employee_id: 2, project_id: 1, role: 'UI/UX Designer' }
            ],
            logs: [
                { id: 1, num: 1 },
                { id: 2, num: 1 },
                { id: 3, num: 1 },
                { id: 4, num: 2 },
                { id: 5, num: 1 },
                { id: 6, num: 2 },
                { id: 7, num: 2 }
            ],
            weather: [
                { id: 1, record_date: '2015-01-01', temperature: 10 },
                { id: 2, record_date: '2015-01-02', temperature: 25 },
                { id: 3, record_date: '2015-01-03', temperature: 20 },
                { id: 4, record_date: '2015-01-04', temperature: 30 }
            ],
            activity: [
                { user_id: 1, session_id: 1, activity_date: '2019-07-20', activity_type: 'open_session' },
                { user_id: 1, session_id: 1, activity_date: '2019-07-20', activity_type: 'scroll_down' },
                { user_id: 1, session_id: 1, activity_date: '2019-07-20', activity_type: 'end_session' },
                { user_id: 1, session_id: 2, activity_date: '2019-07-21', activity_type: 'open_session' },
                { user_id: 1, session_id: 2, activity_date: '2019-07-21', activity_type: 'send_message' },
                { user_id: 1, session_id: 2, activity_date: '2019-07-21', activity_type: 'end_session' },
                { user_id: 2, session_id: 4, activity_date: '2019-07-21', activity_type: 'open_session' },
                { user_id: 2, session_id: 4, activity_date: '2019-07-21', activity_type: 'send_message' },
                { user_id: 2, session_id: 4, activity_date: '2019-07-21', activity_type: 'end_session' }
            ]
        };
    }

    // Mock MySQL connection pool
    createPool(config) {
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
        return this.connectionPool;
    }

    // Execute SQL queries against virtual database
    async executeQuery(sql, params = []) {
        const query = sql.toLowerCase().trim();
        
        try {
            // Handle simple test queries
            if (query.includes('select 1') || query.includes('select 1 as test')) {
                return [[{ test: 1 }]];
            }
            
            // Handle SHOW TABLES
            if (query.startsWith('show tables')) {
                return [Object.keys(this.tables).map(name => ({ Tables_in_virtual_db: name }))];
            }
            
            // Handle DESCRIBE/DESC
            if (query.startsWith('describe') || query.startsWith('desc ')) {
                const tableMatch = query.match(/describe\s+(\w+)|desc\s+(\w+)/i);
                if (tableMatch) {
                    const tableName = (tableMatch[1] || tableMatch[2]).toLowerCase();
                    return [this.getTableSchema(tableName)];
                }
                return [[]];
            }
            
            // Handle SELECT queries
            if (query.startsWith('select')) {
                return [this.executeSelect(sql, params)];
            }
            
            // Handle other queries (INSERT, UPDATE, DELETE, CREATE)
            return [this.executeOther(sql, params)];
            
        } catch (error) {
            throw new Error(`Virtual DB Error: ${error.message}`);
        }
    }

    executeSelect(sql, params) {
        // Handle specific complex queries that your SQL tutor uses
        if (sql.includes('employees e') && sql.includes('departments d') && sql.includes('join')) {
            return this.tables.employees.map(emp => {
                const dept = this.tables.departments.find(d => d.id === emp.department_id);
                return {
                    name: emp.name,
                    salary: emp.salary,
                    department: dept ? dept.name : null
                };
            }).sort((a, b) => b.salary - a.salary);
        }
        
        if (sql.includes('logs l1') && sql.includes('logs l2') && sql.includes('logs l3')) {
            // Handle consecutive logs query
            const consecutive = [];
            for (let i = 1; i <= this.tables.logs.length - 2; i++) {
                const l1 = this.tables.logs[i - 1];
                const l2 = this.tables.logs[i];
                const l3 = this.tables.logs[i + 1];
                if (l1.num === l2.num && l2.num === l3.num) {
                    consecutive.push({ num: l1.num });
                }
            }
            return consecutive;
        }
        
        if (sql.includes('hire_date >') && sql.includes('2021-01-01')) {
            return this.tables.employees
                .filter(emp => emp.hire_date > '2021-01-01')
                .map(emp => ({ name: emp.name, hire_date: emp.hire_date }))
                .sort((a, b) => new Date(b.hire_date) - new Date(a.hire_date));
        }
        
        if (sql.includes('salary >') && sql.includes('70000')) {
            return this.tables.employees
                .filter(emp => emp.salary > 70000)
                .map(emp => ({ name: emp.name, salary: emp.salary }));
        }
        
        if (sql.includes('count') && sql.includes('avg') && sql.includes('group by')) {
            return this.tables.departments.map(dept => {
                const deptEmployees = this.tables.employees.filter(emp => emp.department_id === dept.id);
                const avgSalary = deptEmployees.length > 0 
                    ? deptEmployees.reduce((sum, emp) => sum + emp.salary, 0) / deptEmployees.length 
                    : 0;
                return {
                    name: dept.name,
                    employee_count: deptEmployees.length,
                    avg_salary: Math.round(avgSalary)
                };
            }).sort((a, b) => b.avg_salary - a.avg_salary);
        }
        
        // Default: return all rows from the first table mentioned
        const tableMatch = sql.match(/from\s+(\w+)/i);
        if (tableMatch) {
            const tableName = tableMatch[1].toLowerCase();
            if (this.tables[tableName]) {
                return [...this.tables[tableName]];
            }
        }
        
        return [];
    }

    executeOther(sql, params) {
        // Handle INSERT, UPDATE, DELETE, CREATE TABLE
        return { affectedRows: 1, insertId: Date.now() };
    }

    getTableSchema(tableName) {
        const table = this.tables[tableName];
        if (!table || table.length === 0) {
            return [];
        }
        
        const sampleRow = table[0];
        return Object.keys(sampleRow).map(field => ({
            Field: field,
            Type: this.getFieldType(sampleRow[field]),
            Null: 'YES',
            Key: field === 'id' ? 'PRI' : '',
            Default: null,
            Extra: ''
        }));
    }

    getFieldType(value) {
        if (typeof value === 'number') {
            return Number.isInteger(value) ? 'int' : 'decimal(10,2)';
        }
        if (typeof value === 'string') {
            if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
                return 'date';
            }
            return 'varchar(100)';
        }
        return 'text';
    }
}

// Create singleton instance
const virtualDB = new VirtualDatabase();

// Export as MySQL-compatible interface
module.exports = {
    createPool: (config) => virtualDB.createPool(config),
    createConnection: (config) => virtualDB.createPool(config)
};
