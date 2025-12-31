import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { PDFDocument } from "pdf-lib";
import { motion } from "framer-motion";
import { ArrowLeft, FileText } from "lucide-react";
import { toast } from "sonner";

import { SEOHead } from "@/components/SEOHead";
import { PDFUpload } from "@/components/PDFUpload";
import { PDFViewer } from "@/components/PDFViewer";
import { EditorToolbar, ToolType } from "@/components/EditorToolbar";
import { SignaturePad } from "@/components/SignaturePad";
import { UpgradeModal } from "@/components/UpgradeModal";
import { Button } from "@/components/ui/button";

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  page: number;
}

interface SignatureOverlay {
  id: string;
  imageData: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

const STORAGE_KEY = "pdfotter_signature_used";

export default function Editor() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Overlays
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [signatureOverlays, setSignatureOverlays] = useState<SignatureOverlay[]>([]);
  const [pendingSignature, setPendingSignature] = useState<string | null>(null);
  
  // History for undo/redo
  const [history, setHistory] = useState<{ text: TextOverlay[]; sig: SignatureOverlay[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Modals
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Freemium tracking
  const [signatureUsed, setSignatureUsed] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setTextOverlays([]);
    setSignatureOverlays([]);
    setHistory([]);
    setHistoryIndex(-1);
    setCurrentPage(1);
    toast.success("PDF loaded successfully!");
  }, []);

  const handleToolChange = useCallback((tool: ToolType) => {
    setActiveTool(tool);
  }, []);

  const handleSignRequest = useCallback(() => {
    if (signatureUsed) {
      setShowUpgradeModal(true);
    } else {
      setShowSignaturePad(true);
    }
  }, [signatureUsed]);

  const handleSignatureSave = useCallback((signatureData: string) => {
    setPendingSignature(signatureData);
    setSignatureUsed(true);
    localStorage.setItem(STORAGE_KEY, "true");
    toast.success("Signature created! Click on the PDF to place it.");
  }, []);

  const handleSignaturePlaced = useCallback(() => {
    setPendingSignature(null);
    saveToHistory();
  }, []);

  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ text: [...textOverlays], sig: [...signatureOverlays] });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, textOverlays, signatureOverlays]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setTextOverlays(prev.text);
      setSignatureOverlays(prev.sig);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setTextOverlays(next.text);
      setSignatureOverlays(next.sig);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  const handleDownload = useCallback(async () => {
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      // Add text overlays
      for (const text of textOverlays) {
        const page = pages[text.page - 1];
        if (page) {
          page.drawText(text.text, {
            x: text.x,
            y: page.getHeight() - text.y - text.fontSize,
            size: text.fontSize,
          });
        }
      }

      // Add signature overlays
      for (const sig of signatureOverlays) {
        const page = pages[sig.page - 1];
        if (page) {
          const pngImage = await pdfDoc.embedPng(sig.imageData);
          page.drawImage(pngImage, {
            x: sig.x,
            y: page.getHeight() - sig.y - sig.height,
            width: sig.width,
            height: sig.height,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `edited_${file.name}`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download PDF. Please try again.");
      console.error(error);
    }
  }, [file, textOverlays, signatureOverlays]);

  return (
    <HelmetProvider>
      <SEOHead
        title="Edit PDF Text Online Free"
        description="Edit any text in your PDF documents online for free. No signup, no downloads required. Modify PDF content instantly."
        keywords="edit pdf text online, modify pdf text free, change pdf text, pdf text editor"
      />

      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold text-foreground">PDFOtter</span>
            </div>
            {file && (
              <span className="text-sm text-muted-foreground hidden sm:block">
                {file.name}
              </span>
            )}
          </div>

          {!signatureUsed && (
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Free: 1 signature left</span>
              <Button variant="outline" size="sm" onClick={() => setShowUpgradeModal(true)}>
                Upgrade
              </Button>
            </div>
          )}
        </header>

        {/* Main Content */}
        {!file ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Upload Your PDF
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Start editing your PDF instantly. No signup required. Unlimited text edits free.
              </p>
            </motion.div>
            <PDFUpload onFileSelect={handleFileSelect} />
            
            {/* Ad Banner */}
            <div className="mt-12 ad-banner h-20 w-full max-w-2xl">
              <span>Advertisement</span>
            </div>
          </div>
        ) : (
          <>
            <EditorToolbar
              activeTool={activeTool}
              onToolChange={handleToolChange}
              onDownload={handleDownload}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onZoomIn={() => setZoom((z) => Math.min(z + 25, 200))}
              onZoomOut={() => setZoom((z) => Math.max(z - 25, 50))}
              onPrevPage={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              onNextPage={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              currentPage={currentPage}
              totalPages={totalPages}
              zoom={zoom}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              signatureUsed={signatureUsed}
            />
            
            <PDFViewer
              file={file}
              zoom={zoom}
              currentPage={currentPage}
              onPageCountChange={setTotalPages}
              activeTool={activeTool}
              onSignRequest={handleSignRequest}
              textOverlays={textOverlays}
              onTextOverlaysChange={(overlays) => {
                setTextOverlays(overlays);
                saveToHistory();
              }}
              signatureOverlays={signatureOverlays}
              onSignatureOverlaysChange={setSignatureOverlays}
              pendingSignature={pendingSignature}
              onPendingSignaturePlaced={handleSignaturePlaced}
            />

            {/* Bottom Ad Banner */}
            <div className="bg-card border-t border-border p-2">
              <div className="ad-banner h-16 w-full">
                <span>Advertisement</span>
              </div>
            </div>
          </>
        )}

        {/* Modals */}
        <SignaturePad
          isOpen={showSignaturePad}
          onClose={() => setShowSignaturePad(false)}
          onSave={handleSignatureSave}
        />

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          reason="signature"
        />
      </div>
    </HelmetProvider>
  );
}
