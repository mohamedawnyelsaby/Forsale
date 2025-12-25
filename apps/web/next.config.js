/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@forsale/database', '@forsale/types', '@forsale/utils'],
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    }
  },
  // تأكيد إننا بنستخدم App Router فقط
  reactStrictMode: true,
}

export default nextConfig
