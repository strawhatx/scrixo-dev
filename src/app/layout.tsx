import type { Metadata } from "next";
import Script from "next/script";
import {
  Cedarville_Cursive,
  Dawning_of_a_New_Day,
  Homemade_Apple,
  Inter,
  Kristi,
  Mr_Dafoe,
  Ms_Madi,
  Nanum_Pen_Script,
  Plus_Jakarta_Sans,
  Rock_Salt,
  Sacramento,
  Schoolbell,
  Mrs_Saint_Delafield,
  Zeyada,
} from "next/font/google";
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

// Signature fonts (typed signature picker)
const sigSacramento = Sacramento({ subsets: ["latin"], weight: "400", variable: "--font-sig-sacramento" });
const sigZeyada = Zeyada({ subsets: ["latin"], weight: "400", variable: "--font-sig-zeyada" });
const sigNanumPenScript = Nanum_Pen_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sig-nanum-pen-script",
});
const sigMrDafoe = Mr_Dafoe({ subsets: ["latin"], weight: "400", variable: "--font-sig-mr-dafoe" });
const sigHomemadeApple = Homemade_Apple({ subsets: ["latin"], weight: "400", variable: "--font-sig-homemade-apple" });
const sigRockSalt = Rock_Salt({ subsets: ["latin"], weight: "400", variable: "--font-sig-rock-salt" });
const sigMrsSaintDelafield = Mrs_Saint_Delafield({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sig-mrs-saint-delafield",
});
const sigCedarvilleCursive = Cedarville_Cursive({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sig-cedarville-cursive",
});
const sigKristi = Kristi({ subsets: ["latin"], weight: "400", variable: "--font-sig-kristi" });
const sigDawningOfANewDay = Dawning_of_a_New_Day({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sig-dawning-of-a-new-day",
});
const sigSchoolbell = Schoolbell({ subsets: ["latin"], weight: "400", variable: "--font-sig-schoolbell" });
const sigMsMadi = Ms_Madi({ subsets: ["latin"], weight: "400", variable: "--font-sig-ms-madi" });

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
};;


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode; }>) {
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
          sigSacramento.variable,
          sigZeyada.variable,
          sigNanumPenScript.variable,
          sigMrDafoe.variable,
          sigHomemadeApple.variable,
          sigRockSalt.variable,
          sigMrsSaintDelafield.variable,
          sigCedarvilleCursive.variable,
          sigKristi.variable,
          sigDawningOfANewDay.variable,
          sigSchoolbell.variable,
          sigMsMadi.variable,
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
