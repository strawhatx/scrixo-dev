"use client";

import Link from "next/link";
import { Twitter } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { LAUNCH_LINKS } from "@/lib/seo-content";

export function SiteFooter({ year }: { year?: number }) {
  const y = year ?? new Date().getFullYear();

  return (
    <footer className="border-t border-border/60">
      <nav
        aria-label="Guides"
        className="mx-auto w-full max-w-6xl px-6 py-10"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Guides
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          <li>
            <Link href="/" className="text-sm font-semibold text-foreground hover:text-accent">
              Home
            </Link>
          </li>
          {LAUNCH_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-sm font-semibold text-foreground hover:text-accent">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground/60 font-semibold">
        <div className="flex items-center justify-center gap-3">
          <BrandLogo variant="mark" className="h-8 w-8" />
          <span>© {y} scrixo</span>
          <span aria-hidden="true">·</span>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <span aria-hidden="true">·</span>
          <a
            href="https://x.com/heynathanielj"
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-foreground"
          >
            <Twitter className="h-3.5 w-3.5" />
            Twitter
          </a>
        </div>
      </div>
    </footer>
  );
}
