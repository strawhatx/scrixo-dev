import type { Metadata } from "next";
import { ogImages } from "@/lib/brand";

export const SITE_ORIGIN = "https://scrixo.com";

/** Homepage stays origin with no trailing slash; other paths are relative and resolve via metadataBase. */
export function canonicalPath(path: string): string {
  return path === "/" ? SITE_ORIGIN : path;
}

export function absoluteUrl(path: string): string {
  return path === "/" ? SITE_ORIGIN : `${SITE_ORIGIN}${path}`;
}

/**
 * Self-canonical metadata for one URL. Pass the page's own path — never "/".
 * Root layout must not set alternates.canonical or openGraph.url, or children inherit the homepage.
 */
export function pageMetadata({
  path,
  title,
  description,
  keywords,
  index = true,
  openGraphTitle,
  openGraphDescription,
}: {
  path: string;
  title: string;
  description: string;
  keywords?: string;
  index?: boolean;
  openGraphTitle?: string;
  openGraphDescription?: string;
}): Metadata {
  const canonical = canonicalPath(path);
  const ogTitle = openGraphTitle ?? title;
  const ogDescription = openGraphDescription ?? description;

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    ...(index ? {} : { robots: { index: false, follow: false } }),
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      siteName: "Scrixo",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ogImages,
    },
  };
}
