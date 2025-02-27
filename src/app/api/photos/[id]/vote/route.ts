import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectMongoose } from '@/lib/mongodb';
import Photo from '@/models/Photo';
import mongoose from 'mongoose';
import { ApiResponse, PhotoDocument } from '@/types';
import { ensureModelsAreRegistered } from '@/lib/models-registry';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Type definitions for populated documents from Mongoose
interface PopulatedUser {
  _id: mongoose.Types.ObjectId;
  username: string;
}

interface PopulatedPhoto {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string | null;
  imageUrl: string;
  votes: number;
  user: PopulatedUser | mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

// Helper function to safely extract username from populated user
function getUsernameFromPopulatedUser(user: any): string {
  if (user && typeof user === 'object' && 'username' in user) {
    return user.username;
  }
  return 'Unknown';
}

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
    const photo = await Photo.findById(photoId) as PhotoDocument | null;
    
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
      .lean() as unknown as PopulatedPhoto;
    
    if (!updatedPhoto) {
      throw new Error('Failed to retrieve updated photo');
    }
    
    // Extract username safely using helper function
    const username = getUsernameFromPopulatedUser(updatedPhoto.user);
    
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
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 