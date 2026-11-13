import { createClient } from "@supabase/supabase-js";
const env = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : {};
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}
export const isDemoMode = !supabase;
export default supabase;
