import type { Metadata } from "next";
import { ogImages } from "@/lib/brand";
import { SEOToolPage } from "@/components/SEOToolPage";

export const metadata: Metadata = {
  title: "Annotate PDF Online Free - Highlight, Comment & Draw | Scrixo",
  description: "Annotate PDF online free with no login required. Highlight PDF text, add comments, draw on PDF, and mark up documents instantly. Free PDF annotation tool with no watermark.",
  keywords: "annotate pdf online free, highlight pdf text free, add comments to pdf online, draw on pdf free, mark up pdf online no login, underline pdf text free, add notes to pdf without watermark",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Annotate PDF Online Free - Highlight, Comment & Draw",
    description: "Annotate PDF online free with no login required. Highlight PDF text, add comments, draw on PDF, and mark up documents instantly.",
    url: "https://scrixo.com/annotate-pdf",
    siteName: "Scrixo",
    images: ogImages,
  },
  twitter: {
    card: "summary_large_image",
    images: ogImages,
    title: "Annotate PDF Online Free - Highlight, Comment & Draw",
    description: "Annotate PDF online free with no login required. Highlight PDF text, add comments, draw on PDF, and mark up documents instantly.",
  },
};

export default function AnnotatePDFPage() {
  return (
    <SEOToolPage
      mainKeyword="Annotate PDF Online Free"
      h2Keywords={[
        "Highlight PDF Text Free",
        "Add Comments to PDF Online",
        "Draw on PDF Free",
        "Mark Up PDF Online No Login",
        "Underline PDF Text Free",
        "Add Notes to PDF Without Watermark",
      ]}
      description="Annotate your PDF documents online for free. Highlight text, add comments, draw annotations, and mark up PDFs instantly with no login required."
      tool="draw"
      features={[
        "Highlight and underline text",
        "Add comments and notes",
        "Draw freehand annotations",
        "No account required",
        "No watermarks",
        "Instant results",
      ]}
    />
  );
}

