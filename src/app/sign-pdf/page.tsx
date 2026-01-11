import type { Metadata } from "next";
import { SEOToolPage } from "@/components/SEOToolPage";

export const metadata: Metadata = {
  title: "Sign PDF Online Free - No Login Required | Scrixo",
  description: "Sign PDF online free with no watermark and no login required. Add electronic signature to PDF instantly. Draw signature on PDF or type your signature. Free PDF signing tool.",
  keywords: "sign pdf online free, add signature to pdf free, sign pdf without watermark, sign pdf no login, electronic signature pdf free, draw signature on pdf online, sign and download pdf instantly",
  openGraph: {
    title: "Sign PDF Online Free - No Login Required",
    description: "Sign PDF online free with no watermark and no login required. Add electronic signature to PDF instantly.",
    url: "https://scrixo.com/sign-pdf",
    siteName: "Scrixo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign PDF Online Free - No Login Required",
    description: "Sign PDF online free with no watermark and no login required. Add electronic signature to PDF instantly.",
  },
};

export default function SignPDFPage() {
  return (
    <SEOToolPage
      mainKeyword="Sign PDF Online Free"
      h2Keywords={[
        "Add Signature to PDF Free",
        "Sign PDF Without Watermark",
        "Sign PDF No Login",
        "Electronic Signature PDF Free",
        "Draw Signature on PDF Online",
        "Sign and Download PDF Instantly",
      ]}
      description="Sign your PDF documents online for free with no login required. Add electronic signatures instantly with no watermarks. Draw your signature or type it - your choice."
      tool="sign"
      features={[
        "100% free - no hidden costs",
        "No account or login required",
        "No watermarks on your documents",
        "Instant results - sign and download immediately",
        "Works in your browser - no software download",
        "Secure - all processing happens locally",
      ]}
    />
  );
}

