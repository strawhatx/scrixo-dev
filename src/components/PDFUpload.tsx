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
  fileInputRef
}: PDFUploadProps & ReturnType<typeof useFileHandlers>) {
  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn("w-full h-full relative overflow-hidden", className)}
    >
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
      />
      
      <div className={cn(
        "absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none z-10",
        isDragging ? "bg-[#4bb3a3]/10 scale-100" : "scale-95 opacity-0"
      )}>
        <div className="flex flex-col items-center gap-2">
          <div className="p-4 bg-[#4bb3a3] rounded-full shadow-glow animate-bounce">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <span className="text-[#4bb3a3] font-bold text-lg uppercase tracking-widest">
            Drop PDF Now
          </span>
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
  triggerPicker
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
