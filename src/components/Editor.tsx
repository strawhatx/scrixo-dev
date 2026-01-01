"use client";

import React from "react";
import { FileText, Loader2 } from "lucide-react";
import { useEditor } from "@/hooks/useEditor";
import { PDFViewer } from "@/components/PDFViewerClient";
import { EditorToolbar } from "@/components/EditorToolbar";
import { SignaturePad } from "@/components/SignaturePad";
import { UpgradeModal } from "@/components/UpgradeModal";

/**
 * Staff-Level Editor Component
 * Orchestrates the editing experience using the useEditor hook and modular sub-components.
 */
export default function Editor() {
  const editor = useEditor();

  if (editor.loading) {
    return <EditorLoadingState />;
  }

  if (!editor.file) {
    return null; // Hook handles redirect
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <EditorHeader filename={editor.file.name} />
      
      <main className="flex-1 flex flex-col min-h-0">
        <EditorToolbar
          activeTool={editor.activeTool}
          onToolChange={editor.setActiveTool}
          onDownload={editor.handleDownload}
          onSave={editor.handleSave}
          isSaving={editor.isSaving}
          onUndo={editor.undo}
          onRedo={editor.redo}
          onZoomIn={() => editor.setZoom((z) => Math.min(z + 25, 200))}
          onZoomOut={() => editor.setZoom((z) => Math.max(z - 25, 50))}
          onPrevPage={() => editor.setCurrentPage((p) => Math.max(p - 1, 1))}
          onNextPage={() => editor.setCurrentPage((p) => Math.min(p + 1, editor.totalPages))}
          currentPage={editor.currentPage}
          totalPages={editor.totalPages}
          zoom={editor.zoom}
          canUndo={editor.historyIndex > 0}
          canRedo={editor.historyIndex < editor.historyLength - 1}
          signatureUsed={editor.signatureUsed}
          isFree={!editor.user}
        />
        
        <div className="flex-1 overflow-hidden flex flex-col relative bg-muted/30">
          <PDFViewer
            file={editor.file}
            zoom={editor.zoom}
            currentPage={editor.currentPage}
            onPageCountChange={editor.setTotalPages}
            activeTool={editor.activeTool}
            onSignRequest={editor.handleSignRequest}
            textOverlays={editor.textOverlays}
            onTextOverlaysChange={(overlays) => {
              editor.setTextOverlays(overlays);
              editor.saveToHistory();
            }}
            signatureOverlays={editor.signatureOverlays}
            onSignatureOverlaysChange={editor.setSignatureOverlays}
            pendingSignature={editor.pendingSignature}
            onPendingSignaturePlaced={() => {
              editor.setPendingSignature(null);
              editor.saveToHistory();
            }}
          />

          <EditorAdBanner />
        </div>
      </main>

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
    </div>
  );
}

// --- Sub-Components ---

function EditorLoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
        <p className="text-muted-foreground font-medium">Preparing your workspace...</p>
      </div>
    </div>
  );
}

function EditorHeader({ filename }: { filename: string }) {
  return (
    <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-4 shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
          <FileText className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-display text-lg font-bold text-foreground">PDFOtter</span>
      </div>
      <div className="h-4 w-[1px] bg-border mx-2 hidden sm:block" />
      <span className="text-sm text-muted-foreground truncate max-w-[300px] hidden sm:block font-medium">
        {filename}
      </span>
    </header>
  );
}

function EditorAdBanner() {
  return (
    <div className="bg-card border-t border-border p-2 shrink-0">
      <div className="ad-banner h-16 w-full flex items-center justify-center bg-muted/50 rounded text-xs text-muted-foreground border border-dashed">
        Advertisement
      </div>
    </div>
  );
}
