import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@mds/ui", "@mds/crm", "@mds/data-schemas"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
