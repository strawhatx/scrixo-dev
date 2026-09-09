"use client";

import React, { useMemo } from "react";
import {
  ArrowDownToLine,
  Check,
  FileText,
  MousePointer2,
  PenLine,
  PenTool,
  Shield,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Card } from "./ui/card";
import { PDFUpload } from "@/components/PDFUpload";
import { SiteHeader } from "@/components/SiteHeader";
import { WaitlistFooter } from "@/components/WaitlistForm";
import { useFileStore } from "@/store/useFileStore";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LinkedCopy } from "@/components/LinkedCopy";
import { BrandLogo } from "@/components/BrandLogo";
import { HOME_FAQS, LAUNCH_LINKS } from "@/lib/seo-content";

export default function Landing() {
  const year = useMemo(() => new Date().getFullYear(), []);
  const setFile = useFileStore((state) => state.setFile);
  const router = useRouter();

  const handleFileSelect = (file: File) => {
    setFile(file);
    router.push("/edit/new?tool=sign");
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans select-none">
      <div className="bg-brand-hero min-h-[100svh]">
        <SiteHeader />

        <div className="mx-auto w-full max-w-6xl px-6">
          <section className="py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              <div className="space-y-6 pt-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-bold text-muted-foreground">
                  <Shield className="h-4 w-4 text-accent" />
                  No account · No printing · No watermark
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.06]">
                  Sign a PDF free —{" "}
                  <span className="text-accent">no account, no printing</span>
                </h1>

                <p className="text-base md:text-lg text-muted-foreground/80 font-medium max-w-xl">
                  Draw or type your signature in the browser, place it on the page, and download a
                  clean PDF you can send back. No printer, no scanner, no signup.
                </p>

                <ul className="space-y-3 text-sm font-semibold text-muted-foreground/85">
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 h-6 w-6 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                      <Check className="h-4 w-4" />
                    </span>
                    Upload the PDF
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 h-6 w-6 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                      <Check className="h-4 w-4" />
                    </span>
                    Draw, type, or reuse a signature
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 h-6 w-6 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                      <Check className="h-4 w-4" />
                    </span>
                    Download and send — no scanning
                  </li>
                </ul>
              </div>

              <div className="space-y-3 h-full">
                <div
                  className={cn(
                    "w-full h-full relative overflow-hidden rounded-2xl border",
                    "bg-background shadow-sm border-border/60",
                  )}
                >
                  <div className="p-6 sm:p-8">
                    <PDFUpload onFileSelect={handleFileSelect} inputId="home-upload" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl px-6">
        <section className="py-14 border-t border-border/60">
          <div className="flex items-end justify-between gap-6 mb-8">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">Sign on any device</h2>
              <p className="text-muted-foreground/80 font-medium">
                Same free signer in Chrome, Safari, Preview-alternative workflows, and phones.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-16">
            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-primary/5 to-white">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary rounded-2xl">
                  <PenTool className="size-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Sign without printing</h3>
              <p className="text-gray-600 text-center mb-5 text-sm">
                Skip the print-sign-scan loop. Place an electronic signature and email the file back.
              </p>
              <div className="flex justify-center">
                <Link href="/sign-pdf-without-printing" className="text-sm font-bold text-accent hover:underline">
                  Open the guide →
                </Link>
              </div>
            </Card>

            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-primary/5 to-white">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary rounded-2xl">
                  <PenLine className="size-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Mac &amp; Chromebook</h3>
              <p className="text-gray-600 text-center mb-5 text-sm">
                Trackpad, Chrome, or Mail attachment — sign in the browser if you don&apos;t want Preview or an app.
              </p>
              <div className="flex justify-center gap-3">
                <Link href="/sign-pdf-on-mac" className="text-sm font-bold text-accent hover:underline">
                  Mac
                </Link>
                <Link href="/sign-pdf-on-chromebook" className="text-sm font-bold text-accent hover:underline">
                  Chromebook
                </Link>
              </div>
            </Card>

            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-primary/5 to-white">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary rounded-2xl">
                  <Smartphone className="size-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Phone &amp; tablet</h3>
              <p className="text-gray-600 text-center mb-5 text-sm">
                Sign with a finger in Safari or Chrome. No App Store download required.
              </p>
              <div className="flex justify-center gap-3">
                <Link href="/sign-a-pdf-on-phone" className="text-sm font-bold text-accent hover:underline">
                  Phone
                </Link>
                <Link href="/sign-pdf-on-iphone" className="text-sm font-bold text-accent hover:underline">
                  iPhone
                </Link>
                <Link href="/sign-pdf-on-android" className="text-sm font-bold text-accent hover:underline">
                  Android
                </Link>
              </div>
            </Card>
          </div>

          <div className="w-full max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                  <Zap className="size-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Done in a minute</h4>
                  <p className="text-sm text-gray-600">Upload, sign, download — then send the file back.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                  <Shield className="size-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Private by default</h4>
                  <p className="text-sm text-gray-600">Guest files stay in the browser. No account needed to sign.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                  <Sparkles className="size-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Always free to sign</h4>
                  <p className="text-sm text-gray-600">No watermark on the signed PDF you download.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 border-t border-border/60">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Three steps. No printer.</h2>
          </div>

          <div className="mt-12 flex flex-col md:flex-row md:items-start md:justify-center gap-10 md:gap-8">
            <StepCard icon={FileText} step="1" title="Upload your PDF" description="Drag & drop or tap to browse" />
            <StepCard icon={PenLine} step="2" title="Add your signature" description="Draw, type, or place it on the page" />
            <StepCard icon={ArrowDownToLine} step="3" title="Download and send" description="Clean PDF, no watermark" />
          </div>
        </section>

        <section className="py-14 border-t border-border/60">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">Built for the last-mile signature</h2>
              <p className="text-muted-foreground/80 font-medium">
                Forms, permission slips, contracts, and anything you used to print, sign, and scan.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <ul className="space-y-3 text-sm font-semibold text-muted-foreground/85">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-primary" />
                  Students returning school forms
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-primary" />
                  Freelancers signing a one-off contract
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-primary" />
                  Anyone emailed a PDF that needs a signature today
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-primary" />
                  <Link href="/fill-pdf" className="text-accent hover:underline">
                    Fill blanks, then sign, in the same file
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="py-14 border-t border-border/60">
          <div className="rounded-2xl border border-border bg-muted/20 p-8">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl md:text-2xl font-black tracking-tight">Your files stay private</h2>
                <p className="text-muted-foreground/80 font-medium max-w-2xl">
                  Guest signing runs in your browser. We don&apos;t need an account to let you sign and download.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 border-t border-border/60">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-center">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto mt-8">
            {HOME_FAQS.map((faq, index) => (
              <AccordionItem key={faq.question} value={`home-faq-${index}`}>
                <AccordionTrigger className="text-left text-base sm:text-lg font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  <LinkedCopy text={faq.answer} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="py-14 border-t border-border/60">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-center">
            Signing on a different device?
          </h2>
          <p className="mt-3 text-center text-muted-foreground">
            <LinkedCopy text={"Same free signer — pick the [Mac](/sign-pdf-on-mac), [Chromebook](/sign-pdf-on-chromebook), or [mobile](/sign-pdf-mobile) guide that matches how you're signing."} />
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {LAUNCH_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:border-accent/50 hover:text-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="py-14 border-t border-border/60">
          <div className="rounded-3xl border border-border bg-card p-10 text-center space-y-4">
            <h2 className="text-2xl md:text-4xl font-black tracking-tight">Sign your PDF in seconds</h2>
            <div className="flex flex-col items-center gap-3">
              <Button variant="hero" size="xl" asChild>
                <Link href="/edit/new?tool=sign">Upload a PDF to sign</Link>
              </Button>
              <div className="text-xs text-muted-foreground/70 font-bold">No account required</div>
            </div>
          </div>
        </section>

        <WaitlistFooter />
        <footer className="py-10 border-t border-border/60 text-center text-xs text-muted-foreground/60 font-semibold">
          <div className="flex items-center justify-center gap-2">
            <BrandLogo variant="mark" className="h-8 w-8" />
            <span>© {year} scrixo</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

function StepCard({
  icon: Icon,
  step,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="w-full max-w-sm mx-auto text-center">
      <div className="relative mx-auto h-40 w-56 flex items-center justify-center">
        <div className="absolute inset-0 rounded-3xl bg-muted/10" />
        <div className="absolute left-10 top-6 h-24 w-16 rounded-2xl bg-white shadow-md border border-border/60 -rotate-6" />
        <div className="absolute left-14 top-8 h-24 w-16 rounded-2xl bg-white shadow-md border border-border/60 rotate-6" />
        <div className="absolute left-1/2 -translate-x-1/2 top-10 h-20 w-20 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center shadow-sm">
          <Icon className="h-10 w-10 text-accent" />
        </div>
        <div className="absolute right-8 bottom-7 h-10 w-10 rounded-2xl bg-white border border-border/60 shadow-md flex items-center justify-center rotate-6">
          <MousePointer2 className="h-6 w-6 text-foreground/70" />
        </div>
      </div>

      <div className="text-6xl md:text-7xl font-black tracking-tight text-foreground/80 leading-none mt-2">
        {step}
      </div>
      <div className="mt-3 text-lg font-black tracking-tight">{title}</div>
      <div className="mt-2 text-sm font-semibold text-muted-foreground/80">{description}</div>
    </div>
  );
}
