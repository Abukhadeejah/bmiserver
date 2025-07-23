/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove 'output: export' - not needed for Capacitor apps with API routes
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Remove assetPrefix for development
  // assetPrefix: './',
}

module.exports = nextConfig
