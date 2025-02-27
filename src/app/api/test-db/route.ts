import { NextRequest, NextResponse } from 'next/server';
import { query, testConnection } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        status: 'error',
        message: 'Failed to connect to database',
        error: 'Database connection test failed',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }
    
    // Get table information
    const tables = [
      { name: 'users', expectedColumns: ['id', 'username', 'email', 'password', 'created_at', 'updated_at'] },
      { name: 'photos', expectedColumns: ['id', 'user_id', 'title', 'description', 'image_url', 'votes', 'created_at', 'updated_at'] },
      { name: 'comments', expectedColumns: ['id', 'photo_id', 'user_id', 'content', 'created_at', 'updated_at'] },
    ];
    
    const tablesInfo = [];
    
    for (const table of tables) {
      try {
        // Check if table exists by querying for count
        const countResult = await query(`SELECT COUNT(*) as count FROM ${table.name}`) as any[];
        const rowCount = countResult[0]?.count || 0;
        
        tablesInfo.push({
          name: table.name,
          exists: true,
          rowCount,
          status: 'ok'
        });
      } catch (error: any) {
        tablesInfo.push({
          name: table.name,
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
      databaseInfo: {
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        tables: tablesInfo
      },
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error: any) {
    console.error('Database test error:', error);
    
    return NextResponse.json({
      success: false,
      status: 'error',
      message: 'Error testing database connection',
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 