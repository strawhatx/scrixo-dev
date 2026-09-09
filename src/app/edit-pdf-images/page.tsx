import type { Metadata } from "next";
import { SEOToolPage } from "@/components/SEOToolPage";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  path: "/edit-pdf-images",
  title: "Add Image to PDF Free - Insert Images Online | Scrixo",
  description:
    "Add image to PDF free with no login required. Insert images into PDF, add logo to PDF, replace images, and edit PDF images online instantly. Free PDF image editor with no watermark.",
  keywords:
    "add image to pdf free, insert image into pdf online, add logo to pdf free, replace image in pdf online, edit pdf images free, add photo to pdf no watermark",
  index: false,
  openGraphTitle: "Add Image to PDF Free - Insert Images Online",
  openGraphDescription:
    "Add image to PDF free with no login required. Insert images into PDF, add logo to PDF, replace images, and edit PDF images online instantly.",
});

export default function EditPDFImagesPage() {
  return (
    <SEOToolPage
      mainKeyword="Add Image to PDF Free"
      h2Keywords={[
        "Insert Image into PDF Online",
        "Add Logo to PDF Free",
        "Replace Image in PDF Online",
        "Edit PDF Images Free",
        "Add Photo to PDF No Watermark",
      ]}
      description="Add images to your PDF documents online for free. Insert photos, logos, or any image into PDF files instantly with no login required and no watermarks."
      tool="image"
      features={[
        "Insert images anywhere on PDF",
        "Add logos and watermarks",
        "Replace existing images",
        "No account required",
        "No watermarks",
        "Instant image insertion",
      ]}
    />
  );
}

