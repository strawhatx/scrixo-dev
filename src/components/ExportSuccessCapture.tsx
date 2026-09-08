"use client";

import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WAITLIST_DISMISSED_KEY, WaitlistForm } from "@/components/WaitlistForm";

export function ExportSuccessCapture({ onDismiss }: { onDismiss: () => void }) {
  const dismiss = () => {
    try {
      sessionStorage.setItem(WAITLIST_DISMISSED_KEY, "1");
    } catch {
      // ignore
    }
    onDismiss();
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-[70] flex justify-center px-4 pb-[env(safe-area-inset-bottom)] md:bottom-20">
      <Card className="pointer-events-auto w-full max-w-md border border-border shadow-xl p-5 space-y-3 bg-card">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-foreground">PDF downloaded</p>
              <p className="text-sm text-muted-foreground mt-1">
                Want to send this to someone else to sign? Get notified when that’s ready.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={dismiss}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <WaitlistForm source="post_export" variant="post-export" onSuccess={onDismiss} />
        <button
          type="button"
          onClick={dismiss}
          className="text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          No thanks — skip
        </button>
      </Card>
    </div>
  );
}
