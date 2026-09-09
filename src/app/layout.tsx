import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "../lib/providers";
import { BRAND, ogImages } from "@/lib/brand";
import { SITE_ORIGIN } from "@/lib/page-metadata";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: "Scrixo",
  },
  icons: {
    icon: [
      { url: BRAND.icon, type: "image/svg+xml" },
      { url: BRAND.icon16, sizes: "16x16", type: "image/png" },
      { url: BRAND.icon32, sizes: "32x32", type: "image/png" },
      { url: BRAND.icon192, sizes: "192x192", type: "image/png" },
      { url: BRAND.icon512, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: BRAND.icon180, sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    siteName: "Scrixo",
    images: ogImages,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="google-adsense-account" content="ca-pub-6117588691065617" />
      </head>
      <body
        className={[
          inter.variable,
          plusJakartaSans.variable,
          "font-sans antialiased bg-background text-foreground",
        ].join(" ")}
      >
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-N78CJW97VM"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-N78CJW97VM');
            `,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
