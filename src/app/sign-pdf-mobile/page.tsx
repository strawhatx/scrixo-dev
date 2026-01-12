import type { Metadata } from "next";
import { SEOToolPage } from "@/components/SEOToolPage";

export const metadata: Metadata = {
  title: "Sign PDF Mobile - Free Mobile PDF Signature | Scrixo",
  description: "Sign PDF mobile on any phone or tablet. Add signatures to PDF documents from your mobile device. Works on iPhone, Android, and all mobile browsers. Free mobile PDF signing.",
  keywords: "sign pdf mobile, sign pdf on mobile, mobile pdf signature, sign pdf phone, sign pdf tablet, mobile pdf signer, sign pdf mobile browser",
  openGraph: {
    title: "Sign PDF Mobile - Free Mobile PDF Signature",
    description: "Sign PDF mobile on any phone or tablet. Add signatures to PDF documents from your mobile device. Works on iPhone, Android, and all mobile browsers.",
    url: "https://scrixo.com/sign-pdf-mobile",
    siteName: "Scrixo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign PDF Mobile - Free Mobile PDF Signature",
    description: "Sign PDF mobile on any phone or tablet. Add signatures to PDF documents from your mobile device. Works on iPhone, Android, and all mobile browsers.",
  },
};

export default function SignPDFMobilePage() {
  return (
    <SEOToolPage
      mainKeyword="Sign PDF Mobile"
      h2Keywords={[
        "Sign PDF on Mobile",
        "Mobile PDF Signature",
        "Sign PDF Phone",
        "Sign PDF Tablet",
        "Mobile PDF Signer",
        "Sign PDF Mobile Browser",
      ]}
      description="Sign PDF documents on any mobile device. Works perfectly on iPhone, Android, iPad, and all mobile browsers. No app download needed - sign directly in your mobile browser."
      tool="sign"
      features={[
        "Works on all mobile devices",
        "iPhone, Android, iPad compatible",
        "No app download required",
        "Touch-optimized signature pad",
        "100% free with no watermarks",
        "Fast mobile signing experience",
      ]}
    />
  );
}

