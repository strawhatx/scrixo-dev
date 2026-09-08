import type { Metadata } from "next";
import { SEOToolPage } from "@/components/SEOToolPage";

export const metadata: Metadata = {
  title: "Split PDF Pages Online Free - Extract Pages Instantly | Scrixo",
  description: "Split PDF pages online free with no signup required. Extract pages from PDF, separate PDF pages, and cut PDF pages instantly. Free PDF splitter with no watermark.",
  keywords: "split pdf pages online free, extract pages from pdf free, split pdf no signup, separate pdf pages online, cut pdf pages free, split pdf instantly",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Split PDF Pages Online Free - Extract Pages Instantly",
    description: "Split PDF pages online free with no signup required. Extract pages from PDF, separate PDF pages, and cut PDF pages instantly.",
    url: "https://scrixo.com/split-pdf",
    siteName: "Scrixo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Split PDF Pages Online Free - Extract Pages Instantly",
    description: "Split PDF pages online free with no signup required. Extract pages from PDF, separate PDF pages, and cut PDF pages instantly.",
  },
};

export default function SplitPDFPage() {
  return (
    <SEOToolPage
      mainKeyword="Split PDF Pages Online Free"
      h2Keywords={[
        "Extract Pages from PDF Free",
        "Split PDF No Signup",
        "Separate PDF Pages Online",
        "Cut PDF Pages Free",
        "Split PDF Instantly",
      ]}
      description="Split your PDF documents into separate pages online for free. Extract specific pages from PDF files instantly with no signup required."
      tool="split"
      features={[
        "Extract individual pages",
        "Split PDF into multiple files",
        "No account required",
        "No watermarks",
        "Instant splitting",
        "Select specific pages",
      ]}
    />
  );
}

