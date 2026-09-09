import React from "react";
import { Button } from "@/components/ui/button";
import { X, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: "signature" | "merge" | "split" | "forms";
}

const reasonMessages = {
  signature: {
    title: "Unlock Unlimited Signatures",
    description: "You've used your free signature. Upgrade to sign unlimited documents.",
  },
  merge: {
    title: "Merge PDFs with Pro",
    description: "Combine multiple PDFs into one document with our Pro plan.",
  },
  split: {
    title: "Split PDFs with Pro",
    description: "Extract pages from your PDFs with our Pro plan.",
  },
  forms: {
    title: "Fill Forms with Pro",
    description: "Complete interactive PDF forms with our Pro plan.",
  },
};

const proFeatures = [
  "Unlimited signatures",
  "Merge multiple PDFs",
  "Split PDF pages",
  "Fill interactive forms",
  "No advertisements",
  "Priority support",
];

export function UpgradeModal({ isOpen, onClose, reason = "signature" }: UpgradeModalProps) {
  const { title, description } = reasonMessages[reason];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-end justify-center md:items-center md:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="bg-card rounded-t-3xl md:rounded-2xl shadow-lg max-w-md w-full overflow-hidden relative max-h-[92dvh] md:max-h-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient */}
            <div className="bg-gradient-hero p-6 text-center">
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl font-bold text-primary-foreground mb-2">
                {title}
              </h3>
              <p className="text-primary-foreground/80">
                {description}
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-3 mb-6">
                {proFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="bg-secondary rounded-xl p-4 mb-6 text-center">
                <span className="text-3xl font-display font-bold text-foreground">$4.99</span>
                <span className="text-muted-foreground">/month</span>
                <p className="text-sm text-muted-foreground mt-1">Cancel anytime</p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                >
                  Maybe Later
                </Button>
                <Button
                  variant="hero"
                  className="flex-1"
                >
                  Upgrade Now
                </Button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-primary-foreground/80 hover:text-primary-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
