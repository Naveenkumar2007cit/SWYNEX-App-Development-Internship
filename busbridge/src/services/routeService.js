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
      const { data, error } = await supabase
        .from("bus_routes")
        .select("*, bus_stops(*)")
        .ilike("from_stop", `%${from}%`)
        .ilike("to_stop", `%${to}%`);

      if (error) {
        console.warn("Supabase bus_routes query failed; using local demoRoutes:", error.message);
      } else if (Array.isArray(data) && data.length > 0) {
        return data.map((r) => ({
          id: r.id,
          busNumber: r.bus_number,
          name: r.name,
          from: r.from_stop,
          to: r.to_stop,
          duration: r.duration,
          totalStops: r.total_stops,
          distance: Number(r.distance) || 0,
          frequency: r.frequency,
          type: r.type,
          stops: (r.bus_stops || [])
            .sort((a, b) => a.stop_order - b.stop_order)
            .map((s) => ({ name: s.name, lat: Number(s.lat), lng: Number(s.lng) })),
        }));
      }
    } catch (err) {
      console.warn("Supabase network error; using local demoRoutes:", err.message);
    }
  }
  return demoRoutes.filter((r) => routeMatches(r, from, to));
}

export async function getRouteById(id) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("bus_routes")
        .select("*, bus_stops(*)")
        .eq("id", id)
        .single();

      if (error) {
        console.warn("Supabase getRouteById failed; using local demoRoutes:", error.message);
      } else if (data) {
        return {
          id: data.id,
          busNumber: data.bus_number,
          name: data.name,
          from: data.from_stop,
          to: data.to_stop,
          duration: data.duration,
          totalStops: data.total_stops,
          distance: Number(data.distance) || 0,
          frequency: data.frequency,
          type: data.type,
          stops: (data.bus_stops || [])
            .sort((a, b) => a.stop_order - b.stop_order)
            .map((s) => ({ name: s.name, lat: Number(s.lat), lng: Number(s.lng) })),
        };
      }
    } catch (err) {
      console.warn("Supabase network error; using local demoRoutes:", err.message);
    }
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
