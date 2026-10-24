import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Empty turbopack config — required for Next.js 16 (Turbopack is the default).
  // This silences the "webpack config present but no turbopack config" warning.
  turbopack: {},
};

export default nextConfig;
