"use client";

import React, { useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  FileText,
  FormInput,
  ImageIcon,
  PenLine,
  Pencil,
  Combine,
  SplitSquareHorizontal,
  LayoutGrid,
  RotateCw,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { PDFUpload } from "@/components/PDFUpload";
import { SiteHeader } from "@/components/SiteHeader";
import { WaitlistFooter } from "@/components/WaitlistForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useFileStore } from "@/store/useFileStore";
import { cn } from "@/lib/utils";
import type { ContentSection, FAQItem, HowToStep, RelatedLink } from "@/lib/seo-content";
import { DEFAULT_SIGN_STEPS, relatedLinksFor } from "@/lib/seo-content";

interface SEOToolPageProps {
  mainKeyword: string;
  h2Keywords: string[];
  description: string;
  tool: "sign" | "draw" | "field" | "image" | "merge" | "split" | "rearrange" | "rotate";
  features?: string[];
  explainer?: string;
  howToTitle?: string;
  howToSteps?: HowToStep[];
  sections?: ContentSection[];
  faqs?: FAQItem[];
  relatedLinks?: RelatedLink[];
  ctaLabel?: string;
  uploadHint?: string;
  pathname?: string;
}

const toolIcons = {
  sign: PenLine,
  draw: Pencil,
  field: FormInput,
  image: ImageIcon,
  merge: Combine,
  split: SplitSquareHorizontal,
  rearrange: LayoutGrid,
  rotate: RotateCw,
};

const toolColors = {
  sign: "from-blue-50 to-white",
  draw: "from-purple-50 to-white",
  field: "from-green-50 to-white",
  image: "from-pink-50 to-white",
  merge: "from-orange-50 to-white",
  split: "from-cyan-50 to-white",
  rearrange: "from-indigo-50 to-white",
  rotate: "from-yellow-50 to-white",
};

export function SEOToolPage({
  mainKeyword,
  h2Keywords,
  description,
  tool,
  features = [],
  explainer,
  howToTitle,
  howToSteps,
  sections,
  faqs,
  relatedLinks,
  ctaLabel,
  uploadHint,
  pathname,
}: SEOToolPageProps) {
  const setFile = useFileStore((state) => state.setFile);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ToolIcon = toolIcons[tool] || FileText;
  const toolColor = toolColors[tool] || "from-gray-50 to-white";
  const isSign = tool === "sign";
  const steps = howToSteps ?? (isSign ? DEFAULT_SIGN_STEPS : undefined);
  const links = relatedLinks ?? (pathname ? relatedLinksFor(pathname) : relatedLinksFor(""));

  const resolvedCta =
    ctaLabel ??
    (isSign ? "Sign this PDF — 100% Free" : tool === "field" ? "Fill this PDF — 100% Free" : "Start now — 100% Free");
  const resolvedHint =
    uploadHint ??
    (isSign
      ? "Upload your PDF and add a signature in your browser"
      : tool === "field"
        ? "Upload your PDF and fill it in without printing"
        : "Upload your PDF and start right away");

  const handleFileSelectWithTool = (file: File) => {
    setFile(file);
    router.push(`/edit/new?tool=${tool}`);
  };

  const jsonLd = useMemo(() => {
    const graph: Record<string, unknown>[] = [];
    if (steps && steps.length > 0) {
      graph.push({
        "@type": "HowTo",
        name: howToTitle || `How to ${mainKeyword.toLowerCase()}`,
        description,
        step: steps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.name,
          text: step.text,
        })),
      });
    }
    if (faqs && faqs.length > 0) {
      graph.push({
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      });
    }
    if (graph.length === 0) return null;
    return {
      "@context": "https://schema.org",
      "@graph": graph,
    };
  }, [description, faqs, howToTitle, mainKeyword, steps]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <SiteHeader />
      <main className="flex-1 flex flex-col items-center p-4 sm:p-6 md:p-8 relative overflow-y-auto">
        <div className="w-full max-w-4xl space-y-8 sm:space-y-12">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div
                className={cn(
                  "h-20 w-20 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                  toolColor
                )}
              >
                <ToolIcon className="h-10 w-10 text-[#ff5a3c]" />
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground px-2">
              {mainKeyword}
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto px-4 font-medium leading-relaxed">
              {description}
            </p>
          </div>

          <Card className={cn("p-6 sm:p-8 md:p-10 border-2 shadow-xl", "bg-gradient-to-br", toolColor)}>
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Get started in seconds</h2>
                <p className="text-muted-foreground">{resolvedHint}</p>
              </div>

              <div className="w-full max-w-2xl mx-auto">
                <PDFUpload
                  onFileSelect={handleFileSelectWithTool}
                  minimal={false}
                  inputId="seo-tool-upload"
                />
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="lg"
                  className="h-14 px-8 text-lg font-black bg-[#ff5a3c] text-white hover:bg-[#ff4a2a] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all touch-manipulation"
                >
                  {resolvedCta}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelectWithTool(file);
                  }}
                />
              </div>
            </div>
          </Card>

          {explainer && (
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed px-4 max-w-3xl mx-auto">
              {explainer}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
            <Card className="p-6 border border-border/60">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-xl flex-shrink-0">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Works in the browser</h3>
                  <p className="text-sm text-muted-foreground">No app, printer, or scanner. Sign and download in seconds.</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border border-border/60">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-xl flex-shrink-0">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Stays on your device</h3>
                  <p className="text-sm text-muted-foreground">Guest signing happens locally in your browser. No account required.</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border border-border/60">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-xl flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Free, no watermark</h3>
                  <p className="text-sm text-muted-foreground">Sign and export a clean PDF you can send back immediately.</p>
                </div>
              </div>
            </Card>
          </div>

          {steps && steps.length > 0 && (
            <div className="space-y-6 px-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-center">
                {howToTitle || `How to ${mainKeyword.toLowerCase()}`}
              </h2>
              <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {steps.map((step, index) => (
                  <Card key={step.name} className="p-6 border border-border/60">
                    <div className="text-4xl font-black text-[#ff5a3c]/80 mb-3">{index + 1}</div>
                    <h3 className="font-bold text-lg mb-2">{step.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
                  </Card>
                ))}
              </ol>
            </div>
          )}

          {sections && sections.length > 0 ? (
            <div className="space-y-6 px-4">
              {sections.map((section) => (
                <Card key={section.heading} className="p-6 border border-border/60">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3">
                    {section.heading}
                  </h2>
                  <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                    {section.body}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-6 px-4">
              {h2Keywords.map((keyword) => (
                <Card key={keyword} className="p-6 border border-border/60">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3">
                    {keyword}
                  </h2>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {isSign
                      ? `Use Scrixo to ${keyword.toLowerCase()} in your browser — no account, no printing, and no watermark on the downloaded file.`
                      : `Our free online tool lets you ${keyword.toLowerCase()} without watermarks, signup requirements, or hidden fees.`}
                  </p>
                </Card>
              ))}
            </div>
          )}

          {features.length > 0 && (
            <div className="space-y-6 px-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-center">
                {isSign ? "Why people sign PDFs here" : "Why choose our free PDF tool?"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature) => (
                  <Card key={feature} className="p-4 border border-border/60 hover:border-[#ff5a3c]/40 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-[#ff5a3c]/10 text-[#ff5a3c] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-5 w-5" />
                      </div>
                      <p className="text-base sm:text-lg font-semibold text-foreground pt-1">{feature}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {faqs && faqs.length > 0 && (
            <div className="space-y-4 px-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-center">
                Frequently asked questions
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={faq.question} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left text-base sm:text-lg font-semibold">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {links.length > 0 && (
            <div className="space-y-4 px-4 pb-8">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-center">
                Signing on a different device?
              </h2>
              <p className="text-center text-muted-foreground">
                Same tool, same free download — pick the guide that matches how you&apos;re signing.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:border-[#ff5a3c]/50 hover:text-[#ff5a3c] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <WaitlistFooter />
    </div>
  );
}
