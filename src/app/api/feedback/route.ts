import { NextResponse } from "next/server";
import { classifyFeedback } from "@/lib/classify-feedback";
import { appendSheetRow } from "@/lib/sheets-webhook";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_SOURCES = new Set(["nav", "editor"]);
const DEFAULT_HEADERS = ["Timestamp", "Category", "Message", "Reply", "Source", "Page", "UserAgent"];
const MAX_MESSAGE = 4000;

function feedbackHeaders() {
  const fromEnv = (process.env.FEEDBACK_HEADERS || "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
  return fromEnv.length ? fromEnv : DEFAULT_HEADERS;
}

export async function POST(request: Request) {
  const webhook = (process.env.FEEDBACK_SHEETS_WEBHOOK_URL || "").trim();
  if (!webhook) {
    return NextResponse.json(
      { ok: false, error: "Feedback is not connected yet." },
      { status: 503 },
    );
  }

  let body: {
    message?: string;
    email?: string;
    website?: string;
    source?: string;
    page?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const message = String(body.message || "").trim();
  if (message.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Tell us a bit more — a sentence is enough." },
      { status: 400 },
    );
  }
  if (message.length > MAX_MESSAGE) {
    return NextResponse.json({ ok: false, error: "That’s a bit long. Trim it and try again." }, { status: 400 });
  }

  const reply = String(body.email || "")
    .trim()
    .toLowerCase();
  if (reply && !EMAIL_RE.test(reply)) {
    return NextResponse.json({ ok: false, error: "Enter a valid email, or leave it blank." }, { status: 400 });
  }

  const source = ALLOWED_SOURCES.has(String(body.source || "")) ? String(body.source) : "nav";
  const page = String(body.page || "")
    .trim()
    .slice(0, 200);
  const category = classifyFeedback(message);
  const project = (process.env.FEEDBACK_PROJECT || "Scrixo Feedback").trim();
  const secret = process.env.FEEDBACK_SECRET;
  const headers = feedbackHeaders();

  const result = await appendSheetRow({
    webhook,
    project,
    secret,
    email: reply,
    source,
    headers,
    values: {
      Timestamp: new Date().toISOString(),
      Category: category,
      Message: message,
      Reply: reply,
      Source: source,
      Page: page,
      UserAgent: request.headers.get("user-agent") || "",
    },
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true });
}
