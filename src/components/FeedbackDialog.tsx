"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type FeedbackSource = "nav" | "editor";

type FeedbackButtonProps = {
  source: FeedbackSource;
  className?: string;
  variant?: "ghost" | "outline";
  size?: "sm" | "default" | "icon";
  label?: string;
};

export function FeedbackButton({
  source,
  className,
  variant = "ghost",
  size = "sm",
  label = "Feedback",
}: FeedbackButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn("text-muted-foreground hover:text-foreground", className)}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      <FeedbackDialog open={open} onOpenChange={setOpen} source={source} />
    </>
  );
}

export function FeedbackDialog({
  open,
  onOpenChange,
  source,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: FeedbackSource;
}) {
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const message = String(data.get("message") || "").trim();
    const email = String(data.get("email") || "").trim();
    const website = String(data.get("website") || "");

    if (message.length < 8) {
      setStatus("Tell us a bit more — a sentence is enough.");
      return;
    }

    setPending(true);
    setStatus("");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          email,
          website,
          source,
          page: typeof window !== "undefined" ? window.location.pathname : "",
        }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        setStatus(result.error || "Could not send that. Try again.");
        return;
      }
      setSent(true);
      form.reset();
    } catch {
      setStatus("Could not send that. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setStatus("");
      setSent(false);
      setPending(false);
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="z-[200] max-w-md max-md:max-w-none">
        {sent ? (
          <DialogHeader>
            <DialogTitle>Got it — thank you</DialogTitle>
            <DialogDescription>
              We read every note. If you left an email, we’ll reply when we have something useful to say.
            </DialogDescription>
          </DialogHeader>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>What can we improve?</DialogTitle>
              <DialogDescription>Tell us what happened or what you wish you could do.</DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={onSubmit}>
              <Textarea
                name="message"
                required
                minLength={8}
                maxLength={4000}
                rows={5}
                autoFocus
                placeholder="Something broke, a step was annoying, or you wish it could…"
              />
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Want a response?</p>
                <label className="sr-only" htmlFor={`feedback-email-${source}`}>
                  Email
                </label>
                <Input
                  id={`feedback-email-${source}`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email (optional)"
                />
              </div>
              <label className="sr-only" aria-hidden="true">
                Website
                <input name="website" type="text" tabIndex={-1} autoComplete="off" />
              </label>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground min-h-[1.2em]" role="status">
                  {status}
                </p>
                <Button type="submit" disabled={pending} className="shrink-0">
                  {pending ? "Sending…" : "Send"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
