// Lightweight server for memory-constrained environments
// This server serves pre-built Next.js files with minimal overhead
// Run with: NODE_ENV=production node lightweight-server.js

const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('url');

// Configuration
const PORT = process.env.PORT || 3000;
const BUILD_DIR = path.join(__dirname, '.next');

// MIME types for common file extensions
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
  
  // Parse the URL
  const parsedUrl = parse(req.url, true);
  let pathname = parsedUrl.pathname;
  
  // Serve static files from .next/static
  if (pathname.startsWith('/_next/static/')) {
    const filePath = path.join(BUILD_DIR, pathname.substring(1));
    const extname = path.extname(filePath);
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
      return;
    } catch (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
  }
  
  // For any other request, serve the pre-rendered HTML if available
  // or redirect to the static 404 page
  let filePath;
  
  // Check for HTML files in .next/server/pages
  if (pathname === '/') {
    filePath = path.join(BUILD_DIR, 'server/pages/index.html');
  } else {
    // Try to find the page HTML
    filePath = path.join(BUILD_DIR, 'server/pages', pathname + '.html');
    
    // If not found, check for directory index
    if (!fs.existsSync(filePath)) {
      filePath = path.join(BUILD_DIR, 'server/pages', pathname, 'index.html');
    }
  }
  
  // Serve the file if it exists
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content, 'utf-8');
  } else {
    // Serve 404 page
    try {
      const notFoundPath = path.join(BUILD_DIR, 'server/pages/404.html');
      if (fs.existsSync(notFoundPath)) {
        const content = fs.readFileSync(notFoundPath);
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(content, 'utf-8');
      } else {
        res.writeHead(404);
        res.end('Page not found');
      }
    } catch (err) {
      res.writeHead(500);
      res.end('Server error');
    }
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Lightweight server running on port ${PORT}`);
  console.log(`Memory usage: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`);
}); 