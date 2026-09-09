type SheetPayload = {
  webhook: string;
  project: string;
  secret?: string;
  email: string;
  source: string;
  headers: string[];
  values: Record<string, string>;
  skipDuplicate?: boolean;
  kind?: string;
};

export async function appendSheetRow(
  payload: SheetPayload,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const body: Record<string, unknown> = {
    email: payload.email,
    project: payload.project,
    source: payload.source,
    headers: payload.headers,
    values: payload.values,
  };
  if (payload.skipDuplicate) body.skipDuplicate = true;
  if (payload.kind) body.kind = payload.kind;
  if (payload.secret) body.secret = payload.secret;

  try {
    const response = await fetch(payload.webhook, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
        "User-Agent": "scrixo-sheets",
      },
      body: JSON.stringify(body),
      redirect: "manual",
    });

    const status = response.status;
    // Apps Script web apps 302 after POST. Following that redirect becomes a GET
    // (often 405). Status 0 is an opaque redirect in some fetch implementations.
    const redirected = status === 0 || (status >= 300 && status < 400) || status === 405;
    if (!response.ok && !redirected) {
      console.error("[sheets] webhook failed", status);
      const error =
        status === 401
          ? "Google blocked the sheet webhook (401). Redeploy the Apps Script web app: Execute as Me, Who has access = Anyone, then paste the new /exec URL."
          : "Could not save that. Try again in a moment.";
      return { ok: false, status: 502, error };
    }
  } catch (err) {
    console.error("[sheets] webhook unreachable", err);
    return { ok: false, status: 502, error: "Could not reach the sheet." };
  }

  return { ok: true };
}
