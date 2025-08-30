#!/usr/bin/env node

// Load environment variables from .env file
require('dotenv').config({ path: '.env' });

const { PrismaClient } = require('../lib/generated/prisma');

async function checkTables() {
    console.log('🔍 Checking database tables...\n');

    const prisma = new PrismaClient();

    try {
        await prisma.$connect();
        console.log('✅ Connected to database');

        // Check what tables exist
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `;
        
        console.log('📋 Available tables:');
        tables.forEach(table => {
            console.log(`   - ${table.table_name}`);
        });

        // Check table structures
        for (const table of tables) {
            console.log(`\n📊 Structure of table: ${table.table_name}`);
            const columns = await prisma.$queryRaw`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = ${table.table_name}
                AND table_schema = 'public'
                ORDER BY ordinal_position
            `;
            
            columns.forEach(col => {
                console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
            });
        }

        // Test a simple query on each table
        console.log('\n🧪 Testing queries on each table:');
        for (const table of tables) {
            try {
                const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "${table.table_name}"`;
                console.log(`   ✅ ${table.table_name}: ${count[0].count} rows`);
            } catch (error) {
                console.log(`   ❌ ${table.table_name}: ${error.message}`);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkTables();
