import type { Metadata } from "next";
import { ogImages } from "@/lib/brand";
import { SEOToolPage } from "@/components/SEOToolPage";

const PATH = "/fill-pdf";

export const metadata: Metadata = {
  title: "Fill and Sign a PDF Online Free | Scrixo",
  description:
    "Fill a PDF form online free, then sign it. Add text fields and checkboxes without printing. No login required.",
  keywords:
    "fill pdf form online free, fill and sign pdf free, fill pdf without printing, add text fields to pdf, fill pdf no login",
  alternates: { canonical: `https://scrixo.com${PATH}` },
  openGraph: {
    title: "Fill and Sign a PDF Online Free",
    description: "Fill a PDF form online free, then sign it. No printing, no login.",
    url: `https://scrixo.com${PATH}`,
    siteName: "Scrixo",
    images: ogImages,
  },
  twitter: {
    card: "summary_large_image",
    images: ogImages,
    title: "Fill and Sign a PDF Online Free",
    description: "Fill a PDF form online free, then sign it. No printing, no login.",
  },
};

export default function FillPDFPage() {
  return (
    <SEOToolPage
      pathname={PATH}
      mainKeyword="Fill and Sign a PDF"
      h2Keywords={[]}
      description="Fill a PDF form online free, then sign it. Add text, checkboxes, and your signature in the browser — no printing and no account."
      explainer="Most “sign and return” PDFs also have blanks. Fill those first, then place a signature on the same file so you send back one complete document."
      tool="field"
      ctaLabel="Fill this PDF — 100% Free"
      howToTitle="How to fill and sign a PDF"
      howToSteps={[
        {
          name: "Upload the form",
          text: "Drop in the PDF. You will get tools to add text and checkboxes on the page.",
        },
        {
          name: "Fill the blanks",
          text: "Place text where the form asks for a name, date, or other details. Check boxes if you need them.",
        },
        {
          name: "Sign and download",
          text: "Switch to Sign, add your signature, and export one PDF to send back.",
        },
      ]}
      sections={[
        {
          heading: "Fill without printing",
          body: "You do not need to print a form to write on it. Type on the PDF, then sign. If printing is the whole problem, see [how to sign a PDF without printing](/sign-pdf-without-printing).",
        },
        {
          heading: "Fill and sign in one sitting",
          body: "The fill tools and the signature pad are in the same editor. Prefer to [sign only](/sign-pdf)? Same upload, skip the blanks.",
        },
      ]}
      faqs={[
        {
          question: "Can I fill and sign in the same PDF?",
          answer:
            "Yes. Add text, then use Sign to place your signature before you download. Or start from [sign a PDF](/sign-pdf) if the form is already filled.",
        },
        {
          question: "Do I need an account to fill a form?",
          answer: "No. Guest filling and signing work in the browser without a login.",
        },
        {
          question: "Will the other person be able to edit my answers?",
          answer:
            "Text you overlay is flattened into the exported PDF as content on the page, not as a live AcroForm they can easily tweak.",
        },
      ]}
      features={[
        "Add text anywhere on the page",
        "Checkboxes for forms",
        "Sign on the same file",
        "No printing",
        "No account",
        "No watermark",
      ]}
    />
  );
}
