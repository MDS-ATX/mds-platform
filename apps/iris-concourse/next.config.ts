import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@mds/ui", "@mds/crm", "@mds/data-schemas"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
  async redirects() {
    return [
      {
        source: "/pricing",
        destination: "/concourse/residences",
        permanent: true,
      },
      {
        source: "/residences",
        destination: "/concourse/residences",
        permanent: false,
      },
      {
        source: "/gallery",
        destination: "/concourse/gallery",
        permanent: false,
      },
      {
        source: "/iris/floor-plans",
        destination: "/iris/residences",
        permanent: true,
      },
      {
        source: "/concourse/floor-plans",
        destination: "/concourse/residences",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
