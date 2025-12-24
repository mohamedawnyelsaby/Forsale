// Forsale Web App Configuration
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@forsale/database', '@forsale/types', '@forsale/utils'],
};

export default nextConfig;
