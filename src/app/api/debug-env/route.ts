import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Only return this in development or with a secret key
  const isAuthorized = process.env.NODE_ENV !== 'production' || 
                       request.nextUrl.searchParams.get('key') === 'debugvercel123';
  
  if (!isAuthorized) {
    return NextResponse.json({
      message: 'Not authorized to view environment variables',
    }, { status: 401 });
  }
  
  // Get database-related environment variables
  const envVars = {
    DB_HOST: process.env.DB_HOST || 'not set',
    DB_NAME: process.env.DB_NAME || 'not set',
    DB_USER: process.env.DB_USER || 'not set',
    DB_PASSWORD: process.env.DB_PASSWORD ? '******** (set)' : 'not set',
    NODE_ENV: process.env.NODE_ENV || 'not set',
    // Don't expose JWT_SECRET as it's sensitive
  };
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    variables: envVars
  });
} 