export const BRAND = {
  icon: "/assets/icon.svg",
  icon16: "/assets/icon-16.png",
  icon32: "/assets/icon-32.png",
  icon180: "/assets/icon-180.png",
  icon192: "/assets/icon-192.png",
  icon512: "/assets/icon-512.png",
  logo: "/assets/logo-horizontal.svg",
  logoDark: "/assets/logo-horizontal-dark-bg.svg",
  hero: "/assets/hero-background.svg",
  ogImage: "/assets/og-image.png",
} as const;

export const ogImages = [
  {
    url: BRAND.ogImage,
    width: 1200,
    height: 630,
    alt: "Scrixo — Sign a PDF free, right in your browser",
  },
];
