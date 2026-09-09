"use client";

import React, { useRef, useState } from "react";
import { X, FileText, Loader2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMerge: (files: File[]) => Promise<void>;
  currentFileName: string;
}

export function MergeModal({ isOpen, onClose, onMerge, currentFileName }: MergeModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    // Validate max 3 files
    const remainingSlots = 3 - selectedFiles.length;
    if (files.length > remainingSlots) {
      toast.error(`You can only merge up to 3 files total. You can add ${remainingSlots} more.`);
      const validFiles = files.slice(0, remainingSlots);
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    } else {
      setSelectedFiles((prev) => [...prev, ...files]);
    }
    
    // Reset input
    e.currentTarget.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file to merge.");
      return;
    }

    setIsMerging(true);
    try {
      await onMerge(selectedFiles);
      setSelectedFiles([]);
      onClose();
    } catch (error) {
      // Error is handled in onMerge
    } finally {
      setIsMerging(false);
    }
  };

  const handleClose = () => {
    if (!isMerging) {
      setSelectedFiles([]);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center md:items-center md:p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="bg-card rounded-t-3xl md:rounded-2xl shadow-xl max-w-2xl w-full max-h-[92dvh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Merge PDFs</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Combine multiple PDF files into one document
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isMerging}
                  className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Current file */}
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {currentFileName}
                    </p>
                    <p className="text-xs text-muted-foreground">Current document</p>
                  </div>
                </div>
              </div>

              {/* Selected files */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    Files to merge ({selectedFiles.length}/3)
                  </h3>
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="bg-muted/50 rounded-lg p-4 border border-border flex items-center gap-3"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        disabled={isMerging}
                        className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add files button */}
              {selectedFiles.length < 3 && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={isMerging}
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isMerging}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Add PDF Files ({selectedFiles.length}/3)
                  </Button>
                </div>
              )}

              {/* Info */}
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Limits:</strong> Maximum 3 files per merge, 25MB per file, 20 pages total.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={isMerging}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                className="flex-1"
                onClick={handleMerge}
                disabled={selectedFiles.length === 0 || isMerging}
              >
                {isMerging ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Merging...
                  </>
                ) : (
                  "Merge PDFs"
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

