'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LoginFix() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loginWorking, setLoginWorking] = useState(false);
  const [message, setMessage] = useState('Checking login status...');
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        setUserInfo(userData);
        setLoginWorking(true);
        setMessage('You are logged in! Authentication is working correctly.');
      } catch (e) {
        setMessage('Error parsing user data from localStorage. Try clearing your browser data.');
      }
    } else {
      setMessage('You are not logged in. Try the login page with default credentials.');
    }
  }, []);
  
  const handleClearStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMessage('Local storage cleared. Please try logging in again.');
    setUserInfo(null);
    setLoginWorking(false);
  };
  
  const handleForceNavigate = () => {
    window.location.href = '/photos';
  };
  
  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-primary mb-6">Login Troubleshooter</h1>
      
      <div className={`p-4 mb-6 rounded ${loginWorking ? 'bg-green-100' : 'bg-yellow-100'}`}>
        <p className="font-medium">{message}</p>
      </div>
      
      {userInfo && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Your Account Info:</h2>
          <div className="bg-gray-50 p-3 rounded">
            <p><strong>Username:</strong> {userInfo.username}</p>
            <p><strong>Email:</strong> {userInfo.email}</p>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <button
          onClick={handleClearStorage}
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
        >
          Clear Login Data
        </button>
        
        <button
          onClick={handleForceNavigate}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Force Navigate to Photos
        </button>
        
        <Link href="/login" className="block w-full text-center bg-green-500 text-white py-2 rounded hover:bg-green-600">
          Go to Login Page
        </Link>
      </div>
      
      <div className="mt-8 border-t pt-4">
        <h2 className="text-lg font-semibold mb-2">Default Login Credentials:</h2>
        <div className="bg-gray-50 p-3 rounded">
          <p><strong>Email:</strong> admin@example.com</p>
          <p><strong>Password:</strong> password123</p>
        </div>
      </div>
    </div>
  );
} 