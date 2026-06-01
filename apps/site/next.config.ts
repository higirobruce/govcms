import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compile the workspace design-system package (TSX + CSS) from source.
  transpilePackages: ["@govcms/design-system"],
  async redirects() {
    return [{ source: "/", destination: "/en", permanent: false }];
  },
};

export default nextConfig;
