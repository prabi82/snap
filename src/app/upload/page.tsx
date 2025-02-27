'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function UploadPhoto() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    setIsLoggedIn(true);
  }, [router]);
  
  const uploadFile = async (file: File) => {
    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload file');
    }
    
    return data.data.url;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate title
    if (!title) {
      setError('Title is required');
      return;
    }
    
    // Validate image source
    if (uploadMethod === 'url' && !imageUrl) {
      setError('Image URL is required');
      return;
    }
    
    if (uploadMethod === 'file' && !selectedFile) {
      setError('Please select an image file to upload');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      let finalImageUrl = imageUrl;
      
      // If we're uploading a file, upload it first
      if (uploadMethod === 'file' && selectedFile) {
        try {
          finalImageUrl = await uploadFile(selectedFile);
        } catch (uploadError: any) {
          setError(uploadError.message);
          setIsLoading(false);
          return;
        }
      }
      
      console.log('Submitting photo with URL:', finalImageUrl);
      
      // Create the photo with the image URL
      const response = await fetch('/api/photos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: description || null,
          imageUrl: finalImageUrl,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload photo');
      }
      
      console.log('Photo created successfully:', data);
      
      // Redirect to the photo page
      if (data.data && data.data.id) {
        router.push(`/photos/${data.data.id}`);
      } else {
        router.push('/photos');
      }
    } catch (err: any) {
      console.error('Error in photo upload:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Invalid file type. Please use JPEG, PNG, GIF, or WebP images.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File too large. Maximum size is 5MB.');
        return;
      }
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };
  
  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    setPreviewUrl(url);
  };
  
  const handleUploadMethodChange = (method: 'file' | 'url') => {
    setUploadMethod(method);
    // Clear preview when switching methods
    setPreviewUrl('');
    if (method === 'file') {
      setImageUrl('');
    } else {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  if (!isLoggedIn) {
    return null; // This will redirect to login page in useEffect
  }
  
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Upload a Photo</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input mt-1"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input mt-1"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Method
            </label>
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => handleUploadMethodChange('file')}
                className={`px-4 py-2 rounded-md ${
                  uploadMethod === 'file'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => handleUploadMethodChange('url')}
                className={`px-4 py-2 rounded-md ${
                  uploadMethod === 'url'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Image URL
              </button>
            </div>
          </div>
          
          {uploadMethod === 'file' ? (
            <div>
              <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700">
                Image File *
              </label>
              <div className="mt-1 flex items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="imageFile"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-white
                    hover:file:bg-primary/90"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Supported formats: JPEG, PNG, GIF, WebP. Maximum size: 5MB.
              </p>
            </div>
          ) : (
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                Image URL *
              </label>
              <input
                type="url"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                className="form-input mt-1"
                placeholder="https://example.com/image.jpg"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the URL of your image. Ensure the URL is publicly accessible.
              </p>
            </div>
          )}
          
          {previewUrl && (
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-2">Preview</p>
              <div className="relative aspect-video w-full mb-3 bg-gray-100 rounded-md overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-contain"
                  onError={() => setPreviewUrl('')}
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push('/photos')}
              className="btn-secondary mr-4"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || !title || (uploadMethod === 'url' && !imageUrl) || (uploadMethod === 'file' && !selectedFile)}
            >
              {isLoading ? 'Uploading...' : 'Upload Photo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 