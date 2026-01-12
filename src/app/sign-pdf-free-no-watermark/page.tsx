import type { Metadata } from "next";
import { SEOToolPage } from "@/components/SEOToolPage";

export const metadata: Metadata = {
  title: "Sign PDF Free No Watermark - Unlimited Signatures | Scrixo",
  description: "Sign PDF free no watermark. Add unlimited signatures to PDF documents with no watermarks, no fees, no limits. Completely free PDF signing tool.",
  keywords: "sign pdf free no watermark, sign pdf no watermark, free pdf signature no watermark, sign pdf without watermark, add signature pdf free, electronic signature free",
  openGraph: {
    title: "Sign PDF Free No Watermark - Unlimited Signatures",
    description: "Sign PDF free no watermark. Add unlimited signatures to PDF documents with no watermarks, no fees, no limits.",
    url: "https://scrixo.com/sign-pdf-free-no-watermark",
    siteName: "Scrixo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign PDF Free No Watermark - Unlimited Signatures",
    description: "Sign PDF free no watermark. Add unlimited signatures to PDF documents with no watermarks, no fees, no limits.",
  },
};

export default function SignPDFFreeNoWatermarkPage() {
  return (
    <SEOToolPage
      mainKeyword="Sign PDF Free No Watermark"
      h2Keywords={[
        "Sign PDF No Watermark",
        "Free PDF Signature No Watermark",
        "Sign PDF Without Watermark",
        "Add Signature PDF Free",
        "Electronic Signature Free",
        "Unlimited PDF Signatures",
      ]}
      description="Sign PDF documents completely free with no watermarks. Unlimited signatures, no fees, no limits. Your documents stay clean and professional."
      tool="sign"
      features={[
        "No watermarks on your documents",
        "100% free forever",
        "Unlimited signatures",
        "No account or login required",
        "Instant results - sign and download immediately",
        "Clean, professional documents",
      ]}
    />
  );
}

