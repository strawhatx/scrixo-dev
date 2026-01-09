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
  const customColorInputRef = useRef<HTMLInputElement>(null);
  const [resolvedUserId, setResolvedUserId] = useState<string | undefined>(undefined);

  const [mode, setMode] = useState<SigMode>("type");
  const [isEmpty, setIsEmpty] = useState(true);
  const [fullName, setFullName] = useState("");
  const [sigColor, setSigColor] = useState("#111827");
  const [sigStrokeWidth, setSigStrokeWidth] = useState(5);
  const [saveForFuture, setSaveForFuture] = useState(true);
  const [uploadDataUrl, setUploadDataUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedSignature[]>([]);
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);
  const [selectedFontId, setSelectedFontId] = useState<string>("font-1");
  const [loadingSaved, setLoadingSaved] = useState(false);

  const presetColors = useMemo(
    () => ["#000000", "#1d4ed8", "#2563eb", "#ef4444"],
    []
  );
  const customRainbowBg =
    "conic-gradient(from 0deg, #ff004c, #ff8a00, #ffe600, #18d26b, #00c2ff, #7b61ff, #ff00c8, #ff004c)";
  const isPresetSelected = presetColors.some((c) => c.toLowerCase() === sigColor.toLowerCase());
  const isCustomSelected = !isPresetSelected;
  const customSwatchColor = isPresetSelected ? "#ff5a3c" : sigColor;

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
      setMode("type");
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
          className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-2xl shadow-lg w-full max-w-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-display text-xl font-black tracking-tight text-foreground">
                Create and place signature
              </h3>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {showUpgradePrompt && (
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 m-6">
                <p className="text-sm text-foreground">
                  <strong>You've used your free signature.</strong> Upgrade to Pro for unlimited signatures!
                </p>
              </div>
            )}

            <div className="grid grid-cols-[220px_1fr] min-h-[320px]">
              {/* Left nav */}
              <aside className="border-r border-border bg-muted/10">
                <div className="p-4 space-y-3">
                  <button
                    type="button"
                    className={cn(
                      "w-full rounded-xl border p-3 text-left transition-colors",
                      mode === "type"
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-transparent border-transparent hover:bg-muted/50 text-foreground"
                    )}
                    onClick={() => setMode("type")}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center",
                          mode === "type" ? "bg-primary-foreground/15" : "bg-muted"
                        )}
                      >
                        <Type className={cn("h-4 w-4", mode === "type" ? "text-primary-foreground" : "text-foreground")} />
                      </div>
                      <div>
                        <div className="text-base font-bold leading-tight">Type</div>
                        <div className={cn("text-xs mt-1", mode === "type" ? "text-primary-foreground/85" : "text-muted-foreground")}>
                          Enter your name and create a signature with ready-made font
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={cn(
                      "w-full rounded-xl p-1 text-left transition-colors hover:bg-muted/50",
                      mode === "draw" ? "bg-muted/50" : ""
                    )}
                    onClick={() => setMode("draw")}
                  >
                    <div className="flex items-start gap-3 p-2">
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                        <PenLine className="h-4 w-4 text-foreground" />
                      </div>
                      <div>
                        <div className="text-base font-bold leading-tight">Draw</div>
                        <div className="text-xs mt-1 text-muted-foreground">
                          Handwrite your signature using mouse or trackpad
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={cn(
                      "w-full rounded-xl p-1 text-left transition-colors hover:bg-muted/50",
                      mode === "upload" ? "bg-muted/50" : ""
                    )}
                    onClick={() => setMode("upload")}
                  >
                    <div className="flex items-start gap-3 p-2">
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                        <Upload className="h-4 w-4 text-foreground" />
                      </div>
                      <div>
                        <div className="text-base font-bold leading-tight">Upload</div>
                        <div className="text-xs mt-1 text-muted-foreground">
                          Use signature image from your device
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </aside>

              {/* Right content */}
              <section className="p-4">
                {/* Saved signatures row */}
                <div className="mb-6">
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-3">
                    Saved signatures {resolvedUserId ? "(account)" : "(device)"}
                  </div>
                  {loadingSaved ? (
                    <div className="text-sm text-muted-foreground">Loading…</div>
                  ) : saved.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No saved signatures yet.</div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {saved.map((s) => {
                        const isSel = s.id === selectedSavedId;
                        return (
                          <div key={s.id} className="relative">
                            <button
                              type="button"
                              onClick={() => setSelectedSavedId(isSel ? null : s.id)}
                              className={cn(
                                "h-14 w-28 rounded-xl border bg-background p-2 flex items-center justify-center overflow-hidden",
                                isSel ? "border-primary ring-2 ring-primary/20" : "border-border hover:bg-muted/40"
                              )}
                              title={s.label ?? "Saved signature"}
                            >
                              <img src={s.imageData} alt="Saved signature" className="max-h-full max-w-full object-contain" />
                            </button>
                            <button
                              type="button"
                              className="absolute -top-2 -right-2 h-7 w-7 rounded-full border border-border bg-background shadow-sm hover:bg-muted flex items-center justify-center"
                              onClick={() => handleDeleteSaved(s.id)}
                              aria-label="Delete saved signature"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Creation UI */}
                <div className="border border-border rounded-2xl bg-background p-4">
                  {mode === "type" && (
                    <div>
                      <div className="flex items-start gap-6">
                        <div className="flex-1">
                          <Input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter full name"
                            className="h-11 text-base border-2 border-primary/60 focus-visible:ring-0 focus-visible:border-primary"
                          />
                        </div>

                        {/* Color palette (4 preset + custom) */}
                        <div className="flex items-center gap-2">
                          {presetColors.map((c) => {
                            const isSelected = c.toLowerCase() === sigColor.toLowerCase();
                            return (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setSigColor(c)}
                                className={cn(
                                  "h-9 w-9 rounded-full border flex items-center justify-center",
                                  isSelected ? "border-primary ring-2 ring-primary/25" : "border-border hover:bg-muted/40"
                                )}
                                aria-label={`Color ${c}`}
                                title={c}
                              >
                                <span className="h-6 w-6 rounded-full" style={{ backgroundColor: c }} />
                              </button>
                            );
                          })}

                          <button
                            type="button"
                            onClick={() => customColorInputRef.current?.click()}
                            className={cn(
                              "h-9 w-9 rounded-full border flex items-center justify-center",
                              isCustomSelected ? "border-primary ring-2 ring-primary/25" : "border-border hover:bg-muted/40"
                            )}
                            aria-label="Custom color"
                            title="Custom color"
                          >
                            <span className="h-7 w-7 rounded-full p-[2px]" style={{ backgroundImage: customRainbowBg }} aria-hidden="true">
                              <span className="block h-full w-full rounded-full p-[2px]" style={{ background: "hsl(var(--background))" }}>
                                <span
                                  className="block h-full w-full rounded-full border border-border"
                                  style={
                                    isCustomSelected
                                      ? { backgroundColor: customSwatchColor }
                                      : { backgroundImage: customRainbowBg }
                                  }
                                />
                              </span>
                            </span>
                            <input
                              ref={customColorInputRef}
                              type="color"
                              value={customSwatchColor}
                              onChange={(e) => setSigColor(e.target.value)}
                              className="sr-only"
                              aria-hidden="true"
                              tabIndex={-1}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 max-h-48 overflow-auto pr-1">
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
                                "h-14 rounded-xl border bg-muted/20 px-3 flex items-center justify-center",
                                isSel ? "border-primary ring-2 ring-primary/15 bg-primary/5" : "border-transparent hover:bg-muted/30"
                              )}
                            >
                              <span
                                style={{
                                  fontFamily: f.family,
                                  color: sigColor,
                                  fontSize: 30,
                                  lineHeight: 1,
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
                    <div>
                      {/* Top toolbar (matches reference UI) */}
                      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 border border-border rounded-xl bg-muted/10">
                        <Button variant="outline" size="sm" onClick={handleClear}>
                          Clear
                        </Button>

                        <div className="flex-1 min-w-0 flex items-center justify-center">
                          <SignatureThicknessSlider value={sigStrokeWidth} onChange={setSigStrokeWidth} />
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {presetColors.map((c) => {
                            const isSelected = c.toLowerCase() === sigColor.toLowerCase();
                            return (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setSigColor(c)}
                                className={cn(
                                  "h-9 w-9 rounded-full border flex items-center justify-center",
                                  isSelected ? "border-primary ring-2 ring-primary/25" : "border-border hover:bg-muted/40"
                                )}
                                aria-label={`Color ${c}`}
                                title={c}
                              >
                                <span className="h-6 w-6 rounded-full" style={{ backgroundColor: c }} />
                              </button>
                            );
                          })}

                          <button
                            type="button"
                            onClick={() => customColorInputRef.current?.click()}
                            className={cn(
                              "h-9 w-9 rounded-full border flex items-center justify-center",
                              isCustomSelected ? "border-primary ring-2 ring-primary/25" : "border-border hover:bg-muted/40"
                            )}
                            aria-label="Custom color"
                            title="Custom color"
                          >
                            <span className="h-7 w-7 rounded-full p-[2px]" style={{ backgroundImage: customRainbowBg }} aria-hidden="true">
                              <span className="block h-full w-full rounded-full p-[2px]" style={{ background: "hsl(var(--background))" }}>
                                <span
                                  className="block h-full w-full rounded-full border border-border"
                                  style={
                                    isCustomSelected
                                      ? { backgroundColor: customSwatchColor }
                                      : { backgroundImage: customRainbowBg }
                                  }
                                />
                              </span>
                            </span>
                            <input
                              ref={customColorInputRef}
                              type="color"
                              value={customSwatchColor}
                              onChange={(e) => setSigColor(e.target.value)}
                              className="sr-only"
                              aria-hidden="true"
                              tabIndex={-1}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="signature-pad mt-3 relative overflow-hidden">
                        <SignatureCanvas
                          ref={sigCanvas}
                          canvasProps={{
                            width: 620,
                            height: 260,
                            className: "w-full rounded-lg",
                          }}
                          backgroundColor="white"
                          penColor={sigColor}
                          minWidth={Math.max(1, sigStrokeWidth)}
                          maxWidth={Math.max(1, sigStrokeWidth)}
                          onEnd={handleEnd}
                        />
                        {/* Baseline line */}
                        <div className="pointer-events-none absolute left-10 right-10 bottom-16 h-px bg-border/60" />
                      </div>
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

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Upload a PNG/JPG signature image.</div>
                        <Button variant="outline" onClick={() => uploadInputRef.current?.click()}>
                          Choose file
                        </Button>
                      </div>

                      <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/10 h-56 flex items-center justify-center overflow-hidden">
                        {uploadDataUrl ? (
                          <img src={uploadDataUrl} alt="Uploaded signature" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <div className="text-sm text-muted-foreground">No file selected</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-between">
                  <label className="flex items-center gap-3 text-sm text-foreground select-none">
                    <Checkbox checked={saveForFuture} onCheckedChange={(v) => setSaveForFuture(Boolean(v))} />
                    Save for future use
                  </label>
                  <Button
                    className="h-12 px-8 rounded-xl"
                    disabled={!canPlace}
                    onClick={handlePlace}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Place in PDF
                  </Button>
                </div>
              </section>
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
