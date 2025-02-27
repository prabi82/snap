// Database connection test script for Node.js
// Run this with `node db-test-alt.js` and then access http://localhost:5000 in your browser
// Or upload to your server and access it there

require('dotenv').config({ path: '.env.local' });
const http = require('http');
const mysql = require('mysql2/promise');

// Create server
const server = http.createServer(async (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  
  // Database configuration from environment variables
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
  };
  
  // Generate HTML for the response
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Snap Database Test</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #3B82F6;
      border-bottom: 2px solid #3B82F6;
      padding-bottom: 10px;
    }
    .box {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      padding: 20px;
      margin-bottom: 20px;
    }
    .success {
      background-color: #d1fae5;
      border-left: 4px solid #10B981;
      padding: 10px 15px;
    }
    .error {
      background-color: #fee2e2;
      border-left: 4px solid #ef4444;
      padding: 10px 15px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    table, th, td {
      border: 1px solid #e5e7eb;
    }
    th, td {
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background-color: #f9fafb;
    }
    .warning {
      background-color: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 10px 15px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <h1>Snap Database Connection Test</h1>
  
  <div class="warning">
    <strong>Security Notice:</strong> This page displays sensitive configuration information.
    Delete this file from your server after testing.
  </div>
  
  <div class="box">
    <h2>Environment Configuration</h2>
    <table>
      <tr>
        <th>Setting</th>
        <th>Value</th>
      </tr>
      <tr>
        <td>Node.js Version</td>
        <td>${process.version}</td>
      </tr>
      <tr>
        <td>Environment</td>
        <td>${process.env.NODE_ENV || 'Not set'}</td>
      </tr>
      <tr>
        <td>Database Host</td>
        <td>${dbConfig.host}</td>
      </tr>
      <tr>
        <td>Database Name</td>
        <td>${dbConfig.database}</td>
      </tr>
      <tr>
        <td>Database User</td>
        <td>${dbConfig.user}</td>
      </tr>
      <tr>
        <td>Database Password</td>
        <td>${dbConfig.password ? '******' : '<span style="color:red">Not set</span>'}</td>
      </tr>
    </table>
  </div>
  
  <div class="box">
    <h2>Connection Test Results</h2>
`;

  let connection;
  try {
    // Test database connection
    connection = await mysql.createConnection(dbConfig);
    
    html += `
    <div class="success">
      <strong>✅ Connection successful!</strong>
      <p>Successfully connected to the MySQL database.</p>
    </div>
    `;
    
    // Check tables
    html += `<h3>Database Tables</h3><table>
      <tr>
        <th>Table</th>
        <th>Status</th>
        <th>Row Count</th>
      </tr>`;
    
    const tables = ['users', 'photos', 'comments'];
    
    for (const table of tables) {
      try {
        // Check if table exists by querying for it
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        const count = rows[0].count;
        
        html += `
        <tr>
          <td>${table}</td>
          <td><span style="color:green">Exists</span></td>
          <td>${count}</td>
        </tr>`;
      } catch (error) {
        html += `
        <tr>
          <td>${table}</td>
          <td><span style="color:red">Error</span></td>
          <td>Table does not exist or cannot be accessed</td>
        </tr>`;
      }
    }
    
    html += `</table>`;
    
  } catch (error) {
    html += `
    <div class="error">
      <strong>❌ Connection failed!</strong>
      <p>Error: ${error.message}</p>
      <p>Common issues:</p>
      <ul>
        <li>Check your .env.local file for correct credentials</li>
        <li>Verify the database user has permission to access the database</li>
        <li>Ensure the database exists and is properly configured</li>
        <li>Check if your server's MySQL service is running</li>
      </ul>
    </div>`;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
  
  html += `
  </div>
  
  <div style="margin-top: 30px; font-size: 0.8rem; color: #6b7280; text-align: center;">
    <p>Snap Photo Sharing Application - Database Test Script</p>
    <p>Generated on ${new Date().toISOString()}</p>
  </div>
</body>
</html>
  `;
  
  res.end(html);
});

// Start server on a different port
const PORT = process.env.TEST_PORT || 5000;
server.listen(PORT, () => {
  console.log(`Database test server running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop');
}); 