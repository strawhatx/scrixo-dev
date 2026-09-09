import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Dead/saturated SEO URLs — consolidate into the live sign tool.
      {
        source: "/sign-pdf-no-account",
        destination: "/sign-pdf",
        statusCode: 301,
      },
      {
        source: "/sign-pdf-online-free",
        destination: "/sign-pdf",
        statusCode: 301,
      },
      {
        source: "/sign-pdf-free-no-watermark",
        destination: "/sign-pdf",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
