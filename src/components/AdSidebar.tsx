"use client";

import React, { useEffect } from "react";
import { Search } from "lucide-react";

/**
 * Vertical Ad Sidebar Component
 * - Shows on right side on desktop (xl breakpoint)
 * - Moves to bottom on mobile/tablet
 * - Uses Google AdSense with responsive ads
 * - AdSense script is loaded globally in layout.tsx
 */
export function AdSidebar() {
  useEffect(() => {
    // Push the ad after component mounts (AdSense requires this)
    try {
      if (typeof window !== "undefined" && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      // Ignore errors if AdSense isn't loaded yet
    }
  }, []);

  return (
    <>

      {/* Desktop: Right Sidebar */}
      <aside className="w-[300px] bg-muted/30 border-l border-border hidden xl:flex xl:flex-col shrink-0 min-h-0 overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
            Advertisement
          </span>
          <Search className="w-3 h-3 text-muted-foreground/20" />
        </div>
        <div className="flex-1 p-4 min-h-0 overflow-hidden">
          <div className="w-full h-full flex items-center justify-center">
            <ins
              className="adsbygoogle"
              style={{ display: "block" }}
              data-ad-client="ca-pub-6117588691065617"
              data-ad-slot="9784233430"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        </div>
      </aside>

      {/* Mobile/Tablet: Fixed Bottom Banner */}
      <aside className="fixed bottom-0 left-0 right-0 w-full bg-muted/95 backdrop-blur-sm border-t border-border xl:hidden z-50 shadow-lg">
        <div className="p-2 border-b border-border flex items-center justify-between">
          <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
            Advertisement
          </span>
          <Search className="w-2.5 h-2.5 text-muted-foreground/20" />
        </div>
        <div className="p-2 pb-6">
          <div className="w-full flex items-center justify-center max-w-[320px] mx-auto">

          </div>
        </div>
      </aside>
    </>
  );
}

