/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
  // For Vercel deployment
  output: 'standalone',
  // Source directory configuration - fix for "Couldn't find any `pages` or `app` directory"
  experimental: {
    appDir: true,
  },
  // This is the correct and required setting for projects with src directory
  distDir: '.next',
  // Explicitly tell Next.js where your pages/app directories are
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // Set your source directory
  dir: './src',
};

module.exports = nextConfig; 