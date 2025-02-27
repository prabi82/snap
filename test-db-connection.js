// Simple database connection test script
const mysql = require('mysql2/promise');

async function testConnection() {
  // Database configuration
  const config = {
    host: process.env.DB_HOST || '109.203.109.118',
    user: process.env.DB_USER || 'onlyoman_snap',
    password: process.env.DB_PASSWORD || '1v(hiCel+j0G',
    database: process.env.DB_NAME || 'onlyoman_snap',
    connectTimeout: 10000 // 10 seconds
  };

  console.log('Testing connection to MySQL server...');
  console.log(`Host: ${config.host}`);
  console.log(`Database: ${config.database}`);
  console.log(`User: ${config.user}`);
  console.log('Password: ********');

  try {
    // Create connection
    console.log('Attempting to connect...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Connection successful!');

    // Test query - show tables
    console.log('Running test query...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log('✅ Query successful!');
    
    console.log('\nDatabase tables:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`- ${tableName}`);
    });

    // Get row counts
    console.log('\nTable statistics:');
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      const [result] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`- ${tableName}: ${result[0].count} rows`);
    }

    // Close connection
    await connection.end();
    console.log('\nConnection closed.');
    return true;
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error(`Error: ${error.message}`);
    return false;
  }
}

// Run the test
testConnection()
  .then(success => {
    console.log('\nTest completed ' + (success ? 'successfully' : 'with errors') + '.');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 