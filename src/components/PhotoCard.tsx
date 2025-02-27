'use client';

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';

interface PhotoCardProps {
  id: number;
  title: string;
  description: string | null;
  image_url?: string;
  imageUrl?: string;
  votes: number;
  author: string;
  onVote?: (id: number) => Promise<void>;
}

export default function PhotoCard({
  id,
  title,
  description,
  image_url,
  imageUrl,
  votes,
  author,
  onVote,
}: PhotoCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [currentVotes, setCurrentVotes] = useState(votes);
  
  const finalImageUrl = imageUrl || image_url;
  
  const handleVote = async () => {
    if (!onVote || isVoting) return;
    
    setIsVoting(true);
    try {
      await onVote(id);
      setCurrentVotes(prev => prev + 1);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };
  
  return (
    <div className="card overflow-hidden">
      <div className="relative aspect-video w-full mb-3">
        {finalImageUrl ? (
          <Image
            src={finalImageUrl}
            alt={title}
            className="object-cover rounded-md"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md text-red-500">
            Image not available
          </div>
        )}
      </div>
      
      <h3 className="text-xl font-semibold mb-1">{title}</h3>
      
      {description && (
        <p className="text-gray-600 mb-3 line-clamp-2">{description}</p>
      )}
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">By {author}</span>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleVote}
            disabled={isVoting || !onVote}
            className="flex items-center gap-1 text-gray-600 hover:text-primary transition-colors disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>{currentVotes}</span>
          </button>
          
          <Link href={`/photos/${id}`} className="text-primary hover:underline">
            View
          </Link>
        </div>
      </div>
    </div>
  );
} 