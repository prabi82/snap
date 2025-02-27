'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhotoCard from '@/components/PhotoCard';
import { Photo } from '@/types';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [photos, setPhotos] = useState<(Photo & { author: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    
    try {
      setUser(JSON.parse(userData));
      fetchUserPhotos(JSON.parse(userData).id);
    } catch (err) {
      console.error('Error parsing user data:', err);
      router.push('/login');
    }
  }, [router]);
  
  const fetchUserPhotos = async (userId: number) => {
    try {
      const response = await fetch(`/api/photos?userId=${userId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch photos');
      }
      
      setPhotos(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVote = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/photos/${id}/vote`, {
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
      setPhotos(prev => prev.map(photo => 
        photo.id === id ? { ...photo, votes: photo.votes + 1 } : photo
      ));
      
      return Promise.resolve();
    } catch (err: any) {
      setError(err.message);
      return Promise.reject(err);
    }
  };
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
      
      <div className="mb-8">
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <p className="text-xl font-semibold">{user.username}</p>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => router.push('/upload')}
                className="btn-primary"
              >
                Upload New Photo
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mb-4">Your Photos</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-12 card">
          <p className="text-xl text-gray-500">You haven't uploaded any photos yet</p>
          <button
            onClick={() => router.push('/upload')}
            className="mt-4 btn-primary"
          >
            Upload Your First Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map(photo => (
            <PhotoCard
              key={photo.id}
              id={photo.id}
              title={photo.title}
              description={photo.description}
              image_url={photo.image_url}
              votes={photo.votes}
              author={photo.author}
              onVote={handleVote}
            />
          ))}
        </div>
      )}
    </div>
  );
} 