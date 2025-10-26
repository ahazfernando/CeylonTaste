/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
    ],
    unoptimized: true,
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig

