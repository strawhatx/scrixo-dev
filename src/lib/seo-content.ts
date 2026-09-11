export type FAQItem = {
  question: string;
  answer: string;
};

export type HowToStep = {
  name: string;
  text: string;
};

export type ContentSection = {
  heading: string;
  body: string;
};

export type RelatedLink = {
  href: string;
  label: string;
};

/** Launch cluster — keep these interlinked on every sign page. */
export const GUIDE_GROUPS: { heading: string; links: RelatedLink[] }[] = [
  {
    heading: "Sign a PDF",
    links: [
      { href: "/sign-pdf", label: "Sign a PDF free" },
      { href: "/sign-pdf-without-printing", label: "Sign a PDF without printing" },
      { href: "/sign-pdf-electronically", label: "Sign a PDF electronically" },
      { href: "/fill-pdf", label: "Fill and sign a PDF" },
      { href: "/how-to-sign-pdf-and-send-back", label: "Sign a PDF and send it back" },
    ],
  },
  {
    heading: "On a device",
    links: [
      { href: "/sign-pdf-on-iphone", label: "Sign a PDF on iPhone" },
      { href: "/sign-pdf-on-android", label: "Sign a PDF on Android" },
      { href: "/sign-a-pdf-on-phone", label: "Sign a PDF on your phone" },
      { href: "/sign-pdf-mobile", label: "Sign a PDF on mobile" },
      { href: "/sign-pdf-on-mac", label: "Sign a PDF on Mac" },
      { href: "/sign-pdf-on-chromebook", label: "Sign a PDF on a Chromebook" },
    ],
  },
];

export const LAUNCH_LINKS: RelatedLink[] = GUIDE_GROUPS.flatMap((group) => group.links);

export const HOME_HOW_TO_STEPS: HowToStep[] = [
  {
    name: "Upload your PDF",
    text: "Drop the file into the browser — no account or install.",
  },
  {
    name: "Add your signature",
    text: "Draw, type, or place a signature on the page.",
  },
  {
    name: "Download and send",
    text: "Export a clean PDF with no watermark and attach it to your reply.",
  },
];

export const HOME_FAQS: FAQItem[] = [
  {
    question: "Can I sign a PDF free without an account?",
    answer:
      "Yes. Guest signing works in the browser with no login. Draw or type your signature, download, and send the file back. Start on [sign a PDF free](/sign-pdf).",
  },
  {
    question: "Do I need to print and scan the document?",
    answer:
      "No. Sign the PDF on screen and email the file. See [how to sign a PDF without printing](/sign-pdf-without-printing).",
  },
  {
    question: "Does this work on Mac, Chromebook, and phone?",
    answer:
      "Yes. Use the [Mac](/sign-pdf-on-mac), [Chromebook](/sign-pdf-on-chromebook), or [phone](/sign-a-pdf-on-phone) guide if you want device-specific steps. Same tool on every device.",
  },
  {
    question: "Will the downloaded PDF have a watermark?",
    answer: "No. The signed file you download is a normal PDF you can send back as-is.",
  },
  {
    question: "How do I send the signed PDF back?",
    answer:
      "Download it, then attach it to the same email or portal. Step-by-step: [how to sign a PDF and send it back](/how-to-sign-pdf-and-send-back).",
  },
  {
    question: "Is a Scrixo signature legally valid?",
    answer:
      "For most everyday documents, a standard electronic signature is recognized under the ESIGN Act, UETA, and similar rules (including eIDAS simple signatures in the EU). Wills, court filings, and some notarized papers need a different process. Scrixo does not record an audit trail. Details: [Terms](/terms).",
  },
];

export function relatedLinksFor(pathname: string): RelatedLink[] {
  return LAUNCH_LINKS.filter((link) => link.href !== pathname);
}

export function stripMdLinks(text: string) {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

export const DEFAULT_SIGN_STEPS: HowToStep[] = [
  {
    name: "Upload your PDF",
    text: "Open Scrixo in your browser and drop in the PDF you need to sign. No account or install required.",
  },
  {
    name: "Create your signature",
    text: "Draw with a mouse, trackpad, or finger, or type your name in a handwriting font. Then place it on the page.",
  },
  {
    name: "Download the signed file",
    text: "Export a clean PDF you can email or upload. Nothing is printed, scanned, or watermarked.",
  },
];
