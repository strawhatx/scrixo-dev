"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { supabase} from "@/lib/supabase";
import { useFileStore } from "@/store/useFileStore";
import { PDFDocument } from "pdf-lib";
import {
  processPDF,
  SignatureOverlay,
  DrawStrokeOverlay,
  ImageOverlay,
  FieldOverlay,
  TextOverlay,
  type TextAlign,
  type TextFontFamily,
} from "@/lib/pdf-utils";
import { ToolType } from "@/components/EditorToolbar";
import type { FieldKind } from "@/types/fields";
import { checkRateLimit, recordRateLimit } from "@/lib/rate-limiter";
import { extractAcroFormFields } from "@/lib/acroform";


export function useEditor() {
  const router = useRouter();
  const params = useParams();
  const { file, setFile } = useFileStore();

  // Core State
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Tool & View State - Initialize from URL param if present
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const toolParamProcessed = useRef(false);
  const acroToastKeyRef = useRef<string | null>(null);
  
  // Read initial tool from URL on mount and activate it
  useEffect(() => {
    if (typeof window !== "undefined" && file && !loading && !toolParamProcessed.current) {
      const urlParams = new URLSearchParams(window.location.search);
      const toolParam = urlParams.get("tool") as ToolType;
      if (toolParam && toolParam !== "sign" && ["draw", "field", "image", "text", "merge", "split", "rearrange", "rotate"].includes(toolParam)) {
        toolParamProcessed.current = true;
        if (["merge", "split", "rearrange", "rotate"].includes(toolParam)) {
          // For modal tools, open the modal
          if (toolParam === "rotate") setShowRotateModal(true);
          else if (toolParam === "merge") setShowMergeModal(true);
          else if (toolParam === "split") setShowSplitModal(true);
          else if (toolParam === "rearrange") setShowRearrangeModal(true);
        } else {
          setActiveTool(toolParam);
          setPlacementArmed(toolParam === "text");
        }
      }
    }
  }, [file, loading]);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Base rotation for the whole viewport (kept for backwards compatibility; per-page rotation lives below).
  const [rotation, setRotation] = useState(0);

  // Page Model
  // - pageOrder controls render + export order (array of original page numbers).
  // - pageRotations stores per-original-page rotations in degrees (0/90/180/270).
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});
  
  // Overlays
  const [signatureOverlays, setSignatureOverlays] = useState<SignatureOverlay[]>([]);
  const [pendingSignature, setPendingSignature] = useState<string | null>(null);
  const [drawStrokes, setDrawStrokes] = useState<DrawStrokeOverlay[]>([]);
  // Draw settings (affects new strokes + eraser behavior)
  const [drawTool, setDrawTool] = useState<"pen" | "highlighter" | "eraser">("pen");
  const [drawColor, setDrawColor] = useState<string>("#ef4444");
  const [drawWidth, setDrawWidth] = useState<number>(6);
  const [imageOverlays, setImageOverlays] = useState<ImageOverlay[]>([]);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [fieldOverlays, setFieldOverlays] = useState<FieldOverlay[]>([]);
  const [fieldKind, setFieldKind] = useState<FieldKind>("text");
  const [placementArmed, setPlacementArmed] = useState(false);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [pendingText, setPendingText] = useState<{ text: string; fontSize: number; color: string } | null>(null);
  // Text settings
  const [textFontSize, setTextFontSize] = useState<number>(12);
  const [textColor, setTextColor] = useState<string>("#000000");
  const [textFontFamily, setTextFontFamily] = useState<TextFontFamily>("helvetica");
  const [textBold, setTextBold] = useState(false);
  const [textItalic, setTextItalic] = useState(false);
  const [textAlign, setTextAlign] = useState<TextAlign>("left");
  
  // History State
  const [history, setHistory] = useState<
    Array<{
      sig: SignatureOverlay[];
      draw: DrawStrokeOverlay[];
      img: ImageOverlay[];
      field: FieldOverlay[];
      text: TextOverlay[];
      pageOrder: number[];
      pageRotations: Record<number, number>;
    }>
  >([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Modal State
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showRotateModal, setShowRotateModal] = useState(false);
  const [showRearrangeModal, setShowRearrangeModal] = useState(false);
  

  // Subscription (lightweight for now; can be wired to real billing later)
  const isPro = Boolean(
    user?.user_metadata?.is_pro ||
      user?.user_metadata?.plan === "pro" ||
      user?.app_metadata?.plan === "pro"
  );

  // Initialize
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        setUser(supabaseUser);

        const docId = params?.id as string;
        if (docId && docId !== "new") {
          const { data: doc, error } = await supabase
            .from('documents')
            .select('*')
            .eq('id', docId)
            .single();

          if (error || !doc) {
            toast.error("Document not found");
            router.push("/");
            return;
          }

          const { data, error: downloadError } = await supabase.storage
            .from('pdfs')
            .download(doc.file_path);

          if (downloadError) throw downloadError;

          const downloadedFile = new File([data], doc.name, { type: 'application/pdf' });
          setFile(downloadedFile);
        }
        // Don't redirect if no file - allow user to upload in editor
      } catch (err: any) {
        console.error("Editor init error:", err);
        toast.error("Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [params, supabase, router, setFile]);

  // Track signature count (max 2 for free users)
  const MAX_SIGNATURES_FREE = 2;
  const signatureCount = signatureOverlays.length;
  const canAddSignature = isPro || signatureCount < MAX_SIGNATURES_FREE;


  // Keep pageOrder in sync with the loaded PDF page count.
  // If pageOrder is empty (fresh load) or mismatched, reset to natural order.
  useEffect(() => {
    if (!totalPages || totalPages < 1) return;
    
    // Validate page count (max 20 pages)
    const MAX_PAGES = 20;
    if (totalPages > MAX_PAGES) {
      toast.error(`PDF exceeds the maximum of ${MAX_PAGES} pages. Please use a PDF with ${MAX_PAGES} pages or fewer.`);
      router.push("/");
      return;
    }
    
    setPageOrder((prev) => {
      if (prev.length === totalPages) return prev;
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    });
    // Ensure currentPage is always valid.
    setCurrentPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages, router]);

  // Import existing AcroForm widgets as editable overlays.
  useEffect(() => {
    if (!file) {
      setFieldOverlays([]);
      acroToastKeyRef.current = null;
      return;
    }
    const fileKey = `${file.name}:${file.size}:${file.lastModified}`;
    setFieldOverlays([]);
    let cancelled = false;

    extractAcroFormFields(file)
      .then((fields) => {
        if (cancelled) return;
        if (fields.length === 0) return;
        setFieldOverlays((prev) => {
          const userPlaced = prev.filter((f) => !f.imported);
          return [...fields, ...userPlaced];
        });
        if (acroToastKeyRef.current !== fileKey) {
          acroToastKeyRef.current = fileKey;
          toast.success(
            fields.length === 1 ? "Found 1 fillable field on this PDF" : `Found ${fields.length} fillable fields on this PDF`
          );
        }
      })
      .catch(() => {
        // PDFs without a usable AcroForm are fine.
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  // History Actions
  const saveToHistory = useCallback(() => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({
        sig: [...signatureOverlays],
        draw: [...drawStrokes],
        img: [...imageOverlays],
        field: [...fieldOverlays],
        text: [...textOverlays],
        pageOrder: [...pageOrder],
        pageRotations: { ...pageRotations },
      });
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [drawStrokes, fieldOverlays, historyIndex, imageOverlays, pageOrder, pageRotations, signatureOverlays, textOverlays]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setSignatureOverlays(prev.sig);
      setDrawStrokes(prev.draw);
      setImageOverlays(prev.img);
      setFieldOverlays(prev.field);
      setTextOverlays(prev.text);
      setPageOrder(prev.pageOrder);
      setPageRotations(prev.pageRotations);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setSignatureOverlays(next.sig);
      setDrawStrokes(next.draw);
      setImageOverlays(next.img);
      setFieldOverlays(next.field);
      setTextOverlays(next.text);
      setPageOrder(next.pageOrder);
      setPageRotations(next.pageRotations);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  // Document Actions
  const handleSave = useCallback(async () => {
    if (!file || !user) return;
    setIsSaving(true);
    const loadingToast = toast.loading("Saving changes to cloud...");

    try {
      const pdfBytes = await processPDF(file, signatureOverlays, {
        pageOrder,
        pageRotations,
        drawStrokes,
        imageOverlays,
        fieldOverlays,
        textOverlays,
      });
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      
      const docId = params?.id as string;
      let filePath = "";

      if (docId === "new") {
        filePath = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("pdfs")
          .upload(filePath, blob);
        
        if (uploadError) throw uploadError;

        const { data: docData, error: docError } = await supabase
          .from("documents")
          .insert([{ name: file.name, file_path: filePath, user_id: user.id }])
          .select()
          .single();

        if (docError) throw docError;
        
        router.replace(`/edit/${docData.id}`);
      } else {
        const { data: doc } = await supabase
          .from("documents")
          .select("file_path")
          .eq("id", docId)
          .single();
        
        if (!doc) throw new Error("Document record not found");
        
        const { error: uploadError } = await supabase.storage
          .from("pdfs")
          .upload(doc.file_path, blob, { upsert: true });

        if (uploadError) throw uploadError;

        await supabase
          .from("documents")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", docId);
      }

      toast.dismiss(loadingToast);
      toast.success("All changes saved!");
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(`Failed to save: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [drawStrokes, fieldOverlays, file, imageOverlays, pageOrder, pageRotations, user, signatureOverlays, params, supabase, router]);

  const handleDownload = useCallback(async () => {
    if (!file) return false;
    try {
      const pdfBytes = await processPDF(file, signatureOverlays, {
        pageOrder,
        pageRotations,
        drawStrokes,
        imageOverlays,
        fieldOverlays,
        textOverlays,
        watermark: isPro ? undefined : { text: "Edited with scrixo" },
      });
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `edited_${file.name}`;
      link.click();
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      toast.error("Failed to download PDF.");
      return false;
    }
  }, [drawStrokes, fieldOverlays, file, imageOverlays, isPro, pageOrder, pageRotations, signatureOverlays, textOverlays]);

  // Page Operations
  const rotatePage = useCallback(async (delta: number = 90) => {
    const rateLimitCheck = checkRateLimit("rotate");
    if (!rateLimitCheck.allowed) {
      toast.error(rateLimitCheck.message || "Rate limit exceeded. Please wait before rotating again.");
      return;
    }
    
    recordRateLimit("rotate");
    setPageRotations((prev) => {
      const curr = prev[currentPage] ?? 0;
      const next = ((curr + delta) % 360 + 360) % 360;
      return { ...prev, [currentPage]: next };
    });
    saveToHistory();
  }, [currentPage, saveToHistory]);

  const movePageInOrder = useCallback((fromIndex: number, toIndex: number) => {
    setPageOrder((prev) => {
      if (fromIndex === toIndex) return prev;
      if (fromIndex < 0 || toIndex < 0) return prev;
      if (fromIndex >= prev.length || toIndex >= prev.length) return prev;
      const next = prev.slice();
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const setPageOrderSafe = useCallback((next: number[]) => {
    setPageOrder(() => next);
  }, []);

  const mergeWithPDFs = useCallback(
    async (filesToMerge: File[]) => {
      if (!file) return;
      if (!filesToMerge.length) return;

      // Rate limiting check
      const rateLimitCheck = checkRateLimit("merge");
      if (!rateLimitCheck.allowed) {
        toast.error(rateLimitCheck.message || "Rate limit exceeded. Please wait before merging again.");
        return;
      }

      // Validate max files per merge (max 3)
      if (filesToMerge.length > 3) {
        toast.error("Maximum 3 files can be merged at once.");
        return;
      }

      // Validate file sizes (max 25MB per file)
      const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
      const allFiles = [file, ...filesToMerge];
      for (const f of allFiles) {
        if (f.size > MAX_FILE_SIZE_BYTES) {
          toast.error(`File "${f.name}" exceeds the 25MB size limit.`);
          return;
        }
      }

      const loadingToast = toast.loading("Merging PDFs...");
      try {
        // Validate page counts (max 20 pages total)
        const MAX_PAGES = 20;
        let totalPages = 0;
        
        const baseBytes = await file.arrayBuffer();
        const baseDoc = await PDFDocument.load(baseBytes);
        totalPages += baseDoc.getPageCount();

        for (const f of filesToMerge) {
          const bytes = await f.arrayBuffer();
          const doc = await PDFDocument.load(bytes);
          totalPages += doc.getPageCount();
        }

        if (totalPages > MAX_PAGES) {
          toast.dismiss(loadingToast);
          toast.error(`Total page count (${totalPages}) exceeds the maximum of ${MAX_PAGES} pages.`);
          return;
        }

        // Proceed with merge
        const outDoc = await PDFDocument.create();
        const basePages = await outDoc.copyPages(baseDoc, baseDoc.getPageIndices());
        basePages.forEach((p) => outDoc.addPage(p));

        for (const f of filesToMerge) {
          const bytes = await f.arrayBuffer();
          const doc = await PDFDocument.load(bytes);
          const pages = await outDoc.copyPages(doc, doc.getPageIndices());
          pages.forEach((p) => outDoc.addPage(p));
        }

        const mergedBytes = await outDoc.save();
        const mergedFile = new File([mergedBytes as any], `merged_${file.name}`, {
          type: "application/pdf",
        });
        setFile(mergedFile);
        // Reset overlays/history for now (keeps behavior predictable until we support cross-doc overlay mapping).
        setSignatureOverlays([]);
        setDrawStrokes([]);
        setImageOverlays([]);
        setPendingImage(null);
        setFieldOverlays([]);
        setTextOverlays([]);
        setPendingText(null);
        setHistory([]);
        setHistoryIndex(-1);
        setPageRotations({});
        recordRateLimit("merge");
        toast.dismiss(loadingToast);
        toast.success("Merged!");
      } catch (err: any) {
        toast.dismiss(loadingToast);
        toast.error(`Merge failed: ${err?.message ?? "Unknown error"}`);
      }
    },
    [file, setFile]
  );

  const splitCurrentPageToDownload = useCallback(async (option: "current" | "all" = "current") => {
    if (!file) return;

    // Rate limiting check
    const rateLimitCheck = checkRateLimit("split");
    if (!rateLimitCheck.allowed) {
      toast.error(rateLimitCheck.message || "Rate limit exceeded. Please wait before splitting again.");
      return;
    }

    // Validate file size (max 25MB)
    const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error("File exceeds the 25MB size limit.");
      return;
    }

    const loadingToast = toast.loading(option === "all" ? "Preparing split PDFs..." : "Preparing split PDF...");
    try {
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes);
      
      // Validate page count (max 20 pages)
      const MAX_PAGES = 20;
      const pageCount = src.getPageCount();
      if (pageCount > MAX_PAGES) {
        toast.dismiss(loadingToast);
        toast.error(`PDF exceeds the maximum of ${MAX_PAGES} pages.`);
        return;
      }

      if (option === "current") {
        const out = await PDFDocument.create();
        const idx = Math.min(Math.max(1, currentPage), pageCount) - 1;
        const [copied] = await out.copyPages(src, [idx]);
        out.addPage(copied);
        const outBytes = await out.save();
        const blob = new Blob([outBytes as any], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `page_${currentPage}_${file.name}`;
        link.click();
        URL.revokeObjectURL(url);
        recordRateLimit("split");
        toast.dismiss(loadingToast);
        toast.success("Split downloaded!");
      } else {
        // Split all pages (max 2 pages)
        const MAX_SPLIT_PAGES = 2;
        if (pageCount > MAX_SPLIT_PAGES) {
          toast.dismiss(loadingToast);
          toast.error(`Cannot split more than ${MAX_SPLIT_PAGES} pages. This PDF has ${pageCount} pages.`);
          return;
        }

        const baseFileName = file.name.replace(/\.pdf$/i, "");
        for (let i = 0; i < pageCount; i++) {
          const out = await PDFDocument.create();
          const [copied] = await out.copyPages(src, [i]);
          out.addPage(copied);
          const outBytes = await out.save();
          const blob = new Blob([outBytes as any], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${baseFileName}_page_${i + 1}.pdf`;
          link.click();
          URL.revokeObjectURL(url);
          // Small delay between downloads to avoid browser blocking
          if (i < pageCount - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        recordRateLimit("split");
        toast.dismiss(loadingToast);
        toast.success(`Split ${pageCount} pages downloaded!`);
      }
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(`Split failed: ${err?.message ?? "Unknown error"}`);
    }
  }, [currentPage, file]);

  // Tool Handlers
  const handleSignRequest = useCallback(() => {
    if (!canAddSignature) {
      setShowUpgradeModal(true);
    } else {
      setShowSignaturePad(true);
    }
  }, [canAddSignature]);

  const handleSignatureSave = useCallback((signatureData: string) => {
    setPendingSignature(signatureData);
    setShowSignaturePad(false);
    toast.success("Signature created! Click on the PDF to place it.");
  }, []);

  return {
    // State
    file,
    user,
    isPro,
    loading,
    isSaving,
    activeTool,
    zoom,
    currentPage,
    totalPages,
    rotation,
    pageOrder,
    pageRotations,
    signatureOverlays,
    pendingSignature,
    drawStrokes,
    drawTool,
    setDrawTool,
    drawColor,
    setDrawColor,
    drawWidth,
    setDrawWidth,
    imageOverlays,
    pendingImage,
    fieldOverlays,
    fieldKind,
    placementArmed,
    textOverlays,
    pendingText,
    textFontSize,
    textColor,
    textFontFamily,
    textBold,
    textItalic,
    textAlign,
    historyIndex,
    historyLength: history.length,
    signatureCount,
    canAddSignature,
    showSignaturePad,
    showUpgradeModal,
    showMergeModal,
    showSplitModal,
    showRotateModal,
    showRearrangeModal,
    
    // Setters
    setActiveTool,
    setZoom,
    setCurrentPage,
    setTotalPages,
    setRotation,
    setPageOrder: setPageOrderSafe,
    setPageRotations,
    setSignatureOverlays,
    setPendingSignature,
    setDrawStrokes,
    setImageOverlays,
    setPendingImage,
    setFieldOverlays,
    setFieldKind,
    setPlacementArmed,
    setTextOverlays,
    setPendingText,
    setTextFontSize,
    setTextColor,
    setTextFontFamily,
    setTextBold,
    setTextItalic,
    setTextAlign,
    setShowSignaturePad,
    setShowUpgradeModal,
    setShowMergeModal,
    setShowSplitModal,
    setShowRotateModal,
    setShowRearrangeModal,
    
    // Actions
    handleSave,
    handleDownload,
    handleSignRequest,
    handleSignatureSave,
    rotatePage,
    movePageInOrder,
    mergeWithPDFs,
    splitCurrentPageToDownload,
    undo,
    redo,
    saveToHistory,
  };
}

