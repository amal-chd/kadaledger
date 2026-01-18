import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  pageExtensions: ["ts", "tsx"],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Skip static optimization for API routes
  skipTrailingSlashRedirect: true,
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: `${process.env.BACKEND_URL || 'http://localhost:4000'}/:path*`,
  //     },
  //   ];
  // },
};

export default nextConfig;
