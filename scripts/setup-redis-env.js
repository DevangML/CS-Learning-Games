#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Redis Environment Setup Helper\n');

console.log('📋 To set up your Redis environment variables:\n');

console.log('1. Go to your Vercel Redis store:');
console.log('   https://vercel.com/devangmls-projects/~/stores/integration/redis/store_l2HXWgWQHBvvufY4/guides\n');

console.log('2. Click on your Redis store and go to the Settings tab\n');

console.log('3. Copy these environment variables to your .env.local file:\n');

const envTemplate = `# Vercel Redis Store Configuration
KV_URL=your-redis-store-url-from-vercel
KV_REST_API_URL=your-redis-rest-api-url-from-vercel
KV_REST_API_TOKEN=your-redis-rest-api-token-from-vercel
KV_REST_API_READ_ONLY_TOKEN=your-redis-read-only-token-from-vercel

# Vercel Postgres Configuration (if you have it)
POSTGRES_URL=your-postgres-url
POSTGRES_HOST=your-postgres-host
POSTGRES_DATABASE=your-postgres-database
POSTGRES_USERNAME=your-postgres-username
POSTGRES_PASSWORD=your-postgres-password

# Session and Authentication
SESSION_SECRET=your-session-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret`;

console.log(envTemplate);

console.log('\n4. After setting up .env.local, test the connection with:');
console.log('   npm run test-redis\n');

console.log('5. For production, add these variables to your Vercel project:');
console.log('   - Go to your Vercel project dashboard');
console.log('   - Settings → Environment Variables');
console.log('   - Add all the variables above');
console.log('   - Set for Production, Preview, and Development\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file already exists');
  console.log('   Make sure to update it with your Redis store values\n');
} else {
  console.log('📝 Creating .env.local template...');
  try {
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ Created .env.local template');
    console.log('   Please update it with your actual values from Vercel\n');
  } catch (error) {
    console.error('❌ Could not create .env.local:', error.message);
  }
}

console.log('🚀 Next steps:');
console.log('   1. Update .env.local with your Redis store values');
console.log('   2. Run: npm run test-redis');
console.log('   3. Run: npm run test-prisma');
console.log('   4. If both successful, your databases are ready to use!');
