import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { mkdir } from 'fs/promises';
import jwt from 'jsonwebtoken';

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

// Function to ensure the uploads directory exists
async function ensureUploadsDirectory() {
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  try {
    await mkdir(uploadDir, { recursive: true });
    return uploadDir;
  } catch (error) {
    console.error('Error creating uploads directory:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }
    
    // Parse the FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file uploaded'
      }, { status: 400 });
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid file type. Allowed types: JPEG, PNG, GIF, WEBP'
      }, { status: 400 });
    }
    
    // Get file extension and generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    // Create uploads directory if it doesn't exist
    const uploadDir = await ensureUploadsDirectory();
    
    // Create file path
    const filePath = join(uploadDir, fileName);
    
    // Convert file to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Write file to disk
    await writeFile(filePath, buffer);
    
    // Generate URL for the file
    const fileUrl = `/uploads/${fileName}`;
    
    // Return success with the file URL
    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        fileName: fileName,
        fileType: file.type,
        fileSize: file.size
      }
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Server error'
    }, { status: 500 });
  }
} 