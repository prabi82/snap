import { NextRequest, NextResponse } from 'next/server';
import { query, testConnection } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const isConnected = await testConnection();
    
    // Initial response object
    const response = {
      success: isConnected,
      timestamp: new Date().toISOString(),
      status: isConnected ? 'connected' : 'disconnected',
      database: {
        host: process.env.DB_HOST || 'not set',
        name: process.env.DB_NAME || 'not set',
        tables: [] as any[]
      },
      message: isConnected 
        ? 'Successfully connected to the database' 
        : 'Failed to connect to the database'
    };
    
    // If connected, get additional information
    if (isConnected) {
      try {
        // Get table counts
        const tables = ['users', 'photos', 'comments'];
        for (const table of tables) {
          try {
            const result = await query(`SELECT COUNT(*) as count FROM ${table}`) as any[];
            response.database.tables.push({
              name: table,
              exists: true,
              count: result[0].count
            });
          } catch (error: any) {
            response.database.tables.push({
              name: table,
              exists: false,
              error: error.message
            });
          }
        }
      } catch (error) {
        console.error('Error getting table information:', error);
      }
    }
    
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      status: 'error',
      message: error.message || 'An error occurred while testing database connection',
      error: error.stack
    }, { status: 500 });
  }
} 