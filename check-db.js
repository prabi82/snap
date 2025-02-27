// Simple database connection test script
// Run with: node check-db.js

// Load environment variables
require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

// Display configuration
console.log('===== Database Connection Test =====');
console.log('Node.js version:', process.version);
console.log('Environment:', process.env.NODE_ENV || 'Not set');
console.log('\nTesting connection with:');
console.log('- Host:', process.env.DB_HOST || 'localhost');
console.log('- Database:', process.env.DB_NAME || 'Not set');
console.log('- User:', process.env.DB_USER || 'Not set');
console.log('- Password:', process.env.DB_PASSWORD ? '******** (Set)' : 'Not set');
console.log('\nAttempting to connect...');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
};

// Test connection
async function testConnection() {
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connection successful!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 + 1 as result');
    console.log('✅ Simple query successful. Result:', rows[0].result);
    
    // Check tables
    console.log('\n===== Database Tables =====');
    const tables = ['users', 'photos', 'comments'];
    
    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✅ Table "${table}" exists - Contains ${rows[0].count} rows`);
      } catch (error) {
        console.error(`❌ Table "${table}" error:`, error.message);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error:', error.message);
    console.log('\nCommon issues:');
    console.log('- Check your .env.local file for correct credentials');
    console.log('- Verify the database user has permission to access the database');
    console.log('- Ensure the database exists and is properly configured');
    console.log('- Check if your server\'s MySQL service is running');
    
    return false;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nConnection closed.');
    }
  }
}

// Run the test and exit
testConnection()
  .then(() => {
    console.log('\n===== Test Complete =====');
    console.log('Time:', new Date().toISOString());
  })
  .catch(console.error); 