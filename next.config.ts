/** @type {import('next').NextConfig} */
const nextConfig = {           // enable static export mode
  trailingSlash: true,        // add trailing slash to paths
  images: {
    unoptimized: true,        // disable Next.js image optimization (needed for static export)
  },
  typescript: {
    ignoreBuildErrors: true,  // allow build to pass despite TS errors
  },
  eslint: {
    ignoreDuringBuilds: true, // allow build to pass despite ESLint errors
  },
};

module.exports = nextConfig;
