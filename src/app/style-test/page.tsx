'use client';

import React from 'react';
import Link from 'next/link';

export default function StyleTest() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-500 mb-6">Tailwind CSS Test Page</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Testing Styles</h2>
        <p className="text-gray-600 mb-4">
          This page is designed to test if Tailwind CSS styles are being applied correctly.
          You should see colored text, rounded corners, shadows, and proper spacing.
        </p>
        
        <div className="flex flex-wrap gap-4 mb-8">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Blue Button
          </button>
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
            Green Button
          </button>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
            Red Button
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-100 p-4 rounded">Card 1</div>
          <div className="bg-gray-100 p-4 rounded">Card 2</div>
          <div className="bg-gray-100 p-4 rounded">Card 3</div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Navigation</h2>
        <div className="space-y-2">
          <Link href="/" className="block text-blue-500 hover:underline">
            Go to Home
          </Link>
          <Link href="/login" className="block text-blue-500 hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
} 