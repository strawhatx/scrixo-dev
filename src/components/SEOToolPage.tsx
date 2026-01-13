"use client";

import React, { useRef } from "react";
import { PDFUpload } from "@/components/PDFUpload";
import { useFileStore } from "@/store/useFileStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AdSidebar } from "@/components/AdSidebar";

interface SEOToolPageProps {
  mainKeyword: string;
  h2Keywords: string[];
  description: string;
  tool: "sign" | "draw" | "field" | "image" | "merge" | "split" | "rearrange" | "rotate";
  features?: string[];
}

export function SEOToolPage({
  mainKeyword,
  h2Keywords,
  description,
  tool,
  features = [],
}: SEOToolPageProps) {
  const setFile = useFileStore((state) => state.setFile);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelectWithTool = (file: File) => {
    setFile(file);
    // Navigate to editor with tool param
    router.push(`/edit/new?tool=${tool}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col xl:flex-row overflow-hidden font-sans">
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-y-auto pb-20 xl:pb-8">
        <div className="w-full max-w-4xl space-y-6 sm:space-y-8">
          {/* H1 - Main Keyword */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-center px-2">
            {mainKeyword}
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground text-center max-w-3xl mx-auto px-4">
            {description}
          </p>

          {/* Live Demo - PDF Upload */}
          <div className="w-full max-w-2xl mx-auto px-4">
            <PDFUpload
              onFileSelect={handleFileSelectWithTool}
              minimal={false}
              inputId="seo-tool-upload"
            />
          </div>

          {/* CTA Button */}
          <div className="flex justify-center px-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="lg"
              className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-bold bg-[#ff5a3c] text-white hover:bg-[#ff4a2a] shadow-lg hover:shadow-xl transition-all touch-manipulation min-h-[44px]"
            >
              Do it now — free
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

          {/* H2 Keywords Section */}
          <div className="space-y-5 sm:space-y-6 mt-8 sm:mt-12 px-4">
            {h2Keywords.map((keyword, index) => (
              <div key={index} className="space-y-2 sm:space-y-3">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
                  {keyword}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Our free online tool lets you {keyword.toLowerCase()} without any watermarks, 
                  signup requirements, or hidden fees. Simply upload your PDF and start editing instantly.
                </p>
              </div>
            ))}
          </div>

          {/* Features List */}
          {features.length > 0 && (
            <div className="mt-8 sm:mt-12 space-y-4 px-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
                Why Choose Our Free PDF Tool?
              </h2>
              <ul className="space-y-2 sm:space-y-3 list-disc list-inside text-muted-foreground">
                {features.map((feature, index) => (
                  <li key={index} className="text-base sm:text-lg">
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional SEO Content */}
          <div className="mt-8 sm:mt-12 space-y-3 sm:space-y-4 text-muted-foreground leading-relaxed px-4 pb-4">
            <p className="text-sm sm:text-base">
              Looking for a way to {mainKeyword.toLowerCase()}? Our free online PDF editor makes it 
              easy to {mainKeyword.toLowerCase()} without downloading any software or creating an account. 
              All processing happens in your browser, ensuring your documents stay private and secure.
            </p>
            <p className="text-sm sm:text-base">
              Whether you need to {mainKeyword.toLowerCase()} for work, school, or personal use, 
              our tool provides instant results with no watermarks and no login required. 
              Get started now and experience the fastest way to {mainKeyword.toLowerCase()}.
            </p>
          </div>
        </div>
      </main>

      <AdSidebar />
    </div>
  );
}

