import supabase from "./supabaseClient";
const STORAGE_KEY = "busbridge_issue_reports";

export const ISSUE_CATEGORIES = [
  { value: "delayed",         label: "Delayed Bus" },
  { value: "cancelled",       label: "Cancelled Bus" },
  { value: "overcrowding",    label: "Overcrowding" },
  { value: "not_stopping",    label: "Bus Not Stopping" },
  { value: "route_deviation", label: "Route Deviation" },
  { value: "other",           label: "Other Issue" },
];

export async function submitIssueReport({ busNumber, category, description, routeId }) {
  if (!busNumber || !category) return { success: false, error: "Bus number and issue category are required." };
  const report = { id: `IR${Date.now()}`, busNumber, category, description: description || "", routeId: routeId || null, reportedAt: new Date().toISOString(), status: "submitted" };
  if (supabase) {
    try { const { error } = await supabase.from("issue_reports").insert([report]); if (!error) return { success: true, report }; } catch (_) {}
  }
  const reports = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  reports.unshift(report);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports.slice(0, 100)));
  return { success: true, report };
}

export function getIssueReports() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
