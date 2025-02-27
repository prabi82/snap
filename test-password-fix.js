// Fix or create admin user with correct password
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Try to load .env.local file
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    console.log(`Trying to load environment from: ${envPath}`);
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envLines = envContent.split('\n');
      
      for (const line of envLines) {
        // Skip comments and empty lines
        if (line.trim().startsWith('#') || !line.trim()) continue;
        
        // Parse key=value
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        
        if (key && value) {
          process.env[key.trim()] = value;
        }
      }
      
      console.log('Environment variables loaded from .env.local');
      return true;
    } else {
      console.log('.env.local file not found');
      return false;
    }
  } catch (err) {
    console.error('Error loading .env.local:', err.message);
    return false;
  }
}

// Hardcoded connection string as fallback
const FALLBACK_URI = "mongodb+srv://snap:C4U2QqNfr8OLzNjt@snap.qw1lv.mongodb.net/?retryWrites=true&w=majority&appName=snap";

async function fixAdminPassword() {
  // Try to load environment variables
  loadEnv();
  
  // Get connection string from environment or use fallback
  let MONGODB_URI = process.env.MONGODB_URI || FALLBACK_URI;
  
  console.log(`MongoDB URI (sanitized): ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//******:******@')}`);
  
  // Create a MongoDB client
  const client = new MongoClient(MONGODB_URI);
  
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB successfully!');
    
    // Get the database and collection
    const db = client.db('snap');
    const usersCollection = db.collection('users');
    
    // Check if admin user exists
    const existingAdmin = await usersCollection.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('Admin user found - updating password');
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      // Update user with new password
      await usersCollection.updateOne(
        { email: 'admin@example.com' },
        { $set: { password: hashedPassword, updatedAt: new Date() } }
      );
      
      console.log('Admin password updated to "password123"');
    } else {
      console.log('Admin user not found - creating new admin user');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      // Create new admin user
      await usersCollection.insertOne({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('New admin user created with email "admin@example.com" and password "password123"');
    }
    
    // Display all users for verification
    console.log('\nUser accounts in database:');
    const users = await usersCollection.find({}, { projection: { password: 0 } }).toArray();
    users.forEach(user => {
      console.log(`- ${user.username} (${user.email})`);
    });
    
    console.log('\nOperation completed successfully!');
    console.log('You can now log in with:');
    console.log('Email: admin@example.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed.');
  }
}

// Run the fix
fixAdminPassword()
  .then(() => {
    console.log('Password fix completed.');
  })
  .catch(error => {
    console.error('Fix failed:', error);
  }); 