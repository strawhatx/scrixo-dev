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
} from "@/lib/pdf-utils";
import { ToolType } from "@/components/EditorToolbar";
import type { FieldKind } from "@/types/fields";

const SIGNED_MARKER = "scrixo:signed";

function getSignatureUsedKey(docId: string | undefined, file: File | null) {
  const id = docId && docId !== "new" ? docId : "new";
  if (!file) return `scrixo_signature_used:${id}:nofile`;
  return `scrixo_signature_used:${id}:${file.name}:${file.size}:${file.lastModified}`;
}

export function useEditor() {
  const router = useRouter();
  const params = useParams();
  const { file, setFile } = useFileStore();

  // Core State
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Tool & View State
  const [activeTool, setActiveTool] = useState<ToolType>("sign");
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
  
  // History State
  const [history, setHistory] = useState<
    Array<{
      sig: SignatureOverlay[];
      draw: DrawStrokeOverlay[];
      img: ImageOverlay[];
      field: FieldOverlay[];
      pageOrder: number[];
      pageRotations: Record<number, number>;
    }>
  >([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Modal State
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Freemium tracking
  const [signatureUsed, setSignatureUsed] = useState(false);

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
        } else if (!file) {
          toast.error("No PDF loaded. Please upload a file first.");
          router.push("/");
        }
      } catch (err: any) {
        console.error("Editor init error:", err);
        toast.error("Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [params, supabase, router, setFile]);

  // Track signature usage per-document (instead of globally).
  useEffect(() => {
    const docId = (params?.id as string) || "new";
    const key = getSignatureUsedKey(docId, file ?? null);
    try {
      setSignatureUsed(localStorage.getItem(key) === "true");
    } catch {
      setSignatureUsed(false);
    }
  }, [file, params?.id]);

  // Detect whether the loaded PDF was previously signed in scrixo (metadata marker).
  useEffect(() => {
    let cancelled = false;
    const detect = async () => {
      if (!file) return;
      try {
        const bytes = await file.arrayBuffer();
        const doc: any = await PDFDocument.load(bytes);

        const keywords: unknown =
          typeof doc.getKeywords === "function" ? doc.getKeywords() : undefined;
        const subject: unknown =
          typeof doc.getSubject === "function" ? doc.getSubject() : undefined;

        const keywordMatch =
          Array.isArray(keywords) && keywords.some((k) => String(k).includes(SIGNED_MARKER));
        const subjectMatch = typeof subject === "string" && subject.includes(SIGNED_MARKER);

        if (!cancelled && (keywordMatch || subjectMatch)) {
          setSignatureUsed(true);
          try {
            const docId = (params?.id as string) || "new";
            localStorage.setItem(getSignatureUsedKey(docId, file), "true");
          } catch {
            // ignore
          }
        }
      } catch {
        // Ignore detection errors — doesn't block editor.
      }
    };

    detect();
    return () => {
      cancelled = true;
    };
  }, [file]);

  // Keep pageOrder in sync with the loaded PDF page count.
  // If pageOrder is empty (fresh load) or mismatched, reset to natural order.
  useEffect(() => {
    if (!totalPages || totalPages < 1) return;
    setPageOrder((prev) => {
      if (prev.length === totalPages) return prev;
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    });
    // Ensure currentPage is always valid.
    setCurrentPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  // Mark the free signature as "used" when a signature is actually placed.
  useEffect(() => {
    if (signatureUsed) return;
    if (isPro) return;
    if (signatureOverlays.length === 0) return;
    setSignatureUsed(true);
    try {
      const docId = (params?.id as string) || "new";
      localStorage.setItem(getSignatureUsedKey(docId, file ?? null), "true");
    } catch {
      // ignore
    }
  }, [file, isPro, params?.id, signatureOverlays.length, signatureUsed]);

  // History Actions
  const saveToHistory = useCallback(() => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({
        sig: [...signatureOverlays],
        draw: [...drawStrokes],
        img: [...imageOverlays],
        field: [...fieldOverlays],
        pageOrder: [...pageOrder],
        pageRotations: { ...pageRotations },
      });
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [drawStrokes, fieldOverlays, historyIndex, imageOverlays, pageOrder, pageRotations, signatureOverlays]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setSignatureOverlays(prev.sig);
      setDrawStrokes(prev.draw);
      setImageOverlays(prev.img);
      setFieldOverlays(prev.field);
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
    if (!file) return;
    try {
      const pdfBytes = await processPDF(file, signatureOverlays, {
        pageOrder,
        pageRotations,
        drawStrokes,
        imageOverlays,
        fieldOverlays,
        watermark: isPro ? undefined : { text: "Edited with scrixo" },
      });
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `edited_${file.name}`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download PDF.");
    }
  }, [drawStrokes, fieldOverlays, file, imageOverlays, isPro, pageOrder, pageRotations, signatureOverlays]);

  // Page Operations
  const rotatePage = useCallback((pageNum: number, delta: number = 90) => {
    setPageRotations((prev) => {
      const curr = prev[pageNum] ?? 0;
      const next = ((curr + delta) % 360 + 360) % 360;
      return { ...prev, [pageNum]: next };
    });
  }, []);

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
      const loadingToast = toast.loading("Merging PDFs...");
      try {
        const baseBytes = await file.arrayBuffer();
        const outDoc = await PDFDocument.create();
        const baseDoc = await PDFDocument.load(baseBytes);
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
        setHistory([]);
        setHistoryIndex(-1);
        setPageRotations({});
        toast.dismiss(loadingToast);
        toast.success("Merged!");
      } catch (err: any) {
        toast.dismiss(loadingToast);
        toast.error(`Merge failed: ${err?.message ?? "Unknown error"}`);
      }
    },
    [file, setFile]
  );

  const splitCurrentPageToDownload = useCallback(async () => {
    if (!file) return;
    const loadingToast = toast.loading("Preparing split PDF...");
    try {
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes);
      const out = await PDFDocument.create();
      const idx = Math.min(Math.max(1, currentPage), src.getPageCount()) - 1;
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
      toast.dismiss(loadingToast);
      toast.success("Split downloaded!");
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(`Split failed: ${err?.message ?? "Unknown error"}`);
    }
  }, [currentPage, file]);

  // Tool Handlers
  const handleSignRequest = useCallback(() => {
    if (signatureUsed && !isPro) {
      setShowUpgradeModal(true);
    } else {
      setShowSignaturePad(true);
    }
  }, [isPro, signatureUsed]);

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
    historyIndex,
    historyLength: history.length,
    signatureUsed,
    showSignaturePad,
    showUpgradeModal,
    
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
    setShowSignaturePad,
    setShowUpgradeModal,
    
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

