#!/bin/bash
# Script to run the Node.js server with the correct environment

# Activate the Node.js environment
source /home/onlyoman/nodevenv/public_html/snap.onlyoman.com/19/bin/activate

# Run the server
NODE_ENV=production node $1

echo "Server started with $1"
echo "Press Ctrl+C to stop" 