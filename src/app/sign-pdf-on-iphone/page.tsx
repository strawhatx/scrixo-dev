import type { Metadata } from "next";
import { SEOToolPage } from "@/components/SEOToolPage";

export const metadata: Metadata = {
  title: "Sign PDF on iPhone - Mobile PDF Signature Tool | Scrixo",
  description: "Sign PDF on iPhone instantly. Add your signature to PDF documents right from your iPhone browser. No app download required. Free mobile PDF signature tool.",
  keywords: "sign pdf on iphone, sign pdf iphone, sign pdf mobile, sign pdf on phone, iphone pdf signature, mobile pdf signer, sign pdf ios",
  openGraph: {
    title: "Sign PDF on iPhone - Mobile PDF Signature Tool",
    description: "Sign PDF on iPhone instantly. Add your signature to PDF documents right from your iPhone browser. No app download required.",
    url: "https://scrixo.com/sign-pdf-on-iphone",
    siteName: "Scrixo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign PDF on iPhone - Mobile PDF Signature Tool",
    description: "Sign PDF on iPhone instantly. Add your signature to PDF documents right from your iPhone browser. No app download required.",
  },
};

export default function SignPDFOniPhonePage() {
  return (
    <SEOToolPage
      mainKeyword="Sign PDF on iPhone"
      h2Keywords={[
        "Sign PDF iPhone",
        "Sign PDF Mobile",
        "Sign PDF on Phone",
        "iPhone PDF Signature",
        "Mobile PDF Signer",
        "Sign PDF iOS",
      ]}
      description="Sign PDF documents directly on your iPhone. Works perfectly in Safari - no app download needed. Draw your signature with your finger and add it to PDFs instantly."
      tool="sign"
      features={[
        "Works perfectly on iPhone Safari",
        "No app download required",
        "Touch-friendly signature pad",
        "Sign with your finger or stylus",
        "100% free with no watermarks",
        "Fast and secure mobile signing",
      ]}
    />
  );
}

