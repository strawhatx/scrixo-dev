"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjs from "pdfjs-dist/build/pdf.min.mjs";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";

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

import { ToolType } from "@/components/EditorToolbar";

interface PDFViewerProps {
  file: File;
  zoom: number;
  currentPage: number;
  rotation: number;
  onPageCountChange: (count: number) => void;
  activeTool: ToolType;
  onSignRequest: () => void;
  textOverlays: TextOverlay[];
  onTextOverlaysChange: (overlays: TextOverlay[]) => void;
  signatureOverlays: SignatureOverlay[];
  onSignatureOverlaysChange: (overlays: SignatureOverlay[]) => void;
  pendingSignature: string | null;
  onPendingSignaturePlaced: () => void;
}

export function PDFViewer({
  file,
  zoom,
  currentPage,
  rotation,
  onPageCountChange,
  activeTool,
  onSignRequest,
  textOverlays,
  onTextOverlaysChange,
  signatureOverlays,
  onSignatureOverlaysChange,
  pendingSignature,
  onPendingSignaturePlaced,
}: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [pdfDoc, setPdfDoc] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Load PDF
  useEffect(() => {
    const loadPDF = async () => {
      setLoading(true);
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(pdf);
      onPageCountChange(pdf.numPages);
      setLoading(false);
    };
    loadPDF();
  }, [file, onPageCountChange]);

  // Render page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let cancelled = false;

    const renderPage = async () => {
      // Cancel any in-flight render using this canvas before starting a new one.
      try {
        renderTaskRef.current?.cancel?.();
      } catch {
        // ignore
      }

      const page = await pdfDoc.getPage(currentPage);
      if (cancelled) return;

      const scale = zoom / 100;
      // NOTE: We intentionally ignore the PDF's embedded page rotation (`page.rotate`).
      // Some PDFs have incorrect rotation metadata; other viewers often appear to "fix"
      // it, but PDF.js will faithfully apply it. We keep a user-controlled rotation
      // instead, so the default matches what most users expect.
      const viewport = page.getViewport({ scale, rotation });

      const canvas = canvasRef.current!;
      const context = canvas.getContext("2d")!;

      const outputScale =
        typeof window !== "undefined" && window.devicePixelRatio
          ? window.devicePixelRatio
          : 1;

      // Keep a crisp canvas on HiDPI displays while preserving CSS pixel size.
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      // Reset any prior transforms to avoid accumulating transforms.
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);

      setPageSize({ width: viewport.width, height: viewport.height });

      const renderContext = {
        canvasContext: context,
        viewport,
        // PDF.js recommended HiDPI rendering: keep viewport in CSS pixels and pass a transform.
        transform:
          outputScale !== 1 ? ([outputScale, 0, 0, outputScale, 0, 0] as const) : undefined,
      };

      // @ts-ignore - pdfjs types mismatch
      const task = page.render(renderContext);
      renderTaskRef.current = task;

      try {
        await task.promise;
      } catch (err: any) {
        // Expected during rapid zoom/page changes.
        if (err?.name !== "RenderingCancelledException") throw err;
      } finally {
        if (renderTaskRef.current === task) {
          renderTaskRef.current = null;
        }
      }
    };

    renderPage();
    return () => {
      cancelled = true;
      try {
        renderTaskRef.current?.cancel?.();
      } catch {
        // ignore
      }
    };
  }, [pdfDoc, currentPage, zoom, rotation]);

  // Handle canvas click for placing elements
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === "text") {
      const newText: TextOverlay = {
        id: `text-${Date.now()}`,
        text: "Click to edit",
        x,
        y,
        fontSize: 16 * (zoom / 100),
        page: currentPage,
      };
      onTextOverlaysChange([...textOverlays, newText]);
      setEditingTextId(newText.id);
    } else if (activeTool === "sign") {
      if (pendingSignature) {
        const newSig: SignatureOverlay = {
          id: `sig-${Date.now()}`,
          imageData: pendingSignature,
          x: x - 75,
          y: y - 25,
          width: 150,
          height: 50,
          page: currentPage,
        };
        onSignatureOverlaysChange([...signatureOverlays, newSig]);
        onPendingSignaturePlaced();
      } else {
        onSignRequest();
      }
    }
  }, [activeTool, currentPage, zoom, textOverlays, onTextOverlaysChange, signatureOverlays, onSignatureOverlaysChange, pendingSignature, onPendingSignaturePlaced, onSignRequest]);

  const handleTextChange = (id: string, newText: string) => {
    onTextOverlaysChange(
      textOverlays.map((t) => (t.id === id ? { ...t, text: newText } : t))
    );
  };

  const handleTextBlur = () => {
    setEditingTextId(null);
  };

  const currentPageTextOverlays = textOverlays.filter((t) => t.page === currentPage);
  const currentPageSignatures = signatureOverlays.filter((s) => s.page === currentPage);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading PDF...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-muted p-8 flex items-start justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        ref={containerRef}
        className="relative shadow-lg"
        style={{ width: pageSize.width, height: pageSize.height } as React.CSSProperties}
        onClick={handleCanvasClick}
      >
        <canvas ref={canvasRef} className="pdf-canvas bg-card" />
        
        {/* Text overlays */}
        {currentPageTextOverlays.map((text) => (
          <div
            key={text.id}
            className="absolute"
            style={{ left: text.x, top: text.y }}
          >
            {editingTextId === text.id ? (
              <input
                type="text"
                value={text.text}
                onChange={(e) => handleTextChange(text.id, e.target.value)}
                onBlur={handleTextBlur}
                autoFocus
                className="bg-transparent border-b-2 border-primary outline-none text-foreground"
                style={{ fontSize: text.fontSize }}
              />
            ) : (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingTextId(text.id);
                }}
                className="cursor-text hover:bg-primary/10 px-1 rounded"
                style={{ fontSize: text.fontSize }}
              >
                {text.text}
              </span>
            )}
          </div>
        ))}

        {/* Signature overlays */}
        {currentPageSignatures.map((sig) => (
          <img
            key={sig.id}
            src={sig.imageData}
            alt="Signature"
            className="absolute pointer-events-none"
            style={{
              left: sig.x,
              top: sig.y,
              width: sig.width,
              height: sig.height,
            }}
          />
        ))}

        {/* Cursor hint for sign tool */}
        {activeTool === "sign" && pendingSignature && (
          <div className="absolute inset-0 cursor-crosshair">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              Click to place your signature
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
