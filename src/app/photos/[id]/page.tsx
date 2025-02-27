'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Comment {
  id: number;
  user_id: number;
  content: string;
  username: string;
  created_at: string;
}

interface PhotoDetail {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  image_url: string;
  votes: number;
  author: string;
  created_at: string;
  comments: Comment[];
}

export default function PhotoDetails({ params }: { params: { id: string } }) {
  const [photo, setPhoto] = useState<PhotoDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    fetchPhoto();
  }, [params.id]);
  
  const fetchPhoto = async () => {
    try {
      const response = await fetch(`/api/photos/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch photo');
      }
      
      setPhoto(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVote = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    if (isVoting) return;
    
    setIsVoting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/photos/${params.id}/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to vote');
      }
      
      // Update the photo in the state
      setPhoto(prev => prev ? { ...prev, votes: prev.votes + 1 } : null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsVoting(false);
    }
  };
  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    if (!comment.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/photos/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add comment');
      }
      
      // Clear comment input and refresh photo data to show the new comment
      setComment('');
      fetchPhoto();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
        {error}
      </div>
    );
  }
  
  if (!photo) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-500">Photo not found</p>
        <Link href="/photos" className="mt-4 inline-block text-primary hover:underline">
          Back to photos
        </Link>
      </div>
    );
  }
  
  return (
    <div className="py-8">
      <Link href="/photos" className="text-primary hover:underline mb-4 inline-block">
        ← Back to photos
      </Link>
      
      <div className="card mt-4">
        <div className="relative w-full aspect-video mb-4">
          <Image
            src={photo.image_url}
            alt={photo.title}
            className="rounded-lg object-contain"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            priority
          />
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{photo.title}</h1>
          
          <button
            onClick={handleVote}
            disabled={isVoting}
            className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-primary"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>{photo.votes}</span>
          </button>
        </div>
        
        {photo.description && (
          <p className="text-gray-700 mb-4">{photo.description}</p>
        )}
        
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <span>By {photo.author}</span>
          <span className="mx-2">•</span>
          <span>{new Date(photo.created_at).toLocaleDateString()}</span>
        </div>
        
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Comments</h2>
          
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isLoggedIn ? "Add a comment..." : "Log in to comment"}
                disabled={!isLoggedIn || isSubmitting}
                className="form-input flex-grow"
              />
              <button
                type="submit"
                disabled={!isLoggedIn || !comment.trim() || isSubmitting}
                className="btn-primary px-4 disabled:opacity-50"
              >
                Post
              </button>
            </div>
          </form>
          
          {photo.comments && photo.comments.length > 0 ? (
            <div className="space-y-4">
              {photo.comments.map(comment => (
                <div key={comment.id} className="border-b pb-4">
                  <div className="flex justify-between">
                    <span className="font-medium">{comment.username}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  );
} 