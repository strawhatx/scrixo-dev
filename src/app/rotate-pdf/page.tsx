import type { Metadata } from "next";
import { SEOToolPage } from "@/components/SEOToolPage";

export const metadata: Metadata = {
  title: "Rotate PDF Pages Online Free - Fix Sideways PDFs | Scrixo",
  description: "Rotate PDF pages online free with no login required. Turn PDF pages upright, fix sideways PDFs, rotate scanned PDFs, and rotate PDF instantly. Free PDF rotator with no watermark.",
  keywords: "rotate pdf pages online free, turn pdf pages upright, rotate pdf no login, fix sideways pdf online, rotate scanned pdf free, rotate pdf instantly",
  openGraph: {
    title: "Rotate PDF Pages Online Free - Fix Sideways PDFs",
    description: "Rotate PDF pages online free with no login required. Turn PDF pages upright, fix sideways PDFs, rotate scanned PDFs, and rotate PDF instantly.",
    url: "https://scrixo.com/rotate-pdf",
    siteName: "Scrixo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rotate PDF Pages Online Free - Fix Sideways PDFs",
    description: "Rotate PDF pages online free with no login required. Turn PDF pages upright, fix sideways PDFs, rotate scanned PDFs, and rotate PDF instantly.",
  },
};

export default function RotatePDFPage() {
  return (
    <SEOToolPage
      mainKeyword="Rotate PDF Pages Online Free"
      h2Keywords={[
        "Turn PDF Pages Upright",
        "Rotate PDF No Login",
        "Fix Sideways PDF Online",
        "Rotate Scanned PDF Free",
        "Rotate PDF Instantly",
      ]}
      description="Rotate PDF pages online for free with no login required. Fix sideways or upside-down PDF pages instantly. Perfect for scanned documents."
      tool="rotate"
      features={[
        "Rotate pages 90°, 180°, or 270°",
        "Fix scanned documents",
        "No account required",
        "No watermarks",
        "Instant rotation",
        "Rotate individual pages",
      ]}
    />
  );
}

