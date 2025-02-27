import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Username, email, and password are required',
      }, { status: 400 });
    }

    // Check if email already exists
    const existingUsers = await query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Email or username already exists',
      }, { status: 409 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const result = await query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    // Get the inserted user (without password)
    const newUser = await query(
      'SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?',
      [(result as any).insertId]
    ) as any[];

    return NextResponse.json<ApiResponse<{ user: any }>>({
      success: true,
      data: { user: newUser[0] },
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Server error',
    }, { status: 500 });
  }
} 