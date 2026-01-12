import type { Metadata } from "next";
import { SEOToolPage } from "@/components/SEOToolPage";

export const metadata: Metadata = {
  title: "Sign a PDF on Phone - Quick Mobile Signature | Scrixo",
  description: "Sign a PDF on phone instantly. Add your signature to PDF documents from any phone. Quick, free, and works in any mobile browser. No app download needed.",
  keywords: "sign a pdf on phone, sign pdf on phone, sign pdf phone, phone pdf signature, mobile pdf sign, sign pdf from phone, phone pdf signer",
  openGraph: {
    title: "Sign a PDF on Phone - Quick Mobile Signature",
    description: "Sign a PDF on phone instantly. Add your signature to PDF documents from any phone. Quick, free, and works in any mobile browser.",
    url: "https://scrixo.com/sign-a-pdf-on-phone",
    siteName: "Scrixo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign a PDF on Phone - Quick Mobile Signature",
    description: "Sign a PDF on phone instantly. Add your signature to PDF documents from any phone. Quick, free, and works in any mobile browser.",
  },
};

export default function SignAPDFOnPhonePage() {
  return (
    <SEOToolPage
      mainKeyword="Sign a PDF on Phone"
      h2Keywords={[
        "Sign PDF on Phone",
        "Sign PDF Phone",
        "Phone PDF Signature",
        "Mobile PDF Sign",
        "Sign PDF From Phone",
        "Phone PDF Signer",
      ]}
      description="Sign a PDF on your phone in seconds. Works on any phone - just open in your browser, add your signature, and download. No app download required."
      tool="sign"
      features={[
        "Works on any phone",
        "No app download needed",
        "Sign in your mobile browser",
        "Touch-friendly signature pad",
        "100% free with no watermarks",
        "Quick and easy signing",
      ]}
    />
  );
}

