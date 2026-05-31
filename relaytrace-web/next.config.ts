import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.0.0.25"],
  // Produces a self-contained server in .next/standalone (~no node_modules needed).
  // Reduces the production Docker image from ~1.2 GB to ~150 MB.
  output: "standalone",
};

export default nextConfig;
