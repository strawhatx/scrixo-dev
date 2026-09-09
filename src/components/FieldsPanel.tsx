"use client";

import React from "react";
import { CalendarDays, PenLine, TextCursorInput } from "lucide-react";

import { cn } from "@/lib/utils";
import type { FieldKind } from "@/types/fields";

const FIELD_DRAG_MIME = "application/x-scrixo-field";

const PLACEABLE_FIELDS: Array<{
  id: FieldKind;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "text", label: "Text Field", Icon: TextCursorInput },
  { id: "signature", label: "Signature", Icon: PenLine },
  { id: "date", label: "Date", Icon: CalendarDays },
];

export function FieldsPanel({
  selected,
  armed = false,
  onSelect,
  className,
  variant = "floating",
}: {
  selected: FieldKind;
  armed?: boolean;
  onSelect: (k: FieldKind) => void;
  onClose?: () => void;
  className?: string;
  variant?: "floating" | "bar";
}) {
  const inner = (
    <div className={cn("flex items-center gap-1", variant === "bar" ? "min-w-max px-2 py-1.5" : "px-2 py-1.5")}>
      {PLACEABLE_FIELDS.map(({ id, label, Icon }) => {
        const isArmed = armed && selected === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            draggable
            onDragStart={(e) => {
              try {
                e.dataTransfer.effectAllowed = "copy";
                e.dataTransfer.setData(FIELD_DRAG_MIME, JSON.stringify({ kind: id }));
                e.dataTransfer.setData("text/plain", JSON.stringify({ kind: id }));
              } catch {
                // ignore
              }
              onSelect(id);
            }}
            className={cn(
              "h-8 px-2.5 rounded-md flex items-center gap-1.5 text-sm font-medium",
              isArmed ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            title="Select, then click the PDF once to place"
          >
            <Icon className="h-4 w-4" />
            <span className="whitespace-nowrap">{label}</span>
          </button>
        );
      })}
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

export function FieldsMobileBar({
  selected,
  armed = false,
  onSelect,
}: {
  selected: FieldKind;
  armed?: boolean;
  onSelect: (k: FieldKind) => void;
}) {
  return (
    <FieldsPanel variant="bar" selected={selected} armed={armed} onSelect={onSelect} />
  );
}
