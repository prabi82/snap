// Environment Variable Checker
// This script checks that all required environment variables are set
// Run with: node check-env.js

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Required environment variables
const REQUIRED_VARS = [
  { name: 'DB_HOST', default: 'localhost' },
  { name: 'DB_USER', default: null },
  { name: 'DB_PASSWORD', default: null },
  { name: 'DB_NAME', default: null },
  { name: 'JWT_SECRET', default: null },
  { name: 'NODE_ENV', default: 'development' }
];

// Check environment
console.log('===== Environment Variable Check =====');
console.log('Node.js version:', process.version);
console.log('Current directory:', process.cwd());
console.log('Environment file path:', `${process.cwd()}/.env.local`);

// Check if .env.local exists
const fs = require('fs');
try {
  fs.accessSync('.env.local', fs.constants.R_OK);
  console.log('\n✅ .env.local file exists and is readable');
} catch (err) {
  console.log('\n❌ .env.local file not found or not readable!');
  console.log('   Make sure the file exists in:', process.cwd());
}

// Check each required variable
let hasErrors = false;
console.log('\n===== Required Variables =====');

REQUIRED_VARS.forEach(variable => {
  const value = process.env[variable.name];
  
  if (!value && !variable.default) {
    console.log(`❌ ${variable.name}: Not set (Required)`);
    hasErrors = true;
  } else if (!value && variable.default) {
    console.log(`⚠️ ${variable.name}: Not set (Using default: ${variable.default})`);
  } else if (variable.name.includes('PASSWORD') || variable.name.includes('SECRET')) {
    console.log(`✅ ${variable.name}: ******** (Set)`);
  } else {
    console.log(`✅ ${variable.name}: ${value}`);
  }
});

// Summary
console.log('\n===== Summary =====');
if (hasErrors) {
  console.log('❌ Some required environment variables are missing.');
  console.log('Please check your .env.local file and make sure all required variables are set.');
} else {
  console.log('✅ All required environment variables are set.');
  console.log('Environment seems properly configured!');
}

// List all environment variables
console.log('\n===== All Environment Variables =====');
console.log('(Showing only variables relevant to the application)');
Object.keys(process.env)
  .filter(key => key.startsWith('DB_') || key.startsWith('JWT_') || key === 'NODE_ENV' || key === 'PORT')
  .forEach(key => {
    const value = key.includes('PASSWORD') || key.includes('SECRET') 
      ? '******** (Set)' 
      : process.env[key];
    console.log(`${key}: ${value}`);
  }); 