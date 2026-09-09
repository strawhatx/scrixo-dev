import type { Metadata } from "next";
import { SEOToolPage } from "@/components/SEOToolPage";
import { pageMetadata } from "@/lib/page-metadata";

const PATH = "/sign-pdf-on-mac";

export const metadata: Metadata = pageMetadata({
  path: PATH,
  title: "How to Sign a PDF on Mac (Trackpad, Preview, Mail) | Scrixo",
  description:
    "Sign a PDF on Mac without wrestling Preview. Use this browser tool on MacBook, MacBook Air, or MacBook Pro — or follow the Preview, trackpad, camera, and Mail steps below.",
  keywords:
    "sign pdf on mac, sign pdf on macbook, how to add a signature in Preview on Mac, sign pdf mac trackpad, sign pdf from mail mac, sign pdf osx",
  openGraphTitle: "How to Sign a PDF on Mac (Trackpad, Preview, Mail)",
  openGraphDescription:
    "Sign a PDF on Mac in your browser, or use Preview’s trackpad, camera, and Mail options. Free, no account, no printing.",
});

export default function SignPDFOnMacPage() {
  return (
    <SEOToolPage
      pathname={PATH}
      mainKeyword="Sign a PDF on Mac"
      h2Keywords={[]}
      description="Sign a PDF on Mac in your browser — MacBook, MacBook Air, MacBook Pro, or any macOS machine. Draw with the trackpad, type a signature, or use the Preview steps below if you prefer Apple’s built-in tools."
      explainer="macOS Preview can store a signature, but the menus move between OS versions and Mail attachments still dump you into a viewer that may not offer signing. Scrixo is the one-step alternative: open the PDF in Chrome or Safari on your Mac and sign it there."
      tool="sign"
      howToTitle="How to sign a PDF on Mac with Scrixo"
      howToSteps={[
        {
          name: "Open the PDF in your Mac browser",
          text: "Upload the file with the tool above. Safari and Chrome on macOS both work — no Preview window required.",
        },
        {
          name: "Sign with trackpad or keyboard",
          text: "Draw your signature with the trackpad, or type your name and pick a handwriting style. Place it on the line.",
        },
        {
          name: "Download and attach it from Mail",
          text: "Save the signed PDF to Downloads, then attach it in Mail, Gmail, or whatever sent you the original.",
        },
      ]}
      sections={[
        {
          heading: "Signing with the trackpad",
          body: "On a MacBook, the trackpad is the fastest way to get a signature that looks like you. In Scrixo, choose draw, sign your name with one finger on the trackpad, then drop it onto the PDF. In Preview, Markup → Signature → Trackpad does the same idea, but you have to save a signature into Preview first and it only lives on that Mac.",
        },
        {
          heading: "Signing with the camera",
          body: "Preview can photograph a wet-ink signature: sign a white card, hold it up to the Mac camera, and crop it. That is useful once, messy if the lighting is bad, and unnecessary if you are fine drawing on the trackpad. Scrixo skips the camera step entirely — the signature is created on screen.",
        },
        {
          heading: "Signing from Mail",
          body: "When a PDF arrives in Apple Mail, Quick Look often lets you view it but not sign it. Download the attachment, upload it here (or open it in Preview Markup), sign, then attach the new file to your reply. You do not need to print the Mail attachment or screenshot it.",
        },
        {
          heading: "Using Preview on Mac",
          body: "To add a signature in Preview on Mac: open the PDF → Markup toolbar (pen tip icon) → Signature → Create Signature, then choose Trackpad or Camera. Click the line to stamp it, File → Export to keep a copy. If Preview’s signature tool is missing, greyed out, or you are on a shared Mac, use the browser tool on this page instead — it does not depend on Preview’s Markup extras. Signing on a [Chromebook](/sign-pdf-on-chromebook) or [phone](/sign-a-pdf-on-phone) instead? Those guides use the same browser signer.",
        },
      ]}
      faqs={[
        {
          question: "How do I add a signature in Preview on Mac?",
          answer:
            "Open the PDF in Preview, show the Markup toolbar, click Signature, and create one with the trackpad or camera. Place it on the page and export. If Markup is not available, sign the same file in your browser with the tool on this page.",
        },
        {
          question: "Can I sign a PDF on a MacBook without Preview?",
          answer:
            "Yes. Upload the PDF to Scrixo in Safari or Chrome, draw or type your signature, and download. It works on MacBook Air and MacBook Pro the same way.",
        },
        {
          question: "How do I sign a PDF on Mac with a trackpad?",
          answer:
            "In Scrixo, create a drawn signature and use the trackpad as a pen. In Preview, use Markup → Signature → Trackpad, then click to place it.",
        },
        {
          question: "Does this work on older OS X / macOS versions?",
          answer:
            "The browser tool works on any Mac that can run a current Safari or Chrome. Preview’s signature UI differs by macOS version; if yours is missing, use the upload box above.",
        },
      ]}
      features={[
        "Works in Safari and Chrome on Mac",
        "Trackpad-friendly signature pad",
        "No Preview setup required",
        "Sign Mail attachments without printing",
        "No account and no watermark",
        "Same flow on MacBook Air and MacBook Pro",
      ]}
    />
  );
}
