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
  // These are the updated App Router configurations
  experimental: {
    // No longer need appDir in Next.js 14+ as it's the default
    serverComponentsExternalPackages: [],
  },
  // This is now controlled by output settings
  distDir: '.next',
  // These are standard Next.js settings
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // Add image domains configuration
  images: {
    domains: ['www.caa.gov.om', 'localhost', 'res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.caa.gov.om',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
    ],
  },
  // Increase API body size limit for file uploads (10MB)
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '10mb',
  },
};

module.exports = nextConfig; 