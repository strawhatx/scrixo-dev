import type { Metadata } from "next";
import { SEOToolPage } from "@/components/SEOToolPage";

const PATH = "/sign-pdf";

export const metadata: Metadata = {
  title: "Sign PDF Online Free — No Account Required | Scrixo",
  description:
    "Sign a PDF online free. No login, no printing, no watermark. Draw or type your signature in the browser and download instantly.",
  keywords:
    "sign pdf online free, add signature to pdf free, sign pdf no login, electronic signature pdf free, draw signature on pdf online",
  alternates: { canonical: `https://scrixo.com${PATH}` },
  openGraph: {
    title: "Sign PDF Online Free — No Account Required",
    description: "Sign a PDF online free. No login, no printing, no watermark. Draw or type your signature and download instantly.",
    url: `https://scrixo.com${PATH}`,
    siteName: "Scrixo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign PDF Online Free — No Account Required",
    description: "Sign a PDF online free. No login, no printing, no watermark. Draw or type your signature and download instantly.",
  },
};

export default function SignPDFPage() {
  return (
    <SEOToolPage
      pathname={PATH}
      mainKeyword="Sign PDF Online Free"
      h2Keywords={[]}
      description="Sign a PDF online free — no account, no printing, no watermark. Draw or type your signature in the browser, place it on the page, and download a file you can send back."
      explainer="Scrixo is a free PDF signer, not a full document suite. Upload, sign, download. If you also need to fill blanks before you sign, use Fill & sign from the header."
      tool="sign"
      howToTitle="How to sign a PDF online"
      sections={[
        {
          heading: "Add a signature without creating an account",
          body: "Guest mode keeps the file in your browser for the session. You can log in later to save a signature, but you do not need to in order to sign and download.",
        },
        {
          heading: "Draw or type — your choice",
          body: "Draw with a mouse, trackpad, or finger, or type your name. Place the signature on the line, then export. The download has no watermark.",
        },
        {
          heading: "Send the signed PDF back",
          body: "Attach the downloaded file to the same email or portal that sent you the original. There is nothing to print or scan. Need device-specific steps? See the Mac, Chromebook, and phone guides.",
        },
      ]}
      faqs={[
        {
          question: "Is this PDF signer really free?",
          answer: "Yes. You can sign and download without paying or creating an account. The exported PDF has no watermark.",
        },
        {
          question: "Do I need to print the document first?",
          answer: "No. Sign the PDF on screen and send the file back. See the without-printing guide if that is the whole problem you are solving.",
        },
        {
          question: "Can I fill the form and sign it?",
          answer: "Yes. Use Fill & sign to add text, then switch to Sign to place your signature on the same PDF.",
        },
      ]}
      features={[
        "100% free — no hidden costs",
        "No account or login required",
        "No watermarks on your documents",
        "Sign and download immediately",
        "Works in your browser — no install",
        "Guest signing stays on your device",
      ]}
    />
  );
}
