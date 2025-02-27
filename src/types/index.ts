export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Photo {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  image_url: string;
  votes: number;
  created_at: Date;
  updated_at: Date;
}

export interface Comment {
  id: number;
  photo_id: number;
  user_id: number;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 