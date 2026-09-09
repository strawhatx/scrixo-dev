import type { Metadata } from "next";
import { ogImages } from "@/lib/brand";
import { SEOToolPage } from "@/components/SEOToolPage";

const PATH = "/sign-pdf-on-chromebook";

export const metadata: Metadata = {
  title: "Sign a PDF on a Chromebook (No App) | Scrixo",
  description:
    "Sign a PDF on a Chromebook in Chrome — no Android app and no printer. Chrome’s PDF viewer cannot sign; this page is the actual tool, not just instructions.",
  keywords:
    "sign pdf on chromebook, sign pdf chromebook chrome, sign pdf without app chromebook, does chrome have a built-in pdf signer",
  alternates: { canonical: `https://scrixo.com${PATH}` },
  openGraph: {
    title: "Sign a PDF on a Chromebook (No App)",
    description:
      "Sign a PDF on a Chromebook in Chrome. No Android app, no printer. Chrome’s built-in viewer cannot add a signature — this tool can.",
    url: `https://scrixo.com${PATH}`,
    siteName: "Scrixo",
    images: ogImages,
  },
  twitter: {
    card: "summary_large_image",
    images: ogImages,
    title: "Sign a PDF on a Chromebook (No App)",
    description:
      "Sign a PDF on a Chromebook in Chrome. No Android app, no printer. Chrome’s built-in viewer cannot add a signature — this tool can.",
  },
};

export default function SignPDFOnChromebookPage() {
  return (
    <SEOToolPage
      pathname={PATH}
      mainKeyword="Sign a PDF on a Chromebook"
      h2Keywords={[]}
      description="Sign a PDF on a Chromebook in Chrome — no Android app, no Play Store download, no printing. Chrome can open a PDF; it cannot add a signature. Upload the file here and sign it in one step."
      explainer="Google’s own Chromebook help page explains how to open PDFs and points you at other apps. That page is instructional only — it does not sign the file. Scrixo is the missing piece: the signer runs in Chrome on the Chromebook you already have."
      tool="sign"
      howToTitle="How to sign a PDF on a Chromebook"
      howToSteps={[
        {
          name: "Open this page in Chrome",
          text: "On the Chromebook, stay in Chrome (not the Files app preview). Use the upload box above.",
        },
        {
          name: "Draw or type your signature",
          text: "Use the trackpad, a mouse, or the touchscreen if your Chromebook has one. Place the signature on the line.",
        },
        {
          name: "Download to My Files and send",
          text: "Save the signed PDF, then attach it from Gmail, Drive, or Classroom. You never left the browser.",
        },
      ]}
      sections={[
        {
          heading: "Chrome does not include a PDF signer",
          body: "Chrome’s built-in PDF viewer lets you read, print, and rotate. It does not let you draw a signature onto the page. That is why “sign PDF on Chromebook” searches often land on Google’s help article or on Android APK lists. If you want to sign without installing anything, you need a web tool that runs in Chrome — which is what this page is.",
        },
        {
          heading: "No app, no Play Store sideload",
          body: "You can install Android PDF apps on many Chromebooks, but you should not have to for a one-page permission slip. Scrixo runs in the same Chrome window you used to open the email. School-managed Chromebooks that block Play Store can still use the browser if the site is allowed.",
        },
        {
          heading: "Touchscreen, trackpad, or mouse",
          body: "Convertible Chromebooks can sign with a finger. Clamshells can use the trackpad. The download is a normal PDF that opens in Chrome’s viewer afterward so you can confirm the signature landed on the line before you send it. On a [Mac](/sign-pdf-on-mac) or [phone](/sign-a-pdf-on-phone) instead? Same browser tool, different device notes.",
        },
      ]}
      faqs={[
        {
          question: "Can I sign a PDF on a Chromebook without an app?",
          answer:
            "Yes. Use Chrome to open this page, upload the PDF, add your signature, and download. You do not need an Android or Linux PDF app.",
        },
        {
          question: "Does Chrome have a built-in PDF signer?",
          answer:
            "No. Chrome can display PDFs and print them. It cannot place a signature. A web signer like Scrixo, or a separate app, is required to actually sign.",
        },
        {
          question: "Will this work on a school Chromebook?",
          answer:
            "If Chrome can reach scrixo.com, yes. If the school blocks unknown sites, ask IT to allow it, or use a personal device. No install is required on the Chromebook itself.",
        },
        {
          question: "Where does the signed file go?",
          answer:
            "Chrome saves it to your Downloads folder (My Files). Attach that file in Gmail or upload it wherever the form was requested.",
        },
      ]}
      features={[
        "Runs in Chrome on Chromebook — no app",
        "Works when Play Store is locked down",
        "Touchscreen and trackpad signing",
        "No account required",
        "No watermark on the download",
        "Download straight to My Files",
      ]}
    />
  );
}
