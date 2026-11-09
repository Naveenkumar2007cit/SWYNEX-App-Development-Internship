import { demoRoutes, allStopNames } from "../data/demoRoutes.js";

/**
 * Normalise stop name for comparison (removes extra spaces, lowercase, punctuation)
 */
export function normalizeStopName(name) {
  if (!name) return "";
  return name.trim().toLowerCase();
}

/**
 * Check if two stop names refer to the same stop (exact or high substring match)
 */
export function areStopsEqual(a, b) {
  const normA = normalizeStopName(a);
  const normB = normalizeStopName(b);
  if (!normA || !normB) return false;
  return normA === normB || normA.includes(normB) || normB.includes(normA);
}

/**
 * Extract all unique stop names with their metadata (majorStop flag, lat, lng)
 */
export function getAllStopsCatalog() {
  const map = new Map();
  demoRoutes.forEach((route) => {
    route.stops.forEach((stop) => {
      const key = stop.name.trim();
      if (!map.has(key)) {
        map.set(key, {
          name: key,
          lat: stop.lat,
          lng: stop.lng,
          majorStop: Boolean(stop.majorStop),
          connectedRoutes: [route.busNumber],
        });
      } else {
        const existing = map.get(key);
        if (!existing.connectedRoutes.includes(route.busNumber)) {
          existing.connectedRoutes.push(route.busNumber);
        }
        if (stop.majorStop) existing.majorStop = true;
      }
    });
  });

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Find index of a stop on a route
 */
function findStopIndexOnRoute(route, targetStopName) {
  return route.stops.findIndex((s) => areStopsEqual(s.name, targetStopName));
}

/**
 * Slice sub-stops between start index and end index
 */
function getSubStops(route, startIdx, endIdx) {
  if (startIdx <= endIdx) {
    return route.stops.slice(startIdx, endIdx + 1);
  } else {
    // Reverse direction segment
    return route.stops.slice(endIdx, startIdx + 1).reverse();
  }
}

/**
 * Calculate distance and duration for a segment of stops on a route
 */
function calculateSegmentMetrics(route, startIdx, endIdx) {
  const totalStopsInRoute = route.stops.length;
  const stopsCovered = Math.abs(endIdx - startIdx);
  const ratio = totalStopsInRoute > 1 ? stopsCovered / (totalStopsInRoute - 1) : 1;

  // Approximate proportional duration and distance
  const duration = Math.max(8, Math.round((route.duration || 45) * ratio));
  const distance = Math.max(1.5, Number(((route.distance || 15) * ratio).toFixed(1)));

  return { duration, distance, stopsCount: stopsCovered + 1 };
}

/**
 * Intelligent Journey Finder
 * Searches for direct bus options and 1-transfer connections across the dataset.
 */
export function findJourneys(sourceStop, destStop) {
  if (!sourceStop || !destStop) return [];
  if (areStopsEqual(sourceStop, destStop)) return [];

  const journeys = [];
  const journeyKeys = new Set(); // To prevent duplicate journey options

  // ==========================================
  // 1. Direct Routes Search
  // ==========================================
  for (const route of demoRoutes) {
    const sIdx = findStopIndexOnRoute(route, sourceStop);
    const dIdx = findStopIndexOnRoute(route, destStop);

    if (sIdx !== -1 && dIdx !== -1 && sIdx !== dIdx) {
      const legStops = getSubStops(route, sIdx, dIdx);
      const metrics = calculateSegmentMetrics(route, sIdx, dIdx);

      const journeyId = `direct-${route.id}-${sIdx}-${dIdx}`;
      if (!journeyKeys.has(journeyId)) {
        journeyKeys.add(journeyId);
        journeys.push({
          id: journeyId,
          type: "direct",
          transfersCount: 0,
          totalDuration: metrics.duration,
          totalDistance: metrics.distance,
          totalStopsCount: legStops.length,
          origin: legStops[0].name,
          destination: legStops[legStops.length - 1].name,
          legs: [
            {
              legIndex: 1,
              busNumber: route.busNumber,
              routeName: route.name,
              routeType: route.type,
              frequency: route.frequency,
              boardStop: legStops[0],
              alightStop: legStops[legStops.length - 1],
              stops: legStops,
              duration: metrics.duration,
              distance: metrics.distance,
            },
          ],
        });
      }
    }
  }

  // ==========================================
  // 2. 1-Transfer Routes Search (Leg 1 + Transfer Stop + Leg 2)
  // ==========================================
  for (const r1 of demoRoutes) {
    const s1 = findStopIndexOnRoute(r1, sourceStop);
    if (s1 === -1) continue;

    for (const r2 of demoRoutes) {
      if (r1.id === r2.id) continue; // Same route transfer unnecessary

      const d2 = findStopIndexOnRoute(r2, destStop);
      if (d2 === -1) continue;

      // Find common transfer stop between r1 and r2
      for (let t1 = 0; t1 < r1.stops.length; t1++) {
        if (t1 === s1) continue; // Transfer cannot be the start stop
        const transferCandidate = r1.stops[t1];

        const t2 = findStopIndexOnRoute(r2, transferCandidate.name);
        if (t2 !== -1 && t2 !== d2) {
          // Found a verified transfer stop connecting both routes!
          const leg1Stops = getSubStops(r1, s1, t1);
          const leg2Stops = getSubStops(r2, t2, d2);

          const m1 = calculateSegmentMetrics(r1, s1, t1);
          const m2 = calculateSegmentMetrics(r2, t2, d2);
          const transferWaitTime = 10; // 10 min average transfer interchange wait

          const totalDuration = m1.duration + m2.duration + transferWaitTime;
          const totalDistance = Number((m1.distance + m2.distance).toFixed(1));
          const totalStopsCount = leg1Stops.length + leg2Stops.length - 1; // Subtract common transfer point

          const journeyKey = `transfer-${r1.busNumber}-${r2.busNumber}-${transferCandidate.name.toLowerCase()}`;
          if (!journeyKeys.has(journeyKey)) {
            journeyKeys.add(journeyKey);
            journeys.push({
              id: journeyKey,
              type: "transfer",
              transfersCount: 1,
              transferStopName: transferCandidate.name,
              transferWaitTime,
              totalDuration,
              totalDistance,
              totalStopsCount,
              origin: leg1Stops[0].name,
              destination: leg2Stops[leg2Stops.length - 1].name,
              legs: [
                {
                  legIndex: 1,
                  busNumber: r1.busNumber,
                  routeName: r1.name,
                  routeType: r1.type,
                  frequency: r1.frequency,
                  boardStop: leg1Stops[0],
                  alightStop: leg1Stops[leg1Stops.length - 1],
                  stops: leg1Stops,
                  duration: m1.duration,
                  distance: m1.distance,
                },
                {
                  legIndex: 2,
                  busNumber: r2.busNumber,
                  routeName: r2.name,
                  routeType: r2.type,
                  frequency: r2.frequency,
                  boardStop: leg2Stops[0],
                  alightStop: leg2Stops[leg2Stops.length - 1],
                  stops: leg2Stops,
                  duration: m2.duration,
                  distance: m2.distance,
                },
              ],
            });
          }
        }
      }
    }
  }

  return journeys;
}

/**
 * Sorters for Journey options
 */
export function sortJourneys(journeys, sortCriteria = "fastest") {
  const list = [...journeys];
  switch (sortCriteria) {
    case "fewest_transfers":
      return list.sort((a, b) => {
        if (a.transfersCount !== b.transfersCount) {
          return a.transfersCount - b.transfersCount;
        }
        return a.totalDuration - b.totalDuration;
      });
    case "shortest_distance":
      return list.sort((a, b) => a.totalDistance - b.totalDistance);
    case "fastest":
    default:
      return list.sort((a, b) => {
        if (a.totalDuration !== b.totalDuration) {
          return a.totalDuration - b.totalDuration;
        }
        return a.transfersCount - b.transfersCount;
      });
  }
}
