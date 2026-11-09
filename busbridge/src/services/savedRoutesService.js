import supabase from "./supabaseClient";

const STORAGE_KEY = "busbridge_saved_routes";
export const SAVED_ROUTES_CHANGE_EVENT = "busbridge_saved_routes_changed";

function notifyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SAVED_ROUTES_CHANGE_EVENT));
  }
}

/**
 * Validate and sanitize route object
 */
export function isValidRoute(route) {
  return Boolean(
    route &&
    typeof route === "object" &&
    typeof route.id === "string" &&
    route.id.trim() !== "" &&
    typeof route.busNumber === "string" &&
    route.busNumber.trim() !== "" &&
    typeof route.from === "string" &&
    typeof route.to === "string"
  );
}

/**
 * Read locally stored saved routes safely
 */
export function getLocalSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Filter and sanitize invalid or malformed data
    return parsed.filter(isValidRoute);
  } catch (err) {
    console.error("Failed to parse saved routes from localStorage:", err);
    return [];
  }
}

function setLocalSaved(routes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
    notifyChange();
  } catch (err) {
    console.error("Failed to write saved routes to localStorage:", err);
  }
}

/**
 * Get all saved routes (Supabase with localStorage fallback)
 */
export async function getSavedRoutes() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("saved_routes")
        .select("*")
        .order("saved_at", { ascending: false });
      if (!error && Array.isArray(data)) return data;
    } catch (_) {}
  }
  return getLocalSaved();
}

/**
 * Check if a route is currently saved
 */
export function isRouteSaved(routeId) {
  if (!routeId) return false;
  return getLocalSaved().some((r) => r.id === routeId);
}

/**
 * Save a route with duplicate detection and validation
 * Returns { success: boolean, message: string, route?: object, alreadySaved?: boolean }
 */
export async function saveRoute(route) {
  if (!isValidRoute(route)) {
    return {
      success: false,
      message: "Cannot save: Invalid or missing bus route details.",
    };
  }

  const saved = getLocalSaved();
  const exists = saved.some((r) => r.id === route.id);

  if (exists) {
    return {
      success: false,
      alreadySaved: true,
      message: `Bus ${route.busNumber} (${route.from} → ${route.to}) is already in your saved routes.`,
    };
  }

  // Attempt Supabase insert if available
  if (supabase) {
    try {
      await supabase.from("saved_routes").insert([
        { route_id: route.id, saved_at: new Date().toISOString() },
      ]);
    } catch (_) {}
  }

  const routeToSave = {
    ...route,
    savedAt: new Date().toISOString(),
  };

  const updated = [routeToSave, ...saved];
  setLocalSaved(updated);

  return {
    success: true,
    message: `Bus ${route.busNumber} saved successfully to favourites!`,
    route: routeToSave,
  };
}

/**
 * Remove a saved route
 * Returns { success: boolean, message: string }
 */
export async function unsaveRoute(routeId) {
  if (!routeId) {
    return { success: false, message: "Route ID required to remove." };
  }

  if (supabase) {
    try {
      await supabase.from("saved_routes").delete().eq("route_id", routeId);
    } catch (_) {}
  }

  const current = getLocalSaved();
  const removedRoute = current.find((r) => r.id === routeId);
  const updated = current.filter((r) => r.id !== routeId);
  setLocalSaved(updated);

  const busInfo = removedRoute ? `Bus ${removedRoute.busNumber}` : "Route";
  return {
    success: true,
    message: `${busInfo} removed from saved routes.`,
  };
}

/**
 * Clear all saved routes
 */
export function clearAllSavedRoutes() {
  localStorage.removeItem(STORAGE_KEY);
  notifyChange();
  return { success: true, message: "All saved routes cleared." };
}
