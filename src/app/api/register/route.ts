import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongodb';
import User from '@/models/User';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectMongoose();
    
    const body = await request.json();
    const { username, email, password } = body;

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Username, email, and password are required',
      }, { status: 400 });
    }

    // Check if email or username already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Email or username already exists',
      }, { status: 409 });
    }

    // Create new user (password will be hashed by pre-save hook)
    const newUser = await User.create({
      username,
      email,
      password
    });

    // Remove password from the response
    const userObject = newUser.toObject();
    delete userObject.password;

    return NextResponse.json<ApiResponse<{ user: any }>>({
      success: true,
      data: { user: userObject },
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Server error',
    }, { status: 500 });
  }
} 