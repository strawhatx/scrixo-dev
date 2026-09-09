import type { Metadata } from "next";
import { ogImages } from "@/lib/brand";
import { SEOToolPage } from "@/components/SEOToolPage";

const PATH = "/how-to-sign-pdf-and-send-back";

export const metadata: Metadata = {
  title: "How to Sign a PDF and Send It Back | Scrixo",
  description:
    "Sign a PDF and send it back in three steps: upload, sign, download. No printing, no scanning, no account.",
  keywords:
    "how to sign pdf and send back, sign pdf and send, sign pdf return, sign pdf and email back, how to electronically sign pdf",
  alternates: { canonical: `https://scrixo.com${PATH}` },
  openGraph: {
    title: "How to Sign a PDF and Send It Back",
    description: "Sign a PDF and send it back in three steps: upload, sign, download. No printing or scanning.",
    url: `https://scrixo.com${PATH}`,
    siteName: "Scrixo",
    images: ogImages,
  },
  twitter: {
    card: "summary_large_image",
    images: ogImages,
    title: "How to Sign a PDF and Send It Back",
    description: "Sign a PDF and send it back in three steps: upload, sign, download. No printing or scanning.",
  },
};

export default function HowToSignPDFAndSendBackPage() {
  return (
    <SEOToolPage
      pathname={PATH}
      mainKeyword="How to Sign a PDF and Send It Back"
      h2Keywords={[]}
      description="Sign a PDF and send it back in minutes. Upload the file you were emailed, add your signature, download, and attach it to your reply — no printer and no account."
      explainer="The usual failure mode is printing, signing, then photographing the paper. Sign the original PDF instead so the person who asked for it gets one clean attachment."
      tool="sign"
      howToTitle="Sign and send back in three steps"
      howToSteps={[
        {
          name: "Upload the PDF you were sent",
          text: "Use the box above. You do not need to create an account first.",
        },
        {
          name: "Add your signature",
          text: "Draw or type it, place it on the line, and fill any blanks if the form needs them.",
        },
        {
          name: "Download and reply",
          text: "Attach the signed PDF to the same email or portal. There is nothing to scan.",
        },
      ]}
      sections={[
        {
          heading: "Email it back as a PDF, not a photo",
          body: "A signed PDF opens in any reader and keeps the original layout. A camera shot of a printout is harder to file and often unreadable. Signing on a [phone](/sign-a-pdf-on-phone), [Mac](/sign-pdf-on-mac), or [Chromebook](/sign-pdf-on-chromebook)? Use those device guides — the send-back step is the same.",
        },
      ]}
      faqs={[
        {
          question: "How do I sign a PDF and email it back?",
          answer:
            "Upload it here, sign, download, and attach the new file to your reply. Do not print and photograph it unless the sender required wet ink.",
        },
        {
          question: "Do I need to print it first?",
          answer:
            "No. See [how to sign a PDF without printing](/sign-pdf-without-printing) if that is the whole question.",
        },
        {
          question: "Will they know I signed it digitally?",
          answer:
            "They will see a signature on the page. For ordinary forms that is what they asked for. Follow any notarize/wet-ink instructions if they were explicit.",
        },
      ]}
      features={[
        "Upload, sign, download",
        "Ready to send back in minutes",
        "No account",
        "No watermark",
        "Works on any device",
        "No printer required",
      ]}
    />
  );
}
