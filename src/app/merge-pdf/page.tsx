import type { Metadata } from "next";
import { SEOToolPage } from "@/components/SEOToolPage";

export const metadata: Metadata = {
  title: "Merge PDF Files Online Free - Combine PDFs Instantly | Scrixo",
  description: "Merge PDF files online free with no login required. Combine multiple PDFs into one document instantly. Join PDF pages online with no watermark. Free PDF merger tool.",
  keywords: "merge pdf files online free, combine pdf files no login, join pdf pages online, merge multiple pdfs free, combine pdfs instantly, merge pdf without watermark",
  openGraph: {
    title: "Merge PDF Files Online Free - Combine PDFs Instantly",
    description: "Merge PDF files online free with no login required. Combine multiple PDFs into one document instantly.",
    url: "https://scrixo.com/merge-pdf",
    siteName: "Scrixo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Merge PDF Files Online Free - Combine PDFs Instantly",
    description: "Merge PDF files online free with no login required. Combine multiple PDFs into one document instantly.",
  },
};

export default function MergePDFPage() {
  return (
    <SEOToolPage
      mainKeyword="Merge PDF Files Online Free"
      h2Keywords={[
        "Combine PDF Files No Login",
        "Join PDF Pages Online",
        "Merge Multiple PDFs Free",
        "Combine PDFs Instantly",
        "Merge PDF Without Watermark",
      ]}
      description="Merge multiple PDF files into one document online for free. Combine PDFs instantly with no login required and no watermarks."
      tool="merge"
      features={[
        "Merge unlimited PDF files",
        "Combine PDFs in any order",
        "No account required",
        "No watermarks",
        "Instant merging",
        "Works in your browser",
      ]}
    />
  );
}

