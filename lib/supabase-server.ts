import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the Service Role key.
 * Bypasses RLS — only use in server routes for admin operations
 * (upload files on behalf of a user after verifying their session,
 * insert records that reference auth.users, etc).
 * NEVER import from a client component or expose to the browser.
 */
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
