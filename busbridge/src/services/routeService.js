import supabase from "./supabaseClient";
import { demoRoutes } from "../data/demoRoutes";

const RECENT_KEY = "busbridge_recent_searches";

function normalise(str) { return str.toLowerCase().trim(); }

function routeMatches(route, from, to) {
  const stopNames = route.stops.map((s) => normalise(s.name));
  const fromNorm = normalise(from);
  const toNorm = normalise(to);
  const fromMatch = normalise(route.from).includes(fromNorm) || stopNames.some((n) => n.includes(fromNorm));
  const toMatch = normalise(route.to).includes(toNorm) || stopNames.some((n) => n.includes(toNorm));
  return fromMatch && toMatch;
}

export async function searchRoutes(from, to) {
  if (!from || !to) return [];
  if (supabase) {
    try {
      const { data, error } = await supabase.from("bus_routes").select("*").ilike("from_stop", `%${from}%`).ilike("to_stop", `%${to}%`);
      if (!error && data) return data;
    } catch (_) {}
  }
  return demoRoutes.filter((r) => routeMatches(r, from, to));
}

export async function getRouteById(id) {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("bus_routes").select("*").eq("id", id).single();
      if (!error && data) return data;
    } catch (_) {}
  }
  return demoRoutes.find((r) => r.id === id) || null;
}

export function getAllRoutes() { return demoRoutes; }

export function getRecentSearches() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}

export function addRecentSearch(from, to) {
  const recent = getRecentSearches();
  const entry = { from, to, timestamp: Date.now() };
  const filtered = recent.filter((r) => !(normalise(r.from) === normalise(from) && normalise(r.to) === normalise(to)));
  localStorage.setItem(RECENT_KEY, JSON.stringify([entry, ...filtered].slice(0, 5)));
}

export function clearRecentSearches() { localStorage.removeItem(RECENT_KEY); }
