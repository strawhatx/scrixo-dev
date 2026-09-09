"use client";

import { Check, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { WaitlistForm } from "@/components/WaitlistForm";

export function ExportSuccessCapture({ onDismiss }: { onDismiss: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 md:items-center md:p-4"
        onClick={onDismiss}
      >
        <motion.div
          role="dialog"
          aria-labelledby="export-capture-title"
          aria-describedby="export-capture-desc"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="relative w-full max-w-md rounded-t-3xl bg-card p-6 shadow-xl md:rounded-2xl pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onDismiss}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-3 pr-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
              <Check className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h2 id="export-capture-title" className="text-lg font-semibold leading-none tracking-tight">
                PDF downloaded
              </h2>
              <p id="export-capture-desc" className="text-sm text-muted-foreground">
                Want to send this to someone else to sign? Get notified when that’s ready.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <WaitlistForm source="post_export" variant="post-export" onSuccess={onDismiss} />
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            No thanks — skip
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
