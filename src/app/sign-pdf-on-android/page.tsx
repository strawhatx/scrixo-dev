import type { Metadata } from "next";
import { SEOToolPage } from "@/components/SEOToolPage";

const PATH = "/sign-pdf-on-android";

export const metadata: Metadata = {
  title: "Sign a PDF on Android (Chrome, No App) | Scrixo",
  description:
    "Sign a PDF on Android in Chrome. No Play Store app. Draw your signature with a finger or stylus and download a clean PDF.",
  keywords:
    "sign pdf on android, sign pdf android, android pdf signature, sign pdf on phone android, mobile pdf signer android",
  alternates: { canonical: `https://scrixo.com${PATH}` },
  openGraph: {
    title: "Sign a PDF on Android (Chrome, No App)",
    description: "Sign a PDF on Android in Chrome. No Play Store app. Finger or stylus, then download.",
    url: `https://scrixo.com${PATH}`,
    siteName: "Scrixo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign a PDF on Android (Chrome, No App)",
    description: "Sign a PDF on Android in Chrome. No Play Store app. Finger or stylus, then download.",
  },
};

export default function SignPDFOnAndroidPage() {
  return (
    <SEOToolPage
      pathname={PATH}
      mainKeyword="Sign a PDF on Android"
      h2Keywords={[]}
      description="Sign a PDF on Android in Chrome — no Play Store app. Draw with your finger or stylus, place the signature, and download a file you can send from Gmail."
      explainer="Android’s Downloads and Gmail make it easy to get a PDF onto the phone and hard to sign it without installing another app. This page is the signer: it runs in Chrome on the phone you already carry."
      tool="sign"
      howToTitle="How to sign a PDF on Android"
      howToSteps={[
        {
          name: "Open Chrome and upload the PDF",
          text: "If the file is in Gmail, tap the attachment → Download, then upload it from Downloads with the tool above.",
        },
        {
          name: "Sign with finger or stylus",
          text: "Draw your signature, drop it on the line, and pinch-zoom if the form is dense.",
        },
        {
          name: "Download and attach in Gmail",
          text: "Save the signed PDF and attach it to your reply. No printer, no scanner app.",
        },
      ]}
      sections={[
        {
          heading: "Chrome on Android, not a new APK",
          body: "You can install PDF signers from Play Store. You do not need to for a single form. Stay in Chrome, sign, download to the same Downloads folder Gmail already uses.",
        },
        {
          heading: "Stylus and Samsung DeX",
          body: "An S Pen or other stylus gives a cleaner signature than a finger. The file is still a normal PDF afterward. Signing on a Chromebook? Use the Chromebook guide — that is Chrome OS, not Android-in-a-phone.",
        },
      ]}
      faqs={[
        {
          question: "Do I need a PDF app on Android to sign?",
          answer: "No. Chrome plus this page is enough to add a signature and download the file.",
        },
        {
          question: "Where does Android save the signed PDF?",
          answer: "Usually in Downloads. Gmail’s attach picker can see it immediately.",
        },
        {
          question: "Can I sign on Android without Google account tricks?",
          answer: "Scrixo does not require a Scrixo account. Your Google account is only whatever Gmail or Drive already uses.",
        },
      ]}
      features={[
        "Works in Android Chrome",
        "No Play Store app required",
        "Finger or stylus",
        "No watermark",
        "No Scrixo account",
        "Easy Gmail attach from Downloads",
      ]}
    />
  );
}
