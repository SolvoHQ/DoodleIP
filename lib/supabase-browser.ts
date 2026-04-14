import { createBrowserClient } from "@supabase/ssr";

/**
 * Client-side Supabase client for use in React client components.
 * Respects RLS — users can only access their own rows.
 */
export function getBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
