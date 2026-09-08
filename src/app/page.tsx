import type { Metadata } from "next";
import Landing from "@/components/Landing";

export const metadata: Metadata = {
  title: "Sign a PDF Free — No Account, No Printing | Scrixo",
  description:
    "Sign a PDF free in your browser. No account, no printing, no scanning. Draw or type your signature and download a clean file you can send back.",
  keywords:
    "sign pdf free, sign a pdf, sign pdf without printing, electronic signature, sign pdf no account, sign pdf online",
  alternates: { canonical: "https://scrixo.com" },
  openGraph: {
    title: "Sign a PDF Free — No Account, No Printing | Scrixo",
    description:
      "Sign a PDF free in your browser. No account, no printing, no scanning. Draw or type your signature and download instantly.",
    url: "https://scrixo.com",
    siteName: "Scrixo",
    images: ["https://scrixo.com/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign a PDF Free — No Account, No Printing | Scrixo",
    description:
      "Sign a PDF free in your browser. No account, no printing, no scanning. Draw or type your signature and download instantly.",
    images: ["https://scrixo.com/og-image.png"],
  },
};

export default function Home() {
  return <Landing />;
}
