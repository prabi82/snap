import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { ensureModelsAreRegistered } from '@/lib/models-registry';

export async function POST(request: NextRequest) {
  // Create a detailed response object
  const response: any = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI_EXISTS: !!process.env.MONGODB_URI,
      JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
    },
    database: {
      status: 'Not tested',
      mongooseVersion: mongoose.version,
    },
    request: {
      method: request.method,
      contentType: request.headers.get('content-type') || 'none',
    }
  };
  
  try {
    // Try to parse the request body
    let bodyText = '';
    try {
      bodyText = await request.text();
      response.request.bodyLength = bodyText.length;
      
      if (bodyText) {
        const body = JSON.parse(bodyText);
        response.request.body = {
          email: body.email ? '***' : 'missing', // Don't show the actual email
          passwordProvided: !!body.password
        };
      }
    } catch (parseError) {
      response.request.parseError = (parseError instanceof Error) ? parseError.message : 'Unknown error';
    }
    
    // Ensure models are registered
    try {
      ensureModelsAreRegistered();
      response.modelsRegistered = true;
    } catch (modelError) {
      response.modelsRegistered = false;
      response.modelError = (modelError instanceof Error) ? modelError.message : 'Unknown error';
    }
    
    // Test MongoDB connection
    try {
      await connectMongoose();
      response.database.status = 'Connected';
      response.database.connectionState = mongoose.connection.readyState;
    } catch (dbError) {
      response.database.status = 'Failed';
      response.database.error = (dbError instanceof Error) ? dbError.message : 'Unknown error';
      
      // Add more diagnostic info if available
      if (dbError instanceof Error) {
        if ('code' in dbError) response.database.errorCode = (dbError as any).code;
        if ('errno' in dbError) response.database.errno = (dbError as any).errno;
      }
    }
    
    return NextResponse.json(response);
  } catch (error) {
    // If anything else goes wrong, return a detailed error
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 