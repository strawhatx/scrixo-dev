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
      // Same search intent as /sign-a-pdf-on-phone — do not keep a competing URL.
      {
        source: "/sign-pdf-on-phone-fast",
        destination: "/sign-a-pdf-on-phone",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
