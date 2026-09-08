"use client";

import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Guest signing does not need Supabase. Auth/save/signatures do. */
export const isSupabaseConfigured = Boolean(url && key);

export const supabase = createBrowserClient(
  url || "https://unavailable.supabase.co",
  key || "anon-key-missing"
);
