import supabase from "./supabaseClient.js";

const STORAGE_KEY = "busbridge_saved_routes";
export const SAVED_ROUTES_CHANGE_EVENT = "busbridge_saved_routes_changed";

/**
 * Dispatch cross-component and cross-tab update event
 */
function notifyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SAVED_ROUTES_CHANGE_EVENT));
  }
}

/**
 * Normalise stop name string for consistent comparison
 */
function norm(str) {
  return str ? str.trim().toLowerCase() : "";
}

/**
 * Check if a saved item is a valid journey or single route object
 */
export function isValidJourney(item) {
  if (!item || typeof item !== "object") return false;

  // Must have a valid ID string
  if (typeof item.id !== "string" || item.id.trim() === "") return false;

  // Must have source and destination
  const source = item.from || item.origin;
  const destination = item.to || item.destination;

  if (typeof source !== "string" || source.trim() === "") return false;
  if (typeof destination !== "string" || destination.trim() === "") return false;

  // Must have at least one valid bus number or leg
  const hasBusNumber = typeof item.busNumber === "string" && item.busNumber.trim() !== "";
  const hasLegs = Array.isArray(item.legs) && item.legs.length > 0;

  return hasBusNumber || hasLegs;
}

/**
 * Read and sanitize saved items from localStorage
 * Resilient against corrupted, non-JSON, or invalid data
 */
export function getLocalSaved() {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn("Saved routes in localStorage was not an array. Resetting safely.");
      return [];
    }
    // Filter and sanitize, discarding corrupted or malformed entries
    return parsed.filter(isValidJourney);
  } catch (err) {
    console.error("Corrupted localStorage data encountered. Recovering safely:", err);
    return [];
  }
}

/**
 * Write valid items to localStorage safely
 */
function setLocalSaved(items) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const validItems = items.filter(isValidJourney);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validItems));
    notifyChange();
  } catch (err) {
    console.error("Failed to write saved routes to localStorage:", err);
  }
}

/**
 * Format any route or journey object into a standardized saved journey item
 */
export function formatJourneyForStorage(input) {
  if (!input || typeof input !== "object") return null;

  const isPlannerJourney = Boolean(input.legs && Array.isArray(input.legs));
  const source = (input.from || input.origin || "").trim();
  const destination = (input.to || input.destination || "").trim();

  // Extract legs and bus numbers
  let legs = [];
  let busNumber = input.busNumber || "";
  let routeName = input.name || input.routeName || "";
  let totalDuration = input.duration || input.totalDuration || 0;
  let totalDistance = input.distance || input.totalDistance || 0;
  let transfersCount = input.transfersCount !== undefined ? input.transfersCount : 0;
  let transferStopName = input.transferStopName || null;

  if (isPlannerJourney) {
    legs = input.legs.map((l, idx) => ({
      legIndex: l.legIndex || idx + 1,
      busNumber: l.busNumber || "",
      routeName: l.routeName || "",
      routeType: l.routeType || "Ordinary",
      frequency: l.frequency || "",
      boardStopName: l.boardStop?.name || l.boardStopName || "",
      alightStopName: l.alightStop?.name || l.alightStopName || "",
      duration: l.duration || 0,
      distance: l.distance || 0,
      stopsCount: Array.isArray(l.stops) ? l.stops.length : l.stopsCount || 0,
    }));

    busNumber = legs.map((l) => l.busNumber).filter(Boolean).join(" + ");
    routeName = input.name || `${source} ➔ ${destination}`;
    transfersCount = input.transfersCount ?? (legs.length > 1 ? legs.length - 1 : 0);
  } else {
    // Single direct route
    legs = [
      {
        legIndex: 1,
        busNumber: input.busNumber || "",
        routeName: input.name || "",
        routeType: input.type || "Ordinary",
        frequency: input.frequency || "",
        boardStopName: source,
        alightStopName: destination,
        duration: totalDuration,
        distance: totalDistance,
        stopsCount: input.totalStops || (Array.isArray(input.stops) ? input.stops.length : 0),
      },
    ];
  }

  // Generate robust identifier
  const id = input.id || `saved-${norm(source)}-${norm(destination)}-${norm(busNumber)}-${Date.now()}`;

  return {
    id,
    type: transfersCount > 0 ? "transfer" : "direct",
    from: source,
    to: destination,
    origin: source,
    destination: destination,
    busNumber,
    name: routeName,
    routeName,
    transfersCount,
    transferStopName,
    duration: totalDuration,
    totalDuration,
    distance: totalDistance,
    totalDistance,
    totalStopsCount: input.totalStopsCount || input.totalStops || (Array.isArray(input.stops) ? input.stops.length : 0),
    legs,
    savedAt: input.savedAt || new Date().toISOString(),
  };
}

/**
 * Check if a duplicate exists in the saved collection based on source, destination, and bus route(s)
 */
export function findDuplicate(candidate, savedList = null) {
  if (!candidate) return null;
  const list = savedList || getLocalSaved();

  const cSrc = norm(candidate.from || candidate.origin);
  const cDst = norm(candidate.to || candidate.destination);
  const cBus = norm(candidate.busNumber);
  const cId = candidate.id ? String(candidate.id).trim() : "";

  return list.find((item) => {
    // Exact ID match
    if (cId && item.id === cId) return true;

    const iSrc = norm(item.from || item.origin);
    const iDst = norm(item.to || item.destination);
    const iBus = norm(item.busNumber);

    // Same source, destination, and bus sequence
    return iSrc === cSrc && iDst === cDst && iBus === cBus;
  });
}

/**
 * Check if an item is already saved
 */
export function isRouteSaved(itemOrId) {
  if (!itemOrId) return false;
  const list = getLocalSaved();

  if (typeof itemOrId === "string") {
    return list.some((r) => r.id === itemOrId);
  }

  return Boolean(findDuplicate(itemOrId, list));
}

/**
 * Save a journey or route with validation and duplicate prevention
 * Returns: { success: boolean, message: string, route?: object, alreadySaved?: boolean }
 */
export async function saveRoute(routeOrJourney) {
  const item = formatJourneyForStorage(routeOrJourney);

  if (!isValidJourney(item)) {
    return {
      success: false,
      message: "Cannot save: Missing source, destination, or bus route details.",
    };
  }

  const saved = getLocalSaved();
  const duplicate = findDuplicate(item, saved);

  if (duplicate) {
    const busLabel = duplicate.busNumber ? `Bus ${duplicate.busNumber}` : "Journey";
    return {
      success: false,
      alreadySaved: true,
      message: `${busLabel} (${duplicate.from} ➔ ${duplicate.to}) is already in your saved routes.`,
      route: duplicate,
    };
  }

  // Optional Supabase persistence if available
  let cloudSaved = false;
  if (supabase) {
    try {
      const payload = {
        id: item.id,
        route_id: item.id,
        bus_number: item.busNumber || null,
        name: item.name || null,
        from_stop: item.from,
        to_stop: item.to,
        journey_type: item.type || "direct",
        duration: item.duration || 0,
        distance: item.distance || 0,
        transfers_count: item.transfersCount || 0,
        legs: item.legs || [],
        saved_at: item.savedAt,
      };
      const { error } = await supabase.from("saved_routes").insert([payload]);
      if (error) {
        console.warn("Supabase saved_routes insert failed; using localStorage fallback:", error.message);
      } else {
        cloudSaved = true;
      }
    } catch (err) {
      console.warn("Supabase network error; using localStorage fallback:", err.message);
    }
  }

  const updated = [item, ...saved];
  setLocalSaved(updated);

  const busLabel = item.busNumber ? `Bus ${item.busNumber}` : "Journey";
  const statusNote = cloudSaved ? " (synced to cloud)" : "";
  return {
    success: true,
    cloudSaved,
    message: `${busLabel} (${item.from} ➔ ${item.to}) saved to favourites!${statusNote}`,
    route: item,
  };
}

/**
 * Remove a single saved journey by ID
 * Returns: { success: boolean, message: string }
 */
export async function unsaveRoute(routeId) {
  if (!routeId) {
    return { success: false, message: "Route ID required to remove." };
  }

  if (supabase) {
    try {
      await supabase.from("saved_routes").delete().eq("route_id", routeId);
    } catch (_err) {
      // Fallback gracefully to local storage
    }
  }

  const current = getLocalSaved();
  const removed = current.find((r) => r.id === routeId);
  const updated = current.filter((r) => r.id !== routeId);
  setLocalSaved(updated);

  const busInfo = removed?.busNumber ? `Bus ${removed.busNumber}` : "Journey";
  return {
    success: true,
    message: `${busInfo} removed from saved routes.`,
  };
}

/**
 * Clear all saved journeys with immediate reactive update
 */
export function clearAllSavedRoutes() {
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.removeItem(STORAGE_KEY);
    notifyChange();
  }
  return { success: true, message: "All saved journeys have been cleared." };
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

      if (error) {
        console.warn("Supabase saved_routes fetch failed; fallback to local storage:", error.message);
      } else if (Array.isArray(data) && data.length > 0) {
        // Map database snake_case back to application camelCase
        const mapped = data.map((d) => ({
          id: d.id,
          type: d.journey_type || "direct",
          from: d.from_stop,
          to: d.to_stop,
          origin: d.from_stop,
          destination: d.to_stop,
          busNumber: d.bus_number || "",
          name: d.name || "",
          routeName: d.name || "",
          transfersCount: d.transfers_count || 0,
          duration: d.duration || 0,
          totalDuration: d.duration || 0,
          distance: Number(d.distance) || 0,
          totalDistance: Number(d.distance) || 0,
          legs: d.legs || [],
          savedAt: d.saved_at,
        }));
        return mapped.filter(isValidJourney);
      }
    } catch (err) {
      console.warn("Supabase fetch network error; fallback to local storage:", err.message);
    }
  }
  return getLocalSaved();
}

/**
 * Legacy aliases for backwards compatibility
 */
export const isValidRoute = isValidJourney;
