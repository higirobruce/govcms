import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compile the workspace design-system package (TSX + CSS) from source.
  transpilePackages: ["@govcms/design-system"],
  // Self-contained server bundle for Docker.
  output: "standalone",
  async redirects() {
    return [{ source: "/", destination: "/en", permanent: false }];
  },
};

export default nextConfig;
