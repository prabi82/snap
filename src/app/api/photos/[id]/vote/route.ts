import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ApiResponse } from '@/types';
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

// Vote on a photo
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }
    
    const photoId = params.id;
    
    // Check if photo exists
    const photos = await query(
      'SELECT * FROM photos WHERE id = ?',
      [photoId]
    ) as any[];
    
    if (photos.length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Photo not found',
      }, { status: 404 });
    }
    
    // Increment vote count
    await query(
      'UPDATE photos SET votes = votes + 1 WHERE id = ?',
      [photoId]
    );
    
    // Get updated photo
    const updatedPhoto = await query(
      `SELECT p.*, u.username as author
       FROM photos p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [photoId]
    ) as any[];
    
    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: updatedPhoto[0],
    });
  } catch (error) {
    console.error('Error voting on photo:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Server error',
    }, { status: 500 });
  }
} 