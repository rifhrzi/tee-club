/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Use standalone output for Docker deployment
  output: "standalone",
  experimental: {
    // This will allow Next.js to skip static optimization for API routes
    serverComponentsExternalPackages: ["@prisma/client", "bcrypt"],
  },
  // Ensure proper output for Docker
  outputFileTracing: true,
};

module.exports = nextConfig;
