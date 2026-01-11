"use client";

import React, { useState } from "react";
import { X, Download, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface SplitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSplit: (option: "current" | "all") => Promise<void>;
  currentPage: number;
  totalPages: number;
}

export function SplitModal({ isOpen, onClose, onSplit, currentPage, totalPages }: SplitModalProps) {
  const [splitOption, setSplitOption] = useState<"current" | "all">("current");
  const [isSplitting, setIsSplitting] = useState(false);

  const handleSplit = async () => {
    // Validate split all option
    if (splitOption === "all" && totalPages > 3) {
      return; // Should not happen, but safety check
    }
    
    setIsSplitting(true);
    try {
      await onSplit(splitOption);
      onClose();
    } catch (error) {
      // Error is handled in onSplit
    } finally {
      setIsSplitting(false);
    }
  };

  const handleClose = () => {
    if (!isSplitting) {
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Split PDF</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Extract pages from your document
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isSplitting}
                  className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-sm text-foreground">
                  Document: <span className="font-semibold">{totalPages}</span> page{totalPages !== 1 ? "s" : ""}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Current page: <span className="font-medium">{currentPage}</span>
                </p>
              </div>

              <RadioGroup value={splitOption} onValueChange={(value) => setSplitOption(value as "current" | "all")}>
                <div className="flex items-start space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="current" id="current" className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor="current" className="cursor-pointer">
                      <div className="font-medium text-foreground">Current Page Only</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Download page {currentPage} as a separate PDF
                      </div>
                    </Label>
                  </div>
                </div>

                {totalPages <= 3 && (
                  <div className="flex items-start space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="all" id="all" className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor="all" className="cursor-pointer">
                        <div className="font-medium text-foreground">Split All Pages</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Download each page as a separate PDF ({totalPages} files)
                        </div>
                      </Label>
                    </div>
                  </div>
                )}
              </RadioGroup>

              {totalPages > 3 && (
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Note:</strong> Split all pages is only available for PDFs with 3 pages or fewer. This PDF has {totalPages} pages. Use "Current Page Only" to split individual pages.
                  </p>
                </div>
              )}

              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> Split files will be downloaded immediately.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={isSplitting}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                className="flex-1"
                onClick={handleSplit}
                disabled={isSplitting}
              >
                {isSplitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Splitting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Split & Download
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

