import supabase from "./supabaseClient";
const STORAGE_KEY = "busbridge_crowd_reports";

export const CROWD_LEVELS = [
  { value: "low",       label: "Low",       colour: "green",  description: "Seats available, comfortable journey" },
  { value: "medium",    label: "Medium",    colour: "yellow", description: "Some standing passengers" },
  { value: "high",      label: "High",      colour: "orange", description: "Crowded, limited standing space" },
  { value: "very_high", label: "Very High", colour: "red",    description: "Extremely crowded, difficulty boarding" },
];

function getStoredReports() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

export async function submitCrowdReport({ routeId, busNumber, crowdLevel, notes }) {
  const report = { id: `CR${Date.now()}`, routeId, busNumber, crowdLevel, notes: notes || "", reportedAt: new Date().toISOString(), source: "community" };
  if (supabase) {
    try { const { error } = await supabase.from("crowd_reports").insert([report]); if (!error) return { success: true, report }; } catch (_) {}
  }
  const reports = getStoredReports();
  reports.unshift(report);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports.slice(0, 50)));
  return { success: true, report };
}

export async function getCrowdReports(routeId) {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("crowd_reports").select("*").eq("routeId", routeId).order("reportedAt", { ascending: false }).limit(10);
      if (!error && data) return data;
    } catch (_) {}
  }
  return getStoredReports().filter((r) => !routeId || r.routeId === routeId);
}

export function getAllCrowdReports() { return getStoredReports(); }
