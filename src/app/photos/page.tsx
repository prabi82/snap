'use client';

import { useState, useEffect } from 'react';
import PhotoCard from '@/components/PhotoCard';
import { Photo } from '@/types';

// Define a more specific type to match what the API returns
interface PhotoListItem {
  id: number;
  title: string;
  description: string | null;
  imageUrl?: string; // New field name
  image_url?: string; // Old field name
  votes: number;
  author: string;
}

export default function Photos() {
  const [photos, setPhotos] = useState<PhotoListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchPhotos();
  }, []);
  
  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/photos');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch photos');
      }
      
      console.log('Photos received from API:', data.data);
      setPhotos(data.data || []);
    } catch (err: any) {
      console.error('Error fetching photos:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVote = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('You must be logged in to vote');
      }
      
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
  
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Discover Photos</h1>
      
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
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No photos found</p>
          <p className="mt-2">Be the first to upload a photo!</p>
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
              imageUrl={photo.imageUrl}
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