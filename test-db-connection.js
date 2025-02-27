// Simple script to test database connectivity
require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

// Display the database configuration being used
console.log('Testing database connection with the following configuration:');
console.log('Host:', process.env.DB_HOST);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_NAME);
console.log('Environment:', process.env.NODE_ENV);

// Create connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Test connection function
async function testConnection() {
  let connection;
  try {
    console.log('Attempting to connect to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    console.log('Testing a simple query...');
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Query successful. Found ${rows[0].count} users in the database.`);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return false;
  } finally {
    if (connection) {
      console.log('Closing connection...');
      await connection.end();
    }
  }
}

// Run the test
testConnection()
  .then(() => console.log('Database test completed.'))
  .catch(err => console.error('Test execution error:', err)); 