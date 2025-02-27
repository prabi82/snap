import { Document } from 'mongoose';

export interface UserDocument extends Document {
  username: string;
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface PhotoDocument extends Document {
  title: string;
  description: string | null;
  imageUrl: string;
  votes: number;
  user: UserDocument | string; // Can be populated or just the ID
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentDocument extends Document {
  content: string;
  photo: PhotoDocument | string; // Can be populated or just the ID
  user: UserDocument | string; // Can be populated or just the ID
  createdAt: Date;
  updatedAt: Date;
}

// API response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 