"use client";

import React, { useCallback, useState, useRef } from "react";
import { Upload, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Constants
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPE = "application/pdf";

interface PDFUploadProps {
  onFileSelect: (file: File) => void;
  className?: string;
  minimal?: boolean;
  onDraggingChange?: (isDragging: boolean) => void;
  /**
   * Optional id applied to the underlying <input type="file"> so external
   * buttons (ex: a hero CTA) can trigger the picker via document.getElementById(...).click().
   */
  inputId?: string;
}

/**
 * Custom hook to encapsulate file drop and selection logic.
 * Separates side-effects and event management from the UI.
 */
function useFileHandlers({ 
  onFileSelect, 
  onDraggingChange 
}: Pick<PDFUploadProps, 'onFileSelect' | 'onDraggingChange'>) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = useCallback((file: File | null) => {
    if (!file) return;

    if (file.type !== ACCEPTED_TYPE) {
      // In a real app, we'd use a toast here, but we'll assume the parent handles it 
      // or the input 'accept' attribute restricts it.
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return;
    }

    onFileSelect(file);
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
      onDraggingChange?.(true);
    }
  }, [isDragging, onDraggingChange]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    onDraggingChange?.(false);
  }, [onDraggingChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    onDraggingChange?.(false);
    
    const file = e.dataTransfer.files[0];
    validateAndSelect(file);
  }, [onDraggingChange, validateAndSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    validateAndSelect(file);
  }, [validateAndSelect]);

  const triggerPicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    isDragging,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    triggerPicker
  };
}

/**
 * Staff-Level PDF Upload Component
 * Features:
 * - Clean separation of logic via custom hooks
 * - Multi-mode UI (minimal for landing, standard for dashboard)
 * - Optimized animations with framer-motion
 * - Robust event handling and validation
 */
export function PDFUpload(props: PDFUploadProps) {
  const { minimal = false, className } = props;
  const handlers = useFileHandlers(props);

  if (minimal) {
    return <MinimalUploadView {...props} {...handlers} />;
  }

  return <StandardUploadView {...props} {...handlers} />;
}

// --- Internal View Components ---

function MinimalUploadView({ 
  className, 
  isDragging, 
  handleDragOver, 
  handleDragLeave, 
  handleDrop, 
  handleFileChange,
  fileInputRef,
  inputId,
  triggerPicker
}: PDFUploadProps & ReturnType<typeof useFileHandlers>) {
  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerPicker}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          triggerPicker();
        }
      }}
      className={cn(
        "w-full h-full relative overflow-hidden rounded-2xl border transition-all duration-300",
        "bg-background cursor-pointer select-none shadow-sm",
        isDragging ? "border-[#ff5a3c]/60 ring-4 ring-[#ff5a3c]/10" : "border-border/60",
        className
      )}
    >
        <input
          id={inputId}
          type="file"
          ref={fileInputRef}
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <div className="p-10 sm:p-12 flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center text-center gap-4">
            <div
              className={cn(
                "h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-300",
                isDragging ? "bg-[#ff5a3c] text-white shadow-md" : "bg-[#ff5a3c]/10 text-[#ff5a3c]"
              )}
            >
              <FileText className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <div className="text-base font-semibold text-foreground">
                Drop your file here
              </div>
              <div className="text-[11px] font-black tracking-widest uppercase text-muted-foreground/60">
                or
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerPicker();
              }}
              className={cn(
                "h-12 px-7 rounded-xl font-black tracking-tight transition-all duration-200",
                "bg-[#ff5a3c] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5",
                "hover:bg-[#ff4a2a]"
              )}
            >
              Upload The PDF To Edit
            </button>

            <div className="text-[11px] font-semibold text-muted-foreground/60">
              PDF only · Max {MAX_FILE_SIZE_MB}MB
            </div>
          </div>
        </div>
      </div>
  );
}

function StandardUploadView({ 
  className, 
  isDragging, 
  handleDragOver, 
  handleDragLeave, 
  handleDrop, 
  handleFileChange,
  fileInputRef,
  triggerPicker,
  inputId
}: PDFUploadProps & ReturnType<typeof useFileHandlers>) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("w-full max-w-2xl mx-auto", className)}
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerPicker}
        className={cn(
          "dropzone flex flex-col items-center justify-center p-16 cursor-pointer group transition-all duration-300",
          "border-2 border-dashed border-border hover:border-primary/50",
          isDragging && "border-primary bg-primary/5 shadow-glow"
        )}
      >
        <input
          id={inputId}
          type="file"
          ref={fileInputRef}
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <AnimatePresence mode="wait">
          {isDragging ? (
            <motion.div
              key="dragging"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-glow">
                <FileText className="w-10 h-10 text-primary-foreground" />
              </div>
              <p className="text-lg font-semibold text-primary">Drop your PDF here!</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <p className="text-lg font-semibold text-foreground mb-2">
                Drag & drop your PDF here
              </p>
              <p className="text-muted-foreground">
                or <span className="text-primary font-medium">click to browse</span>
              </p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mt-6 font-bold">
                Max file size: {MAX_FILE_SIZE_MB}MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
