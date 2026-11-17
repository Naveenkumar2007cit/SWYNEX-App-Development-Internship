import { createClient } from "@supabase/supabase-js";
const env = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : {};
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

/**
 * Ensures the client has an active anonymous session so auth.uid() is never null.
 * Provides true cross-user isolation for anonymous/guest sessions under RLS.
 */
export async function ensureAnonymousSession() {
  if (!supabase) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return session.user.id;
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.warn("Supabase anonymous sign-in failed:", error.message);
      return null;
    }
    return data?.user?.id || null;
  } catch (err) {
    console.warn("Error obtaining anonymous auth session:", err.message);
    return null;
  }
}

export const isDemoMode = !supabase;
export default supabase;
