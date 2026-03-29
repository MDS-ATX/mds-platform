import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@mds/ui", "@mds/crm", "@mds/data-schemas"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
  async redirects() {
    return [
      {
        source: "/pricing",
        destination: "/residences",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
