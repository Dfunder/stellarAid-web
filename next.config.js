/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly enable Gzip / Deflate compression for all generated files and API routes
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@reduxjs/toolkit', 'date-fns'],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
