"use client";

import React, { useState } from "react";
import { X, RotateCw, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface RotateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRotate: (angle: number) => Promise<void>;
  currentPage: number;
  currentRotation: number;
}

const ROTATION_OPTIONS = [
  { value: 90, label: "90° Clockwise", icon: RotateCw },
  { value: -90, label: "90° Counter-clockwise", icon: RotateCw },
  { value: 180, label: "180°", icon: RotateCw },
];

export function RotateModal({ isOpen, onClose, onRotate, currentPage, currentRotation }: RotateModalProps) {
  const [rotation, setRotation] = useState<string>("90");
  const [isRotating, setIsRotating] = useState(false);

  const handleRotate = async () => {
    setIsRotating(true);
    try {
      await onRotate(parseInt(rotation));
      onClose();
    } catch (error) {
      // Error is handled in onRotate
    } finally {
      setIsRotating(false);
    }
  };

  const handleClose = () => {
    if (!isRotating) {
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
            className="bg-card rounded-t-3xl md:rounded-2xl shadow-xl max-w-md w-full overflow-hidden max-h-[92dvh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Rotate Page</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Rotate page {currentPage}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isRotating}
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
                  Current rotation: <span className="font-semibold">{currentRotation}°</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Rotation is cumulative and applied to this page
                </p>
              </div>

              <RadioGroup value={rotation} onValueChange={setRotation}>
                {ROTATION_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.value}
                      className="flex items-start space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <RadioGroupItem value={option.value.toString()} id={option.value.toString()} className="mt-0.5" />
                      <div className="flex-1">
                        <Label htmlFor={option.value.toString()} className="cursor-pointer flex items-center gap-2">
                          <Icon
                            className={`w-4 h-4 ${option.value < 0 ? "rotate-180" : ""}`}
                          />
                          <span className="font-medium text-foreground">{option.label}</span>
                        </Label>
                      </div>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={isRotating}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                className="flex-1"
                onClick={handleRotate}
                disabled={isRotating}
              >
                {isRotating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rotating...
                  </>
                ) : (
                  <>
                    <RotateCw className="w-4 h-4 mr-2" />
                    Rotate Page
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

