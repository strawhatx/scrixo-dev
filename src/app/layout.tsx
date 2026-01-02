import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "../lib/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Scrixo",
  description: "Edit PDF documents no signup required",
  keywords: "edit pdf online, sign pdf free, pdf editor, electronic signature, modify pdf text, free pdf tool",
  openGraph: {
    title: "Scrixo",
    description: "Edit PDF documents no signup required",
    url: "https://scrixo.com",
    siteName: "Scrixo",
    images: ["https://scrixo.com/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Scrixo",
    description: "Edit PDF documents no signup required",
    images: ["https://scrixo.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode;}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${plusJakartaSans.variable} font-sans antialiased bg-background text-foreground`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
