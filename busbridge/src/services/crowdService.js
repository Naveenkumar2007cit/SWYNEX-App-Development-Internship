import supabase from "./supabaseClient.js";
import { demoRoutes } from "../data/demoRoutes.js";

const STORAGE_KEY = "busbridge_crowd_reports";
const COOLDOWN_KEY = "busbridge_crowd_cooldowns";
export const CROWD_CHANGE_EVENT = "busbridge_crowd_changed";

export const CROWD_LEVELS = [
  { value: "low",    label: "Low",    score: 1, color: "green",  bgColor: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", desc: "Seats available, comfortable" },
  { value: "medium", label: "Medium", score: 2, color: "yellow", bgColor: "bg-amber-50",   text: "text-amber-800",   border: "border-amber-200",   desc: "Standing passengers, moderate" },
  { value: "high",   label: "High",   score: 3, color: "red",    bgColor: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     desc: "Packed, hard to board" },
];

function notifyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CROWD_CHANGE_EVENT));
  }
}

/**
 * Robust retrieval of crowd reports from localStorage
 */
export function getStoredCrowdReports() {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidCrowdReport);
  } catch (err) {
    console.error("Failed to parse crowd reports from localStorage, recovering:", err);
    return [];
  }
}

function setStoredCrowdReports(reports) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const valid = reports.filter(isValidCrowdReport);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valid.slice(0, 300)));
    notifyChange();
  } catch (err) {
    console.error("Failed to write crowd reports:", err);
  }
}

/**
 * Report validation
 */
export function isValidCrowdReport(report) {
  return Boolean(
    report &&
    typeof report === "object" &&
    typeof report.id === "string" &&
    typeof report.busNumber === "string" &&
    report.busNumber.trim() !== "" &&
    typeof report.crowdLevel === "string" &&
    ["low", "medium", "high"].includes(report.crowdLevel.toLowerCase()) &&
    typeof report.reportedAt === "string"
  );
}

/**
 * Check abuse prevention cooldown (3 minutes per busNumber & stop/location)
 */
export function checkCooldown(busNumber, stopLocation = "") {
  if (typeof window === "undefined" || !window.localStorage) return { allowed: true };
  try {
    const raw = localStorage.getItem(COOLDOWN_KEY);
    const cooldowns = raw ? JSON.parse(raw) : {};
    const key = `${(busNumber || "").trim().toLowerCase()}-${(stopLocation || "").trim().toLowerCase()}`;
    const lastTime = cooldowns[key];
    const now = Date.now();
    const COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes cooldown

    if (lastTime && now - lastTime < COOLDOWN_MS) {
      const remainingSecs = Math.ceil((COOLDOWN_MS - (now - lastTime)) / 1000);
      return {
        allowed: false,
        remainingSecs,
        message: `Please wait ${remainingSecs}s before submitting another crowd report for Bus ${busNumber}.`,
      };
    }
    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

function recordCooldown(busNumber, stopLocation = "") {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const raw = localStorage.getItem(COOLDOWN_KEY);
    const cooldowns = raw ? JSON.parse(raw) : {};
    const key = `${(busNumber || "").trim().toLowerCase()}-${(stopLocation || "").trim().toLowerCase()}`;
    cooldowns[key] = Date.now();
    localStorage.setItem(COOLDOWN_KEY, JSON.stringify(cooldowns));
  } catch (_) {}
}

/**
 * Submit community crowd report with validation and cooldown
 */
export async function submitCrowdReport({
  busNumber,
  routeName,
  stopLocation,
  crowdLevel,
  notes,
  routeId,
}) {
  const normBus = (busNumber || "").trim();
  const normLevel = (crowdLevel || "").trim().toLowerCase();
  const normStop = (stopLocation || "").trim();

  if (!normBus) {
    return { success: false, message: "Please select or enter a valid bus route number." };
  }
  if (!normLevel || !["low", "medium", "high"].includes(normLevel)) {
    return { success: false, message: "Please select a valid crowd condition (Low, Medium, or High)." };
  }

  // Validate bus number against dataset if available
  const matchedRoute = demoRoutes.find(
    (r) => r.busNumber.toLowerCase() === normBus.toLowerCase() || r.id === routeId
  );
  const finalRouteName = routeName || matchedRoute?.name || `Route ${normBus}`;
  const finalRouteId = routeId || matchedRoute?.id || `R-${normBus}`;

  // Cooldown abuse prevention check
  const cooldownCheck = checkCooldown(normBus, normStop);
  if (!cooldownCheck.allowed) {
    return { success: false, cooldown: true, message: cooldownCheck.message };
  }

  const report = {
    id: `CR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    routeId: finalRouteId,
    busNumber: normBus,
    routeName: finalRouteName,
    stopLocation: normStop || (matchedRoute ? matchedRoute.from : "Chennai En Route"),
    crowdLevel: normLevel,
    notes: (notes || "").trim().slice(0, 300),
    reportedAt: new Date().toISOString(),
    source: "community",
  };

  if (supabase) {
    try {
      await supabase.from("crowd_reports").insert([report]);
    } catch (_) {}
  }

  const existing = getStoredCrowdReports();
  setStoredCrowdReports([report, ...existing]);
  recordCooldown(normBus, normStop);

  return {
    success: true,
    message: `Thank you! Your ${normLevel.toUpperCase()} crowd report for Bus ${normBus} has been recorded.`,
    report,
  };
}

/**
 * Calculate community crowd intelligence algorithm
 * Low = 1, Medium = 2, High = 3
 * Thresholds: <= 1.5 => Low, > 1.5 and <= 2.5 => Medium, > 2.5 => High
 * Incorporates time-weighting (recent reports have higher influence)
 */
export function calculateCrowdIntelligence(reports) {
  if (!reports || reports.length === 0) {
    return {
      level: "unknown",
      label: "No Reports",
      averageScore: 0,
      reportCount: 0,
      confidence: "None",
      lastReportedAt: null,
      color: "gray",
      isEstimated: false,
    };
  }

  const now = Date.now();
  let totalWeightedScore = 0;
  let totalWeight = 0;

  reports.forEach((r) => {
    const baseScore = r.crowdLevel === "low" ? 1 : r.crowdLevel === "medium" ? 2 : 3;
    const reportAgeHours = (now - new Date(r.reportedAt).getTime()) / (1000 * 60 * 60);

    // Exponential recency decay: reports under 2 hours have full weight 1.0, older taper to 0.4
    const weight = Math.max(0.4, 1 / (1 + reportAgeHours * 0.15));
    totalWeightedScore += baseScore * weight;
    totalWeight += weight;
  });

  const averageScore = totalWeight > 0 ? Number((totalWeightedScore / totalWeight).toFixed(2)) : 2;

  let level = "medium";
  let label = "Medium";
  let color = "yellow";

  if (averageScore <= 1.5) {
    level = "low";
    label = "Low";
    color = "green";
  } else if (averageScore > 2.5) {
    level = "high";
    label = "High";
    color = "red";
  }

  const count = reports.length;
  const confidence = count >= 5 ? "High" : count >= 2 ? "Moderate" : "Low";
  const lastReportedAt = reports[0]?.reportedAt || null;

  return {
    level,
    label,
    averageScore,
    reportCount: count,
    confidence,
    lastReportedAt,
    color,
    isEstimated: true,
  };
}

/**
 * Get crowd reports for a specific route
 */
export async function getCrowdReports(routeIdentifier) {
  const all = getStoredCrowdReports();
  if (!routeIdentifier) return all;
  const idLower = routeIdentifier.toLowerCase();
  return all.filter(
    (r) =>
      r.routeId?.toLowerCase() === idLower ||
      r.busNumber?.toLowerCase() === idLower
  );
}

/**
 * Seed initial baseline demo reports if storage is completely empty
 */
export function initializeBaselineCrowdData() {
  if (typeof window === "undefined" || !window.localStorage) return;
  const existing = getStoredCrowdReports();
  if (existing.length > 0) return;

  const sampleReports = [
    {
      id: "CR-INIT-1",
      routeId: "R001",
      busNumber: "1A",
      routeName: "Tambaram – Broadway",
      stopLocation: "Guindy",
      crowdLevel: "high",
      notes: "Peak morning commuter rush, standing room only",
      reportedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      source: "community",
    },
    {
      id: "CR-INIT-2",
      routeId: "R001",
      busNumber: "1A",
      routeName: "Tambaram – Broadway",
      stopLocation: "Saidapet",
      crowdLevel: "high",
      notes: "Heavy boarding near Saidapet metro",
      reportedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      source: "community",
    },
    {
      id: "CR-INIT-3",
      routeId: "R002",
      busNumber: "M70",
      routeName: "Koyambedu – Velachery (Metro Feeder)",
      stopLocation: "Vadapalani",
      crowdLevel: "medium",
      notes: "Some seats available, front moderately crowded",
      reportedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      source: "community",
    },
    {
      id: "CR-INIT-4",
      routeId: "R003",
      busNumber: "5C",
      routeName: "T. Nagar – Adyar",
      stopLocation: "Mylapore",
      crowdLevel: "low",
      notes: "Comfortable seating throughout",
      reportedAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
      source: "community",
    },
    {
      id: "CR-INIT-5",
      routeId: "R005",
      busNumber: "21C",
      routeName: "Guindy – T. Nagar",
      stopLocation: "Little Mount",
      crowdLevel: "low",
      notes: "Few passengers at mid-day",
      reportedAt: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
      source: "community",
    },
  ];

  setStoredCrowdReports(sampleReports);
}
