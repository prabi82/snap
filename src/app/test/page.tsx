'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Testing environment variables and connection...');
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        // Check if we can fetch anything
        const testResponse = await fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }),
        });

        // Get raw response
        const rawText = await testResponse.text();
        console.log('Raw response:', rawText);

        // Try to parse the response
        let jsonData;
        try {
          jsonData = JSON.parse(rawText);
          setDetails({
            responseStatus: testResponse.status,
            responseType: 'Valid JSON',
            data: jsonData
          });
        } catch (e) {
          setStatus('error');
          setMessage('Error: Server returned invalid JSON');
          setDetails({
            responseStatus: testResponse.status,
            responseType: 'Invalid JSON - HTML or text',
            rawResponse: rawText.substring(0, 500) + '...' // First 500 chars
          });
          return;
        }

        // If we got a proper JSON response (even if it's an error), that's good
        setStatus('success');
        setMessage('Server communication working correctly!');
      } catch (error) {
        console.error('Test error:', error);
        setStatus('error');
        setMessage('Error connecting to server: ' + (error instanceof Error ? error.message : String(error)));
      }
    };

    checkEnvironment();
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Connection Test Page</h1>
      
      <div className={`p-4 mb-6 rounded-md ${
        status === 'loading' ? 'bg-blue-100' : 
        status === 'success' ? 'bg-green-100' : 'bg-red-100'
      }`}>
        <h2 className="font-semibold text-lg mb-2">Status: {status.toUpperCase()}</h2>
        <p>{message}</p>
      </div>

      {details && (
        <div className="mt-4">
          <h2 className="font-semibold text-lg mb-2">Response Details:</h2>
          <div className="bg-gray-100 p-4 rounded-md overflow-x-auto">
            <pre className="text-sm">{JSON.stringify(details, null, 2)}</pre>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 border rounded-md bg-yellow-50">
        <h2 className="font-semibold text-lg mb-2">Debug Information</h2>
        <p className="mb-2">If you're seeing errors, check the following:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Verify your MongoDB connection string in Vercel environment variables</li>
          <li>Make sure MongoDB Atlas allows connections from Vercel (add 0.0.0.0/0 to Network Access)</li>
          <li>Check that your JWT_SECRET environment variable is set</li>
        </ul>
      </div>
    </div>
  );
} 