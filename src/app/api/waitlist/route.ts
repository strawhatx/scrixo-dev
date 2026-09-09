import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_HEADERS = ["Timestamp", "Email", "Source"];
const ALLOWED_SOURCES = new Set(["waitlist", "footer", "post_export"]);

function waitlistHeaders() {
  const fromEnv = (process.env.WAITLIST_HEADERS || "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
  return fromEnv.length ? fromEnv : DEFAULT_HEADERS;
}

export async function POST(request: Request) {
  const webhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhook) {
    return NextResponse.json(
      { ok: false, error: "Waitlist is not connected yet." },
      { status: 503 },
    );
  }

  let body: { email?: string; website?: string; source?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  }

  const source = ALLOWED_SOURCES.has(String(body.source || ""))
    ? String(body.source)
    : "waitlist";

  const project = (process.env.WAITLIST_PROJECT || "Scrixo").trim();
  const headers = waitlistHeaders();
  const payload: {
    email: string;
    project: string;
    source: string;
    secret?: string;
    headers: string[];
    values: Record<string, string>;
  } = {
    email,
    project,
    source,
    headers,
    values: {
      Timestamp: new Date().toISOString(),
      Email: email,
      Source: source,
    },
  };
  if (process.env.WAITLIST_SECRET) {
    payload.secret = process.env.WAITLIST_SECRET;
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
        "User-Agent": "scrixo-waitlist",
      },
      body: JSON.stringify(payload),
      redirect: "manual",
    });

    const status = response.status;
    // Apps Script web apps 302 after POST. Following that redirect becomes a GET
    // (often 405). Status 0 is an opaque redirect in some fetch implementations.
    const redirected = status === 0 || (status >= 300 && status < 400) || status === 405;
    if (!response.ok && !redirected) {
      console.error("[waitlist] sheets webhook failed", status);
      const error =
        status === 401
          ? "Google blocked the waitlist webhook (401). Redeploy the Apps Script web app: Execute as Me, Who has access = Anyone, then paste the new /exec URL into GOOGLE_SHEETS_WEBHOOK_URL."
          : "Could not save that address. Try again in a moment.";
      return NextResponse.json({ ok: false, error }, { status: 502 });
    }
  } catch (err) {
    console.error("[waitlist] sheets webhook unreachable", err);
    return NextResponse.json(
      { ok: false, error: "Could not reach the waitlist sheet." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
