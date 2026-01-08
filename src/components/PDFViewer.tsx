"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist/build/pdf.min.mjs";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { ToolType } from "@/components/EditorToolbar";
import type { DrawStrokeOverlay, FieldOverlay, ImageOverlay, SignatureOverlay } from "@/lib/pdf-utils";

// Set up PDF.js worker (served from `/public/pdfjs/` via `scripts/copy-pdf-worker.mjs`)
pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";

const DEFAULT_SIGNATURE_SIZE_PX = { width: 150, height: 50 };

interface PDFViewerProps {
  file: File;
  zoom: number;
  currentPage: number;
  onPageChange: (page: number) => void;

  // Base viewer rotation (still supported), plus per-page rotations.
  rotation: number;
  pageOrder?: number[];
  pageRotations?: Record<number, number>;
  onPageOrderChange?: (order: number[]) => void;

  onPageCountChange: (count: number) => void;

  activeTool: ToolType;

  // Sign
  onSignRequest: () => void;
  signatureOverlays: SignatureOverlay[];
  onSignatureOverlaysChange: (overlays: SignatureOverlay[]) => void;
  pendingSignature: string | null;
  onPendingSignaturePlaced: () => void;

  // Draw
  drawStrokes: DrawStrokeOverlay[];
  onDrawStrokesChange: (strokes: DrawStrokeOverlay[]) => void;
  onDrawStrokesCommit?: () => void;
  drawSettings?: {
    tool: "pen" | "highlighter" | "eraser";
    color: string;
    width: number;
  };

  // Images
  imageOverlays: ImageOverlay[];
  onImageOverlaysChange: (overlays: ImageOverlay[]) => void;
  pendingImage: string | null;
  onPendingImageChange: (dataUrl: string | null) => void;
  onPendingImagePlaced: () => void;

  // Fields
  fieldOverlays: FieldOverlay[];
  onFieldOverlaysChange: (overlays: FieldOverlay[]) => void;
  onFieldOverlaysCommit?: () => void;
}

function LoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-muted">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground">Loading PDF...</p>
      </div>
    </div>
  );
}

function PagesSidebar({
  pageNumbers,
  currentPage,
  totalPages,
  pagesListRef,
  onGoToPage,
  rearrangeEnabled,
  onMovePage,
}: {
  pageNumbers: number[];
  currentPage: number;
  totalPages: number;
  pagesListRef: React.RefObject<HTMLDivElement | null>;
  onGoToPage: (page: number) => void;
  rearrangeEnabled?: boolean;
  onMovePage?: (fromIndex: number, toIndex: number) => void;
}) {
  return (
    <aside className="w-56 shrink-0 border-r border-border bg-card/50 backdrop-blur-sm">
      <div className="px-3 py-2 border-b border-border">
        <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
          Pages
        </div>
        <div className="text-xs text-muted-foreground mt-1">{totalPages} total</div>
      </div>

      <div ref={pagesListRef} className="h-[calc(100%-49px)] overflow-auto p-2">
        {pageNumbers.map((pageNum, idx) => {
          const isActive = pageNum === currentPage;
          return (
            <div key={pageNum} className="mb-1 flex items-stretch gap-1">
              <button
                type="button"
                data-page={pageNum}
                onClick={() => onGoToPage(pageNum)}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "flex-1 text-left rounded-lg px-3 py-2 border transition-colors",
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

              {rearrangeEnabled && (
                <div className="flex flex-col justify-center gap-1">
                  <button
                    type="button"
                    className="h-5 w-7 rounded border border-border bg-background/50 text-xs text-muted-foreground hover:bg-muted disabled:opacity-40"
                    onClick={() => onMovePage?.(idx, idx - 1)}
                    disabled={idx === 0}
                    aria-label={`Move page ${pageNum} up`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="h-5 w-7 rounded border border-border bg-background/50 text-xs text-muted-foreground hover:bg-muted disabled:opacity-40"
                    onClick={() => onMovePage?.(idx, idx + 1)}
                    disabled={idx === pageNumbers.length - 1}
                    aria-label={`Move page ${pageNum} down`}
                  >
                    ↓
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function isRenderingCancelled(err: unknown) {
  return typeof err === "object" && err !== null && (err as any).name === "RenderingCancelledException";
}

export function PDFViewer(props: PDFViewerProps) {
  const {
    file,
    zoom,
    currentPage,
    onPageChange,
    rotation,
    pageOrder,
    pageRotations,
    onPageOrderChange,
    onPageCountChange,
    activeTool,
    onSignRequest,
    signatureOverlays,
    onSignatureOverlaysChange,
    pendingSignature,
    onPendingSignaturePlaced,
    drawStrokes,
    onDrawStrokesChange,
    onDrawStrokesCommit,
    drawSettings,
    imageOverlays,
    onImageOverlaysChange,
    pendingImage,
    onPendingImageChange,
    onPendingImagePlaced,
    fieldOverlays,
    onFieldOverlaysChange,
    onFieldOverlaysCommit,
  } = props;

  const scrollRef = useRef<HTMLDivElement>(null);
  const pagesListRef = useRef<HTMLDivElement>(null);
  const pageContainerRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const pageCanvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const drawCanvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const imageInputRef = useRef<HTMLInputElement>(null);

  const renderTasksRef = useRef<Map<number, ReturnType<pdfjs.PDFPageProxy["render"]>>>(new Map());
  const outputScaleRef = useRef<number>(1);

  const [loading, setLoading] = useState(true);
  const [pdfDoc, setPdfDoc] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [pageLayouts, setPageLayouts] = useState<
    Array<{ page: number; width: number; height: number; viewportTransform: [number, number, number, number, number, number] }>
  >([]);

  // PDF.js text layer (for "Select" tool)
  const [textItemsByPage, setTextItemsByPage] = useState<Record<number, any[]>>({});
  const loadedTextPagesRef = useRef<Set<number>>(new Set());

  const totalPages = pdfDoc?.numPages ?? 0;
  const pageNumbers = useMemo(() => {
    if (Array.isArray(pageOrder) && pageOrder.length === totalPages) return pageOrder;
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [pageOrder, totalPages]);

  const overlaysByPage = useMemo(() => {
    const byPage = new Map<
      number,
      { sigs: SignatureOverlay[]; imgs: ImageOverlay[]; fields: FieldOverlay[] }
    >();
    for (const s of signatureOverlays) {
      const entry = byPage.get(s.page) ?? { sigs: [], imgs: [], fields: [] };
      entry.sigs.push(s);
      byPage.set(s.page, entry);
    }
    for (const i of imageOverlays) {
      const entry = byPage.get(i.page) ?? { sigs: [], imgs: [], fields: [] };
      entry.imgs.push(i);
      byPage.set(i.page, entry);
    }
    for (const f of fieldOverlays) {
      const entry = byPage.get(f.page) ?? { sigs: [], imgs: [], fields: [] };
      entry.fields.push(f);
      byPage.set(f.page, entry);
    }
    return byPage;
  }, [fieldOverlays, imageOverlays, signatureOverlays]);

  // -----------------------------
  // Load PDF
  // -----------------------------
  useEffect(() => {
    let cancelled = false;
    let loadingTask: pdfjs.PDFDocumentLoadingTask | null = null;

    const load = async () => {
      setLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        if (cancelled) return;
        loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        setPdfDoc(pdf);
        // Reset cached text content whenever a new PDF is loaded.
        setTextItemsByPage({});
        loadedTextPagesRef.current = new Set();
        onPageCountChange(pdf.numPages);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load().catch((err) => {
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

  // -----------------------------
  // Render pages (PDF canvas)
  // -----------------------------
  useEffect(() => {
    if (!pdfDoc) return;
    let cancelled = false;

    const renderAllPages = async () => {
      const scale = zoom / 100;
      const outputScale =
        typeof window !== "undefined" && window.devicePixelRatio ? window.devicePixelRatio : 1;
      outputScaleRef.current = outputScale;

      // Cancel any in-flight renders before starting a new pass.
      for (const task of renderTasksRef.current.values()) {
        try {
          task.cancel?.();
        } catch {
          // ignore
        }
      }
      renderTasksRef.current.clear();

      // Layouts for each original page number (canvas size needs to be stable)
      const layouts: Array<{
        page: number;
        width: number;
        height: number;
        viewportTransform: [number, number, number, number, number, number];
      }> = [];
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        if (cancelled) return;
        const pageRot = (rotation + (pageRotations?.[pageNum] ?? 0)) % 360;
        const viewport = page.getViewport({ scale, rotation: pageRot });
        layouts.push({
          page: pageNum,
          width: viewport.width,
          height: viewport.height,
          viewportTransform: viewport.transform as any,
        });
      }
      if (cancelled) return;
      setPageLayouts(layouts);

      // Wait a frame for canvases to mount.
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      if (cancelled) return;

      // Render sequentially so pages load in order.
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const canvas = pageCanvasRefs.current.get(pageNum);
        if (!canvas) continue;
        const page = await pdfDoc.getPage(pageNum);
        if (cancelled) return;

        const pageRot = (rotation + (pageRotations?.[pageNum] ?? 0)) % 360;
        const viewport = page.getViewport({ scale, rotation: pageRot });
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const renderContext = {
          canvasContext: ctx,
          viewport,
          transform: outputScale !== 1 ? ([outputScale, 0, 0, outputScale, 0, 0] as const) : undefined,
        };

        const task = page.render(renderContext as any);
        renderTasksRef.current.set(pageNum, task);
        try {
          await task.promise;
        } catch (err) {
          if (!isRenderingCancelled(err)) throw err;
        } finally {
          if (renderTasksRef.current.get(pageNum) === task) renderTasksRef.current.delete(pageNum);
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
  }, [pdfDoc, pageRotations, rotation, zoom]);

  // Lazily load text content for the "Select" tool (so it doesn't slow normal editing).
  useEffect(() => {
    if (activeTool !== "select") return;
    if (!pdfDoc) return;
    let cancelled = false;

    const loadText = async () => {
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        if (cancelled) return;
        if (loadedTextPagesRef.current.has(pageNum)) continue;
        const page = await pdfDoc.getPage(pageNum);
        if (cancelled) return;
        const tc = await page.getTextContent();
        if (cancelled) return;
        loadedTextPagesRef.current.add(pageNum);
        setTextItemsByPage((prev) => ({ ...prev, [pageNum]: (tc as any).items ?? [] }));
      }
    };

    loadText().catch((err) => {
      console.warn("Failed to load text layer:", err);
    });

    return () => {
      cancelled = true;
    };
  }, [activeTool, pdfDoc]);

  const multiplyTransform = useCallback(
    (
      m1: [number, number, number, number, number, number],
      m2: [number, number, number, number, number, number]
    ): [number, number, number, number, number, number] => {
      const [a1, b1, c1, d1, e1, f1] = m1;
      const [a2, b2, c2, d2, e2, f2] = m2;
      return [
        a1 * a2 + c1 * b2,
        b1 * a2 + d1 * b2,
        a1 * c2 + c1 * d2,
        b1 * c2 + d1 * d2,
        a1 * e2 + c1 * f2 + e1,
        b1 * e2 + d1 * f2 + f1,
      ];
    },
    []
  );

  const textSpanStyle = useCallback(
    (
      item: any,
      layout: { viewportTransform: [number, number, number, number, number, number] }
    ): React.CSSProperties => {
      const it = item as { transform?: [number, number, number, number, number, number] };
      const t = (it.transform ?? [1, 0, 0, 1, 0, 0]) as [number, number, number, number, number, number];
      const tx = multiplyTransform(layout.viewportTransform, t);
      const angle = Math.atan2(tx[1], tx[0]);
      const fontHeight = Math.max(1, Math.hypot(tx[2], tx[3]));

      return {
        left: `${tx[4]}px`,
        top: `${tx[5] - fontHeight}px`,
        fontSize: `${fontHeight}px`,
        transformOrigin: "0 0",
        transform: `rotate(${angle}rad)`,
      };
    },
    [multiplyTransform]
  );

  // -----------------------------
  // Draw canvas
  // -----------------------------
  const activeStrokeRef = useRef<{ page: number; pointerId: number; stroke: DrawStrokeOverlay } | null>(
    null
  );
  const activeEraserRef = useRef<{ page: number; pointerId: number } | null>(null);

  const currentDrawSettings = useMemo(() => {
    return (
      drawSettings ?? {
        tool: "pen" as const,
        color: "#ef4444",
        width: 6,
      }
    );
  }, [drawSettings]);

  const redrawDrawForPage = useCallback(
    (pageNum: number) => {
      const canvas = drawCanvasRefs.current.get(pageNum);
      const layout = pageLayouts.find((l) => l.page === pageNum);
      if (!canvas || !layout) return;

      const outputScale = outputScaleRef.current || 1;
      canvas.width = Math.floor(layout.width * outputScale);
      canvas.height = Math.floor(layout.height * outputScale);
      canvas.style.width = `${layout.width}px`;
      canvas.style.height = `${layout.height}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(outputScale, 0, 0, outputScale, 0, 0);
      ctx.clearRect(0, 0, layout.width, layout.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const strokesForPage = drawStrokes.filter((s) => s.page === pageNum).slice();
      const active = activeStrokeRef.current;
      if (active?.page === pageNum) strokesForPage.push(active.stroke);

      for (const s of strokesForPage) {
        const pts = s.points ?? [];
        if (pts.length < 2) continue;
        ctx.save();
        ctx.globalAlpha = typeof s.opacity === "number" ? Math.max(0, Math.min(1, s.opacity)) : 1;
        ctx.strokeStyle = s.color ?? "#ef4444";
        ctx.lineWidth = Math.max(1, s.width || 2);
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
        ctx.restore();
      }
    },
    [drawStrokes, pageLayouts]
  );

  const eraseAtPoint = useCallback(
    (pageNum: number, x: number, y: number) => {
      const radius = Math.max(8, (currentDrawSettings.width || 8) * 1.6);
      const r2 = radius * radius;
      const hit = (s: DrawStrokeOverlay) => {
        if (s.page !== pageNum) return false;
        const pts = s.points ?? [];
        for (const p of pts) {
          const dx = p.x - x;
          const dy = p.y - y;
          if (dx * dx + dy * dy <= r2) return true;
        }
        return false;
      };
      const next = drawStrokes.filter((s) => !hit(s));
      if (next.length !== drawStrokes.length) {
        onDrawStrokesChange(next);
      }
    },
    [currentDrawSettings.width, drawStrokes, onDrawStrokesChange]
  );

  useEffect(() => {
    for (const layout of pageLayouts) redrawDrawForPage(layout.page);
  }, [drawStrokes, pageLayouts, redrawDrawForPage]);

  const handleDrawPointerDown = useCallback(
    (pageNum: number, e: React.PointerEvent<HTMLCanvasElement>) => {
      if (activeTool !== "draw") return;
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      const container = pageContainerRefs.current.get(pageNum);
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      try {
        (e.currentTarget as any).setPointerCapture?.(e.pointerId);
      } catch {
        // ignore
      }

      if (currentDrawSettings.tool === "eraser") {
        activeEraserRef.current = { page: pageNum, pointerId: e.pointerId };
        eraseAtPoint(pageNum, x, y);
        redrawDrawForPage(pageNum);
        return;
      }

      const opacity = currentDrawSettings.tool === "highlighter" ? 0.25 : 1;
      const width = Math.max(1, currentDrawSettings.width || 2) * (currentDrawSettings.tool === "highlighter" ? 2.2 : 1);
      const stroke: DrawStrokeOverlay = {
        id: `draw-${Date.now()}`,
        page: pageNum,
        color: currentDrawSettings.color ?? "#ef4444",
        width,
        opacity,
        points: [{ x, y }],
      };
      activeStrokeRef.current = { page: pageNum, pointerId: e.pointerId, stroke };
      redrawDrawForPage(pageNum);
    },
    [activeTool, currentDrawSettings.color, currentDrawSettings.tool, currentDrawSettings.width, eraseAtPoint, redrawDrawForPage]
  );

  const handleDrawPointerMove = useCallback(
    (pageNum: number, e: React.PointerEvent<HTMLCanvasElement>) => {
      const er = activeEraserRef.current;
      if (er && er.page === pageNum && er.pointerId === e.pointerId) {
        const container = pageContainerRefs.current.get(pageNum);
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        eraseAtPoint(pageNum, x, y);
        redrawDrawForPage(pageNum);
        return;
      }
      const active = activeStrokeRef.current;
      if (!active) return;
      if (active.page !== pageNum) return;
      if (active.pointerId !== e.pointerId) return;
      const container = pageContainerRefs.current.get(pageNum);
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      active.stroke.points.push({ x, y });
      redrawDrawForPage(pageNum);
    },
    [eraseAtPoint, redrawDrawForPage]
  );

  const finishDrawStroke = useCallback(
    (pageNum: number, pointerId: number) => {
      const er = activeEraserRef.current;
      if (er && er.page === pageNum && er.pointerId === pointerId) {
        activeEraserRef.current = null;
        onDrawStrokesCommit?.();
        redrawDrawForPage(pageNum);
        return;
      }
      const active = activeStrokeRef.current;
      if (!active) return;
      if (active.page !== pageNum) return;
      if (active.pointerId !== pointerId) return;
      activeStrokeRef.current = null;
      if ((active.stroke.points?.length ?? 0) > 1) {
        onDrawStrokesChange([...drawStrokes, active.stroke]);
        onDrawStrokesCommit?.();
      }
      redrawDrawForPage(pageNum);
    },
    [drawStrokes, onDrawStrokesChange, onDrawStrokesCommit, redrawDrawForPage]
  );

  useEffect(() => {
    if (activeTool === "draw") return;
    if (activeStrokeRef.current) {
      const pageNum = activeStrokeRef.current.page;
      activeStrokeRef.current = null;
      redrawDrawForPage(pageNum);
    }
    if (activeEraserRef.current) {
      const pageNum = activeEraserRef.current.page;
      activeEraserRef.current = null;
      redrawDrawForPage(pageNum);
    }
  }, [activeTool, redrawDrawForPage]);

  // -----------------------------
  // Scroll + navigation
  // -----------------------------
  const scrollToPage = useCallback((pageNum: number) => {
    const scroller = scrollRef.current;
    const el = pageContainerRefs.current.get(pageNum);
    if (!scroller || !el) return;
    const scrollerRect = scroller.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const top = scroller.scrollTop + (elRect.top - scrollerRect.top) - 16;
    scroller.scrollTo({ top, behavior: "smooth" });
  }, []);

  const handleGoToPage = useCallback(
    (pageNum: number) => {
      onPageChange(pageNum);
      scrollToPage(pageNum);
    },
    [onPageChange, scrollToPage]
  );

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

    let active = pageNumbers[0] ?? 1;
    for (const pageNum of pageNumbers) {
      const el = pageContainerRefs.current.get(pageNum);
      if (!el) continue;
      if (el.offsetTop <= anchor) active = pageNum;
      else break;
    }
    if (active !== currentPage) onPageChange(active);
  }, [currentPage, onPageChange, pageNumbers]);

  // -----------------------------
  // Click to place sign / image / field
  // -----------------------------
  const handlePageClick = useCallback(
    (pageNum: number, e: React.MouseEvent) => {
      if (activeTool === "draw") return;

      const container = pageContainerRefs.current.get(pageNum);
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (activeTool === "sign") {
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
        return;
      }

      if (activeTool === "image") {
        if (pendingImage) {
          const width = 220;
          const height = 220;
          const newImg: ImageOverlay = {
            id: `img-${Date.now()}`,
            imageData: pendingImage,
            x: x - width / 2,
            y: y - height / 2,
            width,
            height,
            page: pageNum,
          };
          onImageOverlaysChange([...imageOverlays, newImg]);
          onPendingImagePlaced();
        } else {
          imageInputRef.current?.click();
        }
        return;
      }

      if (activeTool === "field") {
        const width = 220;
        const height = 36;
        const newField: FieldOverlay = {
          id: `field-${Date.now()}`,
          name: `field_${pageNum}_${Date.now()}`,
          x: x - width / 2,
          y: y - height / 2,
          width,
          height,
          fontSize: 12,
          page: pageNum,
        };
        onFieldOverlaysChange([...fieldOverlays, newField]);
        onFieldOverlaysCommit?.();
      }
    },
    [
      activeTool,
      fieldOverlays,
      imageOverlays,
      onFieldOverlaysChange,
      onFieldOverlaysCommit,
      onImageOverlaysChange,
      onPendingImagePlaced,
      onPendingSignaturePlaced,
      onSignRequest,
      onSignatureOverlaysChange,
      pendingImage,
      pendingSignature,
      signatureOverlays,
    ]
  );

  if (loading) return <LoadingState />;

  return (
    <div className="flex-1 min-h-0 w-full flex overflow-hidden bg-muted">
      {/* Hidden input for the Image tool */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const reader = new FileReader();
          reader.onload = () => {
            const result = String(reader.result ?? "");
            if (result.startsWith("data:")) onPendingImageChange(result);
          };
          reader.readAsDataURL(f);
          e.currentTarget.value = "";
        }}
      />

      <PagesSidebar
        pageNumbers={pageNumbers}
        currentPage={currentPage}
        totalPages={totalPages}
        pagesListRef={pagesListRef}
        onGoToPage={handleGoToPage}
        rearrangeEnabled={activeTool === "rearrange"}
        onMovePage={(from, to) => {
          if (!onPageOrderChange) return;
          const next = pageNumbers.slice();
          if (from < 0 || to < 0 || from >= next.length || to >= next.length) return;
          const [moved] = next.splice(from, 1);
          next.splice(to, 0, moved);
          onPageOrderChange(next);
        }}
      />

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 w-full overflow-auto outline-none"
        tabIndex={0}
        onScroll={handleScroll}
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
                {pageNumbers.map((pageNum) => {
                  const layout = pageLayouts.find((l) => l.page === pageNum);
                  if (!layout) return null;
                  const entry = overlaysByPage.get(pageNum) ?? { sigs: [], imgs: [], fields: [] };
                  const isActive = pageNum === currentPage;
                  return (
                    <div
                      key={pageNum}
                      ref={(el) => {
                        if (el) pageContainerRefs.current.set(pageNum, el);
                        else pageContainerRefs.current.delete(pageNum);
                      }}
                      className={["relative shadow-lg bg-card", isActive ? "ring-2 ring-primary/30" : ""].join(
                        " "
                      )}
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

                      {/* Text layer (for Select tool) */}
                      <div
                        className="absolute inset-0 pdf-text-layer"
                        style={{
                          pointerEvents: activeTool === "select" ? "auto" : "none",
                          cursor: activeTool === "select" ? "text" : "default",
                        }}
                      >
                        {(textItemsByPage[pageNum] ?? []).map((it, idx) => {
                          const str = String((it as any)?.str ?? "");
                          if (!str) return null;
                          return (
                            <span key={`${pageNum}-${idx}`} style={textSpanStyle(it, layout)}>
                              {str}
                            </span>
                          );
                        })}
                      </div>

                      {/* Draw canvas */}
                      <canvas
                        ref={(el) => {
                          if (el) drawCanvasRefs.current.set(pageNum, el);
                          else drawCanvasRefs.current.delete(pageNum);
                        }}
                        className="absolute inset-0"
                        style={{
                          pointerEvents: activeTool === "draw" ? "auto" : "none",
                          cursor: activeTool === "draw" ? "crosshair" : "default",
                          touchAction: "none",
                        }}
                        onPointerDown={(e) => handleDrawPointerDown(pageNum, e)}
                        onPointerMove={(e) => handleDrawPointerMove(pageNum, e)}
                        onPointerUp={(e) => finishDrawStroke(pageNum, e.pointerId)}
                        onPointerCancel={(e) => finishDrawStroke(pageNum, e.pointerId)}
                      />

                      {/* Signatures (render-only) */}
                      {entry.sigs.map((sig) => (
                        <img
                          key={sig.id}
                          src={sig.imageData}
                          alt="Signature"
                          className="absolute pointer-events-none"
                          style={{ left: sig.x, top: sig.y, width: sig.width, height: sig.height }}
                        />
                      ))}

                      {/* Images (render-only) */}
                      {entry.imgs.map((img) => (
                        <img
                          key={img.id}
                          src={img.imageData}
                          alt="Placed image"
                          className="absolute pointer-events-none"
                          style={{ left: img.x, top: img.y, width: img.width, height: img.height }}
                        />
                      ))}

                      {/* Fields (visual placeholder only; actual field is embedded on export) */}
                      {entry.fields.map((f) => (
                        <div
                          key={f.id}
                          className="absolute rounded-sm border border-primary/40 bg-background/30 pointer-events-none"
                          style={{ left: f.x, top: f.y, width: f.width, height: f.height }}
                        >
                          <div className="absolute inset-0 flex items-center px-2 text-[10px] text-muted-foreground">
                            {f.name}
                          </div>
                        </div>
                      ))}

                      {/* Cursor hint for sign tool */}
                      {activeTool === "sign" && pendingSignature && (
                        <div className="absolute inset-0 cursor-crosshair pointer-events-none">
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                            Click to place your signature
                          </div>
                        </div>
                      )}

                      {/* Cursor hint for image tool */}
                      {activeTool === "image" && pendingImage && (
                        <div className="absolute inset-0 cursor-crosshair pointer-events-none">
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                            Click to place your image
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


