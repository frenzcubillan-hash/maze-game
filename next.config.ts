import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
};
module.exports = {
  allowedDevOrigins: ['192.168.100.10']
}


export default nextConfig;