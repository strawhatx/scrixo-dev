"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export const WAITLIST_JOINED_KEY = "scrixo_waitlist_joined";
export const WAITLIST_DISMISSED_KEY = "scrixo_waitlist_dismissed";

export type WaitlistSource = "waitlist" | "footer" | "post_export";

export function markWaitlistJoined() {
  try {
    localStorage.setItem(WAITLIST_JOINED_KEY, "1");
  } catch {
    // ignore
  }
}

export function hasJoinedWaitlist() {
  try {
    return localStorage.getItem(WAITLIST_JOINED_KEY) === "1";
  } catch {
    return false;
  }
}

type WaitlistFormProps = {
  source: WaitlistSource;
  variant?: "footer" | "post-export";
  className?: string;
  onSuccess?: () => void;
};

export function WaitlistForm({ source, variant = "footer", className, onSuccess }: WaitlistFormProps) {
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const isPostExport = variant === "post-export";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") || "")
      .trim()
      .toLowerCase();
    const website = String(data.get("website") || "");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("Enter a valid email address.");
      return;
    }

    setPending(true);
    setStatus("");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website, source }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        setStatus(result.error || "Could not join the waitlist.");
        return;
      }
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "waitlist_submit", waitlist_source: source });
      markWaitlistJoined();
      setStatus("You’re on the list. We’ll email you when that’s ready.");
      form.reset();
      onSuccess?.();
    } catch {
      setStatus("Could not join the waitlist. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={cn("space-y-3", className)} onSubmit={onSubmit}>
      <div className={cn("flex gap-2", isPostExport ? "flex-col sm:flex-row" : "flex-col sm:flex-row")}>
        <label className="sr-only" htmlFor={`waitlist-email-${source}`}>
          Email
        </label>
        <Input
          id={`waitlist-email-${source}`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
          className="flex-1"
        />
        <Button type="submit" disabled={pending} className="shrink-0 bg-[#ff5a3c] text-white hover:bg-[#ff4a2a]">
          {pending ? "Joining…" : isPostExport ? "Notify me" : "Notify me"}
        </Button>
      </div>
      <label className="sr-only" aria-hidden="true">
        Website
        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </label>
      <p className="text-sm text-muted-foreground min-h-[1.2em]" role="status">
        {status}
      </p>
    </form>
  );
}

export function WaitlistFooter() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(hasJoinedWaitlist());
  }, []);

  if (hidden) return null;

  return (
    <div className="border-t border-border/60 py-8">
      <div className="mx-auto w-full max-w-xl text-center space-y-3 px-4">
        <p className="text-sm font-semibold text-foreground">Get notified about new features</p>
        <p className="text-xs text-muted-foreground">
          No account. We’ll only email when send-to-someone-else signing is ready.
        </p>
        <WaitlistForm source="footer" variant="footer" onSuccess={() => setHidden(true)} />
      </div>
    </div>
  );
}
