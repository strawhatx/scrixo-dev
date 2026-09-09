import type { Metadata } from "next";
import { ogImages } from "@/lib/brand";
import { SEOToolPage } from "@/components/SEOToolPage";

export const metadata: Metadata = {
  title: "Sign PDF Electronically - Digital Signature Tool | Scrixo",
  description: "Sign PDF electronically with digital signatures. Add electronic signatures to PDF documents instantly. Free, secure, and legally valid electronic signatures.",
  keywords: "sign pdf electronically, electronic signature pdf, digital signature pdf, sign pdf digitally, e-signature pdf, electronic pdf signature",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Sign PDF Electronically - Digital Signature Tool",
    description: "Sign PDF electronically with digital signatures. Add electronic signatures to PDF documents instantly. Free, secure, and legally valid electronic signatures.",
    url: "https://scrixo.com/sign-pdf-electronically",
    siteName: "Scrixo",
    images: ogImages,
  },
  twitter: {
    card: "summary_large_image",
    images: ogImages,
    title: "Sign PDF Electronically - Digital Signature Tool",
    description: "Sign PDF electronically with digital signatures. Add electronic signatures to PDF documents instantly. Free, secure, and legally valid electronic signatures.",
  },
};

export default function SignPDFElectronicallyPage() {
  return (
    <SEOToolPage
      mainKeyword="Sign PDF Electronically"
      h2Keywords={[
        "Electronic Signature PDF",
        "Digital Signature PDF",
        "Sign PDF Digitally",
        "E-Signature PDF",
        "Electronic PDF Signature",
        "Digital PDF Signer",
      ]}
      description="Sign PDF documents electronically with secure digital signatures. Add legally valid electronic signatures to your PDFs instantly - no printing, no scanning required."
      tool="sign"
      features={[
        "Legally valid electronic signatures",
        "Secure digital signatures",
        "No printing or scanning needed",
        "100% free with no watermarks",
        "Instant electronic signing",
        "Works on any device",
      ]}
    />
  );
}

