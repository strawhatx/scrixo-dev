"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist/build/pdf.min.mjs";
import { motion } from "framer-motion";
import { Check, ChevronDown, Copy, Loader2, Move, Plus, RotateCcw, RotateCw, SlidersHorizontal, Trash2 } from "lucide-react";

import { ToolType } from "@/components/EditorToolbar";
import type { DrawStrokeOverlay, FieldOverlay, ImageOverlay, SignatureOverlay } from "@/lib/pdf-utils";
import type { FieldKind } from "@/types/fields";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";

// Set up PDF.js worker (served from `/public/pdfjs/` via `scripts/copy-pdf-worker.mjs`)
pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";

const DEFAULT_SIGNATURE_SIZE_PX = { width: 150, height: 50 };
const FIELD_DRAG_MIME = "application/x-scrixo-field";
type FieldOverlayWithKind = FieldOverlay & {
  kind?: FieldKind;
  groupName?: string;
  value?: string;
  values?: string[];
  multiline?: boolean;
  checked?: boolean;
  options?: string[];
};

interface PDFViewerProps {
  file: File;
  zoom: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onZoomChange?: (zoom: number) => void;

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
  onSignatureOverlaysCommit?: () => void;

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
  onImageOverlaysCommit?: () => void;

  // Fields
  fieldOverlays: FieldOverlayWithKind[];
  onFieldOverlaysChange: (overlays: FieldOverlayWithKind[]) => void;
  onFieldOverlaysCommit?: () => void;
  fieldKind?: FieldKind;

  // Optional docked panel rendered between the Pages sidebar and the PDF viewport (e.g. Fields panel)
  dockPanel?: React.ReactNode;
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
  thumbnailsByPage,
  rearrangeEnabled,
  onMovePage,
}: {
  pageNumbers: number[];
  currentPage: number;
  totalPages: number;
  pagesListRef: React.RefObject<HTMLDivElement | null>;
  onGoToPage: (page: number) => void;
  thumbnailsByPage?: Record<number, string>;
  rearrangeEnabled?: boolean;
  onMovePage?: (fromIndex: number, toIndex: number) => void;
}) {
  return (
    <aside className="w-42 flex flex-col items-center shrink-0 border-r border-border bg-card/50 backdrop-blur-sm">
      <div className="px-1.5 py-1.5 border-b border-border">
        <Button
          type="button"
          disabled
          className="w-full h-8 rounded-xl border border-border bg-background/60 text-foreground flex items-center justify-center gap-2 hover:bg-muted disabled:opacity-60 disabled:cursor-not-allowed"
          title="Add page (coming soon)"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden font-semibold md:inline">Add page</span>
          <ChevronDown className="hidden h-4 w-4 opacity-70 md:inline" />
        </Button>
      </div>

      <div ref={pagesListRef} className="h-[calc(100%-60px)] w-28 overflow-auto p-1.5">
        {pageNumbers.map((pageNum, idx) => {
          const isActive = pageNum === currentPage; 
          const thumb = thumbnailsByPage?.[pageNum];
          return (
            <div key={pageNum} className="mb-2 flex items-start gap-2">
              <button
                type="button"
                data-page={pageNum}
                onClick={() => onGoToPage(pageNum)}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "flex-1 text-left rounded-2xl border transition-colors overflow-hidden bg-background/40",
                  isActive
                    ? "border-primary ring-2 ring-primary/25"
                    : "border-border hover:bg-muted/70",
                ].join(" ")}
              >
                <div className="p-1">
                  <div className="rounded-xl bg-muted/20 border border-border overflow-hidden aspect-[3/4] flex items-center justify-center">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={`Page ${pageNum}`}
                        className="w-full h-full object-contain"
                        draggable={false}
                      />
                    ) : (
                      <div className="text-[10px] text-muted-foreground">Preview…</div>
                    )}
                  </div>
                </div>
                <div className="px-2 py-1 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-foreground">{idx + 1}</span>
                  {isActive && <span className="text-[10px] font-bold text-primary">•</span>}
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
    onZoomChange,
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
    onSignatureOverlaysCommit,
    drawStrokes,
    onDrawStrokesChange,
    onDrawStrokesCommit,
    drawSettings,
    imageOverlays,
    onImageOverlaysChange,
    pendingImage,
    onPendingImageChange,
    onPendingImagePlaced,
    onImageOverlaysCommit,
    fieldOverlays,
    onFieldOverlaysChange,
    onFieldOverlaysCommit,
    fieldKind,
    dockPanel,
  } = props;

  const isMobile = useIsMobile();
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
    Array<{
      page: number;
      width: number; // CSS px at current zoom
      height: number; // CSS px at current zoom
      baseWidth: number; // scale=1 units (zoom-independent)
      baseHeight: number; // scale=1 units (zoom-independent)
      viewportTransform: [number, number, number, number, number, number];
    }>
  >([]);

  // PDF.js text layer (for "Select" tool)
  const [textItemsByPage, setTextItemsByPage] = useState<Record<number, any[]>>({});
  const loadedTextPagesRef = useRef<Set<number>>(new Set());

  const overlaysNormalizedRef = useRef(false);
  const autoFitDoneRef = useRef(false);
  const [pageThumbs, setPageThumbs] = useState<Record<number, string>>({});

  const totalPages = pdfDoc?.numPages ?? 0;
  const pageNumbers = useMemo(() => {
    if (Array.isArray(pageOrder) && pageOrder.length === totalPages) return pageOrder;
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [pageOrder, totalPages]);

  const overlaysByPage = useMemo(() => {
    const byPage = new Map<
      number,
      { sigs: SignatureOverlay[]; imgs: ImageOverlay[]; fields: FieldOverlayWithKind[] }
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

  const canInteractOverlays =
    activeTool === "select" || activeTool === "sign" || activeTool === "image" || activeTool === "field";
  const canEditFieldStructure = activeTool === "field";
  const [activeOverlay, setActiveOverlay] = useState<
    { type: "sig" | "img" | "field"; id: string; page: number } | null
  >(null);
  const [fieldOptionsOpen, setFieldOptionsOpen] = useState<{ id: string; page: number } | null>(null);
  const interactionRef = useRef<{
    kind: "drag" | "resize";
    type: "sig" | "img" | "field";
    id: string;
    page: number;
    pointerId: number;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    startClientX: number;
    startClientY: number;
    handle?: "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
    changed: boolean;
  } | null>(null);

  // Auto-close field option menus whenever selection changes (prevents "menus showing up" unexpectedly).
  useEffect(() => {
    if (!fieldOptionsOpen) return;
    if (!activeOverlay || activeOverlay.type !== "field") {
      setFieldOptionsOpen(null);
      return;
    }
    if (fieldOptionsOpen.id !== activeOverlay.id || fieldOptionsOpen.page !== activeOverlay.page) {
      setFieldOptionsOpen(null);
    }
  }, [activeOverlay, fieldOptionsOpen]);

  useEffect(() => {
    // Options menus are for field-structure editing; close them outside Field tool.
    if (!canEditFieldStructure && fieldOptionsOpen) setFieldOptionsOpen(null);
  }, [canEditFieldStructure, fieldOptionsOpen]);

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const updateSignatureOverlay = useCallback(
    (page: number, id: string, patch: Partial<SignatureOverlay>) => {
      onSignatureOverlaysChange(
        signatureOverlays.map((s) => (s.page === page && s.id === id ? { ...s, ...patch } : s))
      );
    },
    [onSignatureOverlaysChange, signatureOverlays]
  );

  const updateImageOverlay = useCallback(
    (page: number, id: string, patch: Partial<ImageOverlay>) => {
      onImageOverlaysChange(imageOverlays.map((i) => (i.page === page && i.id === id ? { ...i, ...patch } : i)));
    },
    [imageOverlays, onImageOverlaysChange]
  );

  const updateFieldOverlay = useCallback(
    (page: number, id: string, patch: Partial<FieldOverlayWithKind>) => {
      onFieldOverlaysChange(fieldOverlays.map((f) => (f.page === page && f.id === id ? { ...f, ...patch } : f)));
    },
    [fieldOverlays, onFieldOverlaysChange]
  );

  const toggleRadioInGroup = useCallback(
    (page: number, id: string) => {
      const target = fieldOverlays.find((f) => f.page === page && f.id === id);
      if (!target) return;
      const groupName = (target.groupName || target.name || "").trim();
      const nextChecked = !target.checked;
      onFieldOverlaysChange(
        fieldOverlays.map((f) => {
          if (f.kind !== "radio") return f;
          const fGroup = (f.groupName || f.name || "").trim();
          if (!groupName || fGroup !== groupName) return f;
          if (f.page === page && f.id === id) return { ...f, checked: nextChecked };
          return { ...f, checked: false };
        })
      );
      onFieldOverlaysCommit?.();
    },
    [fieldOverlays, onFieldOverlaysChange, onFieldOverlaysCommit]
  );

  const duplicateFieldOverlay = useCallback(
    (page: number, id: string) => {
      const src = fieldOverlays.find((f) => f.page === page && f.id === id);
      if (!src) return;
      const stamp = Date.now();
      const copy: FieldOverlayWithKind = {
        ...src,
        id: `field-${stamp}`,
        name: `${(src.name || "field").trim() || "field"}_copy`,
        x: src.x + 12,
        y: src.y + 12,
      };
      onFieldOverlaysChange([...fieldOverlays, copy]);
      onFieldOverlaysCommit?.();
      setActiveOverlay({ type: "field", id: copy.id, page });
    },
    [fieldOverlays, onFieldOverlaysChange, onFieldOverlaysCommit]
  );

  const deleteOverlay = useCallback(
    (type: "sig" | "img" | "field", page: number, id: string) => {
      if (type === "sig") {
        onSignatureOverlaysChange(signatureOverlays.filter((s) => !(s.page === page && s.id === id)));
        onSignatureOverlaysCommit?.();
      } else {
        if (type === "img") {
          onImageOverlaysChange(imageOverlays.filter((i) => !(i.page === page && i.id === id)));
          onImageOverlaysCommit?.();
        } else {
          onFieldOverlaysChange(fieldOverlays.filter((f) => !(f.page === page && f.id === id)));
          onFieldOverlaysCommit?.();
        }
      }
      setActiveOverlay(null);
    },
    [
      imageOverlays,
      onImageOverlaysChange,
      onImageOverlaysCommit,
      fieldOverlays,
      onFieldOverlaysChange,
      onFieldOverlaysCommit,
      onSignatureOverlaysChange,
      onSignatureOverlaysCommit,
      signatureOverlays,
    ]
  );

  const finishInteraction = useCallback(() => {
    const inter = interactionRef.current;
    if (!inter) return;
    interactionRef.current = null;
    if (inter.changed) {
      if (inter.type === "sig") onSignatureOverlaysCommit?.();
      else if (inter.type === "img") onImageOverlaysCommit?.();
      else onFieldOverlaysCommit?.();
    }
  }, [onFieldOverlaysCommit, onImageOverlaysCommit, onSignatureOverlaysCommit]);

  const getFieldDefaults = useCallback((kind: FieldKind) => {
    switch (kind) {
      case "signature":
        return { width: 220, height: 60, fontSize: undefined as number | undefined };
      case "checkbox":
      case "radio":
        return { width: 18, height: 18, fontSize: undefined as number | undefined };
      case "date":
        return { width: 180, height: 36, fontSize: 12 };
      case "select":
        return { width: 240, height: 36, fontSize: 12 };
      case "list":
        return { width: 240, height: 84, fontSize: 12 };
      case "text":
      default:
        return { width: 220, height: 36, fontSize: 12 };
    }
  }, []);

  const placeFieldAt = useCallback(
    (pageNum: number, xCss: number, yCss: number, kind: FieldKind) => {
      const layout = pageLayouts.find((l) => l.page === pageNum);
      const scale = layout && layout.baseWidth ? layout.width / layout.baseWidth : 1;
      const bx = xCss / scale;
      const by = yCss / scale;
      const { width, height, fontSize } = getFieldDefaults(kind);

      const stamp = Date.now();
      const newField: FieldOverlayWithKind = {
        id: `field-${stamp}`,
        kind,
        name: `${kind}_${pageNum}_${stamp}`,
        groupName: kind === "radio" ? `radio_group_${pageNum}_${stamp}` : undefined,
        x: bx - width / 2,
        y: by - height / 2,
        width,
        height,
        fontSize,
        options:
          kind === "select"
            ? ["Option 1", "Option 2"]
            : kind === "list"
              ? ["Option 1", "Option 2"]
              : undefined,
        page: pageNum,
      };
      onFieldOverlaysChange([...fieldOverlays, newField]);
      onFieldOverlaysCommit?.();
    },
    [fieldOverlays, getFieldDefaults, onFieldOverlaysChange, onFieldOverlaysCommit, pageLayouts]
  );

  // One-time normalization: convert any existing overlays that were stored in zoom-scaled CSS px
  // into scale=1 units, so they stay anchored when zoom changes.
  useEffect(() => {
    if (overlaysNormalizedRef.current) return;
    if (pageLayouts.length === 0) return;

    const scaleByPage = new Map<number, number>();
    for (const l of pageLayouts) {
      const s = l.baseWidth > 0 ? l.width / l.baseWidth : 1;
      scaleByPage.set(l.page, s || 1);
    }

    const normalizeList = <T extends { page: number; x: number; y: number; width: number; height: number }>(
      list: T[]
    ) => {
      return list.map((o) => {
        const s = scaleByPage.get(o.page) ?? 1;
        if (!s || s === 1) return o;
        // Heuristic: if values look "too large" for base units, divide by scale.
        // We only run once per file load to avoid double-scaling.
        return {
          ...o,
          x: o.x / s,
          y: o.y / s,
          width: o.width / s,
          height: o.height / s,
        };
      });
    };

    onSignatureOverlaysChange(normalizeList(signatureOverlays));
    onImageOverlaysChange(normalizeList(imageOverlays));
    onFieldOverlaysChange(normalizeList(fieldOverlays));
    overlaysNormalizedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fieldOverlays,
    imageOverlays,
    onFieldOverlaysChange,
    onImageOverlaysChange,
    onSignatureOverlaysChange,
    pageLayouts,
    signatureOverlays,
  ]);

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
        overlaysNormalizedRef.current = false;
        autoFitDoneRef.current = false;
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
        baseWidth: number;
        baseHeight: number;
        viewportTransform: [number, number, number, number, number, number];
      }> = [];
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        if (cancelled) return;
        const pageRot = (rotation + (pageRotations?.[pageNum] ?? 0)) % 360;
        const viewport = page.getViewport({ scale, rotation: pageRot });
        const baseViewport = page.getViewport({ scale: 1, rotation: pageRot });
        layouts.push({
          page: pageNum,
          width: viewport.width,
          height: viewport.height,
          baseWidth: baseViewport.width,
          baseHeight: baseViewport.height,
          viewportTransform: viewport.transform as any,
        });
      }
      if (cancelled) return;
      setPageLayouts(layouts);

      // Auto-fit to width on initial load (only once per PDF load)
      if (!autoFitDoneRef.current && onZoomChange && layouts.length > 0 && scrollRef.current) {
        const firstPageLayout = layouts[0];
        const containerWidth = scrollRef.current.clientWidth;
        const padding = 48; // 24px padding on each side (p-6)
        const availableWidth = Math.max(100, containerWidth - padding); // Ensure minimum width
        if (firstPageLayout.baseWidth > 0 && availableWidth > 0) {
          const fitZoom = Math.floor((availableWidth / firstPageLayout.baseWidth) * 100);
          const clampedZoom = Math.max(50, Math.min(200, fitZoom)); // Clamp between 50% and 200%
          autoFitDoneRef.current = true;
          // Use setTimeout to avoid state updates during render
          setTimeout(() => onZoomChange(clampedZoom), 0);
        }
      }

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
          // Generate a lightweight thumbnail for the Pages sidebar.
          try {
            const src = canvas;
            const maxW = 140;
            const aspect = src.height > 0 && src.width > 0 ? src.height / src.width : 1.333;
            const tw = maxW;
            const th = Math.max(1, Math.round(maxW * aspect));
            const off = document.createElement("canvas");
            off.width = tw;
            off.height = th;
            const octx = off.getContext("2d");
            if (octx) {
              octx.imageSmoothingEnabled = true;
              octx.imageSmoothingQuality = "high";
              octx.drawImage(src, 0, 0, src.width, src.height, 0, 0, tw, th);
              const url = off.toDataURL("image/png");
              setPageThumbs((prev) => (prev[pageNum] === url ? prev : { ...prev, [pageNum]: url }));
            }
          } catch {
            // ignore thumbnail errors
          }
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
          const layout = pageLayouts.find((l) => l.page === pageNum);
          const scale = layout && layout.baseWidth ? layout.width / layout.baseWidth : 1;
          const bx = x / scale;
          const by = y / scale;
          const newSig: SignatureOverlay = {
            id: `sig-${Date.now()}`,
            imageData: pendingSignature,
            x: bx - width / 2,
            y: by - height / 2,
            width,
            height,
            page: pageNum,
            opacity: 1,
            rotation: 0,
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
          const layout = pageLayouts.find((l) => l.page === pageNum);
          const scale = layout && layout.baseWidth ? layout.width / layout.baseWidth : 1;
          const bx = x / scale;
          const by = y / scale;
          const newImg: ImageOverlay = {
            id: `img-${Date.now()}`,
            imageData: pendingImage,
            x: bx - width / 2,
            y: by - height / 2,
            width,
            height,
            page: pageNum,
            opacity: 1,
            rotation: 0,
          };
          onImageOverlaysChange([...imageOverlays, newImg]);
          onPendingImagePlaced();
        } else {
          imageInputRef.current?.click();
        }
        return;
      }

      // Mobile: Click-based field placement (instead of drag and drop)
      if (activeTool === "field" && fieldKind && isMobile) {
        placeFieldAt(pageNum, x, y, fieldKind);
        return;
      }
    },
    [
      activeTool,
      fieldKind,
      imageOverlays,
      isMobile,
      onImageOverlaysChange,
      onPendingImagePlaced,
      onPendingSignaturePlaced,
      onSignRequest,
      onSignatureOverlaysChange,
      pendingImage,
      pendingSignature,
      placeFieldAt,
      signatureOverlays,
    ]
  );

  const tryParseDraggedFieldKind = useCallback((e: React.DragEvent) => {
    const isKind = (k: any): k is FieldKind =>
      k === "signature" ||
      k === "text" ||
      k === "checkbox" ||
      k === "radio" ||
      k === "select" ||
      k === "date" ||
      k === "list";

    // Prefer the custom payload, but fall back to text/plain for Safari + cross-app drags.
    const candidates: string[] = [];
    try {
      const rawCustom = e.dataTransfer.getData(FIELD_DRAG_MIME);
      if (rawCustom) candidates.push(rawCustom);
    } catch {
      // ignore
    }
    try {
      const rawText = e.dataTransfer.getData("text/plain");
      if (rawText) candidates.push(rawText);
    } catch {
      // ignore
    }

    for (const raw of candidates) {
      // Raw can be either JSON {kind} or just the kind string.
      try {
        const parsed = JSON.parse(raw) as { kind?: unknown };
        if (isKind(parsed?.kind)) return parsed.kind;
      } catch {
        if (isKind(raw)) return raw;
      }
    }
    return null;
  }, []);

  const startOverlayDrag = useCallback(
    (
      type: "sig" | "img" | "field",
      pageNum: number,
      id: string,
      e: React.PointerEvent<HTMLDivElement>,
      startRect: { x: number; y: number; width: number; height: number }
    ) => {
      if (!canInteractOverlays) return;
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      setActiveOverlay({ type, id, page: pageNum });
      try {
        (e.currentTarget as any).setPointerCapture?.(e.pointerId);
      } catch {
        // ignore
      }
      interactionRef.current = {
        kind: "drag",
        type,
        id,
        page: pageNum,
        pointerId: e.pointerId,
        startX: startRect.x,
        startY: startRect.y,
        startW: startRect.width,
        startH: startRect.height,
        startClientX: e.clientX,
        startClientY: e.clientY,
        changed: false,
      };
    },
    [canInteractOverlays]
  );

  const startOverlayResize = useCallback(
    (
      type: "sig" | "img" | "field",
      pageNum: number,
      id: string,
      handle: "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw",
      e: React.PointerEvent<HTMLDivElement>,
      startRect: { x: number; y: number; width: number; height: number }
    ) => {
      if (!canInteractOverlays) return;
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      setActiveOverlay({ type, id, page: pageNum });
      try {
        (e.currentTarget as any).setPointerCapture?.(e.pointerId);
      } catch {
        // ignore
      }
      interactionRef.current = {
        kind: "resize",
        type,
        id,
        page: pageNum,
        pointerId: e.pointerId,
        startX: startRect.x,
        startY: startRect.y,
        startW: startRect.width,
        startH: startRect.height,
        startClientX: e.clientX,
        startClientY: e.clientY,
        handle,
        changed: false,
      };
    },
    [canInteractOverlays]
  );

  const onOverlayPointerMove = useCallback(
    (pageNum: number, layout: { width: number; height: number }, e: React.PointerEvent) => {
      const inter = interactionRef.current;
      if (!inter) return;
      if (inter.page !== pageNum) return;
      if (inter.pointerId !== e.pointerId) return;

      const dx = e.clientX - inter.startClientX;
      const dy = e.clientY - inter.startClientY;
      const minSize = inter.type === "field" ? 12 : 24;

      let x = inter.startX;
      let y = inter.startY;
      let w = inter.startW;
      let h = inter.startH;

      if (inter.kind === "drag") {
        x = inter.startX + dx;
        y = inter.startY + dy;
      } else {
        const handle = inter.handle!;
        const east = handle.includes("e");
        const west = handle.includes("w");
        const north = handle.includes("n");
        const south = handle.includes("s");

        if (east) w = inter.startW + dx;
        if (west) {
          w = inter.startW - dx;
          x = inter.startX + dx;
        }
        if (south) h = inter.startH + dy;
        if (north) {
          h = inter.startH - dy;
          y = inter.startY + dy;
        }

        if (w < minSize) {
          if (west) x -= minSize - w;
          w = minSize;
        }
        if (h < minSize) {
          if (north) y -= minSize - h;
          h = minSize;
        }
      }

      // Clamp to page bounds
      w = Math.min(w, layout.width);
      h = Math.min(h, layout.height);
      x = clamp(x, 0, layout.width - w);
      y = clamp(y, 0, layout.height - h);

      inter.changed = true;
      const layoutEntry = pageLayouts.find((l) => l.page === pageNum);
      const scale = layoutEntry && layoutEntry.baseWidth ? layoutEntry.width / layoutEntry.baseWidth : 1;
      const bx = x / scale;
      const by = y / scale;
      const bw = w / scale;
      const bh = h / scale;
      if (inter.type === "sig") updateSignatureOverlay(pageNum, inter.id, { x: bx, y: by, width: bw, height: bh });
      else if (inter.type === "img") updateImageOverlay(pageNum, inter.id, { x: bx, y: by, width: bw, height: bh });
      else updateFieldOverlay(pageNum, inter.id, { x: bx, y: by, width: bw, height: bh });
    },
    [clamp, pageLayouts, updateFieldOverlay, updateImageOverlay, updateSignatureOverlay]
  );

  const adjustOverlay = useCallback(
    (type: "sig" | "img", page: number, id: string, patch: { opacity?: number; rotation?: number }) => {
      if (type === "sig") updateSignatureOverlay(page, id, patch as any);
      else updateImageOverlay(page, id, patch as any);
    },
    [updateImageOverlay, updateSignatureOverlay]
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

      {/* Desktop: Pages Sidebar */}
      <div className="hidden md:block">
        <PagesSidebar
          pageNumbers={pageNumbers}
          currentPage={currentPage}
          totalPages={totalPages}
          pagesListRef={pagesListRef}
          onGoToPage={handleGoToPage}
          thumbnailsByPage={pageThumbs}
          rearrangeEnabled={false}
        />
      </div>

      {dockPanel}

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 w-full overflow-auto outline-none"
        tabIndex={0}
        onScroll={handleScroll}
        onPointerDownCapture={(e) => {
          // Clicking outside the PDF pages should clear any selection/options.
          if (!canInteractOverlays) return;
          const t = e.target as HTMLElement | null;
          if (t?.closest?.('[data-page-container="true"]')) return;
          setActiveOverlay(null);
          setFieldOptionsOpen(null);
        }}
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
                  const entry =
                    overlaysByPage.get(pageNum) ??
                    ({ sigs: [], imgs: [], fields: [] } as {
                      sigs: SignatureOverlay[];
                      imgs: ImageOverlay[];
                      fields: FieldOverlayWithKind[];
                    });
                  const isActive = pageNum === currentPage;
                  return (
                    <div
                      key={pageNum}
                      data-page-container="true"
                      ref={(el) => {
                        if (el) pageContainerRefs.current.set(pageNum, el);
                        else pageContainerRefs.current.delete(pageNum);
                      }}
                      className={["relative shadow-lg bg-card", isActive ? "ring-2 ring-primary/30" : ""].join(
                        " "
                      )}
                      style={{ width: layout.width, height: layout.height }}
                      onDragOver={(e) => {
                        // Some browsers don't allow reading drag data during dragover.
                        // If it looks like a compatible drag, allow the drop, then parse onDrop.
                        const types = Array.from(e.dataTransfer.types ?? []);
                        const looksLikeFieldDrag =
                          types.includes(FIELD_DRAG_MIME) || types.includes("text/plain") || types.includes("Text");
                        if (!looksLikeFieldDrag) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "copy";
                      }}
                      onDrop={(e) => {
                        const kind = tryParseDraggedFieldKind(e);
                        if (!kind) return;
                        e.preventDefault();
                        e.stopPropagation();
                        const container = pageContainerRefs.current.get(pageNum);
                        if (!container) return;
                        const rect = container.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        placeFieldAt(pageNum, x, y, kind);
                      }}
                      onPointerDownCapture={(e) => {
                        // Click anywhere on the page that isn't an overlay should clear selection.
                        if (!canInteractOverlays) return;
                        const t = e.target as HTMLElement | null;
                        if (t?.closest?.('[data-overlay-root="true"]')) return;
                        setActiveOverlay(null);
                        setFieldOptionsOpen(null);
                      }}
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
                      {entry.sigs.map((sig) => {
                        const scale = layout.baseWidth ? layout.width / layout.baseWidth : 1;
                        const left = sig.x * scale;
                        const top = sig.y * scale;
                        const width = sig.width * scale;
                        const height = sig.height * scale;
                        const rot = sig.rotation ?? 0;
                        const opacity = typeof sig.opacity === "number" ? sig.opacity : 1;
                        const isSelected =
                          canInteractOverlays &&
                          activeOverlay?.type === "sig" &&
                          activeOverlay.id === sig.id &&
                          activeOverlay.page === pageNum;
                        return (
                          <div
                            key={sig.id}
                            data-overlay-root="true"
                            data-overlay-type="sig"
                            className="absolute"
                            style={{
                              left,
                              top,
                              width,
                              height,
                              pointerEvents: canInteractOverlays ? "auto" : "none",
                              touchAction: "none",
                              opacity,
                            }}
                            onPointerDown={(e) =>
                              startOverlayDrag("sig", pageNum, sig.id, e, {
                                x: left,
                                y: top,
                                width,
                                height,
                              })
                            }
                            onPointerMove={(e) => onOverlayPointerMove(pageNum, layout, e)}
                            onPointerUp={() => finishInteraction()}
                            onPointerCancel={() => finishInteraction()}
                            onClick={(e) => {
                              if (!canInteractOverlays) return;
                              e.stopPropagation();
                              setActiveOverlay({ type: "sig", id: sig.id, page: pageNum });
                            }}
                          >
                            <img
                          src={sig.imageData}
                          alt="Signature"
                              className="absolute inset-0 h-full w-full object-contain select-none"
                              style={{ transform: `rotate(${rot}deg)`, transformOrigin: "center" }}
                              draggable={false}
                            />

                            {isSelected && (
                              <div className="absolute inset-0">
                                <div className="absolute inset-0 border-2 border-primary/80 rounded-sm" />
                                {/* Toolbar */}
                                <div className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none">
                                  <div className="pointer-events-auto flex items-center gap-3 px-3 py-2 rounded-xl border border-border bg-card/95 shadow-lg">
                                    <input
                                      type="range"
                                      min={10}
                                      max={100}
                                      value={Math.round(opacity * 100)}
                                      onChange={(e) => {
                                        const next = clamp(Number(e.target.value) / 100, 0.1, 1);
                                        adjustOverlay("sig", pageNum, sig.id, { opacity: next });
                                      }}
                                      onPointerUp={() => onSignatureOverlaysCommit?.()}
                                      className="w-28 accent-primary"
                                      aria-label="Opacity"
                                      title="Opacity"
                                    />

                                    <div className="h-6 w-px bg-border" />

                                    <button
                                      type="button"
                                      className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center"
                                      onClick={() => {
                                        const next = ((rot - 90) % 360 + 360) % 360;
                                        adjustOverlay("sig", pageNum, sig.id, { rotation: next });
                                        onSignatureOverlaysCommit?.();
                                      }}
                                      aria-label="Rotate left"
                                      title="Rotate left"
                                    >
                                      <RotateCcw className="h-5 w-5" />
                                    </button>
                                    <button
                                      type="button"
                                      className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center"
                                      onClick={() => {
                                        const next = ((rot + 90) % 360 + 360) % 360;
                                        adjustOverlay("sig", pageNum, sig.id, { rotation: next });
                                        onSignatureOverlaysCommit?.();
                                      }}
                                      aria-label="Rotate right"
                                      title="Rotate right"
                                    >
                                      <RotateCw className="h-5 w-5" />
                                    </button>

                                    <div className="h-6 w-px bg-border" />

                                    <button
                                      type="button"
                                      className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center"
                                      onClick={() => deleteOverlay("sig", pageNum, sig.id)}
                                      aria-label="Delete"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </button>
                                  </div>
                                </div>
                                {/* Delete */}
                                <button
                                  type="button"
                                  className="absolute -top-3 -right-3 h-7 w-7 rounded-full bg-background border border-border shadow-sm flex items-center justify-center"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    deleteOverlay("sig", pageNum, sig.id);
                                  }}
                                  aria-label="Delete signature"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </button>

                                {(["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const).map((h) => {
                                  const pos: Record<string, React.CSSProperties> = {
                                    nw: { left: -6, top: -6, cursor: "nwse-resize" },
                                    n: { left: "50%", top: -6, transform: "translateX(-50%)", cursor: "ns-resize" },
                                    ne: { right: -6, top: -6, cursor: "nesw-resize" },
                                    e: { right: -6, top: "50%", transform: "translateY(-50%)", cursor: "ew-resize" },
                                    se: { right: -6, bottom: -6, cursor: "nwse-resize" },
                                    s: { left: "50%", bottom: -6, transform: "translateX(-50%)", cursor: "ns-resize" },
                                    sw: { left: -6, bottom: -6, cursor: "nesw-resize" },
                                    w: { left: -6, top: "50%", transform: "translateY(-50%)", cursor: "ew-resize" },
                                  };
                                  return (
                                    <div
                                      key={h}
                                      style={pos[h]}
                                      className="absolute h-3 w-3 rounded-full bg-background border border-primary shadow-sm"
                                      onPointerDown={(e) =>
                                        startOverlayResize(
                                          "sig",
                                          pageNum,
                                          sig.id,
                                          h,
                                          e,
                                          { x: left, y: top, width, height }
                                        )
                                      }
                                      onPointerMove={(e) => onOverlayPointerMove(pageNum, layout, e)}
                                      onPointerUp={() => finishInteraction()}
                                      onPointerCancel={() => finishInteraction()}
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Images (render-only) */}
                      {entry.imgs.map((img) => {
                        const scale = layout.baseWidth ? layout.width / layout.baseWidth : 1;
                        const left = img.x * scale;
                        const top = img.y * scale;
                        const width = img.width * scale;
                        const height = img.height * scale;
                        const rot = img.rotation ?? 0;
                        const opacity = typeof img.opacity === "number" ? img.opacity : 1;
                        const isSelected =
                          canInteractOverlays &&
                          activeOverlay?.type === "img" &&
                          activeOverlay.id === img.id &&
                          activeOverlay.page === pageNum;
                        return (
                          <div
                            key={img.id}
                            data-overlay-root="true"
                            data-overlay-type="img"
                            className="absolute"
                            style={{
                              left,
                              top,
                              width,
                              height,
                              pointerEvents: canInteractOverlays ? "auto" : "none",
                              touchAction: "none",
                              opacity,
                            }}
                            onPointerDown={(e) =>
                              startOverlayDrag("img", pageNum, img.id, e, {
                                x: left,
                                y: top,
                                width,
                                height,
                              })
                            }
                            onPointerMove={(e) => onOverlayPointerMove(pageNum, layout, e)}
                            onPointerUp={() => finishInteraction()}
                            onPointerCancel={() => finishInteraction()}
                            onClick={(e) => {
                              if (!canInteractOverlays) return;
                              e.stopPropagation();
                              setActiveOverlay({ type: "img", id: img.id, page: pageNum });
                            }}
                          >
                            <img
                          src={img.imageData}
                          alt="Placed image"
                              className="absolute inset-0 h-full w-full object-contain select-none"
                              style={{ transform: `rotate(${rot}deg)`, transformOrigin: "center" }}
                              draggable={false}
                            />

                            {isSelected && (
                              <div className="absolute inset-0">
                                <div className="absolute inset-0 border-2 border-primary/80 rounded-sm" />
                                <div className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none">
                                  <div className="pointer-events-auto flex items-center gap-3 px-3 py-2 rounded-xl border border-border bg-card/95 shadow-lg">
                                    <input
                                      type="range"
                                      min={10}
                                      max={100}
                                      value={Math.round(opacity * 100)}
                                      onChange={(e) => {
                                        const next = clamp(Number(e.target.value) / 100, 0.1, 1);
                                        adjustOverlay("img", pageNum, img.id, { opacity: next });
                                      }}
                                      onPointerUp={() => onImageOverlaysCommit?.()}
                                      className="w-28 accent-primary"
                                      aria-label="Opacity"
                                      title="Opacity"
                                    />

                                    <div className="h-6 w-px bg-border" />

                                    <button
                                      type="button"
                                      className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center"
                                      onClick={() => {
                                        const next = ((rot - 90) % 360 + 360) % 360;
                                        adjustOverlay("img", pageNum, img.id, { rotation: next });
                                        onImageOverlaysCommit?.();
                                      }}
                                      aria-label="Rotate left"
                                      title="Rotate left"
                                    >
                                      <RotateCcw className="h-5 w-5" />
                                    </button>
                                    <button
                                      type="button"
                                      className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center"
                                      onClick={() => {
                                        const next = ((rot + 90) % 360 + 360) % 360;
                                        adjustOverlay("img", pageNum, img.id, { rotation: next });
                                        onImageOverlaysCommit?.();
                                      }}
                                      aria-label="Rotate right"
                                      title="Rotate right"
                                    >
                                      <RotateCw className="h-5 w-5" />
                                    </button>

                                    <div className="h-6 w-px bg-border" />

                                    <button
                                      type="button"
                                      className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center"
                                      onClick={() => deleteOverlay("img", pageNum, img.id)}
                                      aria-label="Delete"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </button>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="absolute -top-3 -right-3 h-7 w-7 rounded-full bg-background border border-border shadow-sm flex items-center justify-center"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    deleteOverlay("img", pageNum, img.id);
                                  }}
                                  aria-label="Delete image"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </button>

                                {(["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const).map((h) => {
                                  const pos: Record<string, React.CSSProperties> = {
                                    nw: { left: -6, top: -6, cursor: "nwse-resize" },
                                    n: { left: "50%", top: -6, transform: "translateX(-50%)", cursor: "ns-resize" },
                                    ne: { right: -6, top: -6, cursor: "nesw-resize" },
                                    e: { right: -6, top: "50%", transform: "translateY(-50%)", cursor: "ew-resize" },
                                    se: { right: -6, bottom: -6, cursor: "nwse-resize" },
                                    s: { left: "50%", bottom: -6, transform: "translateX(-50%)", cursor: "ns-resize" },
                                    sw: { left: -6, bottom: -6, cursor: "nesw-resize" },
                                    w: { left: -6, top: "50%", transform: "translateY(-50%)", cursor: "ew-resize" },
                                  };
                                  return (
                                    <div
                                      key={h}
                                      style={pos[h]}
                                      className="absolute h-3 w-3 rounded-full bg-background border border-primary shadow-sm"
                                      onPointerDown={(e) =>
                                        startOverlayResize(
                                          "img",
                                          pageNum,
                                          img.id,
                                          h,
                                          e,
                                          { x: left, y: top, width, height }
                                        )
                                      }
                                      onPointerMove={(e) => onOverlayPointerMove(pageNum, layout, e)}
                                      onPointerUp={() => finishInteraction()}
                                      onPointerCancel={() => finishInteraction()}
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Fields (visual placeholder; actual field is embedded on export) */}
                      {entry.fields.map((f) => {
                        const scale = layout.baseWidth ? layout.width / layout.baseWidth : 1;
                        const left = f.x * scale;
                        const top = f.y * scale;
                        const width = f.width * scale;
                        const height = f.height * scale;
                        const kind = f.kind ?? "text";
                        const isDate = kind === "date";
                        const isText = kind === "text";
                        const isInput = isText || isDate;
                        const isMultiline = Boolean(f.multiline) && isText;
                        const isCheckbox = kind === "checkbox";
                        const isRadio = kind === "radio";
                        const isSelect = kind === "select";
                        const isList = kind === "list";
                        const hasOptionsMenu = isSelect || isList || isText || isRadio;
                        const tag = kind === "signature" ? "sign" : kind;
                        const isSelected =
                          canInteractOverlays &&
                          activeOverlay?.type === "field" &&
                          activeOverlay.id === f.id &&
                          activeOverlay.page === pageNum;
                        return (
                          <div
                            key={f.id}
                            data-overlay-root="true"
                            data-overlay-type="field"
                            className="absolute"
                            style={{
                              left,
                              top,
                              width,
                              height,
                              pointerEvents: canInteractOverlays ? "auto" : "none",
                              touchAction: "none",
                            }}
                            onPointerDown={(e) => {
                              // In Select tool, fields should be fillable but not movable.
                              if (!canInteractOverlays) return;
                              if (!canEditFieldStructure) return;
                              startOverlayDrag("field", pageNum, f.id, e, { x: left, y: top, width, height });
                            }}
                            onPointerMove={(e) => onOverlayPointerMove(pageNum, layout, e)}
                            onPointerUp={() => finishInteraction()}
                            onPointerCancel={() => finishInteraction()}
                            onClick={(e) => {
                              if (!canInteractOverlays) return;
                              e.stopPropagation();
                              setActiveOverlay({ type: "field", id: f.id, page: pageNum });
                            }}
                          >
                            {isInput ? (
                              isMultiline ? (
                                <textarea
                                  value={f.value ?? ""}
                                  placeholder=""
                                  readOnly={canEditFieldStructure ? !isSelected : false}
                                  className={[
                                    "absolute inset-0 w-full h-full resize-none rounded-md border bg-white/70 px-3 py-2 text-sm text-foreground",
                                    "focus:outline-none",
                                    isSelected ? "border-primary/80 ring-2 ring-primary/20" : "border-primary/30",
                                    !isSelected ? "cursor-pointer" : "cursor-text",
                                  ].join(" ")}
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onClick={(e) => e.stopPropagation()}
                                  onFocus={() => setActiveOverlay({ type: "field", id: f.id, page: pageNum })}
                                  onChange={(e) => updateFieldOverlay(pageNum, f.id, { value: e.target.value })}
                                  onBlur={() => onFieldOverlaysCommit?.()}
                                />
                              ) : (
                                <input
                                  value={f.value ?? ""}
                                  type={isDate ? "date" : "text"}
                                  placeholder={isDate ? "" : ""}
                                  readOnly={canEditFieldStructure ? !isSelected : false}
                                  className={[
                                    "absolute inset-0 w-full h-full rounded-md border bg-white/70 px-3 text-sm text-foreground",
                                    "focus:outline-none",
                                    isSelected ? "border-primary/80 ring-2 ring-primary/20" : "border-primary/30",
                                    !isSelected ? "cursor-pointer" : "cursor-text",
                                  ].join(" ")}
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onClick={(e) => e.stopPropagation()}
                                  onFocus={() => setActiveOverlay({ type: "field", id: f.id, page: pageNum })}
                                  onChange={(e) => updateFieldOverlay(pageNum, f.id, { value: e.target.value })}
                                  onBlur={() => onFieldOverlaysCommit?.()}
                                />
                              )
                            ) : isSelect ? (
                              <select
                                value={f.value ?? ""}
                                className={[
                                  "absolute inset-0 w-full h-full rounded-md border bg-white/70 px-3 text-sm text-foreground",
                                  "focus:outline-none",
                                  isSelected ? "border-primary/80 ring-2 ring-primary/20" : "border-primary/30",
                                  !isSelected ? "cursor-pointer" : "cursor-default",
                                ].join(" ")}
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveOverlay({ type: "field", id: f.id, page: pageNum });
                                }}
                                onChange={(e) => {
                                  updateFieldOverlay(pageNum, f.id, { value: e.target.value });
                                  onFieldOverlaysCommit?.();
                                }}
                              >
                                <option value="" disabled>
                                  Select…
                                </option>
                                {(Array.isArray(f.options) && f.options.length > 0 ? f.options : ["Option 1", "Option 2", "Option 3"]).map(
                                  (opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  )
                                )}
                              </select>
                            ) : isList ? (
                              <select
                                multiple
                                value={
                                  Array.isArray(f.values) && f.values.length > 0
                                    ? f.values
                                    : typeof f.value === "string" && f.value
                                      ? [f.value]
                                      : []
                                }
                                size={Math.max(2, Math.min(12, Math.floor(height / 28)))}
                                className={[
                                  "absolute inset-0 w-full h-full rounded-md border bg-white/70 px-2 py-2 text-sm text-foreground",
                                  "focus:outline-none",
                                  isSelected ? "border-primary/80 ring-2 ring-primary/20" : "border-primary/30",
                                  !isSelected ? "cursor-pointer" : "cursor-default",
                                ].join(" ")}
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveOverlay({ type: "field", id: f.id, page: pageNum });
                                }}
                                onChange={(e) => {
                                  const selected = Array.from(e.currentTarget.selectedOptions).map((o) => o.value);
                                  updateFieldOverlay(pageNum, f.id, {
                                    values: selected,
                                    value: selected[0] ?? "",
                                  });
                                }}
                                onBlur={() => onFieldOverlaysCommit?.()}
                              >
                                {(Array.isArray(f.options) && f.options.length > 0 ? f.options : ["Option 1", "Option 2"]).map(
                                  (opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  )
                                )}
                              </select>
                            ) : isCheckbox ? (
                              <button
                                type="button"
                                className={[
                                  "absolute inset-0 w-full h-full rounded-none border bg-white/60 flex items-center justify-center",
                                  isSelected ? "border-primary/80 ring-2 ring-primary/20" : "border-primary/40",
                                ].join(" ")}
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setActiveOverlay({ type: "field", id: f.id, page: pageNum });
                                  updateFieldOverlay(pageNum, f.id, { checked: !f.checked });
                                  onFieldOverlaysCommit?.();
                                }}
                                aria-label="Toggle checkbox"
                                title="Checkbox"
                              >
                                {f.checked ? <Check className="h-5 w-5 text-primary" /> : null}
                              </button>
                            ) : isRadio ? (
                              <button
                                type="button"
                                className={[
                                  "absolute inset-0 w-full h-full rounded-full border bg-white/60 flex items-center justify-center",
                                  isSelected ? "border-primary/80 ring-2 ring-primary/20" : "border-primary/40",
                                ].join(" ")}
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setActiveOverlay({ type: "field", id: f.id, page: pageNum });
                                  toggleRadioInGroup(pageNum, f.id);
                                }}
                                aria-label="Toggle radio"
                                title="Radio"
                              >
                                {f.checked ? <div className="h-2.5 w-2.5 rounded-full bg-primary" /> : null}
                              </button>
                            ) : (
                              <>
                                <div
                                  className={[
                                    "absolute inset-0 rounded-md border bg-blue-100/40",
                                    isSelected ? "border-primary/80 ring-2 ring-primary/20" : "border-primary/30",
                                  ].join(" ")}
                                />
                              </>
                            )}

                            {isSelected && (
                              <div className="absolute inset-0 z-30">
                                {(() => {
                                  const isOptionsOpen =
                                    fieldOptionsOpen?.id === f.id && fieldOptionsOpen?.page === pageNum;
                                  if (!canEditFieldStructure) return null;
                                  return (
                                    <>
                                {/* Toolbar: Copy + Delete */}
                                <div className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none">
                                  <div className="pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card/95 shadow-lg">
                                    <button
                                      type="button"
                                      className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center cursor-move"
                                      onPointerDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        startOverlayDrag("field", pageNum, f.id, e as any, { x: left, y: top, width, height });
                                      }}
                                      aria-label="Move field"
                                      title="Move"
                                    >
                                      <Move className="h-5 w-5" />
                                    </button>

                                    <div className="h-6 w-px bg-border" />

                                    {hasOptionsMenu && (
                                      <>
                                        <button
                                          type="button"
                                          className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center"
                                          onPointerDown={(e) => {
                                            // Prevent the underlying field overlay from interpreting this as a drag start.
                                            e.stopPropagation();
                                          }}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setFieldOptionsOpen((prev) => {
                                              const next = { id: f.id, page: pageNum };
                                              if (prev?.id === next.id && prev?.page === next.page) return null;
                                              return next;
                                            });
                                          }}
                                          aria-label="Field options"
                                          title="Options"
                                        >
                                          <SlidersHorizontal className="h-5 w-5" />
                                        </button>

                                        <div className="h-6 w-px bg-border" />
                                      </>
                                    )}

                                    <button
                                      type="button"
                                      className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center"
                                      onPointerDown={(e) => {
                                        e.stopPropagation();
                                      }}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        duplicateFieldOverlay(pageNum, f.id);
                                      }}
                                      aria-label="Duplicate field"
                                      title="Duplicate"
                                    >
                                      <Copy className="h-5 w-5" />
                                    </button>

                                    <div className="h-6 w-px bg-border" />

                                    <button
                                      type="button"
                                      className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center"
                                      onPointerDown={(e) => {
                                        e.stopPropagation();
                                      }}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        deleteOverlay("field", pageNum, f.id);
                                      }}
                                      aria-label="Delete field"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Select/List options editor */}
                                {isOptionsOpen && (isSelect || isList) && (
                                  <div
                                    className="absolute left-0 top-full mt-4 w-[340px] rounded-2xl border border-border bg-card/95 shadow-xl p-4 pointer-events-auto"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="text-sm font-semibold text-foreground">
                                      {isSelect ? "Select menu options" : "List menu options"}
                                    </div>
                                    <div className="mt-3 space-y-2">
                                      {(Array.isArray(f.options) && f.options.length > 0
                                        ? f.options
                                        : isSelect
                                          ? ["Option 1", "Option 2"]
                                          : ["Option 1", "Option 2"]
                                      ).map((opt, idx) => (
                                        <div key={`${f.id}-opt-${idx}`} className="flex items-center gap-2">
                                          <input
                                            value={opt}
                                            className="flex-1 h-11 rounded-xl border border-border bg-background px-3 text-sm"
                                            onChange={(e) => {
                                              const nextLabel = e.target.value;
                                              const prevOptions = Array.isArray(f.options) ? f.options : [];
                                              const nextOptions = prevOptions.slice();
                                              // If options were missing (legacy), build from the rendered list.
                                              if (nextOptions.length === 0) {
                                                const base = ["Option 1", "Option 2"];
                                                nextOptions.push(...base);
                                              }
                                              const old = nextOptions[idx] ?? "";
                                              nextOptions[idx] = nextLabel;

                                              // Keep selected value(s) in sync when renaming an option.
                                              const patch: Partial<FieldOverlayWithKind> = { options: nextOptions };
                                              if (isSelect) {
                                                if (f.value === old) patch.value = nextLabel;
                                              } else {
                                                const vals = Array.isArray(f.values) ? f.values.slice() : [];
                                                patch.values = vals.map((v) => (v === old ? nextLabel : v));
                                                if (f.value === old) patch.value = nextLabel;
                                              }
                                              updateFieldOverlay(pageNum, f.id, patch);
                                            }}
                                            onBlur={() => onFieldOverlaysCommit?.()}
                                          />
                                          <button
                                            type="button"
                                            className="h-11 w-11 rounded-xl border border-border bg-background hover:bg-muted flex items-center justify-center"
                                            onClick={() => {
                                              const prevOptions = Array.isArray(f.options) ? f.options : [];
                                              const base =
                                                prevOptions.length > 0
                                                  ? prevOptions
                                                  : isSelect
                                                    ? ["Option 1", "Option 2"]
                                                    : ["Option 1", "Option 2"];
                                              const nextOptions = base.filter((_, i) => i !== idx);
                                              const removed = base[idx];

                                              const patch: Partial<FieldOverlayWithKind> = { options: nextOptions };
                                              if (isSelect) {
                                                if (f.value === removed) patch.value = nextOptions[0] ?? "";
                                              } else {
                                                const vals = Array.isArray(f.values) ? f.values.filter((v) => v !== removed) : [];
                                                patch.values = vals;
                                                if (f.value === removed) patch.value = vals[0] ?? "";
                                              }
                                              updateFieldOverlay(pageNum, f.id, patch);
                                              onFieldOverlaysCommit?.();
                                            }}
                                            aria-label="Delete option"
                                            title="Delete option"
                                          >
                                            <Trash2 className="h-5 w-5 text-destructive" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>

                                    <button
                                      type="button"
                                      className="mt-3 h-11 rounded-xl border border-border bg-background hover:bg-muted w-full flex items-center justify-center gap-2 text-sm font-medium"
                                      onClick={() => {
                                        const prevOptions = Array.isArray(f.options) ? f.options : [];
                                        const nextOptions = prevOptions.length ? prevOptions.slice() : [];
                                        if (nextOptions.length === 0) {
                                          nextOptions.push(...["Option 1", "Option 2"]);
                                        }
                                        const baseWord = "Option";
                                        let n = nextOptions.length + 1;
                                        let label = `${baseWord} ${n}`;
                                        while (nextOptions.includes(label)) {
                                          n++;
                                          label = `${baseWord} ${n}`;
                                        }
                                        nextOptions.push(label);
                                        updateFieldOverlay(pageNum, f.id, { options: nextOptions });
                                        onFieldOverlaysCommit?.();
                                      }}
                                    >
                                      <Plus className="h-4 w-4" />
                                      Add option
                                    </button>
                                  </div>
                                )}

                                {/* Text field options */}
                                {isOptionsOpen && isText && (
                                  <div
                                    className="absolute left-0 top-full mt-4 w-[340px] rounded-2xl border border-border bg-card/95 shadow-xl p-4 pointer-events-auto"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="flex items-center justify-between gap-4">
                                      <div className="text-sm font-semibold text-foreground">Allow multiple lines</div>
                                      <Switch
                                        checked={Boolean(f.multiline)}
                                        onCheckedChange={(checked) => {
                                          updateFieldOverlay(pageNum, f.id, { multiline: checked });
                                          onFieldOverlaysCommit?.();
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Radio options */}
                                {isOptionsOpen && isRadio && (
                                  <div
                                    className="absolute left-0 top-full mt-4 w-[420px] rounded-2xl border border-border bg-card/95 shadow-xl p-4 pointer-events-auto"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="text-sm font-semibold text-foreground">Radio group name</div>
                                    <input
                                      value={f.groupName ?? ""}
                                      placeholder="Group name"
                                      className="mt-2 w-full h-11 rounded-xl border border-primary/40 bg-background px-3 text-sm"
                                      onChange={(e) => updateFieldOverlay(pageNum, f.id, { groupName: e.target.value })}
                                      onBlur={() => onFieldOverlaysCommit?.()}
                                    />
                                    <div className="mt-2 text-xs text-muted-foreground">
                                      To group radio buttons together, give them the same group name.
                                    </div>
                                  </div>
                                )}
                                    </>
                                  );
                                })()}

                                <button
                                  type="button"
                                  className="absolute -top-3 -right-3 h-7 w-7 rounded-full bg-background border border-border shadow-sm flex items-center justify-center"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    deleteOverlay("field", pageNum, f.id);
                                  }}
                                  aria-label="Delete field"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </button>

                                {(["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const).map((h) => {
                                  const pos: Record<string, React.CSSProperties> = {
                                    nw: { left: -6, top: -6, cursor: "nwse-resize" },
                                    n: { left: "50%", top: -6, transform: "translateX(-50%)", cursor: "ns-resize" },
                                    ne: { right: -6, top: -6, cursor: "nesw-resize" },
                                    e: { right: -6, top: "50%", transform: "translateY(-50%)", cursor: "ew-resize" },
                                    se: { right: -6, bottom: -6, cursor: "nwse-resize" },
                                    s: { left: "50%", bottom: -6, transform: "translateX(-50%)", cursor: "ns-resize" },
                                    sw: { left: -6, bottom: -6, cursor: "nesw-resize" },
                                    w: { left: -6, top: "50%", transform: "translateY(-50%)", cursor: "ew-resize" },
                                  };
                                  return (
                                    <div
                                      key={h}
                                      style={pos[h]}
                                      className="absolute h-3 w-3 rounded-full bg-background border border-primary shadow-sm z-30"
                                      onPointerDown={(e) =>
                                        startOverlayResize("field", pageNum, f.id, h, e, {
                                          x: left,
                                          y: top,
                                          width,
                                          height,
                                        })
                                      }
                                      onPointerMove={(e) => onOverlayPointerMove(pageNum, layout, e)}
                                      onPointerUp={() => finishInteraction()}
                                      onPointerCancel={() => finishInteraction()}
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}

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


