import supabase from "./supabaseClient";
const STORAGE_KEY = "busbridge_saved_routes";

function getLocalSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function setLocalSaved(routes) { localStorage.setItem(STORAGE_KEY, JSON.stringify(routes)); }

export async function getSavedRoutes() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("saved_routes").select("*").order("saved_at", { ascending: false });
      if (!error && data) return data;
    } catch (_) {}
  }
  return getLocalSaved();
}

export function isRouteSaved(routeId) { return getLocalSaved().some((r) => r.id === routeId); }

export async function saveRoute(route) {
  if (supabase) {
    try { const { error } = await supabase.from("saved_routes").insert([{ route_id: route.id, saved_at: new Date().toISOString() }]); if (!error) return true; } catch (_) {}
  }
  const saved = getLocalSaved();
  if (!saved.some((r) => r.id === route.id)) { saved.unshift({ ...route, savedAt: new Date().toISOString() }); setLocalSaved(saved); }
  return true;
}

export async function unsaveRoute(routeId) {
  if (supabase) {
    try { const { error } = await supabase.from("saved_routes").delete().eq("route_id", routeId); if (!error) return true; } catch (_) {}
  }
  setLocalSaved(getLocalSaved().filter((r) => r.id !== routeId));
  return true;
}
