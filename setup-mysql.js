#!/usr/bin/env node

const mysql = require('mysql2/promise');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupMySQL() {
    console.log('🚀 MySQL Setup for SQL Mastery Quest');
    console.log('=====================================\n');

    try {
        // Get MySQL root credentials
        const host = await question('MySQL Host (default: localhost): ') || 'localhost';
        const port = await question('MySQL Port (default: 3306): ') || '3306';
        const rootUser = await question('MySQL Root Username (default: root): ') || 'root';
        const rootPassword = await question('MySQL Root Password: ');

        if (!rootPassword) {
            console.log('❌ Root password is required for setup');
            process.exit(1);
        }

        // Connect as root
        console.log('\n🔌 Connecting to MySQL as root...');
        const rootConnection = await mysql.createConnection({
            host,
            port: parseInt(port),
            user: rootUser,
            password: rootPassword
        });

        // Get database details
        const databaseName = await question('Database name (default: sql_tutor): ') || 'sql_tutor';
        const appUser = await question('Application username (default: sql_tutor_user): ') || 'sql_tutor_user';
        const appPassword = await question('Application password: ');

        if (!appPassword) {
            console.log('❌ Application password is required');
            process.exit(1);
        }

        console.log('\n📦 Setting up database and user...');

        // Create database if it doesn't exist
        await rootConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
        console.log(`✅ Database '${databaseName}' created/verified`);

        // Create user if it doesn't exist
        try {
            await rootConnection.execute(`CREATE USER IF NOT EXISTS '${appUser}'@'%' IDENTIFIED BY '${appPassword}'`);
            console.log(`✅ User '${appUser}' created/verified`);
        } catch (error) {
            // If user exists, update password
            await rootConnection.execute(`ALTER USER '${appUser}'@'%' IDENTIFIED BY '${appPassword}'`);
            console.log(`✅ User '${appUser}' password updated`);
        }

        // Grant privileges
        await rootConnection.execute(`GRANT ALL PRIVILEGES ON \`${databaseName}\`.* TO '${appUser}'@'%'`);
        await rootConnection.execute('FLUSH PRIVILEGES');
        console.log(`✅ Privileges granted to '${appUser}' on '${databaseName}'`);

        // Close root connection
        await rootConnection.end();

        // Connect as application user and create tables
        console.log('\n🔌 Connecting as application user...');
        const appConnection = await mysql.createConnection({
            host,
            port: parseInt(port),
            user: appUser,
            password: appPassword,
            database: databaseName
        });

        console.log('\n📋 Creating tables and sample data...');
        await createTables(appConnection);
        console.log('✅ Tables created and populated with sample data');

        // Test the connection
        await appConnection.execute('SELECT 1 as test');
        console.log('✅ Connection test successful');

        await appConnection.end();

        // Generate .env content
        const envContent = generateEnvContent(host, port, appUser, appPassword, databaseName);
        
        console.log('\n🎉 MySQL setup completed successfully!');
        console.log('\n📝 Add these environment variables to your .env file or Vercel:');
        console.log('========================================================');
        console.log(envContent);
        console.log('========================================================');

        // Ask if user wants to save to .env file
        const saveToEnv = await question('\nSave to .env file? (y/N): ');
        if (saveToEnv.toLowerCase() === 'y' || saveToEnv.toLowerCase() === 'yes') {
            const fs = require('fs');
            fs.writeFileSync('.env', envContent);
            console.log('✅ Configuration saved to .env file');
        }

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
}

async function createTables(connection) {
    const sqlStatements = [
        // Departments table
        `CREATE TABLE IF NOT EXISTS departments (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            manager_id INT
        )`,
        
        // Employees table
        `CREATE TABLE IF NOT EXISTS employees (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            department_id INT,
            salary DECIMAL(10,2),
            hire_date DATE
        )`,

        // Projects table
        `CREATE TABLE IF NOT EXISTS projects (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            budget DECIMAL(15,2),
            start_date DATE,
            end_date DATE
        )`,

        // Employee projects junction table
        `CREATE TABLE IF NOT EXISTS employee_projects (
            employee_id INT,
            project_id INT,
            role VARCHAR(50),
            PRIMARY KEY (employee_id, project_id),
            FOREIGN KEY (employee_id) REFERENCES employees(id),
            FOREIGN KEY (project_id) REFERENCES projects(id)
        )`,

        // Insert sample departments
        `INSERT IGNORE INTO departments (id, name, manager_id) VALUES
        (1, 'Engineering', 1),
        (2, 'Marketing', 2),
        (3, 'Sales', 3),
        (4, 'HR', 4)`,

        // Insert sample employees
        `INSERT IGNORE INTO employees (id, name, department_id, salary, hire_date) VALUES
        (1, 'John Doe', 1, 75000.00, '2020-01-15'),
        (2, 'Jane Smith', 2, 65000.00, '2019-03-22'),
        (3, 'Mike Johnson', 1, 80000.00, '2021-06-10'),
        (4, 'Sarah Wilson', 3, 55000.00, '2022-02-01'),
        (5, 'David Brown', 1, 70000.00, '2020-09-15'),
        (6, 'Lisa Davis', 2, 60000.00, '2021-11-30'),
        (7, 'Tom Anderson', 4, 50000.00, '2023-01-20'),
        (8, 'Emily White', 3, 58000.00, '2022-08-15')`,

        // Insert sample projects
        `INSERT IGNORE INTO projects (id, name, budget, start_date, end_date) VALUES
        (1, 'Website Redesign', 100000.00, '2023-01-01', '2023-06-30'),
        (2, 'Mobile App', 150000.00, '2023-03-15', '2023-12-31'),
        (3, 'Database Migration', 80000.00, '2023-02-01', '2023-08-31')`,

        // Insert sample employee projects
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
        try {
            await connection.execute(sql);
        } catch (error) {
            console.log(`⚠️  Warning: ${error.message}`);
        }
    }
}

function generateEnvContent(host, port, user, password, database) {
    return `# MySQL Database Configuration
MYSQL_HOST=${host}
MYSQL_PORT=${port}
MYSQL_USER=${user}
MYSQL_PASSWORD=${password}
MYSQL_DATABASE=${database}

# Alternative MySQL Environment Variables (for compatibility)
DB_USER=${user}
DB_PASSWORD=${password}
DB_NAME=${database}

# Server Configuration
PORT=3000
NODE_ENV=production

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-here

# Google OAuth Configuration (add your own)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-app.vercel.app/auth/google/callback

# CORS Configuration (if needed)
CORS_ORIGIN=https://your-app.vercel.app`;
}

// Run the setup
if (require.main === module) {
    setupMySQL().catch(console.error);
}

module.exports = { setupMySQL, createTables };
