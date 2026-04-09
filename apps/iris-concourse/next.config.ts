import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [100],
  },
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
