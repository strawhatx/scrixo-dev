"use client";

import React, { useEffect, useRef } from "react";
import { Download, FileText, Loader2, Save, Search } from "lucide-react";
import { useEditor } from "@/hooks/useEditor";
import { PDFViewer } from "@/components/PDFViewerClient";
import { EditorFloatingControls, EditorToolbar } from "@/components/EditorToolbar";
import { SignaturePad } from "@/components/SignaturePad";
import { UpgradeModal } from "@/components/UpgradeModal";
import { Button } from "@/components/ui/button";
import { DrawToolsPanel } from "@/components/DrawToolsPanel";

/**
 * Staff-Level Editor Component
 * Orchestrates the editing experience using the useEditor hook and modular sub-components.
 */
export default function Editor() {
  const editor = useEditor();
  const mergeInputRef = useRef<HTMLInputElement>(null);

  // Ensure the editor is a fixed viewport shell; the PDF viewport is the only scroller.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (editor.loading) {
    return <EditorLoadingState />;
  }

  if (!editor.file) {
    return null; // Hook handles redirect
  }

  return (
    <div
      className={[
        "h-dvh bg-background text-foreground flex overflow-hidden font-sans",
        editor.activeTool === "select" ? "select-text" : "select-none",
      ].join(" ")}
    >
      <main className="flex-1 min-w-0 flex flex-col min-h-0 overflow-hidden">
        {/* Hidden file input for Merge */}
        <input
          ref={mergeInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) await editor.mergeWithPDFs(files);
            // reset so selecting the same file twice still triggers change
            e.currentTarget.value = "";
          }}
        />

        <div className="shrink-0 w-full sticky top-0 z-20">
          <EditorHeader
            filename={editor.file.name}
            isFree={!editor.user}
            onSave={editor.handleSave}
            isSaving={editor.isSaving}
            onDownload={editor.handleDownload}
          />
          <EditorToolbar
            activeTool={editor.activeTool}
            isPro={editor.isPro}
            onToolChange={(tool) => {
              if (tool === "rotate") {
                editor.rotatePage(editor.currentPage, 90);
                return;
              }
              if (tool === "merge") {
                mergeInputRef.current?.click();
                return;
              }
              if (tool === "split") {
                editor.splitCurrentPageToDownload();
                return;
              }
              editor.setActiveTool(tool);
            }}
          />
        </div>

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col relative bg-muted/30 w-full">
          <PDFViewer
            file={editor.file}
            zoom={editor.zoom}
            currentPage={editor.currentPage}
            onPageChange={editor.setCurrentPage}
            rotation={editor.rotation}
            pageOrder={editor.pageOrder}
            pageRotations={editor.pageRotations}
            onPageOrderChange={editor.setPageOrder}
            onPageCountChange={editor.setTotalPages}
            activeTool={editor.activeTool}
            onSignRequest={editor.handleSignRequest}
            signatureOverlays={editor.signatureOverlays}
            onSignatureOverlaysChange={editor.setSignatureOverlays}
            pendingSignature={editor.pendingSignature}
            onPendingSignaturePlaced={() => {
              editor.setPendingSignature(null);
              editor.saveToHistory();
            }}
            drawStrokes={editor.drawStrokes}
            onDrawStrokesChange={editor.setDrawStrokes}
            onDrawStrokesCommit={editor.saveToHistory}
            drawSettings={{
              tool: editor.drawTool,
              color: editor.drawColor,
              width: editor.drawWidth,
            }}
            imageOverlays={editor.imageOverlays}
            onImageOverlaysChange={editor.setImageOverlays}
            pendingImage={editor.pendingImage}
            onPendingImageChange={editor.setPendingImage}
            onPendingImagePlaced={() => {
              editor.setPendingImage(null);
              editor.saveToHistory();
            }}
            fieldOverlays={editor.fieldOverlays}
            onFieldOverlaysChange={editor.setFieldOverlays}
            onFieldOverlaysCommit={editor.saveToHistory}
          />

          {editor.activeTool === "draw" && (
            <DrawToolsPanel
              tool={editor.drawTool}
              onToolChange={editor.setDrawTool}
              color={editor.drawColor}
              onColorChange={editor.setDrawColor}
              width={editor.drawWidth}
              onWidthChange={editor.setDrawWidth}
              className="left-[calc(14rem+0.75rem)] top-6"
            />
          )}

          {/* Floating bottom controls (portaled to body for true viewport positioning) */}
              <EditorFloatingControls
                onUndo={editor.undo}
                onRedo={editor.redo}
                onZoomIn={() => editor.setZoom((z) => Math.min(z + 25, 200))}
                onZoomOut={() => editor.setZoom((z) => Math.max(z - 25, 50))}
                zoom={editor.zoom}
                canUndo={editor.historyIndex > 0}
                canRedo={editor.historyIndex < editor.historyLength - 1}
              />
        </div>

        {/* Modals */}
        <SignaturePad
          isOpen={editor.showSignaturePad}
          onClose={() => editor.setShowSignaturePad(false)}
          onSave={editor.handleSignatureSave}
        />

        <UpgradeModal
          isOpen={editor.showUpgradeModal}
          onClose={() => editor.setShowUpgradeModal(false)}
          reason="signature"
        />
      </main>

      {/* Vertical Ad Space */}
      <aside className="w-[300px] bg-muted/30 border-l border-border hidden xl:flex xl:flex-col shrink-0 min-h-0 overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Advertisement</span>
          <Search className="w-3 h-3 text-muted-foreground/20" />
        </div>
        <div className="flex-1 p-4 min-h-0 overflow-hidden">
          <div className="w-full h-full bg-background rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-4 text-muted-foreground/20 italic">
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">Ad Space</p>
              <p className="text-[10px] font-bold">300 x 600</p>
            </div>
            <div className="w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          </div>
        </div>
      </aside>

    </div>
  );
}

// --- Sub-Components ---

function EditorLoadingState() {
  return (
    <div className="h-dvh flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
        <p className="text-muted-foreground font-medium">Preparing your workspace...</p>
      </div>
    </div>
  );
}

function EditorHeader({
  filename,
  isFree,
  onSave,
  isSaving,
  onDownload,
}: {
  filename: string;
  isFree: boolean;
  onSave?: () => void;
  isSaving?: boolean;
  onDownload: () => void;
}) {
  return (
    <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-4 shrink-0 w-full">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
          <FileText className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-display text-lg font-bold text-foreground">scrixo</span>
      </div>

      <div className="h-4 w-[1px] bg-border mx-2 hidden sm:block" />
      <span className="text-sm text-muted-foreground truncate max-w-[300px] hidden sm:block font-medium">
        {filename}
      </span>

      <div className="ml-auto flex items-center gap-2">
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
    </header>
  );
}


