import {
  CHENNAI_COLLEGES,
  KILAMBAKKAM_TERMINAL_GUIDE,
  BEGINNERS_BUS_GUIDE,
  FESTIVAL_TRAVEL_SUGGESTIONS
} from "../data/collegeTransitData.js";

export const COLLEGE_CHANGED_EVENT = "busbridge_college_changed";
const STORAGE_SELECTED_COLLEGE_KEY = "busbridge_selected_college_id";

/**
 * Get all supported colleges
 */
export function getAllColleges() {
  return CHENNAI_COLLEGES;
}

/**
 * Get a specific college by its ID
 */
export function getCollegeById(collegeId) {
  if (!collegeId) return null;
  return CHENNAI_COLLEGES.find((c) => c.id === collegeId) || null;
}

/**
 * Get the user's saved/active college ID (defaults to 'cit-kundrathur')
 */
export function getActiveCollegeId() {
  if (typeof window === "undefined" || !window.localStorage) return "cit-kundrathur";
  try {
    const saved = localStorage.getItem(STORAGE_SELECTED_COLLEGE_KEY);
    if (saved && CHENNAI_COLLEGES.some((c) => c.id === saved)) {
      return saved;
    }
    return "cit-kundrathur";
  } catch {
    return "cit-kundrathur";
  }
}

/**
 * Save user's selected college and broadcast change
 */
export function setActiveCollegeId(collegeId) {
  if (typeof window === "undefined" || !window.localStorage) return;
  if (collegeId && CHENNAI_COLLEGES.some((c) => c.id === collegeId)) {
    localStorage.setItem(STORAGE_SELECTED_COLLEGE_KEY, collegeId);
    if (typeof window.dispatchEvent === "function") {
      window.dispatchEvent(
        new CustomEvent(COLLEGE_CHANGED_EVENT, { detail: { collegeId } })
      );
    }
  }
}

/**
 * Get supported journeys for a given college
 */
export function getCollegeJourneys(collegeId) {
  const college = getCollegeById(collegeId) || getCollegeById("cit-kundrathur");
  if (!college || !college.supportedJourneys) return [];

  return Object.entries(college.supportedJourneys).map(([key, data]) => {
    return {
      destinationId: key,
      destinationTerminal: data.destinationName,
      tamilDestination: data.tamilDestination || "",
      isDirectSupported: data.isDirectSupported,
      recommendedRoute: data.recommendedRoute,
      travelStages: data.travelStages || [],
      options: data.availableOptions || []
    };
  });
}

/**
 * Get verified nearby boarding stops for a college
 */
export function getCollegeNearbyStops(collegeId) {
  const college = getCollegeById(collegeId) || getCollegeById("cit-kundrathur");
  if (!college) return [];
  return college.verifiedNearbyStops || [];
}

/**
 * Search colleges by keyword
 */
export function searchColleges(query) {
  if (!query || !query.trim()) return CHENNAI_COLLEGES;
  const q = query.toLowerCase().trim();

  return CHENNAI_COLLEGES.filter((c) => {
    return (
      c.name.toLowerCase().includes(q) ||
      c.shortName.toLowerCase().includes(q) ||
      c.area.toLowerCase().includes(q) ||
      (c.tamilName && c.tamilName.includes(q))
    );
  });
}

/**
 * Kilambakkam Intercity terminal guide
 */
export function getKilambakkamTerminalGuide() {
  return KILAMBAKKAM_TERMINAL_GUIDE;
}

/**
 * Beginner's Bus Guide
 */
export function getBeginnersBusGuide() {
  return BEGINNERS_BUS_GUIDE;
}

/**
 * Festival & Weekend Travel Suggestions
 */
export function getFestivalTravelSuggestions() {
  return FESTIVAL_TRAVEL_SUGGESTIONS;
}
