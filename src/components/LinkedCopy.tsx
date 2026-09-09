import Link from "next/link";
import { Fragment } from "react";

const LINK_SPLIT = /(\[[^\]]+\]\([^)]+\))/g;
const LINK_MATCH = /^\[([^\]]+)\]\(([^)]+)\)$/;

function isInternalHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

/** Renders `[label](/path)` as Next.js links; other text is left as-is. */
export function LinkedCopy({ text }: { text: string }) {
  const parts = text.split(LINK_SPLIT);
  return (
    <>
      {parts.map((part, index) => {
        const match = part.match(LINK_MATCH);
        if (!match) {
          return <Fragment key={index}>{part}</Fragment>;
        }
        const [, label, href] = match;
        if (!isInternalHref(href)) {
          return <Fragment key={index}>{label}</Fragment>;
        }
        return (
          <Link key={index} href={href} className="font-semibold text-accent hover:underline">
            {label}
          </Link>
        );
      })}
    </>
  );
}

