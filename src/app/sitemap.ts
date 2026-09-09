import type { MetadataRoute } from "next";

const BASE = "https://scrixo.com";

const paths: Array<{ path: string; priority: number }> = [
  { path: "/", priority: 1 },
  { path: "/sign-pdf-without-printing", priority: 1 },
  { path: "/sign-pdf", priority: 0.9 },
  { path: "/sign-pdf-on-mac", priority: 0.9 },
  { path: "/sign-pdf-on-chromebook", priority: 0.9 },
  { path: "/sign-a-pdf-on-phone", priority: 0.8 },
  { path: "/sign-pdf-on-iphone", priority: 0.8 },
  { path: "/sign-pdf-on-android", priority: 0.8 },
  { path: "/sign-pdf-mobile", priority: 0.7 },
  { path: "/fill-pdf", priority: 0.7 },
  { path: "/how-to-sign-pdf-and-send-back", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return paths.map(({ path, priority }) => ({
    url: path === "/" ? BASE : `${BASE}${path}`,
    lastModified,
    changeFrequency: "weekly",
    priority,
  }));
}
