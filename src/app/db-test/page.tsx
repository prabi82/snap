'use client';

import { useEffect, useState } from 'react';

export default function DbTestPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/db-status');
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-blue-500 border-b border-blue-500 pb-2 mb-6">
        Snap Database Connection Test
      </h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Database Status</h2>
        {loading ? (
          <div className="text-center py-6">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
            <p>Testing database connection...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <h3 className="font-bold">❌ Test Failed</h3>
            <p>{error}</p>
            
            <p className="mt-4">This could mean:</p>
            <ul className="list-disc ml-5">
              <li>The API route does not exist or is not accessible</li>
              <li>There's a server-side error in the API route</li>
              <li>Your browser is blocking the request</li>
            </ul>
          </div>
        ) : data?.success ? (
          <>
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
              <h3 className="font-bold">✅ Connected Successfully!</h3>
              <p>{data.message}</p>
            </div>
            
            <h3 className="text-lg font-semibold mb-2">Database Information</h3>
            <table className="w-full border-collapse mb-6">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left border p-2">Setting</th>
                  <th className="text-left border p-2">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">Host</td>
                  <td className="border p-2">{data.database.host}</td>
                </tr>
                <tr>
                  <td className="border p-2">Database Name</td>
                  <td className="border p-2">{data.database.name}</td>
                </tr>
                <tr>
                  <td className="border p-2">Status</td>
                  <td className="border p-2">{data.status}</td>
                </tr>
                <tr>
                  <td className="border p-2">Timestamp</td>
                  <td className="border p-2">{new Date(data.timestamp).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            
            <h3 className="text-lg font-semibold mb-2">Tables</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left border p-2">Table Name</th>
                  <th className="text-left border p-2">Status</th>
                  <th className="text-left border p-2">Record Count</th>
                </tr>
              </thead>
              <tbody>
                {data.database.tables.map((table: any, index: number) => (
                  <tr key={index}>
                    <td className="border p-2">{table.name}</td>
                    <td className="border p-2">
                      {table.exists 
                        ? <span className="text-green-600">✅ Exists</span> 
                        : <span className="text-red-600">❌ Missing</span>}
                    </td>
                    <td className="border p-2">{table.exists ? table.count : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <h3 className="font-bold">❌ Connection Failed</h3>
            <p>{data?.message || 'Unknown error'}</p>
            
            {data && (
              <div className="mt-4">
                <h3 className="font-semibold">Error Details</h3>
                <pre className="bg-gray-100 p-3 mt-2 overflow-auto text-sm">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">What This Test Does</h2>
        <p>This page tests if your Snap application can connect to the database by:</p>
        <ul className="list-disc ml-5 mb-4">
          <li>Making an API call to the <code className="bg-gray-100 px-1 rounded">/api/db-status</code> endpoint</li>
          <li>Checking if the database connection can be established</li>
          <li>Verifying that required tables exist</li>
          <li>Showing record counts for each table</li>
        </ul>
        <p>If this test passes, your database configuration in Vercel is correct.</p>
      </div>
      
      <div className="text-center text-gray-500 text-sm mt-10">
        <p>Snap Photo Sharing Application - Database Test</p>
        <p>Created with Next.js and deployed on Vercel</p>
      </div>
    </div>
  );
} 