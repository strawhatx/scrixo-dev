"use client";

import React, { useEffect, useRef } from "react";
import { Download, FileText, Loader2, Save, Search } from "lucide-react";
import { useEditor } from "@/hooks/useEditor";
import { PDFViewer } from "@/components/PDFViewerClient";
import { EditorFloatingControls, EditorToolbar, MobileTopControls } from "@/components/EditorToolbar";
import { SignaturePad } from "./SignaturePad";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/UpgradeModal";
import { MergeModal } from "@/components/MergeModal";
import { SplitModal } from "@/components/SplitModal";
import { RotateModal } from "@/components/RotateModal";
import { RearrangeModal } from "@/components/RearrangeModal";
import { DrawToolsPanel, DrawToolsMobileBar } from "@/components/DrawToolsPanel";
import { FieldsPanel, FieldsMobileBar } from "@/components/FieldsPanel";
import { TextToolsPanel, TextToolsMobileBar } from "@/components/TextToolsPanel";
import { AdSidebar } from "@/components/AdSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Staff-Level Editor Component
 * Orchestrates the editing experience using the useEditor hook and modular sub-components.
 */
export default function Editor() {
  const editor = useEditor();
  const isMobile = useIsMobile();
  const signToolActivated = React.useRef(false);
  const [pagesSidebarOpen, setPagesSidebarOpen] = React.useState(false);

  // Ensure the editor is a fixed viewport shell; the PDF viewport is the only scroller.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Handle sign tool activation from URL params
  useEffect(() => {
    if (!editor.loading && editor.file && editor.activeTool === "sign" && !editor.pendingSignature && !signToolActivated.current) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("tool") === "sign") {
        signToolActivated.current = true;
        // Small delay to ensure everything is initialized
        const timer = setTimeout(() => {
          editor.handleSignRequest();
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [editor.loading, editor.file, editor.activeTool, editor.pendingSignature, editor.handleSignRequest]);

  if (editor.loading) {
    return <EditorLoadingState />;
  }

  if (!editor.file) {
    return null; // Hook handles redirect
  }

  const handleToolChange = (tool: import("@/components/EditorToolbar").ToolType) => {
    if (tool === "rotate") {
      editor.setShowRotateModal(true);
      return;
    }
    if (tool === "merge") {
      editor.setShowMergeModal(true);
      return;
    }
    if (tool === "split") {
      editor.setShowSplitModal(true);
      return;
    }
    if (tool === "rearrange") {
      editor.setShowRearrangeModal(true);
      return;
    }
    if (tool === "sign") {
      editor.setActiveTool("sign");
      // Open the signature modal immediately unless the user is already holding a signature to place.
      if (!editor.pendingSignature) {
        editor.handleSignRequest();
      }
      return;
    }
    editor.setActiveTool(tool);
  };

  return (
    <div
      className={[
        "h-dvh bg-background text-foreground flex flex-col xl:flex-row overflow-hidden font-sans",
        editor.activeTool === "select" ? "select-text" : "select-none",
      ].join(" ")}
    >
      <main className="flex-1 min-w-0 flex flex-col min-h-0 overflow-hidden">
        {/* Mobile: Minimal top controls */}
        <MobileTopControls
          onUndo={editor.undo}
          onRedo={editor.redo}
          onDownload={editor.handleDownload}
          canUndo={editor.historyIndex > 0}
          canRedo={editor.historyIndex < editor.historyLength - 1}
          onMenuClick={() => setPagesSidebarOpen(true)}
        />
        
        {/* Mobile: Toolbar as sub-nav below top controls */}
        <div className="md:hidden sticky top-0 z-10 bg-card border-b border-border">
          <EditorToolbar
            activeTool={editor.activeTool}
            isPro={editor.isPro}
            filename={editor.file.name}
            onToolChange={handleToolChange}
          />
          {/* Mobile: Draw tools toolbar */}
          {editor.activeTool === "draw" && isMobile && (
            <DrawToolsMobileBar
              tool={editor.drawTool}
              onToolChange={editor.setDrawTool}
              color={editor.drawColor}
              onColorChange={editor.setDrawColor}
              width={editor.drawWidth}
              onWidthChange={editor.setDrawWidth}
            />
          )}
          {/* Mobile: Fields toolbar */}
          {editor.activeTool === "field" && isMobile && (
            <FieldsMobileBar
              selected={editor.fieldKind}
              onSelect={editor.setFieldKind}
            />
          )}
        </div>
        
        {/* Desktop: Full header */}
        <div className="hidden md:block shrink-0 w-full sticky top-0 z-20">
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
            filename={editor.file.name}
            onToolChange={handleToolChange}
          />
        </div>

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col relative bg-muted/30 w-full">
          <PDFViewer
            file={editor.file}
            zoom={editor.zoom}
            currentPage={editor.currentPage}
            onPageChange={editor.setCurrentPage}
            onZoomChange={editor.setZoom}
            rotation={editor.rotation}
            pageOrder={editor.pageOrder}
            pageRotations={editor.pageRotations}
            onPageOrderChange={editor.setPageOrder}
            onPageCountChange={editor.setTotalPages}
            activeTool={editor.activeTool}
            dockPanel={
              editor.activeTool === "field" ? (
                <FieldsPanel
                  variant="docked"
                  selected={editor.fieldKind}
                  onSelect={editor.setFieldKind}
                  onClose={() => editor.setActiveTool("select")}
                />
              ) : null
            }
            onSignRequest={editor.handleSignRequest}
            signatureOverlays={editor.signatureOverlays}
            onSignatureOverlaysChange={editor.setSignatureOverlays}
            onSignatureOverlaysCommit={editor.saveToHistory}
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
            onImageOverlaysCommit={editor.saveToHistory}
            pendingImage={editor.pendingImage}
            onPendingImageChange={editor.setPendingImage}
            onPendingImagePlaced={() => {
              editor.setPendingImage(null);
              editor.saveToHistory();
            }}
            fieldOverlays={editor.fieldOverlays}
            onFieldOverlaysChange={editor.setFieldOverlays}
            onFieldOverlaysCommit={editor.saveToHistory}
            fieldKind={editor.fieldKind}
            textOverlays={editor.textOverlays}
            onTextOverlaysChange={editor.setTextOverlays}
            pendingText={editor.pendingText}
            onPendingTextChange={editor.setPendingText}
            onPendingTextPlaced={() => {
              editor.setPendingText(null);
              editor.saveToHistory();
            }}
            onTextOverlaysCommit={editor.saveToHistory}
            textFontSize={editor.textFontSize}
            textColor={editor.textColor}
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

          {editor.activeTool === "text" && (
            <TextToolsPanel
              fontSize={editor.textFontSize}
              onFontSizeChange={editor.setTextFontSize}
              color={editor.textColor}
              onColorChange={editor.setTextColor}
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

        <MergeModal
          isOpen={editor.showMergeModal}
          onClose={() => editor.setShowMergeModal(false)}
          onMerge={editor.mergeWithPDFs}
          currentFileName={editor.file?.name || ""}
        />

        <SplitModal
          isOpen={editor.showSplitModal}
          onClose={() => editor.setShowSplitModal(false)}
          onSplit={editor.splitCurrentPageToDownload}
          currentPage={editor.currentPage}
          totalPages={editor.totalPages}
        />

        <RotateModal
          isOpen={editor.showRotateModal}
          onClose={() => editor.setShowRotateModal(false)}
          onRotate={editor.rotatePage}
          currentPage={editor.currentPage}
          currentRotation={editor.pageRotations[editor.currentPage] || 0}
        />

        <RearrangeModal
          isOpen={editor.showRearrangeModal}
          onClose={() => editor.setShowRearrangeModal(false)}
          onRearrange={async (newOrder) => {
            editor.setPageOrder(newOrder);
            editor.saveToHistory();
          }}
          currentOrder={editor.pageOrder}
          totalPages={editor.totalPages}
        />

        {/* Mobile: Pages Sidebar Sheet */}
        <Sheet open={pagesSidebarOpen} onOpenChange={setPagesSidebarOpen}>
          <SheetContent side="left" className="w-[280px] p-0">
            <div className="flex flex-col h-full bg-card">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="text-lg font-semibold">Pages</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {Array.from({ length: editor.totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => {
                        editor.setCurrentPage(pageNum);
                        setPagesSidebarOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                        editor.currentPage === pageNum
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-background border-border hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Page {pageNum}</span>
                        {editor.currentPage === pageNum && (
                          <span className="text-primary font-bold">•</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </main>

      <AdSidebar />
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


