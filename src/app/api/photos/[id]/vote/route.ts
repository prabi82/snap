import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectMongoose } from '@/lib/mongodb';
import Photo from '@/models/Photo';
import mongoose from 'mongoose';
import { ApiResponse } from '@/types';
import { ensureModelsAreRegistered } from '@/lib/models-registry';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Get user from token
function getUserFromToken(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) return null;
  
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string };
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
    // Ensure all models are registered
    ensureModelsAreRegistered();
    
    await connectMongoose();
    
    const user = getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }
    
    const photoId = params.id;
    
    // Check if it's a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(photoId)) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Invalid photo ID',
      }, { status: 400 });
    }
    
    // Check if photo exists
    const photo = await Photo.findById(photoId);
    
    if (!photo) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Photo not found',
      }, { status: 404 });
    }
    
    // Increment vote count
    await Photo.findByIdAndUpdate(photoId, { $inc: { votes: 1 } });
    
    // Get updated photo
    const updatedPhoto = await Photo.findById(photoId)
      .populate('user', 'username')
      .lean();
    
    if (!updatedPhoto) {
      throw new Error('Failed to retrieve updated photo');
    }
    
    // Extract username safely
    let username = 'Unknown';
    if (updatedPhoto.user && typeof updatedPhoto.user === 'object' && 'username' in updatedPhoto.user) {
      username = updatedPhoto.user.username;
    }
    
    // Format the response with consistent field names
    const formattedPhoto = {
      ...updatedPhoto,
      id: updatedPhoto._id.toString(),
      imageUrl: updatedPhoto.imageUrl, // Ensure this field is explicitly included
      author: username,
    };
    
    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: formattedPhoto,
    });
  } catch (error) {
    console.error('Error voting on photo:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Server error',
    }, { status: 500 });
  }
} 