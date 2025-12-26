/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@forsale/database', '@forsale/types', '@forsale/utils'],
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    }
  },
  reactStrictMode: true,
  
  // Pi Network specific headers
  async headers() {
    return [
      {
        // Allow Pi SDK to access the app
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Pi-User-Token',
          },
        ],
      },
      {
        // Health check endpoint
        source: '/api/health',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
}

export default nextConfig
