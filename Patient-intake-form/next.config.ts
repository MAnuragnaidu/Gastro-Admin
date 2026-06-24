import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Monorepo has a root package-lock.json; pin this app so `@/*` resolves under Patient-intake-form/
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
