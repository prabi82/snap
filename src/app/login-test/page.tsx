'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginTest() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  const log = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString().substring(11, 19)}: ${message}`]);
  };
  
  const handleTestApi = async () => {
    log('Testing debug API route...');
    setIsLoading(true);
    try {
      const response = await fetch('/api/debug');
      const text = await response.text();
      log(`API response status: ${response.status}`);
      log(`Raw response: ${text.substring(0, 100)}...`);
      
      try {
        const data = JSON.parse(text);
        setResult({
          type: 'Debug API',
          status: response.status,
          data
        });
        log('Parsed JSON successfully');
      } catch (e) {
        log('Failed to parse JSON');
        setError('JSON parse error. See raw response in logs.');
      }
    } catch (e) {
      log(`API error: ${e instanceof Error ? e.message : String(e)}`);
      setError('Failed to connect to debug API');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogin = async () => {
    log(`Attempting login with email: ${email}`);
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      log(`Login response status: ${response.status}`);
      
      const text = await response.text();
      log(`Raw response (first 100 chars): ${text.substring(0, 100)}...`);
      
      try {
        const data = JSON.parse(text);
        setResult({
          type: 'Login',
          status: response.status,
          data
        });
        
        if (data.success && data.data?.token) {
          log('Login successful, storing data');
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('user', JSON.stringify(data.data.user));
        } else {
          log(`Login failed: ${data.error || 'Unknown error'}`);
          setError(data.error || 'Login failed');
        }
      } catch (parseError) {
        log('Failed to parse JSON response');
        setError('Invalid JSON response from server');
      }
    } catch (err) {
      log(`Login request error: ${err instanceof Error ? err.message : String(err)}`);
      setError('Error connecting to server');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Login Test Page</h1>
      <p className="mb-4 text-gray-600">This page helps diagnose login issues</p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 border rounded-md">
          <h2 className="text-lg font-semibold mb-2">Login Form</h2>
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Test Login'}
            </button>
            <button
              onClick={handleTestApi}
              disabled={isLoading}
              className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Test API Connection
            </button>
          </div>
        </div>
        
        <div className="p-4 border rounded-md">
          <h2 className="text-lg font-semibold mb-2">Log Messages</h2>
          <div className="bg-gray-100 p-3 rounded-md h-64 overflow-y-auto text-sm font-mono">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Try testing the API or login.</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {result && (
        <div className="mt-6 p-4 border rounded-md">
          <h2 className="text-lg font-semibold mb-2">Result - {result.type}</h2>
          <div className="bg-gray-100 p-3 rounded-md overflow-x-auto">
            <pre className="text-sm">{JSON.stringify(result.data, null, 2)}</pre>
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <Link href="/login" className="text-blue-500 hover:underline">
          Back to normal login page
        </Link>
      </div>
    </div>
  );
} 