import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Next.js doesn't pick up a stray lockfile
  // higher up the filesystem. The project uses pnpm and lives in this dir.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
