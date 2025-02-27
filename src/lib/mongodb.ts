import { MongoClient, ServerApiVersion, Db } from 'mongodb';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
// Import the models registry to ensure all models are registered
import { ensureModelsAreRegistered } from './models-registry';

dotenv.config();

// MongoDB connection URI - add fallback for easier debugging
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://snap:C4U2QqNfr8OLzNjt@snap.qw1lv.mongodb.net/?retryWrites=true&w=majority&appName=snap';
const DB_NAME = process.env.MONGODB_DB_NAME || 'snap';

// Determine if we're in a build/SSG context
const isBuildTime = process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production' && !process.env.NEXT_RUNTIME;

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase(): Promise<{ client: MongoClient, db: Db }> {
  // Skip actual DB connection during build time
  if (isBuildTime) {
    console.log('Build time detected - skipping actual database connection');
    return { client: null as any, db: null as any };
  }

  // If we already have a connection, use it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    console.log('Connecting to MongoDB with URI starting with:', MONGODB_URI.substring(0, 20) + '...');
    
    // Connect to MongoDB
    const client = new MongoClient(MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });

    await client.connect();
    const db = client.db(DB_NAME);

    // Cache the client and db connection
    cachedClient = client;
    cachedDb = db;

    console.log('MongoDB connection established successfully');
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Keep track of whether models have been registered
let modelsRegistered = false;

// Mongoose connection for schema-based models
export async function connectMongoose() {
  // Skip actual DB connection during build time
  if (isBuildTime) {
    console.log('Build time detected - skipping Mongoose connection');
    return;
  }

  if (mongoose.connection.readyState >= 1) {
    // Ensure models are registered even if already connected
    if (!modelsRegistered) {
      ensureModelsAreRegistered();
      modelsRegistered = true;
    }
    console.log('Mongoose already connected, readyState:', mongoose.connection.readyState);
    return; // Already connected
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    console.log('Connecting to MongoDB with Mongoose, URI starts with:', MONGODB_URI.substring(0, 20) + '...');
    
    // Add connection options for better reliability
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds
      socketTimeoutMS: 45000, // 45 seconds
    });
    console.log('Mongoose connection established successfully');
    
    // Ensure all models are properly registered
    ensureModelsAreRegistered();
    modelsRegistered = true;
  } catch (error) {
    console.error('Mongoose connection error:', error);
    // Provide more context in the error
    if (error instanceof Error) {
      error.message = `MongoDB connection failed: ${error.message}. Please check MONGODB_URI value and network access settings.`;
    }
    throw error;
  }
}

// Test the database connection
export async function testConnection() {
  // Skip actual DB connection during build time
  if (isBuildTime) {
    console.log('Build time detected - skipping actual database connection test');
    return false;
  }

  try {
    const { client } = await connectToDatabase();
    await client.db().command({ ping: 1 });
    console.log('MongoDB connection test successful');
    return true;
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    return false;
  }
}

// Connect to MongoDB and return the db instance
export { connectToDatabase }; 