import fs from 'fs';
import path from 'path';
import { pool, testConnection } from './db';

async function initializeDatabase() {
  try {
    // Test database connection
    const connected = await testConnection();
    
    if (!connected) {
      console.error('Failed to connect to database');
      return;
    }
    
    console.log('Connected to database');
    
    // Read the schema.sql file
    const schemaPath = path.join(process.cwd(), 'src', 'lib', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the SQL by semicolons to execute each statement separately
    const statements = schemaSql
      .split(';')
      .filter(statement => statement.trim() !== '');
    
    // Execute each statement
    for (const statement of statements) {
      await pool.query(statement);
      console.log('Executed statement:', statement.substring(0, 50) + '...');
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the initialization
initializeDatabase();

export default initializeDatabase; 