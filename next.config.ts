import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
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
