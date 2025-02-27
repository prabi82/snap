import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug API route called');
    
    // Gather environment info (without exposing secrets)
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI_SET: !!process.env.MONGODB_URI,
      JWT_SECRET_SET: !!process.env.JWT_SECRET,
      MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'not set',
    };
    
    console.log('Environment info:', envInfo);
    
    // Test MongoDB connection
    console.log('Testing MongoDB connection...');
    let dbStatus = 'Not tested';
    let dbError = null;
    
    try {
      await connectMongoose();
      dbStatus = 'Connected';
      console.log('MongoDB connection successful');
    } catch (error) {
      dbStatus = 'Failed';
      dbError = error instanceof Error ? error.message : 'Unknown error';
      console.error('MongoDB connection failed:', dbError);
    }
    
    // Return debug information
    return NextResponse.json({
      success: dbStatus === 'Connected',
      timestamp: new Date().toISOString(),
      environment: envInfo,
      database: {
        status: dbStatus,
        error: dbError,
        mongooseState: mongoose.connection.readyState,
      },
      message: 'Debug info created successfully',
    });
  } catch (error) {
    console.error('Debug route error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 