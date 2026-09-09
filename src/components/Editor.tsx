"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Download, Loader2, Save } from "lucide-react";
import { useEditor } from "@/hooks/useEditor";
import { PDFViewer } from "@/components/PDFViewer";
import { EditorFloatingControls, EditorToolbar, MobileTopControls } from "@/components/EditorToolbar";
import { SignaturePad } from "./SignaturePad";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/UpgradeModal";
import { MergeModal } from "@/components/MergeModal";
import { SplitModal } from "@/components/SplitModal";
import { RotateModal } from "@/components/RotateModal";
import { RearrangeModal } from "@/components/RearrangeModal";
import { DrawToolsPanel, DrawToolsMobileBar } from "@/components/DrawToolsPanel";
import { FieldsPanel, FieldsMobileBar } from "@/components/FieldsPanel";
import { TextToolsPanel } from "@/components/TextToolsPanel";
import type { TextOverlay } from "@/lib/pdf-utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { PDFUpload } from "@/components/PDFUpload";
import { useFileStore } from "@/store/useFileStore";
import { ExportSuccessCapture } from "@/components/ExportSuccessCapture";
import { hasJoinedWaitlist } from "@/components/WaitlistForm";
import { BrandLogo } from "@/components/BrandLogo";

/**
 * Staff-Level Editor Component
 * Orchestrates the editing experience using the useEditor hook and modular sub-components.
 */
export default function Editor() {
  const editor = useEditor();
  const isMobile = useIsMobile();
  const [pagesSidebarOpen, setPagesSidebarOpen] = React.useState(false);
  const [showExportCapture, setShowExportCapture] = React.useState(false);
  const [activeText, setActiveText] = React.useState<TextOverlay | null>(null);
  const [signingField, setSigningField] = React.useState<{ id: string; page: number } | null>(null);

  const handleDownloadAndCapture = async () => {
    const ok = await editor.handleDownload();
    if (!ok) return;
    try {
      if (hasJoinedWaitlist()) return;
    } catch {
      // ignore storage failures
    }
    setShowExportCapture(true);
  };

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
    return <EditorEmptyState />;
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
      editor.setPlacementArmed(false);
      if (!editor.pendingSignature) {
        editor.handleSignRequest();
      }
      return;
    }
    if (tool === "text") {
      editor.setActiveTool("text");
      editor.setPlacementArmed(true);
      return;
    }
    if (tool === "field") {
      editor.setActiveTool("field");
      editor.setPlacementArmed(false);
      return;
    }
    editor.setActiveTool(tool);
    editor.setPlacementArmed(false);
  };

  const armFieldKind = (kind: import("@/types/fields").FieldKind) => {
    editor.setFieldKind(kind);
    editor.setPlacementArmed(true);
  };

  const handleActiveTextChange = (overlay: TextOverlay | null) => {
    setActiveText(overlay);
    if (!overlay) return;
    if (typeof overlay.fontSize === "number") editor.setTextFontSize(overlay.fontSize);
    if (overlay.color) editor.setTextColor(overlay.color);
    if (overlay.fontFamily) editor.setTextFontFamily(overlay.fontFamily);
    editor.setTextBold(Boolean(overlay.bold));
    editor.setTextItalic(Boolean(overlay.italic));
    if (overlay.align) editor.setTextAlign(overlay.align);
  };

  const patchActiveText = (patch: Partial<TextOverlay>) => {
    if (!activeText) return;
    editor.setTextOverlays(
      editor.textOverlays.map((t) =>
        t.id === activeText.id && t.page === activeText.page ? { ...t, ...patch } : t
      )
    );
    setActiveText({ ...activeText, ...patch });
    editor.saveToHistory();
  };

  const setTextFontSize = (fontSize: number) => {
    editor.setTextFontSize(fontSize);
    patchActiveText({ fontSize });
  };
  const setTextColor = (color: string) => {
    editor.setTextColor(color);
    patchActiveText({ color });
  };
  const setTextFontFamily = (fontFamily: import("@/lib/pdf-utils").TextFontFamily) => {
    editor.setTextFontFamily(fontFamily);
    patchActiveText({ fontFamily });
  };
  const setTextBold = (bold: boolean) => {
    editor.setTextBold(bold);
    patchActiveText({ bold });
  };
  const setTextItalic = (italic: boolean) => {
    editor.setTextItalic(italic);
    patchActiveText({ italic });
  };
  const setTextAlign = (align: import("@/lib/pdf-utils").TextAlign) => {
    editor.setTextAlign(align);
    patchActiveText({ align });
  };

  const duplicateActiveText = () => {
    if (!activeText) return;
    const copy: TextOverlay = {
      ...activeText,
      id: `text-${Date.now()}`,
      x: activeText.x + 12,
      y: activeText.y + 12,
    };
    editor.setTextOverlays([...editor.textOverlays, copy]);
    editor.saveToHistory();
  };

  const deleteActiveText = () => {
    if (!activeText) return;
    editor.setTextOverlays(
      editor.textOverlays.filter((t) => !(t.id === activeText.id && t.page === activeText.page))
    );
    editor.saveToHistory();
    setActiveText(null);
  };

  return (
    <div
      className={[
        "h-dvh bg-background text-foreground flex flex-col overflow-hidden font-sans relative",
        editor.activeTool === "select" ? "select-text" : "select-none",
      ].join(" ")}
    >
      <main className="flex-1 min-w-0 flex flex-col min-h-0 overflow-hidden">
        {/* Mobile: Minimal top controls */}
        <MobileTopControls
          onUndo={editor.undo}
          onRedo={editor.redo}
          onDownload={handleDownloadAndCapture}
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
              armed={editor.placementArmed}
              onSelect={armFieldKind}
            />
          )}
          {editor.activeTool === "text" && isMobile && (
            <TextToolsPanel
              variant="bar"
              fontSize={editor.textFontSize}
              onFontSizeChange={setTextFontSize}
              fontFamily={editor.textFontFamily}
              onFontFamilyChange={setTextFontFamily}
              color={editor.textColor}
              onColorChange={setTextColor}
              bold={editor.textBold}
              onBoldChange={setTextBold}
              italic={editor.textItalic}
              onItalicChange={setTextItalic}
              align={editor.textAlign}
              onAlignChange={setTextAlign}
              canDuplicate={Boolean(activeText)}
              canDelete={Boolean(activeText)}
              onDuplicate={duplicateActiveText}
              onDelete={deleteActiveText}
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
            onDownload={handleDownloadAndCapture}
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
            onSignRequest={editor.handleSignRequest}
            signatureOverlays={editor.signatureOverlays}
            onSignatureOverlaysChange={editor.setSignatureOverlays}
            onSignatureOverlaysCommit={editor.saveToHistory}
            onSignatureFieldClick={(field) => {
              setSigningField({ id: field.id, page: field.page });
              editor.handleSignRequest();
            }}
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
            placementArmed={editor.placementArmed}
            onPlacementConsumed={() => editor.setPlacementArmed(false)}
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
            textFontFamily={editor.textFontFamily}
            textBold={editor.textBold}
            textItalic={editor.textItalic}
            textAlign={editor.textAlign}
            onActiveTextChange={handleActiveTextChange}
            viewportOverlay={
              !isMobile && editor.activeTool === "field" ? (
                <FieldsPanel
                  selected={editor.fieldKind}
                  armed={editor.placementArmed}
                  onSelect={armFieldKind}
                />
              ) : !isMobile && editor.activeTool === "text" ? (
                <TextToolsPanel
                  fontSize={editor.textFontSize}
                  onFontSizeChange={setTextFontSize}
                  fontFamily={editor.textFontFamily}
                  onFontFamilyChange={setTextFontFamily}
                  color={editor.textColor}
                  onColorChange={setTextColor}
                  bold={editor.textBold}
                  onBoldChange={setTextBold}
                  italic={editor.textItalic}
                  onItalicChange={setTextItalic}
                  align={editor.textAlign}
                  onAlignChange={setTextAlign}
                  canDuplicate={Boolean(activeText)}
                  canDelete={Boolean(activeText)}
                  onDuplicate={duplicateActiveText}
                  onDelete={deleteActiveText}
                />
              ) : null
            }
            viewportFooter={
              <EditorFloatingControls
                onUndo={editor.undo}
                onRedo={editor.redo}
                onZoomIn={() => editor.setZoom((z) => Math.min(z + 25, 200))}
                onZoomOut={() => editor.setZoom((z) => Math.max(z - 25, 50))}
                zoom={editor.zoom}
                canUndo={editor.historyIndex > 0}
                canRedo={editor.historyIndex < editor.historyLength - 1}
              />
            }
          />

          {editor.activeTool === "draw" && (
            <DrawToolsPanel
              tool={editor.drawTool}
              onToolChange={editor.setDrawTool}
              color={editor.drawColor}
              onColorChange={editor.setDrawColor}
              width={editor.drawWidth}
              onWidthChange={editor.setDrawWidth}
              className="absolute left-[calc(12.25rem+0.75rem)] top-6"
            />
          )}
        </div>

        {/* Modals */}
        <SignaturePad
          isOpen={editor.showSignaturePad}
          onClose={() => {
            setSigningField(null);
            editor.setShowSignaturePad(false);
          }}
          onSave={(data) => {
            if (signingField) {
              editor.setFieldOverlays(
                editor.fieldOverlays.map((f) =>
                  f.id === signingField.id && f.page === signingField.page ? { ...f, value: data } : f
                )
              );
              editor.saveToHistory();
              setSigningField(null);
              return;
            }
            editor.handleSignatureSave(data);
          }}
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
                <SheetTitle className="text-lg font-semibold">Pages</SheetTitle>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-3 bg-muted">
                <button
                  type="button"
                  disabled
                  title="Add page (coming soon)"
                  className="w-full h-9 mb-3 rounded-lg border border-black/10 bg-white text-foreground shadow-sm flex items-center px-2.5 disabled:opacity-70"
                >
                  <span className="text-lg leading-none">+</span>
                  <span className="flex-1 text-center text-sm font-medium">Add page</span>
                  <span className="text-neutral-500 text-xs">▾</span>
                </button>
                <div>
                  {Array.from({ length: editor.totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => {
                        editor.setCurrentPage(pageNum);
                        setPagesSidebarOpen(false);
                      }}
                      className={`w-full mb-2 flex items-center gap-3 px-2 py-2 rounded-lg border-[3px] bg-white text-left transition-colors ${
                        editor.currentPage === pageNum
                          ? "border-primary"
                          : "border-transparent hover:border-black/10"
                      }`}
                    >
                      <span className="w-4 text-center text-[13px] text-neutral-500 tabular-nums">{pageNum}</span>
                      <span className="font-medium text-sm">Page {pageNum}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </main>
      {showExportCapture && (
        <ExportSuccessCapture onDismiss={() => setShowExportCapture(false)} />
      )}
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

function EditorEmptyState() {
  const setFile = useFileStore((state) => state.setFile);

  const handleFileSelect = (file: File) => {
    setFile(file);
    // The editor will automatically re-render when file is set
  };

  return (
    <div className="h-dvh bg-brand-hero text-foreground flex flex-col overflow-hidden font-sans">
      <main className="flex-1 min-w-0 flex flex-col items-center min-h-0 overflow-hidden">
        {/* Header */}
        <div className="hidden md:block shrink-0 w-full sticky top-0 z-20">
          <EditorHeader
            filename="No file loaded"
            isFree={true}
            onDownload={() => { }}
          />
        </div>

        {/* Mobile Header */}
        <div className="md:hidden shrink-0 w-full sticky top-0 z-20 bg-card border-b border-border px-4 py-3">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <BrandLogo />
          </Link>
        </div>

        {/* Upload Area */}
        {/* Logo Section */}
        <div className="z-10 w-full max-w-4xl flex flex-col items-center mt-12">
          <div className="flex items-center justify-center mb-4 animate-float">
            <BrandLogo size="lg" />
          </div>

          <p className="text-muted-foreground/80 text-lg font-medium max-w-2xl text-center mb-8">
            Sign a PDF free in your browser — no account, no printing
          </p>


          {/* Dropzone Area */}
          <div className="w-full max-w-3xl aspect-[2.8/1] flex items-center justify-center relative">
            <PDFUpload
              onFileSelect={handleFileSelect}
              minimal={false}
              inputId="editor-upload"
            />
          </div>
        </div>
      </main>
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
      <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
        <BrandLogo />
      </Link>

      <div className="h-4 w-[1px] bg-border mx-2 hidden sm:block" />
      <span className="text-sm text-muted-foreground truncate max-w-[300px] hidden sm:block font-medium">
        {filename}
      </span>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 px-4" asChild>
          <a href="https://x.com/heynathanielj" target="_blank" rel="noopener noreferrer">
            Contact
          </a>
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
          className="gap-2 h-8 px-4 bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>
    </header>
  );
}


