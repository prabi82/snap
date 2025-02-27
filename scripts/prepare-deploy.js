const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Deployment directory
const deployDir = path.join(__dirname, '..', 'deploy');

// Source directory
const srcDir = path.join(__dirname, '..');

// Directories and files to copy
const itemsToCopy = [
  { src: '.next', dest: '.next', isDir: true },
  { src: 'public', dest: 'public', isDir: true },
  { src: 'package.json', dest: 'package.json', isDir: false },
  { src: 'package-lock.json', dest: 'package-lock.json', isDir: false },
  { src: 'next.config.js', dest: 'next.config.js', isDir: false },
  { src: 'server.js', dest: 'server.js', isDir: false },
  { src: path.join('src', 'lib', 'schema.sql'), dest: path.join('src', 'lib', 'schema.sql'), isDir: false }
];

// Create deploy directory if it doesn't exist
console.log('Creating deployment package...');
if (!fs.existsSync(deployDir)) {
  fs.mkdirSync(deployDir, { recursive: true });
}

// Create src/lib directory in deploy folder
const libDir = path.join(deployDir, 'src', 'lib');
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

// Copy files and directories
itemsToCopy.forEach(item => {
  const srcPath = path.join(srcDir, item.src);
  const destPath = path.join(deployDir, item.dest);
  
  // Skip if source doesn't exist
  if (!fs.existsSync(srcPath)) {
    console.log(`Warning: ${srcPath} does not exist, skipping...`);
    return;
  }
  
  // Make sure parent directory exists
  const parentDir = path.dirname(destPath);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }
  
  if (item.isDir) {
    // Copy directory recursively
    console.log(`Copying directory: ${item.src} -> ${item.dest}`);
    copyDirectoryRecursive(srcPath, destPath);
  } else {
    // Copy file
    console.log(`Copying file: ${item.src} -> ${item.dest}`);
    fs.copyFileSync(srcPath, destPath);
  }
});

// Create .env.local.template in deploy folder
console.log('Creating production environment file template...');
const envContent = `# Production Environment Variables
# Replace these values with your production settings
DB_HOST=localhost
DB_USER=production_username
DB_PASSWORD=production_password
DB_NAME=production_database
JWT_SECRET=production_jwt_secret_key
NODE_ENV=production
`;

fs.writeFileSync(path.join(deployDir, '.env.local.template'), envContent);

console.log('Deployment package created in the "deploy" folder.');
console.log('Please update the .env.local.template file with your production settings before uploading.');
console.log('Refer to DEPLOYMENT.md for detailed instructions on uploading to cPanel.');

// Helper function to copy directory recursively
function copyDirectoryRecursive(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  // Get all files and directories in source
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  // Copy each entry
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively copy directory
      copyDirectoryRecursive(srcPath, destPath);
    } else {
      // Copy file
      fs.copyFileSync(srcPath, destPath);
    }
  }
} 