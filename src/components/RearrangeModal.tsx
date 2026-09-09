"use client";

import React, { useState, useEffect } from "react";
import { X, ArrowUp, ArrowDown, Loader2, GripVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RearrangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRearrange: (newOrder: number[]) => Promise<void>;
  currentOrder: number[];
  totalPages: number;
}

export function RearrangeModal({ isOpen, onClose, onRearrange, currentOrder, totalPages }: RearrangeModalProps) {
  const [pageOrder, setPageOrder] = useState<number[]>(currentOrder);
  const [isRearranging, setIsRearranging] = useState(false);

  // Update local order when currentOrder changes
  useEffect(() => {
    if (isOpen) {
      setPageOrder([...currentOrder]);
    }
  }, [currentOrder, isOpen]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...pageOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setPageOrder(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === pageOrder.length - 1) return;
    const newOrder = [...pageOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setPageOrder(newOrder);
  };

  const handleRearrange = async () => {
    // Check if order actually changed
    if (JSON.stringify(pageOrder) === JSON.stringify(currentOrder)) {
      onClose();
      return;
    }

    setIsRearranging(true);
    try {
      await onRearrange(pageOrder);
      onClose();
    } catch (error) {
      // Error is handled in onRearrange
    } finally {
      setIsRearranging(false);
    }
  };

  const handleClose = () => {
    if (!isRearranging) {
      setPageOrder([...currentOrder]); // Reset to original order
      onClose();
    }
  };

  const handleReset = () => {
    const naturalOrder = Array.from({ length: totalPages }, (_, i) => i + 1);
    setPageOrder(naturalOrder);
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
            className="bg-card rounded-t-3xl md:rounded-2xl shadow-xl max-w-md w-full max-h-[92dvh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Rearrange Pages</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Change the order of pages in your document
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isRearranging}
                  className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-sm text-foreground">
                  Total pages: <span className="font-semibold">{totalPages}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use the arrows to reorder pages. The new order will be applied when you save.
                </p>
              </div>

              <div className="space-y-2">
                {pageOrder.map((pageNum, index) => (
                  <div
                    key={`${pageNum}-${index}`}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <GripVertical className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        Page {pageNum}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Position {index + 1}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0 || isRearranging}
                        className="p-1 rounded border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        title="Move up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === pageOrder.length - 1 || isRearranging}
                        className="p-1 rounded border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        title="Move down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleReset}
                disabled={isRearranging}
              >
                Reset to Original Order
              </Button>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={isRearranging}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                className="flex-1"
                onClick={handleRearrange}
                disabled={isRearranging}
              >
                {isRearranging ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  "Apply Changes"
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

