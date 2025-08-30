const { PrismaClient } = require('@prisma/client');

class PrismaPostgresDatabase {
    constructor() {
        this.initialized = false;
        this.prisma = new PrismaClient();
        console.log('🗄️  Initializing Prisma Postgres database...');
    }

    async initialize() {
        try {
            if (this.initialized) return;
            
            // Create tables and insert sample data
            await this.createTables();
            await this.insertSampleData();
            
            this.initialized = true;
            console.log('✅ Prisma Postgres database initialized with sample data');
        } catch (error) {
            console.error('❌ Prisma Postgres database initialization failed:', error);
            throw error;
        }
    }

    async createTables() {
        try {
            // Prisma will handle table creation through migrations
            // For now, we'll just ensure the client is connected
            await this.prisma.$connect();
            console.log('✅ Connected to Prisma database');
        } catch (error) {
            console.error('❌ Failed to connect to Prisma database:', error);
            throw error;
        }
    }

    async insertSampleData() {
        try {
            // Check if data already exists
            const departmentCount = await this.prisma.department.count();
            if (departmentCount > 0) {
                console.log('Sample data already exists, skipping insertion');
                return;
            }

            // Insert departments with upsert to handle existing data
            const departmentData = [
                { id: 1, name: 'Engineering', managerId: 1 },
                { id: 2, name: 'Marketing', managerId: 2 },
                { id: 3, name: 'Sales', managerId: 3 },
                { id: 4, name: 'HR', managerId: 4 }
            ];

            for (const dept of departmentData) {
                await this.prisma.department.upsert({
                    where: { id: dept.id },
                    update: dept,
                    create: dept
                });
            }

            // Insert employees with upsert
            const employeeData = [
                { id: 1, name: 'John Doe', departmentId: 1, salary: 75000.00, hireDate: new Date('2020-01-15') },
                { id: 2, name: 'Jane Smith', departmentId: 2, salary: 65000.00, hireDate: new Date('2019-03-22') },
                { id: 3, name: 'Mike Johnson', departmentId: 1, salary: 80000.00, hireDate: new Date('2021-06-10') },
                { id: 4, name: 'Sarah Wilson', departmentId: 3, salary: 55000.00, hireDate: new Date('2022-02-01') },
                { id: 5, name: 'David Brown', departmentId: 1, salary: 70000.00, hireDate: new Date('2020-09-15') },
                { id: 6, name: 'Lisa Davis', departmentId: 2, salary: 60000.00, hireDate: new Date('2021-11-30') },
                { id: 7, name: 'Tom Anderson', departmentId: 4, salary: 50000.00, hireDate: new Date('2023-01-20') },
                { id: 8, name: 'Emily White', departmentId: 3, salary: 58000.00, hireDate: new Date('2022-08-15') }
            ];

            for (const emp of employeeData) {
                await this.prisma.employee.upsert({
                    where: { id: emp.id },
                    update: emp,
                    create: emp
                });
            }

            // Insert projects with upsert
            const projectData = [
                { id: 1, name: 'Website Redesign', budget: 100000.00, startDate: new Date('2023-01-01'), endDate: new Date('2023-06-30') },
                { id: 2, name: 'Mobile App', budget: 150000.00, startDate: new Date('2023-03-15'), endDate: new Date('2023-12-31') },
                { id: 3, name: 'Database Migration', budget: 80000.00, startDate: new Date('2023-02-01'), endDate: new Date('2023-08-31') }
            ];

            for (const proj of projectData) {
                await this.prisma.project.upsert({
                    where: { id: proj.id },
                    update: proj,
                    create: proj
                });
            }

            // Insert employee projects with upsert
            const employeeProjectData = [
                { employeeId: 1, projectId: 1, role: 'Lead Developer' },
                { employeeId: 3, projectId: 1, role: 'Frontend Developer' },
                { employeeId: 5, projectId: 2, role: 'Backend Developer' },
                { employeeId: 1, projectId: 3, role: 'Database Architect' },
                { employeeId: 2, projectId: 1, role: 'UI/UX Designer' }
            ];

            for (const ep of employeeProjectData) {
                await this.prisma.employeeProject.upsert({
                    where: { 
                        employeeId_projectId: {
                            employeeId: ep.employeeId,
                            projectId: ep.projectId
                        }
                    },
                    update: ep,
                    create: ep
                });
            }

            // Insert logs with upsert
            const logData = [
                { id: 1, num: 1 }, { id: 2, num: 1 }, { id: 3, num: 1 }, 
                { id: 4, num: 2 }, { id: 5, num: 1 }, { id: 6, num: 2 }, { id: 7, num: 2 }
            ];

            for (const log of logData) {
                await this.prisma.log.upsert({
                    where: { id: log.id },
                    update: log,
                    create: log
                });
            }

            // Insert weather with upsert
            const weatherData = [
                { id: 1, recordDate: new Date('2015-01-01'), temperature: 10 },
                { id: 2, recordDate: new Date('2015-01-02'), temperature: 25 },
                { id: 3, recordDate: new Date('2015-01-03'), temperature: 20 },
                { id: 4, recordDate: new Date('2015-01-04'), temperature: 30 }
            ];

            for (const w of weatherData) {
                await this.prisma.weather.upsert({
                    where: { id: w.id },
                    update: w,
                    create: w
                });
            }

            // Insert activity with upsert
            const activityData = [
                { userId: 1, sessionId: 1, activityDate: new Date('2019-07-20'), activityType: 'open_session' },
                { userId: 1, sessionId: 1, activityDate: new Date('2019-07-20'), activityType: 'scroll_down' },
                { userId: 1, sessionId: 1, activityDate: new Date('2019-07-20'), activityType: 'end_session' },
                { userId: 1, sessionId: 2, activityDate: new Date('2019-07-21'), activityType: 'open_session' },
                { userId: 1, sessionId: 2, activityDate: new Date('2019-07-21'), activityType: 'send_message' },
                { userId: 1, sessionId: 2, activityDate: new Date('2019-07-21'), activityType: 'end_session' },
                { userId: 2, sessionId: 4, activityDate: new Date('2019-07-21'), activityType: 'open_session' },
                { userId: 2, sessionId: 4, activityDate: new Date('2019-07-21'), activityType: 'send_message' },
                { userId: 2, sessionId: 4, activityDate: new Date('2019-07-21'), activityType: 'end_session' },
                { userId: 3, sessionId: 5, activityDate: new Date('2019-07-22'), activityType: 'open_session' },
                { userId: 3, sessionId: 5, activityDate: new Date('2019-07-22'), activityType: 'send_message' },
                { userId: 3, sessionId: 5, activityDate: new Date('2019-07-22'), activityType: 'end_session' }
            ];

            for (const act of activityData) {
                await this.prisma.activity.upsert({
                    where: { 
                        userId_sessionId_activityDate: {
                            userId: act.userId,
                            sessionId: act.sessionId,
                            activityDate: act.activityDate
                        }
                    },
                    update: act,
                    create: act
                });
            }

            console.log('✅ Sample data inserted successfully');
        } catch (error) {
            console.error('❌ Failed to insert sample data:', error);
            throw error;
        }
    }

    async executeQuery(sqlQuery, params = []) {
        try {
            await this.initialize();
            
            const query = sqlQuery.toLowerCase().trim();
            
            // Handle simple test queries
            if (query.includes('select 1') || query.includes('select 1 as test')) {
                return [[{ test: 1 }]];
            }
            
            // Handle SHOW TABLES
            if (query.startsWith('show tables')) {
                const tables = await this.prisma.$queryRaw`
                    SELECT table_name as "Tables_in_sqlite_db"
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                `;
                return [tables];
            }
            
            // Handle DESCRIBE/DESC
            if (query.startsWith('describe') || query.startsWith('desc ')) {
                const tableMatch = query.match(/describe\s+(\w+)|desc\s+(\w+)/i);
                if (tableMatch) {
                    const tableName = tableMatch[1] || tableMatch[2];
                    return [await this.getTableSchema(tableName)];
                }
                return [[]];
            }
            
            // Handle parameterized queries by replacing placeholders
            let processedQuery = sqlQuery;
            if (params && params.length > 0) {
                // Replace ? placeholders with $1, $2, etc.
                params.forEach((param, index) => {
                    const placeholder = `$${index + 1}`;
                    processedQuery = processedQuery.replace('?', placeholder);
                });
            }
            
            // Handle all other queries using raw SQL with proper parameter handling
            if (query.startsWith('select')) {
                // For SELECT queries, we need to handle parameters properly
                let result;
                if (params && params.length > 0) {
                    // Use Prisma's parameterized query approach
                    result = await this.prisma.$queryRawUnsafe(processedQuery, ...params);
                } else {
                    result = await this.prisma.$queryRawUnsafe(processedQuery);
                }
                
                // Convert BigInt values to regular numbers for JSON serialization
                const processedResult = result.map(row => {
                    const processedRow = {};
                    for (const [key, value] of Object.entries(row)) {
                        if (typeof value === 'bigint') {
                            processedRow[key] = Number(value);
                        } else {
                            processedRow[key] = value;
                        }
                    }
                    return processedRow;
                });
                
                return [processedResult];
            } else {
                // For non-SELECT queries (INSERT, UPDATE, DELETE, CREATE, etc.)
                if (params && params.length > 0) {
                    const result = await this.prisma.$executeRawUnsafe(processedQuery, ...params);
                    return [{ 
                        affectedRows: result || 0, 
                        insertId: null
                    }];
                } else {
                    const result = await this.prisma.$executeRawUnsafe(processedQuery);
                    return [{ 
                        affectedRows: result || 0, 
                        insertId: null
                    }];
                }
            }
            
        } catch (error) {
            throw new Error(`Prisma Postgres Error: ${error.message}`);
        }
    }

    async getTableSchema(tableName) {
        try {
            const result = await this.prisma.$queryRaw`
                SELECT 
                    column_name as "Field",
                    data_type as "Type",
                    is_nullable as "Null",
                    CASE 
                        WHEN constraint_name LIKE '%_pkey' THEN 'PRI'
                        ELSE ''
                    END as "Key",
                    column_default as "Default",
                    '' as "Extra"
                FROM information_schema.columns 
                WHERE table_name = ${tableName}
                AND table_schema = 'public'
                ORDER BY ordinal_position
            `;
            return result;
        } catch (error) {
            console.error('Error getting table schema:', error);
            return [];
        }
    }

    // Create MySQL-compatible connection pool interface
    createPool() {
        return {
            execute: async (sqlQuery, params = []) => {
                return this.executeQuery(sqlQuery, params);
            },
            getConnection: async () => {
                return {
                    ping: async () => Promise.resolve(),
                    release: () => Promise.resolve(),
                    execute: async (sqlQuery, params = []) => {
                        return this.executeQuery(sqlQuery, params);
                    }
                };
            }
        };
    }

    async disconnect() {
        await this.prisma.$disconnect();
    }
}

// Create singleton instance
const prismaDB = new PrismaPostgresDatabase();

// Export as MySQL-compatible interface
module.exports = {
    createPool: (config) => prismaDB.createPool(config),
    createConnection: (config) => prismaDB.createPool(config),
    disconnect: () => prismaDB.disconnect()
};
