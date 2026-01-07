"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { supabase} from "@/lib/supabase";
import { useFileStore } from "@/store/useFileStore";
import { PDFDocument } from "pdf-lib";
import { processPDF, TextOverlay, SignatureOverlay } from "@/lib/pdf-utils";
import { ToolType } from "@/components/EditorToolbar";

const STORAGE_KEY = "scrixo_signature_used";
const SIGNED_MARKER = "scrixo:signed";

export function useEditor() {
  const router = useRouter();
  const params = useParams();
  const { file, setFile } = useFileStore();

  // Core State
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Tool & View State
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [textToolMode, setTextToolMode] = useState<"edit" | "add">("edit");
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rotation, setRotation] = useState(0);
  
  // Overlays
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [signatureOverlays, setSignatureOverlays] = useState<SignatureOverlay[]>([]);
  const [pendingSignature, setPendingSignature] = useState<string | null>(null);
  
  // History State
  const [history, setHistory] = useState<{ text: TextOverlay[]; sig: SignatureOverlay[] }[]>([]);
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
        
        // Track signature usage
        setSignatureUsed(localStorage.getItem(STORAGE_KEY) === "true");

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
          localStorage.setItem(STORAGE_KEY, "true");
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

  // Mark the free signature as "used" when a signature is actually placed.
  useEffect(() => {
    if (signatureUsed) return;
    if (signatureOverlays.length === 0) return;
    setSignatureUsed(true);
    localStorage.setItem(STORAGE_KEY, "true");
  }, [signatureOverlays.length, signatureUsed]);

  // History Actions
  const saveToHistory = useCallback(() => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ text: [...textOverlays], sig: [...signatureOverlays] });
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [textOverlays, signatureOverlays, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setTextOverlays(prev.text);
      setSignatureOverlays(prev.sig);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setTextOverlays(next.text);
      setSignatureOverlays(next.sig);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  // Document Actions
  const handleSave = useCallback(async () => {
    if (!file || !user) return;
    setIsSaving(true);
    const loadingToast = toast.loading("Saving changes to cloud...");

    try {
      const pdfBytes = await processPDF(file, textOverlays, signatureOverlays);
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
  }, [file, user, textOverlays, signatureOverlays, params, supabase, router]);

  const handleDownload = useCallback(async () => {
    if (!file) return;
    try {
      const pdfBytes = await processPDF(file, textOverlays, signatureOverlays);
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
  }, [file, textOverlays, signatureOverlays]);

  // Tool Handlers
  const handleSignRequest = useCallback(() => {
    if (signatureUsed) {
      setShowUpgradeModal(true);
    } else {
      setShowSignaturePad(true);
    }
  }, [signatureUsed]);

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
    textToolMode,
    zoom,
    currentPage,
    totalPages,
    rotation,
    textOverlays,
    signatureOverlays,
    pendingSignature,
    historyIndex,
    historyLength: history.length,
    signatureUsed,
    showSignaturePad,
    showUpgradeModal,
    
    // Setters
    setActiveTool,
    setTextToolMode,
    setZoom,
    setCurrentPage,
    setTotalPages,
    setRotation,
    setTextOverlays,
    setSignatureOverlays,
    setPendingSignature,
    setShowSignaturePad,
    setShowUpgradeModal,
    
    // Actions
    handleSave,
    handleDownload,
    handleSignRequest,
    handleSignatureSave,
    undo,
    redo,
    saveToHistory,
  };
}

