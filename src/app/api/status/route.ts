import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, testConnection } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const isConnected = await testConnection();
    
    return NextResponse.json({
      success: true,
      status: isConnected ? 'connected' : 'disconnected',
      database: {
        type: 'MongoDB',
        connection: isConnected ? 'success' : 'failed',
        version: mongoose.version
      },
      server: {
        node: process.version,
        environment: process.env.NODE_ENV
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 