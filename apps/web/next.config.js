/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Existing headers, images, webpack config...
  // (Keep everything as is)

  // REMOVE OR COMMENT THIS LINE:
  // output: 'standalone', 

  typescript: {
    ignoreBuildErrors: true,
  },

  // Also remove the eslint block since it's giving a warning
  /* eslint: {
    ignoreDuringBuilds: true,
  },
  */

  env: {
    NEXT_PUBLIC_APP_NAME: 'Forsale',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
};

module.exports = nextConfig;
