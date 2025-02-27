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

// Get a specific photo
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const photoId = params.id;
    
    const photos = await query(
      `SELECT p.*, u.username as author
       FROM photos p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [photoId]
    ) as any[];
    
    if (photos.length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Photo not found',
      }, { status: 404 });
    }
    
    // Get comments for this photo
    const comments = await query(
      `SELECT c.*, u.username
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.photo_id = ?
       ORDER BY c.created_at ASC`,
      [photoId]
    );
    
    const photo = photos[0];
    photo.comments = comments;
    
    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: photo,
    });
  } catch (error) {
    console.error('Error fetching photo:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Server error',
    }, { status: 500 });
  }
}

// Update a photo
export async function PUT(
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
    const body = await request.json();
    const { title, description } = body;
    
    // Check if photo exists and belongs to the user
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
    
    if (photos[0].user_id !== user.id) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized to update this photo',
      }, { status: 403 });
    }
    
    await query(
      'UPDATE photos SET title = ?, description = ? WHERE id = ?',
      [title, description, photoId]
    );
    
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
    console.error('Error updating photo:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Server error',
    }, { status: 500 });
  }
}

// Delete a photo
export async function DELETE(
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
    
    // Check if photo exists and belongs to the user
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
    
    if (photos[0].user_id !== user.id) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized to delete this photo',
      }, { status: 403 });
    }
    
    await query('DELETE FROM photos WHERE id = ?', [photoId]);
    
    return NextResponse.json<ApiResponse<null>>({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Server error',
    }, { status: 500 });
  }
} 