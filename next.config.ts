import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // Next.js 16 blocks the image optimizer from fetching local IPs (localhost →
    // 127.0.0.1) by default. The MinIO object store runs on localhost:9000 in dev,
    // so allow it here. DEV ONLY — in production MinIO/S3 has a public host, so do
    // not ship this flag to prod (remove it or gate behind NODE_ENV).
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      // MinIO object store (admin/seller uploads) in local dev. Backend images
      // are normally rendered with `unoptimized`, but allowing the host here is
      // a safety net so a forgotten `unoptimized` doesn't crash the page.
      // For production, add the real S3/MinIO public host here too.
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
      },
    ],
  },
}

export default nextConfig
