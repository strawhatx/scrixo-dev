import type { Metadata } from "next";
import { SEOToolPage } from "@/components/SEOToolPage";

export const metadata: Metadata = {
  title: "Fill PDF Form Online Free - No Login Required | Scrixo",
  description: "Fill PDF form online free with no login required. Add text fields, checkboxes, and fill PDF forms instantly. Edit PDF form fields online without printing. Free PDF form filler.",
  keywords: "fill pdf form online free, add text fields to pdf, fill and sign pdf free, fill pdf without printing, add checkbox to pdf free, edit pdf form fields online, fill pdf no login",
  openGraph: {
    title: "Fill PDF Form Online Free - No Login Required",
    description: "Fill PDF form online free with no login required. Add text fields, checkboxes, and fill PDF forms instantly.",
    url: "https://scrixo.com/fill-pdf",
    siteName: "Scrixo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fill PDF Form Online Free - No Login Required",
    description: "Fill PDF form online free with no login required. Add text fields, checkboxes, and fill PDF forms instantly.",
  },
};

export default function FillPDFPage() {
  return (
    <SEOToolPage
      mainKeyword="Fill PDF Form Online Free"
      h2Keywords={[
        "Add Text Fields to PDF",
        "Fill and Sign PDF Free",
        "Fill PDF Without Printing",
        "Add Checkbox to PDF Free",
        "Edit PDF Form Fields Online",
        "Fill PDF No Login",
      ]}
      description="Fill PDF forms online for free with no login required. Add text fields, checkboxes, and interactive form elements to your PDF documents instantly."
      tool="field"
      features={[
        "Add text fields to any PDF",
        "Insert checkboxes and radio buttons",
        "Fill forms without printing",
        "No account required",
        "No watermarks",
        "Instant form filling",
      ]}
    />
  );
}

