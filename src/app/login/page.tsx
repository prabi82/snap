'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // Debug helper
  const debugLog = (message: string, data?: any) => {
    console.log(`[Login Debug] ${message}`, data || '');
  };
  
  useEffect(() => {
    debugLog('Login component mounted');
    // Check if already logged in
    const token = localStorage.getItem('token');
    if (token) {
      debugLog('User already has token, redirecting to photos');
      router.push('/photos');
    }
  }, [router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    debugLog(`Attempting login with email: ${email}`);
    
    try {
      debugLog('Sending request to /api/auth');
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      debugLog('Response received', { status: response.status, ok: response.ok });
      
      // Get response as text first to debug
      const rawText = await response.text();
      debugLog('Raw response text:', rawText);
      
      // Try to parse JSON
      let data;
      try {
        data = JSON.parse(rawText);
        debugLog('Parsed JSON data:', data);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        setError(`Server returned invalid format. Status: ${response.status}. See console for details.`);
        setIsLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }
      
      // Save token and user to localStorage
      debugLog('Login successful, storing data');
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      // Try navigation with a hard redirect for reliability
      debugLog('Navigating to /photos');
      
      // First try the router
      try {
        router.push('/photos');
        // Also try a backup with window.location after a short delay
        setTimeout(() => {
          if (window.location.pathname !== '/photos') {
            debugLog('Router navigation may have failed, using window.location');
            window.location.href = '/photos';
          }
        }, 500);
      } catch (navError) {
        debugLog('Router navigation failed, using window.location', navError);
        window.location.href = '/photos';
      }
    } catch (err: any) {
      debugLog('Login error', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-primary">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Password
              </label>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Not a member?{' '}
          <Link href="/register" className="font-semibold leading-6 text-primary hover:text-primary/80">
            Create an account
          </Link>
        </p>
        
        {/* Login tip for seeded users */}
        <div className="mt-5 text-xs text-gray-500 border-t pt-4">
          <p>Try logging in with:</p>
          <ul className="mt-1">
            <li><strong>Email:</strong> admin@example.com</li>
            <li><strong>Password:</strong> password123</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 