// Script to create symbolic links for Vercel deployment
const fs = require('fs');
const path = require('path');

// Paths to link
const linkPairs = [
  { source: 'src/app', target: 'app' },
  { source: 'src/pages', target: 'pages' },
];

console.log('Creating symbolic links for Vercel deployment...');

// Create each link
for (const { source, target } of linkPairs) {
  const sourcePath = path.resolve(__dirname, source);
  const targetPath = path.resolve(__dirname, target);
  
  // Skip if target already exists
  if (fs.existsSync(targetPath)) {
    console.log(`${target} already exists, skipping...`);
    continue;
  }
  
  // Ensure source exists
  if (!fs.existsSync(sourcePath)) {
    console.error(`Error: Source path ${sourcePath} does not exist!`);
    continue;
  }
  
  try {
    // On Windows, we need to use junction instead of symlink for directories
    if (process.platform === 'win32') {
      fs.symlinkSync(sourcePath, targetPath, 'junction');
    } else {
      fs.symlinkSync(sourcePath, targetPath);
    }
    console.log(`Created symbolic link: ${source} -> ${target}`);
  } catch (error) {
    console.error(`Error creating symbolic link for ${source}:`, error.message);
  }
}

console.log('Done creating symbolic links.'); 