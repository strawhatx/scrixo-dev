import type { Metadata } from "next";
import { ogImages } from "@/lib/brand";
import { SEOToolPage } from "@/components/SEOToolPage";

const PATH = "/sign-a-pdf-on-phone";

export const metadata: Metadata = {
  title: "Sign a PDF on Your Phone (No App) | Scrixo",
  description:
    "Sign a PDF on your phone in the mobile browser. No app download. Draw your signature with a finger and send the file back — iPhone or Android.",
  keywords:
    "sign a pdf on phone, sign pdf on phone, phone pdf signature, mobile pdf sign, sign pdf from phone",
  alternates: { canonical: `https://scrixo.com${PATH}` },
  openGraph: {
    title: "Sign a PDF on Your Phone (No App)",
    description: "Sign a PDF on your phone in the browser. No app. Draw with your finger and download.",
    url: `https://scrixo.com${PATH}`,
    siteName: "Scrixo",
    images: ogImages,
  },
  twitter: {
    card: "summary_large_image",
    images: ogImages,
    title: "Sign a PDF on Your Phone (No App)",
    description: "Sign a PDF on your phone in the browser. No app. Draw with your finger and download.",
  },
};

export default function SignAPDFOnPhonePage() {
  return (
    <SEOToolPage
      pathname={PATH}
      mainKeyword="Sign a PDF on Your Phone"
      h2Keywords={[]}
      description="Sign a PDF on your phone in seconds. Open this page in Safari or Chrome, add a finger-drawn signature, and download — no App Store or Play Store app."
      explainer="Most “sign on phone” results want you to install a scanner app so you can photograph a printout. You can skip that: sign the original PDF on the phone you already have. Once the file is open, drawing and placing a signature usually takes about a minute."
      tool="sign"
      howToTitle="How to sign a PDF on your phone"
      howToSteps={[
        {
          name: "Open the PDF from email or Files",
          text: "If the file is in Mail or Gmail, download or share it, then upload it with the box above in your phone browser.",
        },
        {
          name: "Sign with your finger",
          text: "Draw your signature on the pad, place it on the line, and pinch-zoom the page if you need a better view.",
        },
        {
          name: "Download and send it back",
          text: "Save the PDF to Files or Downloads and attach it to your reply. Nothing was printed or scanned.",
        },
      ]}
      sections={[
        {
          heading: "Works on any phone browser",
          body: "iPhone, Android, and other phones that run a modern browser can sign here. For iPhone-specific Safari notes see the [iPhone guide](/sign-pdf-on-iphone); for Chrome on Android see the [Android guide](/sign-pdf-on-android).",
        },
        {
          heading: "No app download",
          body: "You do not need Adobe, CamScanner, or a separate “PDF signer” from the store for a one-off signature. The tool is the page you are on. Same idea if you are on a computer: [sign a PDF without printing](/sign-pdf-without-printing).",
        },
        {
          heading: "Sign and send it back from the same sitting",
          body: "There is no account to create and no file to print. Upload, sign with a finger, download, and attach the PDF to your reply. That is the whole loop — faster than installing an app or photographing a printout.",
        },
      ]}
      faqs={[
        {
          question: "Can I sign a PDF on my phone without an app?",
          answer: "Yes. Use Safari or Chrome, upload the PDF here, sign with your finger, and download.",
        },
        {
          question: "Will my signature look okay on a small screen?",
          answer:
            "Draw a bit larger than you think, then place and resize it on the page. Zoom the PDF if the signature line is small.",
        },
        {
          question: "iPhone or Android — does it matter?",
          answer:
            "The same steps work on both. Use the [iPhone](/sign-pdf-on-iphone) or [Android](/sign-pdf-on-android) guides if you want OS-specific sharing tips.",
        },
        {
          question: "How long does it take to sign a PDF on my phone?",
          answer:
            "If you already have the file, most people finish in about a minute: upload, draw a signature, place it, download. The slow part is usually finding the attachment in Mail or Files, not the signing itself.",
        },
      ]}
      features={[
        "Works on any phone",
        "No app download needed",
        "Finger-drawn signature in about a minute",
        "No account required",
        "No watermark",
        "Send the file back from Mail or Gmail",
      ]}
    />
  );
}
