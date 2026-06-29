/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },

  // IMPORTANT for GitHub Pages
  basePath: isProd ? "/maze-game" : "",

  trailingSlash: true,
};

export default nextConfig;