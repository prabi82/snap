// Basic Node.js test file
// Run this with: node test.js

console.log('===== Node.js Basic Test =====');
console.log('Node.js is working!');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);

// Test basic file system operations
try {
  const fs = require('fs');
  fs.writeFileSync('test-output.txt', 'This is a test file created by test.js');
  console.log('✅ File system operations: Success');
} catch (error) {
  console.error('❌ File system operations failed:', error.message);
}

// Test environment variables
console.log('\n===== Environment Variables =====');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('DB_HOST:', process.env.DB_HOST || 'Not set');
console.log('DB_NAME:', process.env.DB_NAME || 'Not set');
console.log('DB_USER:', process.env.DB_USER || 'Not set');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '******** (Set)' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '******** (Set)' : 'Not set');

// Test database connection
console.log('\n===== Database Connection Test =====');
try {
  // Only try to connect if we have the mysql2 package
  const mysql = require('mysql2/promise');
  
  // Will execute asynchronously
  async function testConnection() {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });
      
      console.log('✅ Database connection successful!');
      
      // Try a simple query
      const [rows] = await connection.execute('SELECT 1 + 1 AS result');
      console.log('✅ Database query successful. Result:', rows[0].result);
      
      // Close connection
      await connection.end();
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError.message);
    }
  }
  
  console.log('Attempting database connection...');
  testConnection().then(() => {
    console.log('\n===== Test Complete =====');
  });
} catch (moduleError) {
  console.log('❌ Could not test database connection: mysql2 module not available');
  console.log('Run "npm install mysql2" to install the module if needed');
  console.log('\n===== Test Complete =====');
} 