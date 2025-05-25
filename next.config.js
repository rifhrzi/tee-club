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
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Skip static generation for pages that require database access
  output: "standalone",
  experimental: {
    // Correctly place experimental options here
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
  // Security headers to prevent unwanted script injection
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Content Security Policy to block unwanted external scripts
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; img-src 'self' data: https://images.pexels.com https://images.unsplash.com; font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; connect-src 'self' https://api.midtrans.com https://app.midtrans.com https://api.sandbox.midtrans.com https://app.sandbox.midtrans.com; frame-src 'self' https://app.midtrans.com https://app.sandbox.midtrans.com;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
