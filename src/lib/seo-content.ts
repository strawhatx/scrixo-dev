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
export const LAUNCH_LINKS: RelatedLink[] = [
  { href: "/sign-pdf", label: "Sign a PDF free" },
  { href: "/sign-pdf-without-printing", label: "Sign a PDF without printing" },
  { href: "/sign-pdf-on-mac", label: "Sign a PDF on Mac" },
  { href: "/sign-pdf-on-chromebook", label: "Sign a PDF on a Chromebook" },
  { href: "/sign-a-pdf-on-phone", label: "Sign a PDF on your phone" },
  { href: "/sign-pdf-on-iphone", label: "Sign a PDF on iPhone" },
  { href: "/sign-pdf-on-android", label: "Sign a PDF on Android" },
  { href: "/sign-pdf-mobile", label: "Sign a PDF on mobile" },
  { href: "/fill-pdf", label: "Fill and sign a PDF" },
];

export function relatedLinksFor(pathname: string): RelatedLink[] {
  return LAUNCH_LINKS.filter((link) => link.href !== pathname);
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
