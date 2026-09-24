/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Three.js ships ESM that transpiles cleanly; keeping it out of the SWC
  // server-compile path avoids the occasional "require() of ES Module" error.
  transpilePackages: ['three'],
  eslint: {
    // Lint runs as its own CI step (`npm run lint`) so a stylistic warning
    // can never block a production deploy.
    ignoreDuringBuilds: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  // Long-lived, content-hashed static assets.
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
};

export default nextConfig;
