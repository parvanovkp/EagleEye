import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      timeout: 60000, // 60 seconds
      bodySizeLimit: '2mb'
    }
  }
};

export default nextConfig;