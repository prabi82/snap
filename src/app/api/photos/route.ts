import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ApiResponse, Photo } from '@/types';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Get user from token
function getUserFromToken(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) return null;
  
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; email: string };
  } catch (error) {
    return null;
  }
}

// Get all photos
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    let sql = `
      SELECT p.*, u.username as author
      FROM photos p
      JOIN users u ON p.user_id = u.id
    `;
    
    const params: any[] = [];
    
    if (userId) {
      sql += ' WHERE p.user_id = ?';
      params.push(userId);
    }
    
    sql += ' ORDER BY p.created_at DESC';
    
    const photos = await query(sql, params) as any[];
    
    return NextResponse.json<ApiResponse<any[]>>({
      success: true,
      data: photos,
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Server error',
    }, { status: 500 });
  }
}

// Create a new photo
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }
    
    const body = await request.json();
    const { title, description, image_url } = body;
    
    if (!title || !image_url) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Title and image URL are required',
      }, { status: 400 });
    }
    
    const result = await query(
      'INSERT INTO photos (user_id, title, description, image_url) VALUES (?, ?, ?, ?)',
      [user.id, title, description || null, image_url]
    );
    
    const newPhoto = await query(
      'SELECT p.*, u.username as author FROM photos p JOIN users u ON p.user_id = u.id WHERE p.id = ?',
      [(result as any).insertId]
    ) as any[];
    
    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: newPhoto[0],
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating photo:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Server error',
    }, { status: 500 });
  }
} 