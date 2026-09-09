import type { Metadata } from "next";
import Landing from "@/components/Landing";
import { HOME_FAQS, HOME_HOW_TO_STEPS, stripMdLinks } from "@/lib/seo-content";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  path: "/",
  title: "Sign a PDF Free — No Account, No Printing | Scrixo",
  description:
    "Sign a PDF free in your browser. No account, no printing, no scanning. Draw or type your signature and download a clean file you can send back.",
  keywords:
    "sign pdf free, sign a pdf, sign pdf without printing, electronic signature, sign pdf no account, sign pdf online",
  openGraphDescription:
    "Sign a PDF free in your browser. No account, no printing, no scanning. Draw or type your signature and download instantly.",
});

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HowTo",
      name: "How to sign a PDF free",
      description:
        "Sign a PDF free in your browser. No account, no printing, no scanning.",
      step: HOME_HOW_TO_STEPS.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.name,
        text: step.text,
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: HOME_FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: stripMdLinks(faq.answer),
        },
      })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Landing />
    </>
  );
}
