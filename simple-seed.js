// Simple MongoDB seed script (JavaScript version)
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Try to manually load .env.local file
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

async function seedDatabase() {
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
    
    // Get the database
    const db = client.db('snap');
    
    // Clear existing collections
    console.log('Clearing existing data...');
    await db.collection('users').deleteMany({});
    await db.collection('photos').deleteMany({});
    await db.collection('comments').deleteMany({});
    console.log('Existing data cleared.');
    
    // Create users
    console.log('Creating users...');
    const adminPassword = await bcrypt.hash('password123', 10);
    const user1Password = await bcrypt.hash('userpass123', 10);
    const user2Password = await bcrypt.hash('userpass456', 10);
    
    const usersCollection = db.collection('users');
    
    const admin = await usersCollection.insertOne({
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const user1 = await usersCollection.insertOne({
      username: 'johnsmith',
      email: 'john@example.com',
      password: user1Password,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const user2 = await usersCollection.insertOne({
      username: 'sarahjones',
      email: 'sarah@example.com',
      password: user2Password,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Users created.');
    
    // Create photos
    console.log('Creating photos...');
    const photosCollection = db.collection('photos');
    
    const photo1 = await photosCollection.insertOne({
      title: 'Beautiful Sunset',
      description: 'A stunning sunset over the ocean',
      imageUrl: 'https://images.unsplash.com/photo-1493514789931-586cb221d7a7',
      votes: 12,
      user: admin.insertedId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const photo2 = await photosCollection.insertOne({
      title: 'Mountain Landscape',
      description: 'Majestic mountains in the morning',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      votes: 8,
      user: user1.insertedId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const photo3 = await photosCollection.insertOne({
      title: 'City Lights',
      description: 'Night cityscape with beautiful lights',
      imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390',
      votes: 15,
      user: user2.insertedId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Photos created.');
    
    // Create comments
    console.log('Creating comments...');
    const commentsCollection = db.collection('comments');
    
    await commentsCollection.insertOne({
      content: 'This is absolutely gorgeous!',
      photo: photo1.insertedId,
      user: user1.insertedId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await commentsCollection.insertOne({
      content: 'What camera did you use?',
      photo: photo1.insertedId,
      user: user2.insertedId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await commentsCollection.insertOne({
      content: 'I love the colors!',
      photo: photo2.insertedId,
      user: admin.insertedId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await commentsCollection.insertOne({
      content: 'Beautiful composition',
      photo: photo3.insertedId,
      user: user1.insertedId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Comments created.');
    console.log('Database seeded successfully!');
    
    // List the collections to verify
    const collections = await db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(collection => console.log(`- ${collection.name}`));
    
    // Get counts from each collection
    const userCount = await usersCollection.countDocuments();
    const photoCount = await photosCollection.countDocuments();
    const commentCount = await commentsCollection.countDocuments();
    
    console.log('\nDocument counts:');
    console.log(`- Users: ${userCount}`);
    console.log(`- Photos: ${photoCount}`);
    console.log(`- Comments: ${commentCount}`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the MongoDB connection
    await client.close();
    console.log('MongoDB connection closed.');
  }
}

// Run the seeder
seedDatabase()
  .then(() => {
    console.log('Seeding completed successfully.');
  })
  .catch(error => {
    console.error('Seeding failed:', error);
  }); 