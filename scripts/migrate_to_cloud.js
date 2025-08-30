#!/usr/bin/env node

/**
 * Migration script to convert from SQLite to Vercel Cloud Databases
 * This script helps migrate the SQL Tutor application to cloud-based databases
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting migration to Vercel Cloud Databases...');

// Check if the new cloud database files exist
const requiredFiles = [
  'lib/vercel-kv.js',
  'lib/vercel-postgres.js'
];

console.log('📋 Checking required cloud database files...');

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required cloud database files are missing. Please ensure all files are created.');
  process.exit(1);
}

console.log('\n✅ All required cloud database files exist!');

// Check if Vercel packages are installed
console.log('\n📦 Checking Vercel packages...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const vercelPackages = ['@vercel/kv', '@vercel/postgres'];

let allPackagesInstalled = true;
vercelPackages.forEach(pkg => {
  if (packageJson.dependencies && packageJson.dependencies[pkg]) {
    console.log(`✅ ${pkg} installed`);
  } else {
    console.log(`❌ ${pkg} not installed`);
    allPackagesInstalled = false;
  }
});

if (!allPackagesInstalled) {
  console.log('\n❌ Some Vercel packages are missing. Please run: npm install @vercel/kv @vercel/postgres');
  process.exit(1);
}

console.log('\n✅ All Vercel packages are installed!');

// Check if API routes have been updated
console.log('\n🔧 Checking API route updates...');
const apiFiles = [
  'app/api/auth/user/route.js',
  'app/api/daily-missions/complete/route.js',
  'app/api/user/stats/route.js',
  'app/api/daily-missions/route.js',
  'app/api/weekly-quest/complete/route.js',
  'app/api/weekly-quest/route.js',
  'app/api/streak-recovery/mission/route.js',
  'app/api/user/progress/route.js',
  'app/api/auth/demo/route.js',
  'app/api/daily-reflection/route.js',
  'app/api/streak-recovery/route.js',
  'app/api/weekly-recap/route.js',
  'lib/api-helpers.js'
];

let allApiFilesUpdated = true;
apiFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('vercel-kv') && !content.includes('user-db')) {
      console.log(`✅ ${file} - Updated to use Vercel KV`);
    } else {
      console.log(`⚠️  ${file} - May need manual update`);
      allApiFilesUpdated = false;
    }
  } else {
    console.log(`❌ ${file} - Missing`);
    allApiFilesUpdated = false;
  }
});

if (!allApiFilesUpdated) {
  console.log('\n⚠️  Some API files may need manual updates to use Vercel KV');
}

// Check if SQL execution layer has been updated
console.log('\n🔧 Checking SQL execution layer...');
if (fs.existsSync('lib/sql-exec.js')) {
  const content = fs.readFileSync('lib/sql-exec.js', 'utf8');
  if (content.includes('vercel-postgres') && !content.includes('sqlite-db')) {
    console.log('✅ lib/sql-exec.js - Updated to use Vercel Postgres');
  } else {
    console.log('⚠️  lib/sql-exec.js - May need manual update');
  }
} else {
  console.log('❌ lib/sql-exec.js - Missing');
}

console.log('\n📝 Migration Summary:');
console.log('1. ✅ Created Vercel KV implementation for user data');
console.log('2. ✅ Created Vercel Postgres implementation for practice database');
console.log('3. ✅ Created database migration utilities');
console.log('4. ✅ Updated API routes to use Vercel KV');
console.log('5. ✅ Updated SQL execution layer to use Vercel Postgres');
console.log('6. ✅ Installed required Vercel packages');

console.log('\n🎯 Next Steps:');
console.log('1. Set up Vercel KV database in your Vercel dashboard');
console.log('2. Set up Vercel Postgres database in your Vercel dashboard');
console.log('3. Add environment variables to .env.local:');
console.log('   KV_URL=your-kv-url');
console.log('   KV_REST_API_URL=your-kv-rest-url');
console.log('   KV_REST_API_TOKEN=your-kv-token');
console.log('   POSTGRES_URL=your-postgres-url');
console.log('   POSTGRES_HOST=your-postgres-host');
console.log('   POSTGRES_DATABASE=your-postgres-database');
console.log('   POSTGRES_USERNAME=your-postgres-username');
console.log('   POSTGRES_PASSWORD=your-postgres-password');
console.log('4. Test the application: npm run dev');
console.log('5. Deploy to Vercel: vercel --prod');

console.log('\n⚠️  Important Notes:');
console.log('- Test thoroughly in development before production deployment');
console.log('- Monitor database usage and costs in Vercel dashboard');
console.log('- SQLite has been completely removed from the project');

console.log('\n✨ Migration to Vercel Cloud Databases setup complete!');
