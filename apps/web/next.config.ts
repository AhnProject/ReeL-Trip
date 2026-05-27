import type { NextConfig } from "next";

// API_URL: server-side only (no NEXT_PUBLIC_ prefix).
// Set this in Railway/Vercel as API_URL=https://reel-tripapi-production.up.railway.app
// Never set NEXT_PUBLIC_API_URL in production — it exposes the backend URL to the browser
// and causes the browser to bypass the Next.js proxy, triggering CORS errors.
const API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
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
