import type { Metadata } from "next";
import { SEOToolPage } from "@/components/SEOToolPage";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  path: "/reorder-pdf",
  title: "Reorder PDF Pages Online - Rearrange Pages Free | Scrixo",
  description:
    "Reorder PDF pages online for free with no login required. Rearrange PDF pages, move pages in PDF, organize PDF pages, and change page order instantly. Free PDF page organizer.",
  keywords:
    "rearrange pdf pages online, reorder pdf pages free, move pages in pdf online, organize pdf pages free, change page order pdf, reorder pdf without login",
  index: false,
  openGraphTitle: "Reorder PDF Pages Online - Rearrange Pages Free",
  openGraphDescription:
    "Reorder PDF pages online for free with no login required. Rearrange PDF pages, move pages in PDF, organize PDF pages, and change page order instantly.",
});

export default function ReorderPDFPage() {
  return (
    <SEOToolPage
      mainKeyword="Reorder PDF Pages Online"
      h2Keywords={[
        "Rearrange PDF Pages Free",
        "Move Pages in PDF Online",
        "Organize PDF Pages Free",
        "Change Page Order PDF",
        "Reorder PDF Without Login",
      ]}
      description="Reorder and rearrange PDF pages online for free. Organize your PDF documents by changing page order instantly with no login required."
      tool="rearrange"
      features={[
        "Drag and drop page reordering",
        "Rearrange pages in any order",
        "No account required",
        "No watermarks",
        "Instant reorganization",
        "Visual page preview",
      ]}
    />
  );
}

