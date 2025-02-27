import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'snap_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Add connect timeout to prevent hanging
  connectTimeout: 10000, // 10 seconds
};

// Determine if we're in a build/SSG context
const isBuildTime = process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production' && !process.env.NEXT_RUNTIME;

// Create a connection pool only if we're not in build time
const pool = isBuildTime
  ? null // Don't create a pool during build
  : mysql.createPool(dbConfig);

// Test the database connection
async function testConnection() {
  // Skip actual DB connection during build time
  if (isBuildTime) {
    console.log('Build time detected - skipping actual database connection');
    return false;
  }

  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error connecting to database:', error);
    return false;
  }
}

// Execute a query
async function query(sql: string, params: any[] = []) {
  // During build time, return empty results for database queries
  if (isBuildTime) {
    console.log('Build time detected - returning mock data for query:', sql);
    // Return empty array or mock data depending on the query
    if (sql.toUpperCase().includes('SELECT COUNT(*)')) {
      return [{ count: 0 }];
    }
    return [];
  }

  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export { pool, query, testConnection }; 