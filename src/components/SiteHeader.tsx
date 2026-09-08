"use client";

import React from "react";
import Link from "next/link";
import { ChevronDown, FileText, Menu, Twitter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDashboard } from "@/hooks/useDashboard";

const GUIDE_LINKS = [
  { href: "/sign-pdf-without-printing", label: "Without printing" },
  { href: "/sign-pdf-on-mac", label: "On Mac" },
  { href: "/sign-pdf-on-chromebook", label: "On Chromebook" },
  { href: "/sign-a-pdf-on-phone", label: "On phone" },
  { href: "/sign-pdf-on-iphone", label: "On iPhone" },
  { href: "/sign-pdf-on-android", label: "On Android" },
] as const;

export function SiteHeader() {
  const { user, signIn, signOut } = useDashboard();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const isGuest = !user || user.isFree;

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-glow">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-black tracking-tight">scrixo</span>
              <span className="text-[11px] text-muted-foreground/70 font-semibold tracking-tight">
                PDF signer
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
              <Link href="/sign-pdf">Sign PDF</Link>
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
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
              <Link
                href="https://github.com/strawhatx/scrixo-dev"
                target="_blank"
                rel="noopener noreferrer"
                title="Report Bug"
              >
                REPORT BUG
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-9 w-9"
              asChild
            >
              <Link href="https://x.com/heynathanielj" target="_blank" rel="noopener noreferrer" title="Twitter">
                <Twitter className="w-4 h-4" />
              </Link>
            </Button>
            <div className="h-5 w-px bg-border mx-1" />
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-tight h-9 px-3"
              onClick={isGuest ? signIn : signOut}
            >
              {isGuest ? "Log In" : "Log Out"}
            </Button>
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
              <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                <Link href="https://github.com/strawhatx/scrixo-dev" target="_blank" rel="noopener noreferrer">
                  Report Bug
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  isGuest ? signIn() : signOut();
                  setMobileMenuOpen(false);
                }}
              >
                {isGuest ? "Log In" : "Log Out"}
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
