import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectMongoose } from '@/lib/mongodb';
import Photo from '@/models/Photo';
import Comment from '@/models/Comment';
import mongoose from 'mongoose';
import { ApiResponse } from '@/types';

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

// Add a comment to a photo
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
    const { content } = body;
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Comment content is required',
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
    
    // Create new comment
    const newComment = await Comment.create({
      content,
      photo: photoId,
      user: user.id
    });
    
    // Get the comment with user information
    const commentWithUser = await Comment.findById(newComment._id)
      .populate('user', 'username')
      .lean();
    
    // Format the response with null checks
    let formattedComment;
    
    if (commentWithUser) {
      // Check if user is populated and has username
      const username = commentWithUser.user && 
                      typeof commentWithUser.user === 'object' && 
                      'username' in commentWithUser.user ? 
                      commentWithUser.user.username : 'Unknown User';
      
      formattedComment = {
        ...commentWithUser,
        username: username
      };
    } else {
      // Fallback if comment not found (shouldn't happen normally)
      formattedComment = {
        _id: newComment._id,
        content: newComment.content,
        username: 'Unknown User',
        createdAt: newComment.createdAt
      };
    }
    
    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: formattedComment,
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Get comments for a photo
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoose();
    
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
    
    // Get comments
    const comments = await Comment.find({ photo: photoId })
      .populate('user', 'username')
      .sort({ createdAt: 1 })
      .lean();
    
    // Format comments with null and type checks
    const formattedComments = comments.map(comment => {
      // Safely extract username
      let username = 'Unknown User';
      if (comment.user && typeof comment.user === 'object' && 'username' in comment.user) {
        username = comment.user.username;
      }
      
      return {
        ...comment,
        username
      };
    });
    
    return NextResponse.json<ApiResponse<any[]>>({
      success: true,
      data: formattedComments,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 