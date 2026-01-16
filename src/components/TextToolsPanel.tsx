"use client";

import React, { useMemo, useRef } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export function TextToolsPanel({
  fontSize,
  onFontSizeChange,
  color,
  onColorChange,
  className,
}: {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  color: string;
  onColorChange: (hex: string) => void;
  className?: string;
}) {
  const isMobile = useIsMobile();
  const presetColors = useMemo(
    () => [
      "#000000",
      "#3b82f6",
      "#ef4444",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#ffffff",
    ],
    []
  );
  const customColorInputRef = useRef<HTMLInputElement>(null);
  const isPresetSelected = presetColors.some((c) => c.toLowerCase() === color.toLowerCase());
  const isCustomSelected = !isPresetSelected;
  const customSwatchColor = isPresetSelected ? "#ff5a3c" : color;
  const customRainbowBg =
    "conic-gradient(from 0deg, #ff004c, #ff8a00, #ffe600, #18d26b, #00c2ff, #7b61ff, #ff00c8, #ff004c)";

  // Mobile: Render inline horizontal toolbar (should be rendered in Editor component)
  if (isMobile) {
    return null;
  }

  // Desktop: Vertical sidebar panel
  return (
    <div className={cn("pointer-events-auto absolute z-[70]", className)}>
      <div className="w-[46px] rounded-xl border border-border bg-card shadow-xl overflow-hidden">
        {/* Font size slider */}
        <div className="px-2 pt-3 pb-2">
          <div className="px-1 pb-2 flex items-center justify-center">
            <FontSizeSlider value={fontSize} onChange={onFontSizeChange} />
          </div>
          <div className="text-[10px] text-center text-muted-foreground mt-1">
            {fontSize}px
          </div>
        </div>

        <div className="px-2 pb-3">
          <div className="mx-auto my-2 h-px w-10 bg-border" />

          {/* Colors */}
          <div className="grid grid-cols-1 gap-2 justify-items-center pt-2 pb-2">
            {presetColors.map((c) => {
              const isSelected = c.toLowerCase() === color.toLowerCase();
              const isWhite = c.toLowerCase() === "#ffffff";
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onColorChange(c)}
                  className={cn(
                    "h-7 w-7 rounded-full border flex items-center justify-center transition-transform",
                    isSelected ? "border-[#ff5a3c] ring-2 ring-[#ff5a3c]/30" : "border-border hover:scale-105"
                  )}
                  aria-label={`Color ${c}`}
                  title={c}
                >
                  <span
                    className={cn(
                      "h-4 w-4 rounded-full",
                      isWhite ? "border border-border" : ""
                    )}
                    style={{ backgroundColor: c }}
                  />
                </button>
              );
            })}

            {/* Custom color */}
            <button
              type="button"
              onClick={() => customColorInputRef.current?.click()}
              className={cn(
                "h-7 w-7 rounded-full border flex items-center justify-center transition-transform",
                isCustomSelected
                  ? "border-[#ff5a3c] ring-2 ring-[#ff5a3c]/30 shadow-sm"
                  : "border-border hover:scale-105"
              )}
              aria-label="Custom color"
              title={isPresetSelected ? "Custom color" : `Custom: ${color}`}
            >
              <span
                className="h-6 w-6 rounded-full p-[2px]"
                style={{ backgroundImage: customRainbowBg }}
                aria-hidden="true"
              >
                <span
                  className="block h-full w-full rounded-full p-[2px]"
                  style={{ background: "hsl(var(--background))" }}
                >
                  <span
                    className="block h-full w-full rounded-full border border-border"
                    style={
                      isCustomSelected
                        ? { backgroundColor: customSwatchColor }
                        : { backgroundImage: customRainbowBg }
                    }
                  />
                </span>
              </span>
              <input
                ref={customColorInputRef}
                type="color"
                value={customSwatchColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="sr-only"
                aria-hidden="true"
                tabIndex={-1}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile horizontal toolbar
export function TextToolsMobileBar({
  fontSize,
  onFontSizeChange,
  color,
  onColorChange,
}: {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  color: string;
  onColorChange: (hex: string) => void;
}) {
  const presetColors = useMemo(
    () => [
      "#000000",
      "#3b82f6",
      "#ef4444",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#ffffff",
    ],
    []
  );
  const customColorInputRef = useRef<HTMLInputElement>(null);
  const isPresetSelected = presetColors.some((c) => c.toLowerCase() === color.toLowerCase());
  const isCustomSelected = !isPresetSelected;
  const customSwatchColor = isPresetSelected ? "#ff5a3c" : color;
  const customRainbowBg =
    "conic-gradient(from 0deg, #ff004c, #ff8a00, #ffe600, #18d26b, #00c2ff, #7b61ff, #ff00c8, #ff004c)";

  return (
    <div className="border-t border-border bg-card px-2 py-2">
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
        {/* Font size slider */}
        <div className="flex items-center gap-2 shrink-0 min-w-[100px]">
          <span className="text-xs text-muted-foreground shrink-0">Size:</span>
          <HorizontalFontSizeSlider value={fontSize} onChange={onFontSizeChange} />
          <span className="text-xs text-muted-foreground shrink-0 w-8">{fontSize}px</span>
        </div>

        <div className="h-6 w-px bg-border shrink-0" />

        {/* Colors */}
        <div className="flex items-center gap-2 shrink-0">
          {presetColors.map((c) => {
            const isSelected = c.toLowerCase() === color.toLowerCase();
            const isWhite = c.toLowerCase() === "#ffffff";
            return (
              <button
                key={c}
                type="button"
                onClick={() => onColorChange(c)}
                className={cn(
                  "h-7 w-7 rounded-full border flex items-center justify-center transition-transform touch-manipulation",
                  isSelected ? "border-[#ff5a3c] ring-2 ring-[#ff5a3c]/30" : "border-border active:scale-95"
                )}
                aria-label={`Color ${c}`}
                title={c}
              >
                <span
                  className={cn(
                    "h-4 w-4 rounded-full",
                    isWhite ? "border border-border" : ""
                  )}
                  style={{ backgroundColor: c }}
                />
              </button>
            );
          })}

          {/* Custom color */}
          <button
            type="button"
            onClick={() => customColorInputRef.current?.click()}
            className={cn(
              "h-7 w-7 rounded-full border flex items-center justify-center transition-transform touch-manipulation",
              isCustomSelected
                ? "border-[#ff5a3c] ring-2 ring-[#ff5a3c]/30 shadow-sm"
                : "border-border active:scale-95"
            )}
            aria-label="Custom color"
            title={isPresetSelected ? "Custom color" : `Custom: ${color}`}
          >
            <span
              className="h-5 w-5 rounded-full p-[1px]"
              style={{ backgroundImage: customRainbowBg }}
              aria-hidden="true"
            >
              <span
                className="block h-full w-full rounded-full"
                style={
                  isCustomSelected
                    ? { backgroundColor: customSwatchColor }
                    : { backgroundImage: customRainbowBg }
                }
              />
            </span>
            <input
              ref={customColorInputRef}
              type="color"
              value={customSwatchColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="sr-only"
              aria-hidden="true"
              tabIndex={-1}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

function FontSizeSlider({
  value,
  onChange,
  min = 8,
  max = 72,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const clamped = Math.max(min, Math.min(max, value));
  const pct = ((clamped - min) / (max - min)) * 100;

  return (
    <div className="mx-auto w-8 h-20 relative flex items-center justify-center" style={{ ["--pct" as any]: `${pct}%` }}>
      <div
        className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 opacity-30"
        style={{
          background: "hsl(var(--muted-foreground))",
          clipPath: "polygon(15% 0%, 85% 0%, 50% 100%)",
          borderRadius: "999px",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-6"
        style={{
          height: "var(--pct)",
          background: "hsl(var(--primary))",
          clipPath: "polygon(15% 0%, 85% 0%, 50% 100%)",
          borderRadius: "999px",
        }}
      />
      <SliderPrimitive.Root
        orientation="vertical"
        value={[clamped]}
        min={min}
        max={max}
        step={1}
        onValueChange={(v) => onChange(v[0] ?? clamped)}
        className="relative flex h-20 w-8 touch-none select-none items-center justify-center"
        aria-label="Font size"
      >
        <SliderPrimitive.Track className="relative h-full w-8 rounded-full bg-transparent">
          <SliderPrimitive.Range className="absolute w-full bg-transparent" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            "block h-6 w-6 rounded-full bg-primary shadow-md",
            "border-[6px] border-background",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
        />
      </SliderPrimitive.Root>
    </div>
  );
}

function HorizontalFontSizeSlider({
  value,
  onChange,
  min = 8,
  max = 72,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const clamped = Math.max(min, Math.min(max, value));
  const pct = ((clamped - min) / (max - min)) * 100;

  return (
    <div className="relative flex-1 h-6" style={{ ["--pct" as any]: `${pct}%` }}>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 right-0 opacity-25"
        style={{
          background: "hsl(var(--muted-foreground))",
          borderRadius: "999px",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0"
        style={{
          width: "var(--pct)",
          background: "hsl(var(--primary))",
          borderRadius: "999px",
          opacity: 0.9,
        }}
      />
      <SliderPrimitive.Root
        orientation="horizontal"
        value={[clamped]}
        min={min}
        max={max}
        step={1}
        onValueChange={(v) => onChange(v[0] ?? clamped)}
        className="relative flex h-6 w-full touch-none select-none items-center"
        aria-label="Font size"
      >
        <SliderPrimitive.Track className="relative h-full w-full rounded-full bg-transparent">
          <SliderPrimitive.Range className="absolute h-full bg-transparent" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            "block h-5 w-5 rounded-full bg-primary shadow-md",
            "border-[4px] border-background",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
        />
      </SliderPrimitive.Root>
    </div>
  );
}
