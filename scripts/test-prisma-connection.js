#!/usr/bin/env node

// Load environment variables from .env file
require('dotenv').config({ path: '.env' });

const { PrismaClient } = require('@prisma/client');

async function testPrismaConnection() {
  console.log('🔍 Testing Prisma Postgres connection...\n');

  const prisma = new PrismaClient();

  try {
    // Test 1: Basic connection
    console.log('🔌 Test 1: Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test 2: Test a simple query
    console.log('\n📝 Test 2: Testing simple query...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Simple query successful');
    console.log('📄 Result:', result);

    // Test 3: Test table creation and data insertion
    console.log('\n🗄️ Test 3: Testing table operations...');
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('📋 Available tables:', tables.map(t => t.table_name));

    // Test 4: Test sample data insertion
    console.log('\n📊 Test 4: Testing sample data...');
    
    // Check if departments exist
    const departmentCount = await prisma.department.count();
    console.log(`📈 Department count: ${departmentCount}`);

    if (departmentCount === 0) {
      console.log('📝 Inserting sample data...');
      
      // Insert a test department
      const testDept = await prisma.department.create({
        data: {
          name: 'Test Department',
          managerId: 1
        }
      });
      console.log('✅ Test department created:', testDept.name);

      // Insert a test employee
      const testEmployee = await prisma.employee.create({
        data: {
          name: 'Test Employee',
          departmentId: testDept.id,
          salary: 50000.00,
          hireDate: new Date()
        }
      });
      console.log('✅ Test employee created:', testEmployee.name);

      // Clean up test data
      await prisma.employee.delete({ where: { id: testEmployee.id } });
      await prisma.department.delete({ where: { id: testDept.id } });
      console.log('🧹 Test data cleaned up');
    } else {
      console.log('✅ Sample data already exists');
      
      // Test querying existing data
      const departments = await prisma.department.findMany({
        include: {
          employees: true
        }
      });
      console.log('📊 Departments with employees:', departments.length);
      departments.forEach(dept => {
        console.log(`   - ${dept.name}: ${dept.employees.length} employees`);
      });
    }

    // Test 5: Test raw SQL queries
    console.log('\n🔧 Test 5: Testing raw SQL queries...');
    const rawResult = await prisma.$queryRaw`
      SELECT COUNT(*) as total_departments 
      FROM "Department"
    `;
    console.log('✅ Raw SQL query successful');
    console.log('📊 Total departments:', rawResult[0].total_departments);

    console.log('\n🎉 All Prisma tests passed! Your Prisma Postgres database is working correctly.');
    console.log('\n📋 Summary:');
    console.log('   ✅ Database connection established');
    console.log('   ✅ Simple queries working');
    console.log('   ✅ Table operations working');
    console.log('   ✅ Sample data management working');
    console.log('   ✅ Raw SQL queries working');

  } catch (error) {
    console.error('\n❌ Prisma connection test failed:');
    console.error('Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check your DATABASE_URL in .env file');
    console.error('2. Verify your Prisma database is accessible');
    console.error('3. Run: npx prisma db push (to sync schema)');
    console.error('4. Run: npx prisma generate (to regenerate client)');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testPrismaConnection();
