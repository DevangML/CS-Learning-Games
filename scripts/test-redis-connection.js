#!/usr/bin/env node

// Load environment variables from .env file
require('dotenv').config({ path: '.env' });

const { kv } = require('@vercel/kv');

async function testRedisConnection() {
  console.log('🔍 Testing Redis connection...\n');

  try {
    // Test 1: Basic connection and write
    console.log('📝 Test 1: Writing test data...');
    await kv.set('test:connection', {
      message: 'Hello from SQL Tutor!',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
    console.log('✅ Write successful');

    // Test 2: Read data
    console.log('\n📖 Test 2: Reading test data...');
    const testData = await kv.get('test:connection');
    console.log('✅ Read successful');
    console.log('📄 Data:', JSON.stringify(testData, null, 2));

    // Test 3: Test user data pattern
    console.log('\n👤 Test 3: Testing user data pattern...');
    const testUser = {
      id: 'test-user-123',
      google_id: 'test-google-123',
      name: 'Test User',
      email: 'test@example.com',
      total_xp: 100,
      level: 2,
      current_streak: 5,
      max_streak: 10,
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set('users:test-google-123', testUser);
    const retrievedUser = await kv.get('users:test-google-123');
    console.log('✅ User data pattern test successful');
    console.log('👤 User:', retrievedUser.name, 'Level:', retrievedUser.level);

    // Test 4: Test progress data pattern
    console.log('\n📊 Test 4: Testing progress data pattern...');
    const testProgress = {
      user_id: 'test-google-123',
      level_id: 1,
      question_id: 1,
      completed: true,
      attempts: 2,
      hints_used: 1,
      xp_earned: 50,
      completed_at: new Date().toISOString()
    };

    await kv.set('progress:test-google-123:1:1', testProgress);
    const retrievedProgress = await kv.get('progress:test-google-123:1:1');
    console.log('✅ Progress data pattern test successful');
    console.log('📊 Progress:', `Level ${retrievedProgress.level_id}, Question ${retrievedProgress.question_id}`);

    // Test 5: Test keys pattern
    console.log('\n🔑 Test 5: Testing keys pattern...');
    const keys = await kv.keys('test:*');
    console.log('✅ Keys pattern test successful');
    console.log('🔑 Found keys:', keys);

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await kv.del('test:connection');
    await kv.del('users:test-google-123');
    await kv.del('progress:test-google-123:1:1');
    console.log('✅ Cleanup complete');

    console.log('\n🎉 All Redis tests passed! Your Redis store is working correctly.');
    console.log('\n📋 Summary:');
    console.log('   ✅ Connection established');
    console.log('   ✅ Read/Write operations working');
    console.log('   ✅ User data patterns working');
    console.log('   ✅ Progress data patterns working');
    console.log('   ✅ Keys pattern matching working');
    console.log('   ✅ Cleanup operations working');

  } catch (error) {
    console.error('\n❌ Redis connection test failed:');
    console.error('Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check your environment variables in .env.local');
    console.error('2. Verify your Redis store is active in Vercel');
    console.error('3. Ensure KV_URL, KV_REST_API_URL, KV_REST_API_TOKEN are set');
    console.error('4. Check your Vercel project settings');
    process.exit(1);
  }
}

// Run the test
testRedisConnection();
