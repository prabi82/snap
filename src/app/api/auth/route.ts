import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectMongoose } from '@/lib/mongodb';
import User from '@/models/User';
import { ApiResponse } from '@/types';
import { ensureModelsAreRegistered } from '@/lib/models-registry';

// Secret for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Login handler
export async function POST(request: NextRequest) {
  try {
    console.log('Auth API called');
    
    // Ensure all models are registered
    console.log('Registering models...');
    ensureModelsAreRegistered();
    
    // Connect to MongoDB
    try {
      console.log('Connecting to MongoDB with URI set:', !!process.env.MONGODB_URI);
      await connectMongoose();
      console.log('MongoDB connected successfully');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Database connection error. Please try again later.',
      }, { status: 500 });
    }
    
    let body;
    try {
      const bodyText = await request.text();
      console.log('Request body text:', bodyText);
      body = JSON.parse(bodyText);
      console.log('Request body parsed successfully:', body);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Invalid request format',
      }, { status: 400 });
    }
    
    const { email, password } = body;
    
    console.log('Login attempt:', { email, passwordProvided: !!password });

    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Email and password are required',
      }, { status: 400 });
    }

    // Find the user by email
    console.log('Looking for user with email:', email);
    let user;
    try {
      user = await User.findOne({ email });
      console.log('User query completed:', user ? 'User found' : 'User not found');
    } catch (findError) {
      console.error('Error finding user:', findError);
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Error querying user database',
      }, { status: 500 });
    }
    
    if (!user) {
      console.log('User not found');
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Invalid credentials',
      }, { status: 401 });
    }
    
    console.log('User found:', user.username);
    
    // Compare passwords
    let isMatch;
    try {
      console.log('Comparing passwords');
      isMatch = await user.comparePassword(password);
      console.log('Password comparison completed, result:', isMatch);
    } catch (passwordError) {
      console.error('Error comparing passwords:', passwordError);
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Error verifying credentials',
      }, { status: 500 });
    }
    
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Invalid credentials',
      }, { status: 401 });
    }

    // Create JWT token
    let token;
    try {
      token = jwt.sign(
        { id: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: '1d' }
      );
      console.log('JWT token created successfully');
    } catch (tokenError) {
      console.error('Error creating token:', tokenError);
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Error creating authentication token',
      }, { status: 500 });
    }

    // Convert user document to a plain object and remove password
    const userObject = user.toObject();
    delete userObject.password;

    console.log('Login successful for user:', user.username);
    
    // Return success response with token
    return NextResponse.json<ApiResponse<{ user: any, token: string }>>({
      success: true,
      data: {
        user: userObject,
        token,
      },
    });
  } catch (error) {
    console.error('Unhandled login error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Server error',
    }, { status: 500 });
  }
} 