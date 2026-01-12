import type { Metadata } from "next";
import { SEOToolPage } from "@/components/SEOToolPage";

export const metadata: Metadata = {
  title: "Sign PDF on Phone Fast - Quick Mobile Signature | Scrixo",
  description: "Sign PDF on phone fast. Add signatures to PDF documents quickly from any phone. Fast, free, and works instantly in your mobile browser.",
  keywords: "sign pdf on phone fast, sign pdf fast, quick pdf signature, fast pdf signer, mobile pdf signature fast, sign pdf quickly, rapid pdf signing",
  openGraph: {
    title: "Sign PDF on Phone Fast - Quick Mobile Signature",
    description: "Sign PDF on phone fast. Add signatures to PDF documents quickly from any phone. Fast, free, and works instantly in your mobile browser.",
    url: "https://scrixo.com/sign-pdf-on-phone-fast",
    siteName: "Scrixo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign PDF on Phone Fast - Quick Mobile Signature",
    description: "Sign PDF on phone fast. Add signatures to PDF documents quickly from any phone. Fast, free, and works instantly in your mobile browser.",
  },
};

export default function SignPDFOnPhoneFastPage() {
  return (
    <SEOToolPage
      mainKeyword="Sign PDF on Phone Fast"
      h2Keywords={[
        "Sign PDF Fast",
        "Quick PDF Signature",
        "Fast PDF Signer",
        "Mobile PDF Signature Fast",
        "Sign PDF Quickly",
        "Rapid PDF Signing",
      ]}
      description="Sign PDF documents fast on your phone. Lightning-quick signing from any mobile device. No waiting, no delays - get it done in seconds."
      tool="sign"
      features={[
        "Lightning-fast signing on mobile",
        "Works on any phone - iPhone, Android, or any device",
        "No app download - instant access",
        "Sign and download in seconds",
        "100% free with no watermarks",
        "Optimized for speed and performance",
      ]}
    />
  );
}

