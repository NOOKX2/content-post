import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@prisma/client",
    "@node-rs/argon2",
    "pdfkit",
    "@aws-sdk/client-s3",
  ],
  // Ensure Thai fonts ship with the PDF API serverless function on Vercel.
  outputFileTracingIncludes: {
    "/api/content/[id]/pdf": ["./public/fonts/**/*"],
  },
};

export default nextConfig;
