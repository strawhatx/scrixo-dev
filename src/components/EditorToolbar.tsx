import React from "react";
import { 
  MousePointer2, 
  Type, 
  PenLine, 
  Pencil,
  ImageIcon,
  FormInput,
  Combine,
  SplitSquareHorizontal,
  LayoutGrid,
  RotateCw,
  MoreHorizontal,
  Download, 
  Undo2, 
  Redo2,
  Minus,
  Plus,
  Search,
  User,
  Save,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export type ToolType = "select" | "text" | "sign" | "draw" | "image" | "field" | "merge" | "split" | "rearrange" | "rotate" | "more";

interface EditorToolbarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onDownload: () => void;
  onSave?: () => void;
  isSaving?: boolean;
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
  isFree?: boolean;
}

const tools = [
  { id: "select" as ToolType, icon: MousePointer2, label: "Select" },
  { id: "text" as ToolType, icon: Type, label: "Text" },
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
  onDownload,
  onSave,
  isSaving,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  zoom,
  canUndo,
  canRedo,
  isFree,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center justify-between bg-card border-b border-border px-4 py-1">
      {/* Left: Tools with icons and labels */}
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
      </div>

      {/* Right: Undo/Redo, Zoom, User, Share, Download */}
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
        
        <Separator orientation="vertical" className="h-6 mx-2" />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomOut}
          disabled={zoom <= 50}
          className="w-8 h-8"
        >
          <Minus className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium text-foreground w-12 text-center">
          {zoom}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomIn}
          disabled={zoom >= 200}
          className="w-8 h-8"
        >
          <Plus className="w-4 h-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-2" />
        
        <Button variant="ghost" size="icon" className="w-8 h-8">
          <Search className="w-4 h-4" />
        </Button>
        
        <Button variant="ghost" size="icon" className="w-8 h-8">
          <User className="w-4 h-4" />
        </Button>
        
        <Button variant="outline" size="sm" className="h-8 px-4">
          Share
        </Button>

        {onSave && !isFree && (
          <Button 
            onClick={onSave} 
            disabled={isSaving}
            variant="outline"
            className="gap-2 h-8 px-4 border-primary text-primary hover:bg-primary/5"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </Button>
        )}
        
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
