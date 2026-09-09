import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Check, Trash2, Type, PenLine, Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BRAND_NAVY } from "@/lib/colors";
import { useIsMobile } from "@/hooks/use-mobile";

export interface SignaturePadProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureData: string) => void;
  showUpgradePrompt?: boolean;
}

type SigMode = "type" | "draw" | "upload";

type SavedSignature = {
  id: string;
  label?: string | null;
  imageData: string;
  createdAt: string;
};

const GUEST_SIGNATURES_KEY = "scrixo_saved_signatures_guest_v1";

export function SignaturePad({ isOpen, onClose, onSave, showUpgradePrompt }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const [resolvedUserId, setResolvedUserId] = useState<string | undefined>(undefined);

  const [mode, setMode] = useState<SigMode>("draw");
  const [isEmpty, setIsEmpty] = useState(true);
  const [fullName, setFullName] = useState("");
  const [sigColor, setSigColor] = useState(BRAND_NAVY);
  const [sigStrokeWidth, setSigStrokeWidth] = useState(5);
  const [saveForFuture, setSaveForFuture] = useState(true);
  const [uploadDataUrl, setUploadDataUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedSignature[]>([]);
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);
  const [selectedFontId, setSelectedFontId] = useState<string>("font-1");
  const [loadingSaved, setLoadingSaved] = useState(false);

  const presetColors = useMemo(() => [BRAND_NAVY, "#ef4444", "#111827"], []);

  const fontOptions = useMemo(
    () => [
      { id: "sacramento", family: "var(--font-sig-sacramento), Sacramento, cursive" },
      { id: "zeyada", family: "var(--font-sig-zeyada), Zeyada, cursive" },
      { id: "nanum-pen-script", family: "var(--font-sig-nanum-pen-script), 'Nanum Pen Script', cursive" },
      { id: "mr-dafoe", family: "var(--font-sig-mr-dafoe), 'Mr Dafoe', cursive" },
      { id: "homemade-apple", family: "var(--font-sig-homemade-apple), 'Homemade Apple', cursive" },
      { id: "rock-salt", family: "var(--font-sig-rock-salt), 'Rock Salt', cursive" },
      { id: "mrs-saint-delafield", family: "var(--font-sig-mrs-saint-delafield), 'Mrs Saint Delafield', cursive" },
      { id: "cedarville-cursive", family: "var(--font-sig-cedarville-cursive), 'Cedarville Cursive', cursive" },
      { id: "kristi", family: "var(--font-sig-kristi), Kristi, cursive" },
      { id: "dawning-of-a-new-day", family: "var(--font-sig-dawning-of-a-new-day), 'Dawning of a New Day', cursive" },
      { id: "schoolbell", family: "var(--font-sig-schoolbell), Schoolbell, cursive" },
      { id: "ms-madi", family: "var(--font-sig-ms-madi), 'Ms Madi', cursive" },
    ],
    []
  );

  useEffect(() => {
    if (isOpen) {
      setIsEmpty(true);
      setMode("draw");
      setUploadDataUrl(null);
      setSelectedSavedId(null);
      setSigStrokeWidth(5);
      // Resolve logged-in user for signature persistence (DB vs localStorage).
      supabase.auth
        .getUser()
        .then(({ data }) => setResolvedUserId(data?.user?.id))
        .catch(() => setResolvedUserId(undefined));
    }
  }, [isOpen]);

  const loadSavedSignatures = useCallback(async () => {
    if (!isOpen) return;
    setLoadingSaved(true);
    try {
      if (resolvedUserId) {
        const { data, error } = await supabase
          .from("signatures")
          .select("id,label,image_data,created_at")
          .eq("user_id", resolvedUserId)
          .order("created_at", { ascending: false });
        if (error) {
          // If the table isn't present yet, fall back to guest storage.
          const msg = String((error as any)?.message ?? "");
          if (msg.toLowerCase().includes("does not exist")) {
            const raw = localStorage.getItem(GUEST_SIGNATURES_KEY);
            const parsed: SavedSignature[] = raw ? JSON.parse(raw) : [];
            setSaved(parsed);
          } else {
            console.warn("Failed to load signatures:", error);
            setSaved([]);
          }
        } else {
          const mapped: SavedSignature[] =
            (data ?? []).map((r: any) => ({
              id: String(r.id),
              label: r.label ?? null,
              imageData: String(r.image_data),
              createdAt: String(r.created_at),
            })) ?? [];
          setSaved(mapped);
        }
      } else {
        const raw = localStorage.getItem(GUEST_SIGNATURES_KEY);
        const parsed: SavedSignature[] = raw ? JSON.parse(raw) : [];
        setSaved(parsed);
      }
    } catch (err) {
      console.warn("Failed to load signatures:", err);
      setSaved([]);
    } finally {
      setLoadingSaved(false);
    }
  }, [isOpen, resolvedUserId]);

  useEffect(() => {
    if (!isOpen) return;
    loadSavedSignatures();
  }, [isOpen, loadSavedSignatures]);

  const handleClear = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
  };

  const handleEnd = () => {
    setIsEmpty(sigCanvas.current?.isEmpty() ?? true);
  };

  const selectedSaved = useMemo(
    () => (selectedSavedId ? saved.find((s) => s.id === selectedSavedId) ?? null : null),
    [saved, selectedSavedId]
  );

  const canPlace = useMemo(() => {
    if (selectedSaved) return true;
    if (mode === "upload") return Boolean(uploadDataUrl);
    if (mode === "draw") return Boolean(sigCanvas.current && !isEmpty);
    const name = fullName.trim();
    return name.length > 0;
  }, [fullName, isEmpty, mode, selectedSaved, uploadDataUrl]);

  const renderTypedSignature = useCallback(
    (text: string, fontCss: string, color: string) => {
      const t = text.trim() || "Signature";
      const canvas = document.createElement("canvas");
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const paddingX = 30;
      const paddingY = 18;
      const fontSize = 84;
      const font = `${fontSize}px ${fontCss}`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      ctx.font = font;
      const metrics = ctx.measureText(t);
      const textWidth = Math.ceil(metrics.width);
      const w = Math.max(320, textWidth + paddingX * 2);
      const h = 180;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      const ctx2 = canvas.getContext("2d");
      if (!ctx2) return null;
      ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx2.clearRect(0, 0, w, h);
      ctx2.font = font;
      ctx2.fillStyle = color;
      ctx2.textBaseline = "middle";
      ctx2.textAlign = "left";
      ctx2.fillText(t, paddingX, h / 2 + 8);
      return canvas.toDataURL("image/png");
    },
    []
  );

  const persistIfRequested = useCallback(
    async (dataUrl: string) => {
      if (!saveForFuture) return;
      const label = fullName.trim() || "Signature";
      const createdAt = new Date().toISOString();
      if (resolvedUserId) {
        const { data, error } = await supabase
          .from("signatures")
          .insert([{ user_id: resolvedUserId, label, image_data: dataUrl }])
          .select("id,label,image_data,created_at")
          .single();
        if (error) {
          console.warn("Failed to save signature to DB:", error);
          // Fall back to guest storage
          const id = `guest-${Date.now()}`;
          const next: SavedSignature[] = [{ id, label, imageData: dataUrl, createdAt }, ...saved];
          setSaved(next);
          localStorage.setItem(GUEST_SIGNATURES_KEY, JSON.stringify(next));
          return;
        }
        const row: SavedSignature = {
          id: String((data as any).id),
          label: (data as any).label ?? null,
          imageData: String((data as any).image_data),
          createdAt: String((data as any).created_at),
        };
        setSaved((prev) => [row, ...prev]);
      } else {
        const id = `guest-${Date.now()}`;
        const next: SavedSignature[] = [{ id, label, imageData: dataUrl, createdAt }, ...saved];
        setSaved(next);
        localStorage.setItem(GUEST_SIGNATURES_KEY, JSON.stringify(next));
      }
    },
    [fullName, resolvedUserId, saveForFuture, saved]
  );

  const handleDeleteSaved = useCallback(
    async (id: string) => {
      try {
        if (resolvedUserId) {
          const { error } = await supabase.from("signatures").delete().eq("id", id).eq("user_id", resolvedUserId);
          if (error) console.warn("Failed to delete signature:", error);
        }
      } finally {
        setSaved((prev) => {
          const next = prev.filter((s) => s.id !== id);
          try {
            if (!resolvedUserId) localStorage.setItem(GUEST_SIGNATURES_KEY, JSON.stringify(next));
          } catch {
            // ignore
          }
          return next;
        });
        if (selectedSavedId === id) setSelectedSavedId(null);
      }
    },
    [resolvedUserId, selectedSavedId]
  );

  const handlePlace = useCallback(async () => {
    let dataUrl: string | null = null;

    if (selectedSaved) {
      dataUrl = selectedSaved.imageData;
    } else if (mode === "upload") {
      dataUrl = uploadDataUrl;
    } else if (mode === "draw") {
      if (sigCanvas.current && !isEmpty) {
        dataUrl = sigCanvas.current.toDataURL("image/png");
      }
    } else {
      const font = fontOptions.find((f) => f.id === selectedFontId)?.family ?? fontOptions[0].family;
      dataUrl = renderTypedSignature(fullName || "Signature", font, sigColor);
    }

    if (!dataUrl) return;
    await persistIfRequested(dataUrl);
    onSave(dataUrl);
    onClose();
  }, [
    fontOptions,
    fullName,
    isEmpty,
    mode,
    onClose,
    onSave,
    persistIfRequested,
    renderTypedSignature,
    selectedFontId,
    selectedSaved,
    sigColor,
    uploadDataUrl,
  ]); 

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "fixed inset-0 z-[80] flex bg-black/40",
            isMobile ? "items-end justify-center" : "items-center justify-center p-4"
          )}
          onClick={onClose}
        >
          <motion.div
            initial={isMobile ? { y: "100%" } : { opacity: 0, y: 16, scale: 0.98 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={isMobile ? { y: "100%" } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={isMobile ? { type: "spring", damping: 28, stiffness: 320 } : { duration: 0.18 }}
            className={cn(
              "bg-white shadow-2xl w-full overflow-hidden flex flex-col",
              isMobile
                ? "rounded-t-3xl max-h-[92dvh] pb-[env(safe-area-inset-bottom)]"
                : "rounded-2xl max-w-[640px] max-h-[90vh]"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {isMobile && (
              <div className="flex justify-center pt-2 pb-1">
                <span className="h-1 w-10 rounded-full bg-neutral-300" />
              </div>
            )}
            <div className={cn("flex items-center justify-between pb-2", isMobile ? "px-4 pt-1" : "px-6 pt-5")}>
              <h3 className="text-[22px] font-semibold tracking-tight text-neutral-900">
                Signature
              </h3>
              <button
                type="button"
                className="text-neutral-400 hover:text-neutral-700 transition-colors"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {showUpgradePrompt && (
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mx-6 mb-2">
                <p className="text-sm text-foreground">
                  <strong>You've used your free signature.</strong> Upgrade to Pro for unlimited signatures!
                </p>
              </div>
            )}

            <div className={cn("flex items-center gap-6 border-b border-neutral-200", isMobile ? "px-4" : "px-6")}>
              {(["draw", "type", "upload"] as const).map((id) => {
                const label = id === "draw" ? "Draw" : id === "type" ? "Type" : "Upload";
                const active = mode === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMode(id)}
                    className={cn(
                      "relative pb-3 text-[15px] font-medium transition-colors",
                      active ? "text-primary" : "text-neutral-400 hover:text-neutral-600"
                    )}
                  >
                    {label}
                    {active && <span className="absolute left-0 right-0 -bottom-px h-[3px] rounded-full bg-primary" />}
                  </button>
                );
              })}
            </div>

            <div className={cn("flex-1 overflow-y-auto py-5", isMobile ? "px-4" : "px-6")}>
              {saved.length > 0 && (
                <div className="mb-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400 mb-2">
                    Saved
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {saved.map((s) => {
                      const isSel = s.id === selectedSavedId;
                      return (
                        <div key={s.id} className="relative">
                          <button
                            type="button"
                            onClick={() => setSelectedSavedId(isSel ? null : s.id)}
                            className={cn(
                              "h-12 w-24 rounded-lg border bg-white p-1.5 flex items-center justify-center overflow-hidden",
                              isSel ? "border-primary ring-2 ring-primary/20" : "border-neutral-200 hover:bg-neutral-50"
                            )}
                            title={s.label ?? "Saved signature"}
                          >
                            <img src={s.imageData} alt="Saved signature" className="max-h-full max-w-full object-contain" />
                          </button>
                          <button
                            type="button"
                            className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full border border-neutral-200 bg-white shadow-sm hover:bg-neutral-50 flex items-center justify-center"
                            onClick={() => handleDeleteSaved(s.id)}
                            aria-label="Delete saved signature"
                          >
                            <Trash2 className="h-3 w-3 text-neutral-400" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {mode === "type" && (
                <div>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    className="h-12 w-full min-w-0 text-base border-2 border-primary/40 focus-visible:ring-0 focus-visible:border-primary"
                  />
                  <div className="mt-3 flex items-center gap-2">
                    {presetColors.map((c) => {
                      const isSelected = c.toLowerCase() === sigColor.toLowerCase();
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSigColor(c)}
                          className={cn(
                            "h-8 w-8 rounded-full border border-white shadow-sm flex items-center justify-center",
                            isSelected ? "ring-2 ring-offset-1 ring-primary" : "border-neutral-200"
                          )}
                          style={{ backgroundColor: c }}
                          aria-label={`Ink ${c}`}
                        >
                          {isSelected ? <Check className="h-3 w-3 text-white" /> : null}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[40vh] overflow-auto pr-1">
                    {fontOptions.map((f) => {
                      const text = (fullName || "Signature").trim() || "Signature";
                      const isSel = f.id === selectedFontId;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            setSelectedSavedId(null);
                            setSelectedFontId(f.id);
                          }}
                          className={cn(
                            "min-h-16 rounded-xl border bg-neutral-50 px-3 py-3 flex items-center justify-center overflow-hidden",
                            isSel ? "border-primary ring-2 ring-primary/15 bg-primary/5" : "border-transparent hover:bg-neutral-100"
                          )}
                        >
                          <span
                            className="w-full text-center leading-tight break-words"
                            style={{
                              fontFamily: f.family,
                              color: sigColor,
                              fontSize: isMobile ? 22 : 28,
                            }}
                          >
                            {text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {mode === "draw" && (
                <div className="relative rounded-xl bg-neutral-100 overflow-hidden">
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                    {presetColors.map((c) => {
                      const isSelected = c.toLowerCase() === sigColor.toLowerCase();
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSigColor(c)}
                          className={cn(
                            "h-6 w-6 rounded-full border border-white shadow-sm flex items-center justify-center",
                            isSelected ? "ring-2 ring-offset-1 ring-primary" : ""
                          )}
                          style={{ backgroundColor: c }}
                          aria-label={`Ink ${c}`}
                        >
                          {isSelected ? <Check className="h-3 w-3 text-white" /> : null}
                        </button>
                      );
                    })}
                  </div>
                  <SignatureCanvas
                    ref={sigCanvas}
                    canvasProps={{
                      width: 580,
                      height: 220,
                      className: cn("w-full bg-neutral-100", isMobile ? "h-[180px]" : "h-[220px]"),
                    }}
                    backgroundColor="rgba(0,0,0,0)"
                    penColor={sigColor}
                    minWidth={Math.max(1, sigStrokeWidth)}
                    maxWidth={Math.max(1, sigStrokeWidth)}
                          onEnd={() => {
                            setSelectedSavedId(null);
                            handleEnd();
                          }}
                  />
                </div>
              )}

              {mode === "upload" && (
                <div>
                  <input
                    ref={uploadInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        const result = String(reader.result ?? "");
                        if (result.startsWith("data:")) {
                          setSelectedSavedId(null);
                          setUploadDataUrl(result);
                        }
                      };
                      reader.readAsDataURL(f);
                      e.currentTarget.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => uploadInputRef.current?.click()}
                    className={cn(
                      "w-full rounded-xl bg-neutral-100 flex flex-col items-center justify-center gap-2 text-neutral-500 hover:bg-neutral-200/70",
                      isMobile ? "h-[180px]" : "h-[220px]"
                    )}
                  >
                    {uploadDataUrl ? (
                      <img src={uploadDataUrl} alt="Uploaded signature" className="max-h-full max-w-full object-contain p-4" />
                    ) : (
                      <>
                        <Upload className="h-6 w-6" />
                        <span className="text-sm">Click to upload a PNG or JPG</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div
              className={cn(
                "flex gap-3 border-t border-neutral-100",
                isMobile ? "flex-col px-4 py-3" : "items-center justify-between px-6 py-4"
              )}
            >
              <label className="flex items-center gap-2 text-sm text-neutral-600 select-none">
                <Checkbox checked={saveForFuture} onCheckedChange={(v) => setSaveForFuture(Boolean(v))} />
                Save
              </label>
              <div className={cn("flex items-center gap-3", isMobile && "w-full")}>
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    "h-11 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5",
                    isMobile ? "flex-1" : "px-5"
                  )}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!canPlace}
                  onClick={handlePlace}
                  className={cn(
                    "h-11 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-40",
                    isMobile ? "flex-1" : "px-5"
                  )}
                >
                  Accept and sign
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SignatureThicknessSlider({
  value,
  onChange,
  min = 2,
  max = 12,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const clamped = Math.max(min, Math.min(max, value));
  const pct = ((clamped - min) / (max - min)) * 100;

  return (
    <div className="flex items-center gap-3 w-full min-w-0 max-w-[260px]" style={{ ["--pct" as any]: `${pct}%` }}>

      <div className="relative flex-1 min-w-0 h-6">
        {/* Ghost tapered bar */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 right-0 opacity-25"
          style={{
            background: "hsl(var(--muted-foreground))",
            clipPath: "polygon(0% 40%, 100% 0%, 100% 100%, 0% 60%)",
            borderRadius: "999px",
          }}
        />
        {/* Active fill */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0"
          style={{
            width: "var(--pct)",
            background: "hsl(var(--primary))",
            clipPath: "polygon(0% 40%, 100% 0%, 100% 100%, 0% 60%)",
            borderRadius: "999px",
            opacity: 0.9,
          }}
        />

        <SliderPrimitive.Root
          orientation="horizontal"
          value={[clamped]}
          min={min}
          max={max}
          step={1}
          onValueChange={(v) => onChange(v[0] ?? clamped)}
          className="absolute inset-0 flex w-full touch-none select-none items-center"
          aria-label="Signature thickness"
        >
          <SliderPrimitive.Track className="relative h-full w-full rounded-full bg-transparent">
            <SliderPrimitive.Range className="absolute h-full bg-transparent" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            className={cn(
              "block h-6 w-6 rounded-full bg-primary shadow-md",
              "border-[6px] border-background",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          />
        </SliderPrimitive.Root>
      </div>
    </div>
  );
}
