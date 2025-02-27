// Simple static file server for Next.js exported sites
// Run with: node static-server.js

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = process.env.PORT || 3000;
const STATIC_DIR = path.join(__dirname, 'out'); // 'out' is where Next.js exports static files

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Create server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Parse URL
  let pathname = req.url;
  
  // Handle root path
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // Add .html extension for routes without file extensions (Next.js pages)
  if (!path.extname(pathname) && !pathname.endsWith('/')) {
    pathname = `${pathname}.html`;
  } else if (!path.extname(pathname) && pathname.endsWith('/')) {
    pathname = `${pathname}index.html`;
  }
  
  // Get file path
  const filePath = path.join(STATIC_DIR, pathname);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Try to serve 404 page
      const notFoundPath = path.join(STATIC_DIR, '404.html');
      fs.access(notFoundPath, fs.constants.F_OK, (notFoundErr) => {
        if (notFoundErr) {
          // No 404 page, send basic 404
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
          return;
        }
        
        // Serve 404 page
        fs.readFile(notFoundPath, (readErr, content) => {
          if (readErr) {
            res.writeHead(500);
            res.end('Server Error');
            return;
          }
          
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(content);
        });
      });
      return;
    }
    
    // Read and serve the file
    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      
      // Get content type based on file extension
      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Static file server running on port ${PORT}`);
  console.log(`Serving files from ${STATIC_DIR}`);
  console.log(`Memory usage: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`);
}); 