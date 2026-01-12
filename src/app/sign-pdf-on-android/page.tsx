import type { Metadata } from "next";
import { SEOToolPage } from "@/components/SEOToolPage";

export const metadata: Metadata = {
  title: "Sign PDF on Android - Mobile PDF Signature | Scrixo",
  description: "Sign PDF on Android instantly. Add your signature to PDF documents right from your Android phone browser. No app download required. Free mobile PDF signature tool.",
  keywords: "sign pdf on android, sign pdf android, android pdf signature, sign pdf on phone android, mobile pdf signer android, sign pdf mobile android",
  openGraph: {
    title: "Sign PDF on Android - Mobile PDF Signature",
    description: "Sign PDF on Android instantly. Add your signature to PDF documents right from your Android phone browser. No app download required.",
    url: "https://scrixo.com/sign-pdf-on-android",
    siteName: "Scrixo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign PDF on Android - Mobile PDF Signature",
    description: "Sign PDF on Android instantly. Add your signature to PDF documents right from your Android phone browser. No app download required.",
  },
};

export default function SignPDFOnAndroidPage() {
  return (
    <SEOToolPage
      mainKeyword="Sign PDF on Android"
      h2Keywords={[
        "Sign PDF Android",
        "Android PDF Signature",
        "Sign PDF on Phone Android",
        "Mobile PDF Signer Android",
        "Sign PDF Mobile Android",
        "Android PDF Signer Free",
      ]}
      description="Sign PDF documents directly on your Android phone. Works perfectly in Chrome - no app download needed. Draw your signature with your finger and add it to PDFs instantly."
      tool="sign"
      features={[
        "Works perfectly on Android Chrome",
        "No app download required",
        "Touch-friendly signature pad",
        "Sign with your finger or stylus",
        "100% free with no watermarks",
        "Fast and secure mobile signing",
      ]}
    />
  );
}

