/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly enable Gzip / Deflate compression for all generated files and API routes
  compress: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
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
