'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary">
          Welcome to Snap
        </h1>
        <p className="text-xl text-center mb-12">
          Share your best moments with the world
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">Share Photos</h2>
            <p className="mb-4">Upload your best photos and share them with friends and family</p>
            <Link href="/upload" className="btn-primary inline-block">Get Started</Link>
          </div>
          
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">Discover</h2>
            <p className="mb-4">Find amazing photos from photographers around the world</p>
            <Link href="/photos" className="btn-secondary inline-block">Explore Now</Link>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
          <p className="mb-6">Create an account to share your photos, vote, and comment</p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/register"
              className="btn-primary"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="border border-primary text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-md"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 