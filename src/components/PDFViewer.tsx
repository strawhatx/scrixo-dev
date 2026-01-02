"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist/build/pdf.min.mjs";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { ToolType } from "@/components/EditorToolbar";
import type { SignatureOverlay, TextOverlay } from "@/lib/pdf-utils";

// Set up PDF.js worker (served from `/public/pdfjs/` via `scripts/copy-pdf-worker.mjs`)
pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";

const DEFAULT_TEXT = "Click to edit";
const DEFAULT_FONT_SIZE_PX = 16;
const DEFAULT_SIGNATURE_SIZE_PX = { width: 150, height: 50 };

interface PDFViewerProps {
  file: File;
  zoom: number;
  currentPage: number;
  onPageChange: (page: number) => void;
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
  onPageChange,
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
  const renderTaskRef = useRef<ReturnType<pdfjs.PDFPageProxy["render"]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfDoc, setPdfDoc] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const pageNumbers = useMemo(
    () => Array.from({ length: pdfDoc?.numPages ?? 0 }, (_, i) => i + 1),
    [pdfDoc?.numPages]
  );

  // Load PDF
  useEffect(() => {
    let cancelled = false;
    let loadingTask: pdfjs.PDFDocumentLoadingTask | null = null;

    const loadPDF = async () => {
      setLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        if (cancelled) return;

        loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        setPdfDoc(pdf);
        onPageCountChange(pdf.numPages);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPDF().catch((err) => {
      // Avoid crashing the whole editor on a single bad file.
      console.error("Failed to load PDF:", err);
      if (!cancelled) {
        setPdfDoc(null);
        onPageCountChange(0);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      try {
        loadingTask?.destroy();
      } catch {
        // ignore
      }
    };
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

      const task = page.render(renderContext as any);
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
        text: DEFAULT_TEXT,
        x,
        y,
        fontSize: DEFAULT_FONT_SIZE_PX * (zoom / 100),
        page: currentPage,
      };
      onTextOverlaysChange([...textOverlays, newText]);
      setEditingTextId(newText.id);
    } else if (activeTool === "sign") {
      if (pendingSignature) {
        const { width, height } = DEFAULT_SIGNATURE_SIZE_PX;
        const newSig: SignatureOverlay = {
          id: `sig-${Date.now()}`,
          imageData: pendingSignature,
          x: x - width / 2,
          y: y - height / 2,
          width,
          height,
          page: currentPage,
        };
        onSignatureOverlaysChange([...signatureOverlays, newSig]);
        onPendingSignaturePlaced();
      } else {
        onSignRequest();
      }
    }
  }, [
    activeTool,
    currentPage,
    onPendingSignaturePlaced,
    onSignRequest,
    onSignatureOverlaysChange,
    onTextOverlaysChange,
    pendingSignature,
    signatureOverlays,
    textOverlays,
    zoom,
  ]);

  const handleTextChange = useCallback(
    (id: string, newText: string) => {
      onTextOverlaysChange(textOverlays.map((t) => (t.id === id ? { ...t, text: newText } : t)));
    },
    [onTextOverlaysChange, textOverlays]
  );

  const handleTextBlur = useCallback(() => setEditingTextId(null), []);

  const currentPageTextOverlays = useMemo(
    () => textOverlays.filter((t) => t.page === currentPage),
    [currentPage, textOverlays]
  );
  const currentPageSignatures = useMemo(
    () => signatureOverlays.filter((s) => s.page === currentPage),
    [currentPage, signatureOverlays]
  );

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
    <div className="flex-1 min-h-0 w-full flex overflow-hidden bg-muted">
      {/* Pages sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-card/50 backdrop-blur-sm">
        <div className="px-3 py-2 border-b border-border">
          <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
            Pages
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {pdfDoc?.numPages ?? 0} total
          </div>
        </div>

        <div className="h-[calc(100%-49px)] overflow-auto p-2">
          {pageNumbers.map((pageNum) => {
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "w-full text-left rounded-lg px-3 py-2 mb-1 border transition-colors",
                  isActive
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-background/40 border-border text-foreground hover:bg-muted/70",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Page {pageNum}</span>
                  {isActive && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                      Active
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main PDF canvas area (fills remaining width) */}
      <div className="flex-1 min-h-0 w-full overflow-auto">
        <div className="min-w-full flex items-start justify-center p-6 pb-28">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div
              ref={containerRef}
              className="relative shadow-lg bg-card"
              style={{ width: pageSize.width, height: pageSize.height }}
              onClick={handleCanvasClick}
            >
              <canvas ref={canvasRef} className="pdf-canvas bg-card" />

              {/* Text overlays */}
              {currentPageTextOverlays.map((text) => (
                <div key={text.id} className="absolute" style={{ left: text.x, top: text.y }}>
                  {editingTextId === text.id ? (
                    <input
                      type="text"
                      value={text.text}
                      onChange={(e) => handleTextChange(text.id, e.target.value)}
                      onBlur={handleTextBlur}
                      autoFocus
                      aria-label="Edit text overlay"
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
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
