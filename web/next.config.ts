import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The repo root contains non-app dirs (design/, docs); pin resolution here.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
