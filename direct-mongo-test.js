// Direct MongoDB connection test
const { MongoClient, ServerApiVersion } = require('mongodb');

async function testDirectConnection() {
  // Connection string directly from Atlas (correct format)
  const MONGODB_URI = "mongodb+srv://snap:C4U2QqNfr8OLzNjt@snap.qw1lv.mongodb.net/?retryWrites=true&w=majority&appName=snap";

  console.log('Testing direct connection to MongoDB...');
  console.log(`URI: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//******:******@')}`);
  
  const client = new MongoClient(MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Connection successful!');
    
    // Test a basic operation
    await client.db().command({ ping: 1 });
    console.log('✅ Database ping successful!');
    
    // Get database name
    const dbName = client.db().databaseName;
    console.log(`Database name: ${dbName}`);
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error(`Error: ${error.message}`);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('connection')) {
      console.log('\nPossible issues:');
      console.log('1. Check network connection');
      console.log('2. Ensure your IP address is whitelisted in MongoDB Atlas');
    }
    
    if (error.message.includes('Authentication failed')) {
      console.log('\nAuthentication failed. Check the username and password in the connection string.');
    }
    
    return false;
  } finally {
    await client.close();
    console.log('\nConnection closed.');
  }
}

// Run the test
testDirectConnection()
  .then(success => {
    console.log(`\nTest completed ${success ? 'successfully' : 'with errors'}.`);
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 