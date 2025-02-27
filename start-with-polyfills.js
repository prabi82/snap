// Polyfill Fetch API for Node.js 16
// This file adds global.Request and other required objects
// Run with: node start-with-polyfills.js

// Add the undici polyfills
const { fetch, Request, Response, Headers } = require('undici');

// Add these to the global namespace
global.fetch = fetch;
global.Request = Request;
global.Response = Response;
global.Headers = Headers;

// Output diagnostics
console.log('✅ Added Fetch API polyfills to global namespace');
console.log('Starting server with Next.js compatibility layer...');

// Now load the actual server
require('./server.js'); 