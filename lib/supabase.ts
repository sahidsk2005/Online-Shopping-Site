import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when both Supabase environment variables are present. */
export const isSupabaseConfigured = Boolean(url && key);

/**
 * The app must not crash when the env vars are missing (fresh clone without
 * .env.local, or a Vercel deploy without environment variables). With
 * placeholders the pages still render and can show a friendly setup message.
 */
export const supabase = createClient(
  url || "https://missing-supabase-url.supabase.co",
  key || "missing-supabase-anon-key",
  { auth: { persistSession: true, autoRefreshToken: true } }
);
