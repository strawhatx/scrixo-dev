"use client";

import React, { useRef } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Copy,
  Italic,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TextAlign, TextFontFamily } from "@/lib/text-style";
import { TEXT_FONT_STACK } from "@/lib/text-style";

const FONTS: Array<{ id: TextFontFamily; label: string }> = [
  { id: "helvetica", label: "Helvetica" },
  { id: "times", label: "Times" },
  { id: "courier", label: "Courier" },
];

export function TextToolsPanel({
  fontSize,
  onFontSizeChange,
  fontFamily,
  onFontFamilyChange,
  color,
  onColorChange,
  bold,
  onBoldChange,
  italic,
  onItalicChange,
  align,
  onAlignChange,
  canDuplicate,
  canDelete,
  onDuplicate,
  onDelete,
  className,
  variant = "floating",
}: {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  fontFamily: TextFontFamily;
  onFontFamilyChange: (family: TextFontFamily) => void;
  color: string;
  onColorChange: (hex: string) => void;
  bold: boolean;
  onBoldChange: (bold: boolean) => void;
  italic: boolean;
  onItalicChange: (italic: boolean) => void;
  align: TextAlign;
  onAlignChange: (align: TextAlign) => void;
  canDuplicate?: boolean;
  canDelete?: boolean;
  onDuplicate?: () => void;
  onDelete?: () => void;
  className?: string;
  variant?: "floating" | "bar";
}) {
  const colorInputRef = useRef<HTMLInputElement>(null);

  const inner = (
    <div
      className={cn(
        "flex items-center gap-1",
        variant === "bar" ? "min-w-max px-2 py-1.5" : "px-2 py-1.5"
      )}
      onMouseDown={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("select, input")) return;
        e.preventDefault();
      }}
    >
      <button
        type="button"
        onClick={() => colorInputRef.current?.click()}
        className="flex items-center gap-1 h-8 px-1.5 rounded-md hover:bg-muted"
        aria-label="Text color"
        title="Text color"
      >
        <span className="h-5 w-5 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: color }} />
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
        <input
          ref={colorInputRef}
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="sr-only"
          tabIndex={-1}
        />
      </button>

      <select
        value={fontFamily}
        onChange={(e) => onFontFamilyChange(e.target.value as TextFontFamily)}
        aria-label="Font"
        className="h-8 max-w-[128px] rounded-md border border-border bg-background px-2 text-sm font-medium text-foreground"
        style={{ fontFamily: TEXT_FONT_STACK[fontFamily] }}
      >
        {FONTS.map((font) => (
          <option key={font.id} value={font.id} style={{ fontFamily: TEXT_FONT_STACK[font.id] }}>
            {font.label}
          </option>
        ))}
      </select>

      <input
        type="number"
        min={8}
        max={72}
        value={fontSize}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (!Number.isFinite(next)) return;
          onFontSizeChange(Math.max(8, Math.min(72, Math.round(next))));
        }}
        aria-label="Font size"
        className="h-8 w-12 rounded-md border border-border bg-background text-center text-sm font-medium tabular-nums"
      />

      <Divider />

      <Toggle pressed={bold} label="Bold" onClick={() => onBoldChange(!bold)}>
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle pressed={italic} label="Italic" onClick={() => onItalicChange(!italic)}>
        <Italic className="h-4 w-4" />
      </Toggle>

      <Divider />

      <Toggle pressed={align === "left"} label="Align left" onClick={() => onAlignChange("left")}>
        <AlignLeft className="h-4 w-4" />
      </Toggle>
      <Toggle pressed={align === "center"} label="Align center" onClick={() => onAlignChange("center")}>
        <AlignCenter className="h-4 w-4" />
      </Toggle>
      <Toggle pressed={align === "right"} label="Align right" onClick={() => onAlignChange("right")}>
        <AlignRight className="h-4 w-4" />
      </Toggle>

      <Divider />

      <IconButton label="Duplicate" disabled={!canDuplicate} onClick={onDuplicate}>
        <Copy className="h-4 w-4" />
      </IconButton>
      <IconButton label="Delete" disabled={!canDelete} onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </IconButton>
    </div>
  );

  if (variant === "bar") {
    return (
      <div className={cn("border-t border-border bg-card overflow-x-auto scrollbar-hide", className)}>
        {inner}
      </div>
    );
  }

  return (
    <div className={cn("pointer-events-auto", className)}>
      <div className="rounded-xl border border-border bg-card shadow-xl overflow-x-auto scrollbar-hide">
        {inner}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="mx-1 h-6 w-px shrink-0 bg-border" />;
}

function Toggle({
  pressed,
  label,
  onClick,
  children,
}: {
  pressed: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={onClick}
      className={cn(
        "h-8 w-8 rounded-md flex items-center justify-center",
        pressed ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
    >
      {children}
    </button>
  );
}
