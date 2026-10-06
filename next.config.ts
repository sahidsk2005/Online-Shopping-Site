import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  // Dev-only setting: lets the app be opened through preview/proxy hosts
  // (e.g. *.e2b.app) while running `next dev`. Ignored in production builds.
  allowedDevOrigins: ["*.e2b.app", "localhost", "127.0.0.1"]
};
export default nextConfig;
