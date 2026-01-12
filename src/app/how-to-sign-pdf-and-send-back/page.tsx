import type { Metadata } from "next";
import { SEOToolPage } from "@/components/SEOToolPage";

export const metadata: Metadata = {
  title: "How to Sign PDF and Send Back - Quick Guide | Scrixo",
  description: "Learn how to sign PDF and send back quickly. Step-by-step guide to signing PDF documents and sending them back. Free, fast, and easy.",
  keywords: "how to sign pdf and send back, sign pdf and send, how to sign pdf document, sign pdf return, sign pdf and email back, how to electronically sign pdf",
  openGraph: {
    title: "How to Sign PDF and Send Back - Quick Guide",
    description: "Learn how to sign PDF and send back quickly. Step-by-step guide to signing PDF documents and sending them back. Free, fast, and easy.",
    url: "https://scrixo.com/how-to-sign-pdf-and-send-back",
    siteName: "Scrixo",
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Sign PDF and Send Back - Quick Guide",
    description: "Learn how to sign PDF and send back quickly. Step-by-step guide to signing PDF documents and sending them back. Free, fast, and easy.",
  },
};

export default function HowToSignPDFAndSendBackPage() {
  return (
    <SEOToolPage
      mainKeyword="How to Sign PDF and Send Back"
      h2Keywords={[
        "Sign PDF and Send",
        "How to Sign PDF Document",
        "Sign PDF Return",
        "Sign PDF and Email Back",
        "How to Electronically Sign PDF",
        "Sign and Send PDF Instantly",
      ]}
      description="Learn how to sign PDF and send back in seconds. Upload your PDF, add your signature, download the signed document, and send it back - all in one quick process."
      tool="sign"
      features={[
        "Simple 3-step process: upload, sign, download",
        "Ready to send back in seconds",
        "No account or login required",
        "100% free with no watermarks",
        "Works on any device",
        "Secure and private",
      ]}
    />
  );
}

