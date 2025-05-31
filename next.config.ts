import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for deployment flexibility
  // output: 'export', // Uncomment for static site deployment
  // trailingSlash: true, // Uncomment for static site deployment
  // skipTrailingSlashRedirect: true, // Uncomment for static site deployment
  
  // Image optimization for production
  images: {
    unoptimized: false, // Set to true for static export
  },
  
  // Environment variables that should be available on client side
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  
  // Webpack configuration for better builds
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Important: return the modified config
    return config;
  },
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
  
  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
