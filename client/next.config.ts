import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "d31tkeukt9d0fy.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;
