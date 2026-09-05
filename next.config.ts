import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep development from adding generated agent files to the skeleton.
  agentRules: false,
};

export default nextConfig;
