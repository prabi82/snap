import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, ApiResponse } from '@/types';

// Secret for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Login handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Email and password are required',
      }, { status: 400 });
    }

    // Query for the user
    const users = await query('SELECT * FROM users WHERE email = ?', [email]) as User[];
    
    if (users.length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Invalid credentials',
      }, { status: 401 });
    }

    const user = users[0];
    
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password || '');
    
    if (!isMatch) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Invalid credentials',
      }, { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    // Return success response with token
    return NextResponse.json<ApiResponse<{ user: Omit<User, 'password'>, token: string }>>({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Server error',
    }, { status: 500 });
  }
} 