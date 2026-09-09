"use client";

import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WaitlistForm } from "@/components/WaitlistForm";

export function ExportSuccessCapture({ onDismiss }: { onDismiss: () => void }) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onDismiss(); }}>
      <DialogContent className="z-[200] max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3 pr-6">
            <div className="h-9 w-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
              <Check className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle>PDF downloaded</DialogTitle>
              <DialogDescription>
                Want to send this to someone else to sign? Get notified when that’s ready.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <WaitlistForm source="post_export" variant="post-export" onSuccess={onDismiss} />
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          No thanks — skip
        </button>
      </DialogContent>
    </Dialog>
  );
}
