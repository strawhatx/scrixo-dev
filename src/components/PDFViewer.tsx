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
  const scrollRef = useRef<HTMLDivElement>(null);
  const pagesListRef = useRef<HTMLDivElement>(null);
  const pageContainerRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const pageCanvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const renderTasksRef = useRef<Map<number, ReturnType<pdfjs.PDFPageProxy["render"]>>>(new Map());
  const [loading, setLoading] = useState(true);
  const [pdfDoc, setPdfDoc] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [pageLayouts, setPageLayouts] = useState<Array<{ page: number; width: number; height: number }>>(
    []
  );
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

  // Render all pages (continuous scroll)
  useEffect(() => {
    if (!pdfDoc) return;

    let cancelled = false;

    const renderAllPages = async () => {
      const scale = zoom / 100;
      // NOTE: We intentionally ignore the PDF's embedded page rotation (`page.rotate`).
      // Some PDFs have incorrect rotation metadata; other viewers often appear to "fix"
      // it, but PDF.js will faithfully apply it. We keep a user-controlled rotation
      // instead, so the default matches what most users expect.
      const outputScale =
        typeof window !== "undefined" && window.devicePixelRatio
          ? window.devicePixelRatio
          : 1;

      // Cancel any in-flight renders before starting a new pass.
      for (const task of renderTasksRef.current.values()) {
        try {
          task.cancel?.();
        } catch {
          // ignore
        }
      }
      renderTasksRef.current.clear();

      // Compute page layouts so we can render all pages in order.
      const layouts: Array<{ page: number; width: number; height: number }> = [];
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        if (cancelled) return;
        const viewport = page.getViewport({ scale, rotation });
        layouts.push({ page: pageNum, width: viewport.width, height: viewport.height });
      }
      if (cancelled) return;
      setPageLayouts(layouts);

      // Wait a frame for canvases to mount.
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      if (cancelled) return;

      // Render sequentially so pages "load in order".
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const canvas = pageCanvasRefs.current.get(pageNum);
        if (!canvas) continue;

        const page = await pdfDoc.getPage(pageNum);
        if (cancelled) return;

        const viewport = page.getViewport({ scale, rotation });
        const context = canvas.getContext("2d");
        if (!context) continue;

      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: context,
        viewport,
        transform:
          outputScale !== 1 ? ([outputScale, 0, 0, outputScale, 0, 0] as const) : undefined,
      };

      const task = page.render(renderContext as any);
        renderTasksRef.current.set(pageNum, task);

      try {
        await task.promise;
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") throw err;
      } finally {
          if (renderTasksRef.current.get(pageNum) === task) {
            renderTasksRef.current.delete(pageNum);
          }
        }
      }
    };

    renderAllPages();
    return () => {
      cancelled = true;
      for (const task of renderTasksRef.current.values()) {
      try {
          task.cancel?.();
      } catch {
        // ignore
      }
      }
      renderTasksRef.current.clear();
    };
  }, [pdfDoc, zoom, rotation]);

  // Handle click for placing elements on a specific page
  const handlePageClick = useCallback((pageNum: number, e: React.MouseEvent) => {
    const container = pageContainerRefs.current.get(pageNum);
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === "text") {
      const newText: TextOverlay = {
        id: `text-${Date.now()}`,
        text: DEFAULT_TEXT,
        x,
        y,
        fontSize: DEFAULT_FONT_SIZE_PX * (zoom / 100),
        page: pageNum,
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
          page: pageNum,
        };
        onSignatureOverlaysChange([...signatureOverlays, newSig]);
        onPendingSignaturePlaced();
      } else {
        onSignRequest();
      }
    }
  }, [
    activeTool,
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

  const scrollToPage = useCallback((pageNum: number) => {
    const scroller = scrollRef.current;
    const el = pageContainerRefs.current.get(pageNum);
    if (!scroller || !el) return;
    const scrollerRect = scroller.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const top = scroller.scrollTop + (elRect.top - scrollerRect.top) - 16;
    scroller.scrollTo({ top, behavior: "smooth" });
  }, []);

  // Keep the active page button visible in the sidebar when currentPage changes (via scroll or click).
  useEffect(() => {
    const list = pagesListRef.current;
    if (!list) return;
    const btn = list.querySelector<HTMLButtonElement>(`button[data-page="${currentPage}"]`);
    btn?.scrollIntoView({ block: "nearest" });
  }, [currentPage]);

  const handleScroll = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const anchor = scroller.scrollTop + scroller.clientHeight * 0.35;

    let active = 1;
    for (const layout of pageLayouts) {
      const el = pageContainerRefs.current.get(layout.page);
      if (!el) continue;
      if (el.offsetTop <= anchor) active = layout.page;
      else break;
    }
    if (active !== currentPage) onPageChange(active);
  }, [currentPage, onPageChange, pageLayouts]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (editingTextId) return;
      if (e.key === "PageDown") {
        e.preventDefault();
        scrollToPage(Math.min(currentPage + 1, pdfDoc?.numPages ?? currentPage + 1));
      }
      if (e.key === "PageUp") {
        e.preventDefault();
        scrollToPage(Math.max(currentPage - 1, 1));
      }
    },
    [currentPage, editingTextId, pdfDoc?.numPages, scrollToPage]
  );

  const overlaysByPage = useMemo(() => {
    const byPage = new Map<number, { texts: TextOverlay[]; sigs: SignatureOverlay[] }>();
    for (const t of textOverlays) {
      const entry = byPage.get(t.page) ?? { texts: [], sigs: [] };
      entry.texts.push(t);
      byPage.set(t.page, entry);
    }
    for (const s of signatureOverlays) {
      const entry = byPage.get(s.page) ?? { texts: [], sigs: [] };
      entry.sigs.push(s);
      byPage.set(s.page, entry);
    }
    return byPage;
  }, [signatureOverlays, textOverlays]);

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

        <div ref={pagesListRef} className="h-[calc(100%-49px)] overflow-auto p-2">
          {pageNumbers.map((pageNum) => {
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                data-page={pageNum}
                onClick={() => {
                  onPageChange(pageNum);
                  scrollToPage(pageNum);
                }}
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
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 w-full overflow-auto outline-none"
        tabIndex={0}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
      >
        <div className="min-w-full flex flex-col items-center gap-10 p-6 pb-28">
          {pageLayouts.length === 0 ? (
            <div className="w-full flex items-center justify-center py-16 text-muted-foreground gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Preparing pages…</span>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
              <div className="w-full flex flex-col items-center gap-10">
                {pageLayouts.map((layout) => {
                  const pageNum = layout.page;
                  const entry = overlaysByPage.get(pageNum) ?? { texts: [], sigs: [] };
                  const isActive = pageNum === currentPage;
                  return (
                    <div
                      key={pageNum}
                      ref={(el) => {
                        if (el) pageContainerRefs.current.set(pageNum, el);
                        else pageContainerRefs.current.delete(pageNum);
                      }}
                      className={[
                        "relative shadow-lg bg-card",
                        isActive ? "ring-2 ring-primary/30" : "",
                      ].join(" ")}
                      style={{ width: layout.width, height: layout.height }}
                      onClick={(e) => handlePageClick(pageNum, e)}
            >
                      <canvas
                        ref={(el) => {
                          if (el) pageCanvasRefs.current.set(pageNum, el);
                          else pageCanvasRefs.current.delete(pageNum);
                        }}
                        className="pdf-canvas bg-card"
                      />

              {/* Text overlays */}
                      {entry.texts.map((text) => (
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
                      {entry.sigs.map((sig) => (
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
                  );
                })}
            </div>
          </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
