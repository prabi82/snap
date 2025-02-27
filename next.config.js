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
  // Source directory config - tells Next.js where to find the pages/app directories
  distDir: '.next',
  // This is the correct way to specify the source directory
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig; 