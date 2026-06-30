import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "@node-rs/argon2"],
};

export default nextConfig;
