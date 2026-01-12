import type { Metadata } from "next";
import { SEOToolPage } from "@/components/SEOToolPage";

export const metadata: Metadata = {
  title: "Sign PDF Online Free - No Account Required | Scrixo",
  description: "Sign PDF online free with no account required. Add signatures to PDF documents instantly. 100% free, no login, no watermark. Free online PDF signature tool.",
  keywords: "sign pdf online free, sign pdf free online, free pdf signature, sign pdf online no account, free online pdf signer, sign pdf online no login",
  openGraph: {
    title: "Sign PDF Online Free - No Account Required",
    description: "Sign PDF online free with no account required. Add signatures to PDF documents instantly. 100% free, no login, no watermark.",
    url: "https://scrixo.com/sign-pdf-online-free",
    siteName: "Scrixo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign PDF Online Free - No Account Required",
    description: "Sign PDF online free with no account required. Add signatures to PDF documents instantly. 100% free, no login, no watermark.",
  },
};

export default function SignPDFOnlineFreePage() {
  return (
    <SEOToolPage
      mainKeyword="Sign PDF Online Free"
      h2Keywords={[
        "Sign PDF Free Online",
        "Free PDF Signature",
        "Sign PDF Online No Account",
        "Free Online PDF Signer",
        "Sign PDF Online No Login",
        "Free PDF Signer Online",
      ]}
      description="Sign PDF documents online for free with no account required. Add signatures instantly - no login, no watermark, no hidden fees. Completely free online PDF signing."
      tool="sign"
      features={[
        "100% free forever",
        "No account or login required",
        "No watermarks on your documents",
        "Sign and download instantly",
        "Works in any browser",
        "Secure and private",
      ]}
    />
  );
}

