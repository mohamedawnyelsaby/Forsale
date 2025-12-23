// Copy to: apps/web/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['assets.forsale.app', 'localhost'],
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
