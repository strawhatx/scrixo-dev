import type { Metadata } from "next";
import { SEOToolPage } from "@/components/SEOToolPage";

export const metadata: Metadata = {
  title: "Sign PDF Without Printing - Digital Signature Tool | Scrixo",
  description: "Sign PDF without printing. Add electronic signatures to PDF documents digitally - no printer, no paper, no scanning required. Sign and send instantly.",
  keywords: "sign pdf without printing, sign pdf digitally, sign pdf no printer, electronic signature no printing, sign pdf online no print, digital signature pdf",
  openGraph: {
    title: "Sign PDF Without Printing - Digital Signature Tool",
    description: "Sign PDF without printing. Add electronic signatures to PDF documents digitally - no printer, no paper, no scanning required.",
    url: "https://scrixo.com/sign-pdf-without-printing",
    siteName: "Scrixo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign PDF Without Printing - Digital Signature Tool",
    description: "Sign PDF without printing. Add electronic signatures to PDF documents digitally - no printer, no paper, no scanning required.",
  },
};

export default function SignPDFWithoutPrintingPage() {
  return (
    <SEOToolPage
      mainKeyword="Sign PDF Without Printing"
      h2Keywords={[
        "Sign PDF Digitally",
        "Sign PDF No Printer Required",
        "Electronic Signature No Printing",
        "Sign PDF Online No Print",
        "Digital Signature PDF Free",
      ]}
      description="Sign PDF documents without printing or scanning. Add electronic signatures directly to your PDF - no printer, no paper, no hassle. Sign and send instantly."
      tool="sign"
      features={[
        "No printer needed - sign completely digitally",
        "No paper or scanning required",
        "Sign and send in seconds",
        "100% free with no watermarks",
        "Works on any device - phone, tablet, or computer",
        "Secure electronic signatures",
      ]}
    />
  );
}

