"use client";

import React from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  CheckSquare,
  CircleDot,
  List,
  PenLine,
  TextCursorInput,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { FieldKind } from "@/types/fields";
import { useIsMobile } from "@/hooks/use-mobile";

const FIELD_DRAG_MIME = "application/x-scrixo-field";

export function FieldsPanel({
  selected,
  onSelect,
  onClose,
  className,
  variant = "docked",
}: {
  selected: FieldKind;
  onSelect: (k: FieldKind) => void;
  onClose: () => void;
  className?: string;
  variant?: "docked" | "floating";
}) {
  const isMobile = useIsMobile();
  const items: Array<{
    id: FieldKind;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
    size: "lg" | "sm";
    enabled: boolean;
  }> = [
    { id: "signature", label: "Signature", Icon: PenLine, size: "lg", enabled: true },
    { id: "text", label: "Text Field", Icon: TextCursorInput, size: "lg", enabled: true },
    { id: "checkbox", label: "Checkbox", Icon: CheckSquare, size: "lg", enabled: true },
    { id: "radio", label: "Radio", Icon: CircleDot, size: "lg", enabled: true },
    { id: "select", label: "Select", Icon: List, size: "sm", enabled: true },
    { id: "date", label: "Date", Icon: CalendarDays, size: "sm", enabled: true },
    { id: "list", label: "List", Icon: List, size: "sm", enabled: true },
  ];

  // Mobile: Render inline horizontal toolbar (should be rendered in Editor component)
  if (isMobile) {
    return null;
  }

  // Desktop: Vertical sidebar panel
  return (
    <div
      className={cn(
        variant === "docked"
          ? "shrink-0 w-24 border-r border-border bg-card/50 backdrop-blur-sm"
          : "pointer-events-auto absolute z-[70] w-20",
        className
      )}
    >
      <div className={cn(variant === "docked" ? "h-full" : "rounded-2xl border border-border bg-card shadow-xl overflow-hidden")}>
        
        <div className="p-4">
          <div className="flex flex-col gap-3">
            {items
              .map(({ id, label, Icon, enabled }) => {
                const isSelected = selected === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      if (!enabled) {
                        toast.message("Coming soon", { description: `${label} fields aren't implemented yet.` });
                        return;
                      }
                      onSelect(id);
                    }}
                    draggable={enabled}
                    onDragStart={(e) => {
                      if (!enabled) return;
                      try {
                        e.dataTransfer.effectAllowed = "copy";
                        e.dataTransfer.setData(FIELD_DRAG_MIME, JSON.stringify({ kind: id }));
                        // Cross-browser fallback (some browsers block custom MIME reads during dragover).
                        e.dataTransfer.setData("text/plain", JSON.stringify({ kind: id }));
                      } catch {
                        // ignore
                      }
                    }}
                    className={cn(
                      "rounded-xl border p-2 bg-background transition-colors text-center",
                      enabled ? "hover:bg-muted/40" : "opacity-50 cursor-not-allowed",
                      isSelected ? "border-primary ring-2 ring-primary/20" : "border-border"
                    )}
                    title={enabled ? "Drag onto the PDF to place" : "Coming soon"}
                  >
                    <div className="mx-auto h-3 w-3 rounded-xl bg-muted flex items-center justify-center">
                      <Icon className="h-6 w-6 text-foreground" />
                    </div>
                    <div className="mt-3 text-[10px]">{label}</div>
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile horizontal toolbar
export function FieldsMobileBar({
  selected,
  onSelect,
}: {
  selected: FieldKind;
  onSelect: (k: FieldKind) => void;
}) {
  const items: Array<{
    id: FieldKind;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
    enabled: boolean;
  }> = [
    { id: "signature", label: "Signature", Icon: PenLine, enabled: true },
    { id: "text", label: "Text", Icon: TextCursorInput, enabled: true },
    { id: "checkbox", label: "Checkbox", Icon: CheckSquare, enabled: true },
    { id: "radio", label: "Radio", Icon: CircleDot, enabled: true },
    { id: "select", label: "Select", Icon: List, enabled: true },
    { id: "date", label: "Date", Icon: CalendarDays, enabled: true },
    { id: "list", label: "List", Icon: List, enabled: true },
  ];

  return (
    <div className="border-t border-border bg-card px-2 py-2">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {items.map(({ id, label, Icon, enabled }) => {
          const isSelected = selected === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                if (!enabled) {
                  toast.message("Coming soon", { description: `${label} fields aren't implemented yet.` });
                  return;
                }
                onSelect(id);
              }}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-1.5 rounded-lg transition-colors min-w-[56px] touch-manipulation shrink-0",
                enabled
                  ? isSelected
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground active:bg-muted border border-transparent"
                  : "opacity-50 cursor-not-allowed"
              )}
              title={enabled ? `Select ${label}` : "Coming soon"}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] font-medium leading-tight">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

