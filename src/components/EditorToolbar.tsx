import React from "react";
import { 
  MousePointer2, 
  Type, 
  PenLine, 
  Download, 
  Undo2, 
  Redo2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export type ToolType = "select" | "text" | "sign";

interface EditorToolbarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onDownload: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  currentPage: number;
  totalPages: number;
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  signatureUsed: boolean;
}

const tools = [
  { id: "select" as ToolType, icon: MousePointer2, label: "Select" },
  { id: "text" as ToolType, icon: Type, label: "Text" },
  { id: "sign" as ToolType, icon: PenLine, label: "Sign" },
];

export function EditorToolbar({
  activeTool,
  onToolChange,
  onDownload,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onPrevPage,
  onNextPage,
  currentPage,
  totalPages,
  zoom,
  canUndo,
  canRedo,
  signatureUsed,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center justify-between bg-card border-b border-border px-4 py-2">
      {/* Left: Tools */}
      <div className="flex items-center gap-1">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant={activeTool === tool.id ? "toolbar-active" : "toolbar"}
            size="sm"
            onClick={() => onToolChange(tool.id)}
            className="gap-2"
          >
            <tool.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tool.label}</span>
            {tool.id === "sign" && !signatureUsed && (
              <span className="text-xs bg-success/20 text-success px-1.5 py-0.5 rounded-full">
                Free
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Center: Navigation and Zoom */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onUndo}
          disabled={!canUndo}
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRedo}
          disabled={!canRedo}
        >
          <Redo2 className="w-4 h-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-2" />
        
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onZoomOut}
          disabled={zoom <= 50}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium text-muted-foreground w-14 text-center">
          {zoom}%
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onZoomIn}
          disabled={zoom >= 200}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-2" />

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onPrevPage}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Right: Download */}
      <Button variant="default" onClick={onDownload} className="gap-2">
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Download PDF</span>
      </Button>
    </div>
  );
}
