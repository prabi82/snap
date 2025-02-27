import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectMongoose } from '@/lib/mongodb';
import Photo from '@/models/Photo';
import Comment from '@/models/Comment';
import mongoose from 'mongoose';
import { ApiResponse, PhotoDocument, UserDocument } from '@/types';
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

interface PopulatedComment {
  _id: mongoose.Types.ObjectId;
  content: string;
  photo: mongoose.Types.ObjectId | string;
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

// Get a specific photo
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure all models are registered
    ensureModelsAreRegistered();
    
    await connectMongoose();
    
    const photoId = params.id;
    
    // Check if it's a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(photoId)) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Invalid photo ID',
      }, { status: 400 });
    }
    
    // Find the photo and populate user (author) information
    const photo = await Photo.findById(photoId)
      .populate('user', 'username')
      .lean() as unknown as PopulatedPhoto;
    
    if (!photo) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Photo not found',
      }, { status: 404 });
    }
    
    // Get comments for this photo
    const comments = await Comment.find({ photo: photoId })
      .populate('user', 'username')
      .sort({ createdAt: 1 })
      .lean() as unknown as PopulatedComment[];
    
    console.log('Retrieved photo data:', photo);
    
    // Extract username safely using helper function
    const username = getUsernameFromPopulatedUser(photo.user);
    
    // Format the comments safely
    const formattedComments = comments.map(comment => {
      const commentUsername = getUsernameFromPopulatedUser(comment.user);
      
      return {
        ...comment,
        id: comment._id.toString(),
        username: commentUsername,
      };
    });
    
    // Format the photo response with consistent field names
    const formattedPhoto = {
      ...photo,
      id: photo._id.toString(),
      imageUrl: photo.imageUrl, // Ensure this field is explicitly included
      author: username,
      comments: formattedComments,
    };
    
    console.log('Sending formatted photo:', formattedPhoto);
    
    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: formattedPhoto,
    });
  } catch (error) {
    console.error('Error fetching photo:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Update a photo
export async function PUT(
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
    
    const body = await request.json();
    const { title, description } = body;
    
    // Check if photo exists and belongs to the user
    const photo = await Photo.findById(photoId) as PhotoDocument | null;
    
    if (!photo) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Photo not found',
      }, { status: 404 });
    }
    
    // Check if the photo belongs to the user
    if (photo.user.toString() !== user.id) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized to update this photo',
      }, { status: 403 });
    }
    
    // Update the photo
    await Photo.findByIdAndUpdate(photoId, {
      title,
      description,
    });
    
    // Get the updated photo with user information
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
    console.error('Error updating photo:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Delete a photo
export async function DELETE(
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
    
    // Check if photo exists and belongs to the user
    const photo = await Photo.findById(photoId) as PhotoDocument | null;
    
    if (!photo) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Photo not found',
      }, { status: 404 });
    }
    
    // Check if the photo belongs to the user
    if (photo.user.toString() !== user.id) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized to delete this photo',
      }, { status: 403 });
    }
    
    // Delete the photo
    await Photo.findByIdAndDelete(photoId);
    
    // Also delete all comments related to this photo
    await Comment.deleteMany({ photo: photoId });
    
    return NextResponse.json<ApiResponse<null>>({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 