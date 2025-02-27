import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectMongoose } from '@/lib/mongodb';
import Photo from '@/models/Photo';
import User from '@/models/User';
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

// Get all photos
export async function GET(request: NextRequest) {
  try {
    // Ensure all models are registered
    ensureModelsAreRegistered();
    
    await connectMongoose();
    
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    let query = {};
    
    if (userId) {
      query = { user: userId };
    }
    
    // Find photos and populate the user field to get username
    const photos = await Photo.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'username') // Select only username from the User model
      .lean(); // Convert to plain object
    
    // Transform the results to match the expected format
    const formattedPhotos = photos.map(photo => {
      // Safely extract username from populated user
      let username = 'Unknown';
      if (photo.user && typeof photo.user === 'object' && 'username' in photo.user) {
        username = photo.user.username;
      }
      
      return {
        ...photo,
        author: username,
        id: photo._id // Ensure ID is set
      };
    });
    
    return NextResponse.json<ApiResponse<any[]>>({
      success: true,
      data: formattedPhotos,
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
    console.log('Starting photo creation process');
    
    // Ensure all models are registered
    ensureModelsAreRegistered();
    
    await connectMongoose();
    console.log('MongoDB connected successfully');
    
    const user = getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }
    
    console.log('User authenticated:', user.id);
    
    const body = await request.json();
    console.log('Request body:', body);
    
    // Handle both formats - imageUrl (new) and image_url (old)
    const { title, description, imageUrl, image_url } = body;
    const finalImageUrl = imageUrl || image_url;
    
    if (!title || !finalImageUrl) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Title and image URL are required',
      }, { status: 400 });
    }
    
    console.log('Creating photo with: ', {
      title,
      description: description || null,
      imageUrl: finalImageUrl,
      userId: user.id
    });
    
    // Create new photo
    const newPhoto = await Photo.create({
      title,
      description: description || null,
      imageUrl: finalImageUrl,
      user: user.id,
      votes: 0
    });
    
    console.log('Photo created successfully with ID:', newPhoto._id);
    
    // Return simplified data without trying to populate user
    const photoData = {
      ...newPhoto.toObject(),
      id: newPhoto._id.toString(),
      author: 'You' // Since we just created it, it's the current user
    };
    
    console.log('Returning photo data:', photoData);
    
    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: photoData,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating photo:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    }, { status: 500 });
  }
} 