import type { Metadata } from "next";
import { ogImages } from "@/lib/brand";
import { SEOToolPage } from "@/components/SEOToolPage";

const PATH = "/sign-pdf-on-iphone";

export const metadata: Metadata = {
  title: "Sign a PDF on iPhone (Safari, No App) | Scrixo",
  description:
    "Sign a PDF on iPhone in Safari. No App Store download. Draw your signature with a finger and send the file back from Mail or Files.",
  keywords:
    "sign pdf on iphone, sign pdf iphone, iphone pdf signature, sign pdf ios, sign pdf on phone, mobile pdf signer",
  alternates: { canonical: `https://scrixo.com${PATH}` },
  openGraph: {
    title: "Sign a PDF on iPhone (Safari, No App)",
    description: "Sign a PDF on iPhone in Safari. No App Store app. Finger signature, then send from Mail.",
    url: `https://scrixo.com${PATH}`,
    siteName: "Scrixo",
    images: ogImages,
  },
  twitter: {
    card: "summary_large_image",
    images: ogImages,
    title: "Sign a PDF on iPhone (Safari, No App)",
    description: "Sign a PDF on iPhone in Safari. No App Store app. Finger signature, then send from Mail.",
  },
};

export default function SignPDFOniPhonePage() {
  return (
    <SEOToolPage
      pathname={PATH}
      mainKeyword="Sign a PDF on iPhone"
      h2Keywords={[]}
      description="Sign a PDF on iPhone in Safari — no App Store app. Draw your signature with a finger, place it on the page, and share the file from Files or Mail."
      explainer="Markup in Files and Mail can stamp a saved iOS signature, but it is easy to miss and behaves differently in each app. If you just want the PDF signed and gone, upload it here in Safari and download a finished file."
      tool="sign"
      howToTitle="How to sign a PDF on iPhone"
      howToSteps={[
        {
          name: "Open Safari and upload the PDF",
          text: "From Mail, tap the attachment and share/save it, or pick it from Files. Then use the upload box on this page.",
        },
        {
          name: "Sign with your finger",
          text: "Draw the signature, place it on the line, and pinch to zoom the page if needed.",
        },
        {
          name: "Download and send from Mail",
          text: "Save to Files, then attach the signed PDF to your reply. You never printed the document.",
        },
      ]}
      sections={[
        {
          heading: "Safari, not another App Store PDF editor",
          body: "iPhone already has too many PDF apps. This signer is a website. If your school or workplace blocks App Store installs, Safari still works. You also skip the print-and-scan loop — [sign a PDF without printing](/sign-pdf-without-printing).",
        },
        {
          heading: "Mail attachments",
          body: "Mail’s Markup signature is fine when it appears. When it does not — or when you want a signature that is not stored in iCloud Markup — use this page, then attach the new file to the same thread. On Android instead? See the [Android guide](/sign-pdf-on-android). Any phone: [sign a PDF on your phone](/sign-a-pdf-on-phone).",
        },
      ]}
      faqs={[
        {
          question: "Can I sign a PDF on iPhone without the Adobe app?",
          answer: "Yes. Safari plus this page is enough. No App Store download.",
        },
        {
          question: "Does this work in Chrome on iPhone too?",
          answer: "Yes. Safari is the usual path; Chrome on iOS can also upload and download the PDF.",
        },
        {
          question: "Where does the signed file save?",
          answer: "Safari typically puts it in Downloads inside the Files app, where Mail can attach it.",
        },
      ]}
      features={[
        "Works in iPhone Safari",
        "No App Store download",
        "Touch signature pad",
        "No watermark",
        "No account required",
        "Send back from Mail or Files",
      ]}
    />
  );
}
