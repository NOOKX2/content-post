import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@prisma/client",
    "@node-rs/argon2",
    "pdfkit",
    "@aws-sdk/client-s3",
  ],
  // Allow larger video uploads through the App Router (self-hosted / Docker).
  experimental: {
    serverActions: {
      bodySizeLimit: "210mb",
    },
    proxyClientMaxBodySize: "210mb",
  },
  // Ensure Thai fonts ship with the PDF API serverless function on Vercel.
  outputFileTracingIncludes: {
    "/api/content/[id]/pdf": ["./public/fonts/**/*"],
  },
};

export default nextConfig;
