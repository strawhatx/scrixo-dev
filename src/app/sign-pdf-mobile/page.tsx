import type { Metadata } from "next";
import { ogImages } from "@/lib/brand";
import { SEOToolPage } from "@/components/SEOToolPage";

const PATH = "/sign-pdf-mobile";

export const metadata: Metadata = {
  title: "Sign a PDF on Mobile (Phone or Tablet) | Scrixo",
  description:
    "Sign a PDF on mobile — phone or tablet, iOS or Android. No app. Draw a signature in the browser and download a clean PDF.",
  keywords:
    "sign pdf mobile, sign pdf on mobile, mobile pdf signature, sign pdf phone, sign pdf tablet, mobile pdf signer",
  alternates: { canonical: `https://scrixo.com${PATH}` },
  openGraph: {
    title: "Sign a PDF on Mobile (Phone or Tablet)",
    description: "Sign a PDF on any phone or tablet in the browser. No app, no watermark.",
    url: `https://scrixo.com${PATH}`,
    siteName: "Scrixo",
    images: ogImages,
  },
  twitter: {
    card: "summary_large_image",
    images: ogImages,
    title: "Sign a PDF on Mobile (Phone or Tablet)",
    description: "Sign a PDF on any phone or tablet in the browser. No app, no watermark.",
  },
};

export default function SignPDFMobilePage() {
  return (
    <SEOToolPage
      pathname={PATH}
      mainKeyword="Sign a PDF on Mobile"
      h2Keywords={[]}
      description="Sign a PDF on mobile — iPhone, Android, iPad, or any tablet browser. No app download. Draw your signature, place it, and send the file back."
      explainer="Mobile PDF signing should not mean installing a scanner. If you can open this page, you can sign the document and download it. For phone-sized screens see the [phone guide](/sign-a-pdf-on-phone); iPad uses the same flow in Safari."
      tool="sign"
      howToTitle="How to sign a PDF on a phone or tablet"
      sections={[
        {
          heading: "Phone and tablet, same tool",
          body: "A tablet gives you more room to place the signature; a phone is enough for a single line. The export is the same PDF either way.",
        },
        {
          heading: "No mobile app required",
          body: "Skip the App Store and Play Store for a one-time signature. Device-specific notes live on the [iPhone](/sign-pdf-on-iphone), [Android](/sign-pdf-on-android), and [phone](/sign-a-pdf-on-phone) pages.",
        },
      ]}
      faqs={[
        {
          question: "Can I sign a PDF on a tablet the same way as a phone?",
          answer: "Yes. Upload, sign, download. A larger screen just makes placement easier.",
        },
        {
          question: "Is there a Scrixo app?",
          answer: "No. The product is the website, which is the point — nothing to install.",
        },
        {
          question: "Will it work on iPad?",
          answer: "Yes, in Safari or Chrome. Apple Pencil works as a more precise pointer for drawing the signature.",
        },
      ]}
      features={[
        "Phone and tablet",
        "iPhone, Android, iPad",
        "No app download",
        "Touch-optimized pad",
        "No watermark",
        "No account required",
      ]}
    />
  );
}
