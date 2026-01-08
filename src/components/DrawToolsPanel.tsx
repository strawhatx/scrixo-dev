"use client";

import React, { useMemo, useRef } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Eraser, Highlighter, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export type DrawTool = "pen" | "highlighter" | "eraser";

export function DrawToolsPanel({
  tool,
  onToolChange,
  color,
  onColorChange,
  width,
  onWidthChange,
  className,
}: {
  tool: DrawTool;
  onToolChange: (t: DrawTool) => void;
  color: string;
  onColorChange: (hex: string) => void;
  width: number;
  onWidthChange: (w: number) => void;
  className?: string;
}) {
  const presetColors = useMemo(
    () => [
      "#000000",
      "#3b82f6",
      "#8b5cf6",
      "#ffffff",
    ],
    []
  );
  const customColorInputRef = useRef<HTMLInputElement>(null);
  const isPresetSelected = presetColors.some((c) => c.toLowerCase() === color.toLowerCase());
  const customSwatchColor = isPresetSelected ? "#ff5a3c" : color;

  const toolItems: Array<{ id: DrawTool; label: string; Icon: React.ComponentType<{ className?: string }> }> = [
    { id: "pen", label: "Pen", Icon: Pencil },
    { id: "highlighter", label: "Highlight", Icon: Highlighter },
    { id: "eraser", label: "Eraser", Icon: Eraser },
  ];

  return (
    <div className={cn("pointer-events-auto absolute z-[70]", className)}>
      <div className="w-[46px] rounded-xl border border-border bg-card shadow-xl overflow-hidden">
        <div className="px-2 pt-2 pb-2 space-y-2">
          {toolItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onToolChange(id)}
              className={cn(
                "h-9 w-full rounded-lg flex items-center justify-center border transition-colors",
                tool === id
                  ? "border-[#ff5a3c]/40 bg-[#ff5a3c]/10 text-[#ff5a3c]"
                  : "border-border bg-background hover:bg-muted text-foreground"
              )}
              aria-label={label}
              title={label}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <div className="px-2 pb-3">
          <div className="mx-auto my-2 h-px w-10 bg-border" />

          {/* Stroke size */}
          <div className="px-1 pb-2 flex items-center justify-center">
            <ThicknessSlider value={width} onChange={onWidthChange} />
          </div>

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

            {/* Custom color (5th swatch) */}
            <button
              type="button"
              onClick={() => customColorInputRef.current?.click()}
              className={cn(
                "h-7 w-7 rounded-full border flex items-center justify-center transition-transform",
                !isPresetSelected ? "border-[#ff5a3c] ring-2 ring-[#ff5a3c]/30" : "border-border hover:scale-105"
              )}
              aria-label="Custom color"
              title={isPresetSelected ? "Custom color" : `Custom: ${color}`}
            >
              <span
                className="h-4 w-4 rounded-full border border-border"
                style={{ backgroundColor: customSwatchColor }}
              />
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

function ThicknessSlider({
  value,
  onChange,
  min = 2,
  max = 24,
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
      {/* Ghost/background */}
      <div
        className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 opacity-30"
        style={{
          background: "hsl(var(--muted-foreground))",
          clipPath: "polygon(15% 0%, 85% 0%, 50% 100%)",
          borderRadius: "999px",
        }}
      />

      {/* Active tapered fill from bottom up to thumb */}
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
        aria-label="Stroke size"
      >
        {/* Invisible track; we render our own visuals above */}
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



