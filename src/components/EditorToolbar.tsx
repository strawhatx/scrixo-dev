"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { 
  MousePointer2,
  PenLine,
  FormInput,
  Type,
  Undo2, 
  Redo2,
  Minus,
  Plus,
  Search,
  Menu,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

export type ToolType =
  | "select"
  | "sign"
  | "draw"
  | "image"
  | "field"
  | "text"
  | "merge"
  | "split"
  | "rearrange"
  | "rotate"
  | "more";

interface EditorToolbarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  isPro?: boolean;
  filename?: string;
}

const tools = [
  { id: "select" as ToolType, icon: MousePointer2, label: "Select" },
  { id: "sign" as ToolType, icon: PenLine, label: "Sign" },
  { id: "field" as ToolType, icon: FormInput, label: "Field" },
  { id: "text" as ToolType, icon: Type, label: "Text" },
  // Phase 5 (hidden from v1 sign-focus launch): draw, image
];

// Phase 5 candidates — ToolType union and Editor handlers stay in place.
// Merge / split / rearrange / rotate are hidden from the v1 toolbar, not deleted.
const actions: Array<{ id: ToolType; icon: typeof PenLine; label: string }> = [];

export function EditorToolbar({
  activeTool,
  onToolChange,
  isPro = false,
  filename,
}: EditorToolbarProps) {
  const isMobile = useIsMobile();
  const allTools = [...tools, ...actions];

  // Desktop: Top toolbar (existing design)
  if (!isMobile) {
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

          {actions.length > 0 && (
            <>
              <Separator orientation="vertical" className="h-10 mx-2" />
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => onToolChange(action.id)}
                  className={`flex flex-col items-center justify-center px-3 py-1 rounded-lg transition-colors min-w-[48px] ${
                    activeTool === action.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <action.icon className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-medium">{action.label}</span>
                </button>
              ))}
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Mobile: Top toolbar (as sub-nav below top controls)
  return (
    <div className="bg-card border-b border-border">
      {/* Tools Row - Horizontal Scrolling */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center px-2 py-1.5 min-w-max">
          {allTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => onToolChange(tool.id)}
                className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-lg transition-colors min-w-[56px] touch-manipulation ${
                  activeTool === tool.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground active:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium leading-tight">{tool.label}</span>
              </button>
            );
          })}
        </div>
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
  const isMobile = useIsMobile();
  useEffect(() => setMounted(true), []);

  const content = useMemo(() => {
    if (isMobile) return null;
    
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
  }, [canRedo, canUndo, onRedo, onUndo, onZoomIn, onZoomOut, zoom, isMobile]);

  if (!mounted || isMobile) return null;
  return createPortal(content, document.body);
}

// Mobile Top Header Controls
export function MobileTopControls({
  onUndo,
  onRedo,
  onDownload,
  canUndo,
  canRedo,
  onMenuClick,
}: {
  onUndo: () => void;
  onRedo: () => void;
  onDownload: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onMenuClick?: () => void;
}) {
  const isMobile = useIsMobile();
  if (!isMobile) return null;

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-card border-b border-border">
      <div className="flex items-center gap-2">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 touch-manipulation"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
        )}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 touch-manipulation disabled:opacity-30"
          aria-label="Undo"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 touch-manipulation disabled:opacity-30"
          aria-label="Redo"
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          className="p-2 touch-manipulation"
          aria-label="Search"
        >
          <Search className="w-5 h-5 text-foreground" />
        </button>
        <button
          onClick={onDownload}
          className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium touch-manipulation flex items-center gap-1.5"
          aria-label="Download"
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
}
