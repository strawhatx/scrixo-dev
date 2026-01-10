"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { 
  MousePointer2,
  PenLine, 
  Pencil,
  ImageIcon,
  FormInput,
  Combine,
  SplitSquareHorizontal,
  LayoutGrid,
  RotateCw,
  MoreHorizontal,
  Undo2, 
  Redo2,
  Minus,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export type ToolType =
  | "select"
  | "sign"
  | "draw"
  | "image"
  | "field"
  | "merge"
  | "split"
  | "rearrange"
  | "rotate"
  | "more";

interface EditorToolbarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  isPro?: boolean;
}

const tools = [
  { id: "select" as ToolType, icon: MousePointer2, label: "Select" },
  { id: "sign" as ToolType, icon: PenLine, label: "Sign" },
  { id: "draw" as ToolType, icon: Pencil, label: "Draw" },
  { id: "image" as ToolType, icon: ImageIcon, label: "Image" },
  { id: "field" as ToolType, icon: FormInput, label: "Field" },
];

const actions = [
  { id: "merge" as ToolType, icon: Combine, label: "Merge" },
  { id: "split" as ToolType, icon: SplitSquareHorizontal, label: "Split" },
  { id: "rearrange" as ToolType, icon: LayoutGrid, label: "Rearrange" },
  { id: "rotate" as ToolType, icon: RotateCw, label: "Rotate" },
  { id: "more" as ToolType, icon: MoreHorizontal, label: "More" },
];

export function EditorToolbar({
  activeTool,
  onToolChange,
  isPro = false,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center justify-between bg-card border-b border-border px-4 py-1">
      <div className="flex items-center">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`flex flex-col items-center justify-center px-3 py-1 rounded-lg transition-colors min-w-[48px] ${
              activeTool === tool.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <tool.icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">{tool.label}</span>
          </button>
        ))}
        
        <Separator orientation="vertical" className="h-10 mx-2" />
        
        {actions.map((action) => (
          // Advanced actions are Pro-only for now.
          <button
            key={action.id}
            onClick={() => onToolChange(action.id)}
            disabled={!isPro}
            className={`flex flex-col items-center justify-center px-3 py-1 rounded-lg transition-colors min-w-[48px] ${
              !isPro
                ? "opacity-40 cursor-not-allowed text-muted-foreground"
                : activeTool === action.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <action.icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">{action.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="w-8 h-8">
          <Search className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function EditorFloatingControls({
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  zoom,
  canUndo,
  canRedo,
}: {
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const content = useMemo(() => {
  return (
      <div className="pointer-events-none fixed inset-x-0 bottom-4 pb-[env(safe-area-inset-bottom)] flex justify-center z-[60]">
        <div className="pointer-events-auto flex items-center gap-1 bg-card/80 backdrop-blur-md border border-border shadow-lg rounded-full px-2 py-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={onUndo}
        disabled={!canUndo}
        className="w-9 h-9"
      >
        <Undo2 className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRedo}
        disabled={!canRedo}
        className="w-9 h-9"
      >
        <Redo2 className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomOut}
        disabled={zoom <= 50}
        className="w-9 h-9"
      >
        <Minus className="w-4 h-4" />
      </Button>
      <span className="text-sm font-semibold text-foreground w-12 text-center tabular-nums">
        {zoom}%
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomIn}
        disabled={zoom >= 200}
        className="w-9 h-9"
      >
        <Plus className="w-4 h-4" />
      </Button>
        </div>
    </div>
  );
  }, [canRedo, canUndo, onRedo, onUndo, onZoomIn, onZoomOut, zoom]);

  if (!mounted) return null;
  return createPortal(content, document.body);
}
