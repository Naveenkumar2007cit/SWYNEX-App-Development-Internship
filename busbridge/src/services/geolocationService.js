import { demoRoutes } from "../data/demoRoutes.js";

/**
 * Standard Haversine Formula for distance calculation between two latitude/longitude points in kilometers.
 * d = 2R * sin⁻¹(√[sin²(Δφ/2) + cos(φ₁)cos(φ₂)sin²(Δλ/2)])
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (
    lat1 === undefined || lon1 === undefined ||
    lat2 === undefined || lon2 === undefined ||
    lat1 === null || lon1 === null ||
    lat2 === null || lon2 === null
  ) {
    return Infinity;
  }

  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;

  return Number(distanceKm.toFixed(2));
}

/**
 * Format distance in a human-friendly transport format (e.g. "350 m" or "1.8 km")
 */
export function formatDistance(distanceKm) {
  if (distanceKm === Infinity || isNaN(distanceKm)) return "Unknown distance";
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(2)} km`;
}

/**
 * Extract unique bus stops catalog from verified Chennai demo data with valid coordinates and passing routes
 */
export function getStopLocationsCatalog() {
  const map = new Map();

  demoRoutes.forEach((route) => {
    route.stops.forEach((stop) => {
      if (stop.lat && stop.lng) {
        const key = stop.name.trim();
        if (!map.has(key)) {
          map.set(key, {
            id: `stop-${stop.id}-${key.replace(/\s+/g, "-").toLowerCase()}`,
            name: key,
            lat: stop.lat,
            lng: stop.lng,
            majorStop: Boolean(stop.majorStop),
            routes: [route.busNumber],
          });
        } else {
          const existing = map.get(key);
          if (!existing.routes.includes(route.busNumber)) {
            existing.routes.push(route.busNumber);
          }
          if (stop.majorStop) existing.majorStop = true;
        }
      }
    });
  });

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Curated Fallback Manual Anchor Locations in Chennai (for users who decline browser geolocation)
 */
export const CHENNAI_MANUAL_ANCHORS = [
  { id: "anchor-guindy",    name: "Guindy Junction / Metro",      lat: 13.0067, lng: 80.2206 },
  { id: "anchor-tambaram",  name: "Tambaram Bus Terminus",        lat: 12.9249, lng: 80.1000 },
  { id: "anchor-cmbt",      name: "Koyambedu CMBT Hub",           lat: 13.0694, lng: 80.1948 },
  { id: "anchor-tnagar",    name: "T. Nagar Bus Terminus",        lat: 13.0418, lng: 80.2341 },
  { id: "anchor-broadway",  name: "Broadway / Chennai Central",   lat: 13.0878, lng: 80.2785 },
  { id: "anchor-adyar",     name: "Adyar Depot / Signal",         lat: 13.0012, lng: 80.2565 },
  { id: "anchor-velachery", name: "Velachery Bus Stand",          lat: 12.9815, lng: 80.2209 },
  { id: "anchor-annanagar", name: "Anna Nagar Tower",             lat: 13.0850, lng: 80.2101 },
];

/**
 * Find nearby bus stops ordered by Haversine distance from given coordinates
 */
export function findNearbyStops(userLat, userLng, radiusKm = 5) {
  if (userLat === undefined || userLng === undefined) return [];

  const catalog = getStopLocationsCatalog();
  const withDistance = catalog.map((stop) => {
    const distKm = calculateHaversineDistance(userLat, userLng, stop.lat, stop.lng);
    return {
      ...stop,
      distanceKm: distKm,
      formattedDistance: formatDistance(distKm),
    };
  });

  // Filter within selected radius
  return withDistance
    .filter((stop) => stop.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Request user's current GPS location via Geolocation API
 * Returns: Promise<{ success: boolean, coords?: { lat, lng, accuracy }, errorType?: string, message: string }>
 */
export function requestUserGeolocation() {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      return resolve({
        success: false,
        errorType: "NOT_SUPPORTED",
        message: "Geolocation is not supported by your browser. Please choose a manual location.",
      });
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
          message: "Location acquired successfully.",
        });
      },
      (error) => {
        let errorType = "UNKNOWN";
        let message = "Unable to retrieve your location.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorType = "PERMISSION_DENIED";
            message = "Location access was denied. You can choose a manual Chennai hub below.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorType = "POSITION_UNAVAILABLE";
            message = "Location signal is unavailable. Please check your GPS settings or choose a manual hub.";
            break;
          case error.TIMEOUT:
            errorType = "TIMEOUT";
            message = "Location request timed out. Please try again or pick a manual hub.";
            break;
        }

        resolve({ success: false, errorType, message });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}
