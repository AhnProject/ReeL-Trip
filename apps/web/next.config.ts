import type { NextConfig } from "next";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5173";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:5173",
        APP_URL.replace(/^https?:\/\//, ""),
      ],
    },
  },
};

export default nextConfig;
