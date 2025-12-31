import React from "react";
import { 
  MousePointer2, 
  Type, 
  PenLine, 
  Download, 
  Undo2, 
  Redo2,
  Minus,
  Plus,
  Search,
  User,
  MoreHorizontal
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
  zoom,
  canUndo,
  canRedo,
  signatureUsed,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center justify-between bg-card border-b border-border px-4 py-1.5">
      {/* Left: Tools with icons and labels */}
      <div className="flex items-center gap-1">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-lg transition-colors min-w-[52px] ${
              activeTool === tool.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <tool.icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">{tool.label}</span>
            {tool.id === "sign" && !signatureUsed && (
              <span className="absolute -top-1 -right-1 text-[8px] bg-success text-success-foreground px-1 rounded-full">
                Free
              </span>
            )}
          </button>
        ))}
        
        <Separator orientation="vertical" className="h-10 mx-2" />
        
        {/* More tools placeholder */}
        <button className="flex flex-col items-center justify-center px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground min-w-[52px]">
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </div>

      {/* Center: Undo/Redo and Zoom */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
          className="w-8 h-8"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRedo}
          disabled={!canRedo}
          className="w-8 h-8"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-3" />
        
        <div className="flex items-center gap-0.5 bg-muted/50 rounded-lg px-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onZoomOut}
            disabled={zoom <= 50}
            className="w-7 h-7"
          >
            <Minus className="w-3.5 h-3.5" />
          </Button>
          <span className="text-xs font-medium text-foreground w-12 text-center">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onZoomIn}
            disabled={zoom >= 200}
            className="w-7 h-7"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
        
        <Button variant="ghost" size="icon" className="w-8 h-8">
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Right: User, Share, Download */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="w-8 h-8">
          <User className="w-4 h-4" />
        </Button>
        
        <Button variant="outline" size="sm" className="h-8 px-4">
          Share
        </Button>
        
        <Button 
          onClick={onDownload} 
          className="gap-2 h-8 px-4 bg-foreground text-background hover:bg-foreground/90"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>
    </div>
  );
}
