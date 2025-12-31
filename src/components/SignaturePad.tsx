import React, { useRef, useEffect, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { X, Check, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SignaturePadProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureData: string) => void;
  showUpgradePrompt?: boolean;
}

export function SignaturePad({ isOpen, onClose, onSave, showUpgradePrompt }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsEmpty(true);
    }
  }, [isOpen]);

  const handleClear = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
  };

  const handleSave = () => {
    if (sigCanvas.current && !isEmpty) {
      const dataUrl = sigCanvas.current.toDataURL("image/png");
      onSave(dataUrl);
      onClose();
    }
  };

  const handleEnd = () => {
    setIsEmpty(sigCanvas.current?.isEmpty() ?? true);
  };

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
            className="bg-card rounded-2xl shadow-lg max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-bold text-foreground">
                Draw Your Signature
              </h3>
              <Button variant="ghost" size="icon-sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {showUpgradePrompt && (
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-4">
                <p className="text-sm text-foreground">
                  <strong>You've used your free signature.</strong> Upgrade to Pro for unlimited signatures!
                </p>
              </div>
            )}

            <div className="signature-pad mb-4">
              <SignatureCanvas
                ref={sigCanvas}
                canvasProps={{
                  width: 450,
                  height: 200,
                  className: "w-full rounded-lg",
                }}
                backgroundColor="white"
                penColor="#1e293b"
                onEnd={handleEnd}
              />
            </div>

            <p className="text-xs text-muted-foreground mb-4 text-center">
              Draw your signature above using your mouse or trackpad
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleClear}
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
              <Button
                variant="default"
                className="flex-1 gap-2"
                onClick={handleSave}
                disabled={isEmpty}
              >
                <Check className="w-4 h-4" />
                Apply Signature
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
