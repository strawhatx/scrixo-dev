import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/page-metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/edit", "/edit/"],
    },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
