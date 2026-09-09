"use client";

import React from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BrandLogo } from "@/components/BrandLogo";
import { FeedbackButton, FeedbackDialog } from "@/components/FeedbackDialog";

const GUIDE_LINKS = [
  { href: "/sign-pdf-on-mac", label: "On Mac" },
  { href: "/sign-pdf-on-chromebook", label: "On Chromebook" },
  { href: "/sign-a-pdf-on-phone", label: "On phone" },
  { href: "/sign-pdf-on-iphone", label: "On iPhone" },
  { href: "/sign-pdf-on-android", label: "On Android" },
  { href: "/sign-pdf-mobile", label: "On mobile" },
  { href: "/sign-pdf-electronically", label: "Electronically" },
  { href: "/how-to-sign-pdf-and-send-back", label: "Sign and send back" },
] as const;

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border/40 backdrop-blur-md">
      <div className="mx-auto w-full max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <BrandLogo />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
              <Link href="/sign-pdf">Sign PDF</Link>
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
              <Link href="/sign-pdf-without-printing">Without printing</Link>
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
              <Link href="/fill-pdf">Fill &amp; sign</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Guides
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {GUIDE_LINKS.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="h-5 w-px bg-border mx-1" />
            <FeedbackButton source="nav" />
          </nav>

          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-border/60 pt-4">
            <div className="flex flex-col gap-2">
              <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                <Link href="/sign-pdf">Sign PDF</Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                <Link href="/sign-pdf-without-printing">Without printing</Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                <Link href="/fill-pdf">Fill &amp; sign</Link>
              </Button>
              {GUIDE_LINKS.map((link) => (
                <Button
                  key={link.href}
                  variant="ghost"
                  className="justify-start"
                  asChild
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
              <div className="h-px bg-border my-2" />
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setFeedbackOpen(true);
                }}
              >
                Feedback
              </Button>
            </div>
          </nav>
        )}
      </div>
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} source="nav" />
    </header>
  );
}
