"use client";

import React, { useRef } from "react";
import { PDFUpload } from "@/components/PDFUpload";
import { useFileStore } from "@/store/useFileStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AdSidebar } from "@/components/AdSidebar";
import { 
  FileText, 
  Check, 
  Zap, 
  Shield, 
  Sparkles,
  PenLine,
  Pencil,
  FormInput,
  ImageIcon,
  Combine,
  SplitSquareHorizontal,
  LayoutGrid,
  RotateCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SEOToolPageProps {
  mainKeyword: string;
  h2Keywords: string[];
  description: string;
  tool: "sign" | "draw" | "field" | "image" | "merge" | "split" | "rearrange" | "rotate";
  features?: string[];
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
}: SEOToolPageProps) {
  const setFile = useFileStore((state) => state.setFile);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ToolIcon = toolIcons[tool] || FileText;
  const toolColor = toolColors[tool] || "from-gray-50 to-white";

  const handleFileSelectWithTool = (file: File) => {
    setFile(file);
    // Navigate to editor with tool param
    router.push(`/edit/new?tool=${tool}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col xl:flex-row overflow-hidden font-sans">
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-y-auto pb-20 xl:pb-8">
        <div className="w-full max-w-4xl space-y-8 sm:space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            {/* Icon Badge */}
            <div className="flex justify-center">
              <div className={cn(
                "h-20 w-20 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                toolColor
              )}>
                <ToolIcon className="h-10 w-10 text-[#ff5a3c]" />
              </div>
            </div>

            {/* H1 - Main Keyword */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground px-2">
              {mainKeyword}
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto px-4 font-medium leading-relaxed">
              {description}
            </p>
          </div>

          {/* Upload Card */}
          <Card className={cn(
            "p-6 sm:p-8 md:p-10 border-2 shadow-xl",
            "bg-gradient-to-br",
            toolColor
          )}>
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Get Started in Seconds
                </h2>
                <p className="text-muted-foreground">
                  Upload your PDF and start editing right away
                </p>
              </div>

              {/* Live Demo - PDF Upload */}
              <div className="w-full max-w-2xl mx-auto">
                <PDFUpload
                  onFileSelect={handleFileSelectWithTool}
                  minimal={false}
                  inputId="seo-tool-upload"
                />
              </div>

              {/* CTA Button */}
              <div className="flex justify-center">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="lg"
                  className="h-14 px-8 text-lg font-black bg-[#ff5a3c] text-white hover:bg-[#ff4a2a] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all touch-manipulation"
                >
                  Start Editing Now — 100% Free
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

          {/* Benefits Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
            <Card className="p-6 border border-border/60">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-xl flex-shrink-0">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Lightning Fast</h3>
                  <p className="text-sm text-muted-foreground">
                    Process PDFs in seconds, not minutes
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border border-border/60">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-xl flex-shrink-0">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">100% Private</h3>
                  <p className="text-sm text-muted-foreground">
                    Files never leave your device
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border border-border/60">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-xl flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Always Free</h3>
                  <p className="text-sm text-muted-foreground">
                    Core features will always be free
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* H2 Keywords Section */}
          <div className="space-y-6 px-4">
            {h2Keywords.map((keyword, index) => (
              <Card key={index} className="p-6 border border-border/60">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3">
                  {keyword}
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Our free online tool lets you {keyword.toLowerCase()} without any watermarks, 
                  signup requirements, or hidden fees. Simply upload your PDF and start editing instantly.
                </p>
              </Card>
            ))}
          </div>

          {/* Features List */}
          {features.length > 0 && (
            <div className="space-y-6 px-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-center">
                Why Choose Our Free PDF Tool?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <Card key={index} className="p-4 border border-border/60 hover:border-[#ff5a3c]/40 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-[#ff5a3c]/10 text-[#ff5a3c] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-5 w-5" />
                      </div>
                      <p className="text-base sm:text-lg font-semibold text-foreground pt-1">
                        {feature}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
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

