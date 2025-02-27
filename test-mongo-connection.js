// Test MongoDB connection
const { MongoClient, ServerApiVersion } = require('mongodb');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Try to load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from: ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('Warning: .env.local file not found!');
  dotenv.config(); // Try loading from default .env
}

async function testMongoConnection() {
  // Get MongoDB URI from environment
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set!');
    console.error('Please ensure you have added it to your .env.local file');
    console.error('Current working directory:', process.cwd());
    console.error('Files in current directory:');
    try {
      const files = fs.readdirSync(process.cwd());
      console.error(files.join(', '));
    } catch (err) {
      console.error('Error listing directory:', err.message);
    }
    return false;
  }

  console.log('Testing connection to MongoDB...');
  console.log(`URI: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//******:******@')}`); // Hide credentials in output
  
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
    
    // List collections
    const collections = await client.db().listCollections().toArray();
    console.log(`\nCollections (${collections.length}):`);
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Sample data from each collection (if possible)
    console.log('\nCollection samples:');
    for (const collection of collections) {
      try {
        const sample = await client.db().collection(collection.name).findOne({});
        console.log(`\n${collection.name} sample document:`);
        console.log(JSON.stringify(sample, null, 2));
      } catch (err) {
        console.error(`Error getting sample from ${collection.name}:`, err.message);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error(`Error: ${error.message}`);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('connection')) {
      console.log('\nPossible issues:');
      console.log('1. Check your connection string - it may be incorrect');
      console.log('2. Ensure your IP address is whitelisted in MongoDB Atlas');
      console.log('3. Check your network connection');
    }
    
    if (error.message.includes('Authentication failed')) {
      console.log('\nAuthentication failed. Check your username and password in the connection string.');
    }
    
    return false;
  } finally {
    await client.close();
    console.log('\nConnection closed.');
  }
}

// Run the test
testMongoConnection()
  .then(success => {
    console.log(`\nTest completed ${success ? 'successfully' : 'with errors'}.`);
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 