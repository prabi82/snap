import { NextRequest, NextResponse } from 'next/server';
import { query, testConnection, pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const isConnected = await testConnection();
    
    // Database configuration from environment variables (hiding password)
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || '',
      password: process.env.DB_PASSWORD ? '******' : 'Not set',
      database: process.env.DB_NAME || '',
    };
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        status: 'error',
        message: 'Failed to connect to database',
        config: dbConfig,
        environment: process.env.NODE_ENV,
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }
    
    // Get table information
    const tables = ['users', 'photos', 'comments'];
    const tablesInfo = [];
    
    for (const table of tables) {
      try {
        // Check if table exists by querying for count
        const countResult = await query(`SELECT COUNT(*) as count FROM ${table}`) as any[];
        const rowCount = countResult[0]?.count || 0;
        
        tablesInfo.push({
          name: table,
          exists: true,
          rowCount,
          status: 'ok'
        });
      } catch (error: any) {
        tablesInfo.push({
          name: table,
          exists: false,
          error: error.message,
          status: 'error'
        });
      }
    }
    
    // Return success response with database info
    return NextResponse.json({
      success: true,
      status: 'ok',
      message: 'Database connection successful',
      config: dbConfig,
      databaseInfo: {
        tables: tablesInfo
      },
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error: any) {
    console.error('Database test error:', error);
    
    return NextResponse.json({
      success: false,
      status: 'error',
      message: 'Error testing database connection',
      error: error.message,
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 