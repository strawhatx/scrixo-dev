import type { Metadata } from "next";
import { SEOToolPage } from "@/components/SEOToolPage";
import { pageMetadata } from "@/lib/page-metadata";

const PATH = "/sign-pdf-electronically";

export const metadata: Metadata = pageMetadata({
  path: PATH,
  title: "Sign a PDF Electronically (No Print or Account) | Scrixo",
  description:
    "Sign a PDF electronically in your browser. Draw or type your name on the file, download a clean copy, and send it back — no printing, scanning, or account.",
  keywords:
    "sign pdf electronically, electronic signature pdf, sign pdf digitally, e-signature pdf, electronic pdf signature",
  openGraphTitle: "Sign a PDF Electronically",
  openGraphDescription:
    "Sign a PDF electronically in your browser. Draw or type your name, download, and send it back — no printing or account.",
});

export default function SignPDFElectronicallyPage() {
  return (
    <SEOToolPage
      pathname={PATH}
      mainKeyword="Sign a PDF Electronically"
      h2Keywords={[]}
      description="Sign a PDF electronically in the browser. Draw or type your signature on the original file, download it, and send it back — no printing, scanning, or account."
      explainer="An electronic signature is your name on the PDF itself — drawn, typed, or placed as an image — not a photo of a signed printout. For most “please sign and return” documents, that is what the sender wants."
      tool="sign"
      howToTitle="How to sign a PDF electronically"
      howToSteps={[
        {
          name: "Upload the PDF",
          text: "Drop the file into the tool above. It opens in your browser; nothing is printed and nothing is installed.",
        },
        {
          name: "Add an electronic signature",
          text: "Draw with a mouse, trackpad, or finger, or type your name. Place it on the signature line.",
        },
        {
          name: "Download and send it back",
          text: "Export a clean PDF and attach it to the same email or portal. The file is the signed document.",
        },
      ]}
      sections={[
        {
          heading: "Electronic signature vs a printed one",
          body: "Printing, signing by hand, and scanning produces a picture of paper. Signing electronically keeps the original PDF and puts your name on the line in that file. You avoid a crooked phone photo, a second attachment of JPEGs, and a trip to a printer. If you still need the print-and-scan walkthrough, see [sign a PDF without printing](/sign-pdf-without-printing).",
        },
        {
          heading: "What “electronically” means here",
          body: "Scrixo adds an electronic signature to the PDF: a drawing, typed name, or uploaded image placed on the page. That is the usual meaning of e-sign for school forms, freelance contracts, and permission slips. It is not a cryptographic certificate (the kind of “digital signature” some PDF readers show as a signed identity). If a process requires a certificate, notary, or wet ink, follow those instructions instead.",
        },
        {
          heading: "Is an electronic signature accepted?",
          body: "In the US, the ESIGN Act and similar state laws (such as UETA) recognize electronic signatures on many ordinary documents. The other party still has to accept the signed file — most “sign and return” PDFs do. If the sender requires a handwritten paper copy or a specific e-sign vendor, they will usually say so. Otherwise a signed PDF is what they expect.",
        },
      ]}
      faqs={[
        {
          question: "How do I sign a PDF electronically?",
          answer:
            "Upload the file, draw or type your signature, place it on the page, and download. You can do this on a computer or [phone](/sign-a-pdf-on-phone) in the browser — no account required.",
        },
        {
          question: "Is an electronic signature the same as a digital signature?",
          answer:
            "People often use the words interchangeably. In PDF software, a “digital signature” often means a cryptographic certificate that proves identity. Scrixo applies an electronic signature — your mark on the document — which is what most everyday forms need. It does not issue a certificate.",
        },
        {
          question: "Are electronic signatures legally valid?",
          answer:
            "For many ordinary documents in the US and elsewhere, yes — electronic signatures are recognized by law (ESIGN, UETA, and similar rules). Some documents still require wet ink, a notary, or a specific vendor. Scrixo does not record an audit trail. See [Terms](/terms).",
        },
        {
          question: "Do I need an account to sign electronically?",
          answer:
            "No. Guest signing works in the browser for the session. Download the signed PDF and send it back; nothing is stored on a server in this flow.",
        },
      ]}
      features={[
        "Draw or type an electronic signature",
        "No printing or scanning",
        "No account to start",
        "No watermark on the download",
        "Works in the browser on any device",
        "Fill blanks, then sign, in the same file",
      ]}
    />
  );
}
