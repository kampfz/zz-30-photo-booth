import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The repo lives inside a workspace with its own lockfile; point
  // tracing at this project so Vercel/local builds do not pick up the parent.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
