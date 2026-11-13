import { demoRoutes } from "../data/demoRoutes.js";

const STORAGE_ALERTS_KEY = "busbridge_service_alerts";
const STORAGE_NOTIF_READS_KEY = "busbridge_notifications_read";
export const ALERTS_CHANGE_EVENT = "busbridge_alerts_changed";
export const NOTIFICATIONS_CHANGE_EVENT = "busbridge_notifications_changed";

export const ALERT_CATEGORIES = [
  { value: "bus_delay",          label: "Bus Delay",                     badgeColor: "bg-amber-100 text-amber-800 border-amber-300" },
  { value: "route_diversion",    label: "Route Diversion",               badgeColor: "bg-blue-100 text-blue-800 border-blue-300" },
  { value: "service_disruption", label: "Service Disruption",            badgeColor: "bg-red-100 text-red-800 border-red-300" },
  { value: "stop_change",        label: "Bus Stop Change",               badgeColor: "bg-purple-100 text-purple-800 border-purple-300" },
  { value: "cancellation",       label: "Route Cancellation",            badgeColor: "bg-rose-100 text-rose-800 border-rose-300" },
  { value: "announcement",       label: "General Service Announcement",  badgeColor: "bg-teal-100 text-teal-800 border-teal-300" },
];

export const ALERT_SEVERITIES = [
  { value: "low",    label: "Low Severity",    color: "bg-blue-50 text-blue-800 border-blue-200",     dot: "bg-blue-500",    score: 1 },
  { value: "medium", label: "Medium Severity", color: "bg-amber-50 text-amber-800 border-amber-200",  dot: "bg-amber-500",   score: 2 },
  { value: "high",   label: "High Severity",   color: "bg-red-50 text-red-800 border-red-200",       dot: "bg-red-500",     score: 3 },
];

function notifyAlertsChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ALERTS_CHANGE_EVENT));
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGE_EVENT));
  }
}

function notifyNotifsChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGE_EVENT));
  }
}

/**
 * Validates alert item structure
 */
export function isValidAlert(alert) {
  return Boolean(
    alert &&
    typeof alert === "object" &&
    typeof alert.id === "string" &&
    typeof alert.title === "string" &&
    alert.title.trim().length >= 4 &&
    typeof alert.description === "string" &&
    typeof alert.category === "string" &&
    typeof alert.severity === "string" &&
    Array.isArray(alert.affectedRoutes)
  );
}

/**
 * Retrieve alerts from localStorage (with baseline fallback & auto-expiry detection)
 */
export function getStoredAlerts() {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(STORAGE_ALERTS_KEY);
    if (!raw) {
      initializeBaselineAlerts();
      return JSON.parse(localStorage.getItem(STORAGE_ALERTS_KEY) || "[]");
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const now = Date.now();
    return parsed.filter(isValidAlert).map((alert) => {
      // Dynamic active calculation based on expiry date
      const isExpired = alert.expiresAt ? new Date(alert.expiresAt).getTime() < now : false;
      return {
        ...alert,
        status: isExpired ? "expired" : (alert.status || "active"),
        isActive: !isExpired && alert.status !== "inactive",
      };
    });
  } catch (err) {
    console.error("Error reading stored alerts, recovering:", err);
    return [];
  }
}

function setStoredAlerts(alerts) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const valid = alerts.filter(isValidAlert);
    localStorage.setItem(STORAGE_ALERTS_KEY, JSON.stringify(valid));
    notifyAlertsChange();
  } catch (err) {
    console.error("Failed to write alerts to storage:", err);
  }
}

/**
 * Notification Read State Tracking
 */
export function getReadNotificationIds() {
  if (typeof window === "undefined" || !window.localStorage) return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_NOTIF_READS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function markAlertAsRead(alertId) {
  if (!alertId || typeof window === "undefined" || !window.localStorage) return;
  const reads = getReadNotificationIds();
  reads.add(alertId);
  localStorage.setItem(STORAGE_NOTIF_READS_KEY, JSON.stringify(Array.from(reads)));
  notifyNotifsChange();
}

export function markAlertAsUnread(alertId) {
  if (!alertId || typeof window === "undefined" || !window.localStorage) return;
  const reads = getReadNotificationIds();
  reads.delete(alertId);
  localStorage.setItem(STORAGE_NOTIF_READS_KEY, JSON.stringify(Array.from(reads)));
  notifyNotifsChange();
}

export function markAllAlertsAsRead() {
  if (typeof window === "undefined" || !window.localStorage) return;
  const allAlerts = getStoredAlerts();
  const allIds = allAlerts.map((a) => a.id);
  localStorage.setItem(STORAGE_NOTIF_READS_KEY, JSON.stringify(allIds));
  notifyNotifsChange();
}

export function clearNotificationHistory() {
  if (typeof window === "undefined" || !window.localStorage) return;
  const allAlerts = getStoredAlerts();
  // Mark all as read so unread badge clears
  const allIds = allAlerts.map((a) => a.id);
  localStorage.setItem(STORAGE_NOTIF_READS_KEY, JSON.stringify(allIds));
  notifyNotifsChange();
  return { success: true, message: "Notification history cleared." };
}

/**
 * Match alerts against a user's saved routes / journeys
 */
export function getPersonalizedAlerts(savedJourneys) {
  const allAlerts = getStoredAlerts().filter((a) => a.isActive);
  if (!savedJourneys || savedJourneys.length === 0) return [];

  // Extract all bus numbers from saved routes
  const userBusNumbers = new Set();
  const userStops = new Set();

  savedJourneys.forEach((sj) => {
    // Bus number(s)
    if (sj.busNumber) {
      sj.busNumber.split("+").forEach((b) => userBusNumbers.add(b.trim().toLowerCase()));
    }
    if (Array.isArray(sj.legs)) {
      sj.legs.forEach((l) => {
        if (l.busNumber) userBusNumbers.add(l.busNumber.trim().toLowerCase());
        if (l.boardStopName) userStops.add(l.boardStopName.trim().toLowerCase());
        if (l.alightStopName) userStops.add(l.alightStopName.trim().toLowerCase());
      });
    }
    if (sj.from) userStops.add(sj.from.trim().toLowerCase());
    if (sj.to) userStops.add(sj.to.trim().toLowerCase());
  });

  return allAlerts.filter((alert) => {
    // Check if any affected route matches
    const routeMatch = alert.affectedRoutes?.some((ar) =>
      userBusNumbers.has(ar.trim().toLowerCase())
    );
    // Check if any affected stop matches
    const stopMatch = alert.affectedStops?.some((as) =>
      userStops.has(as.trim().toLowerCase())
    );
    return routeMatch || stopMatch;
  });
}

/**
 * Compute total unread personalized alerts count
 */
export function getUnreadAlertCount(savedJourneys = []) {
  const reads = getReadNotificationIds();
  const relevant = savedJourneys.length > 0 ? getPersonalizedAlerts(savedJourneys) : getStoredAlerts().filter((a) => a.isActive);
  return relevant.filter((a) => !reads.has(a.id)).length;
}

/**
 * CRUD: Create a new service alert (Demo / Admin workflow)
 */
export function createServiceAlert({
  title,
  description,
  category,
  severity,
  affectedRoutes,
  affectedStops,
  expiresAt,
}) {
  const normTitle = (title || "").trim();
  const normDesc = (description || "").trim();
  const normCat = (category || "").trim();
  const normSev = (severity || "medium").trim().toLowerCase();

  if (!normTitle || normTitle.length < 4) {
    return { success: false, message: "Alert title must be at least 4 characters long." };
  }
  if (!normDesc || normDesc.length < 8) {
    return { success: false, message: "Alert description must be at least 8 characters long." };
  }
  if (!normCat || !ALERT_CATEGORIES.some((c) => c.value === normCat)) {
    return { success: false, message: "Please select a valid alert category." };
  }
  if (!Array.isArray(affectedRoutes) || affectedRoutes.length === 0) {
    return { success: false, message: "Please specify at least one affected bus route number." };
  }

  // Validate expiry date if provided
  if (expiresAt) {
    const expTime = new Date(expiresAt).getTime();
    if (isNaN(expTime) || expTime < Date.now()) {
      return { success: false, message: "Expiry date must be in the future." };
    }
  }

  const now = new Date().toISOString();
  const newAlert = {
    id: `ALERT-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    title: normTitle,
    description: normDesc,
    category: normCat,
    severity: normSev,
    affectedRoutes: affectedRoutes.map((r) => r.trim().toUpperCase()),
    affectedStops: Array.isArray(affectedStops) ? affectedStops.map((s) => s.trim()) : [],
    createdAt: now,
    expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    status: "active",
    isActive: true,
  };

  const existing = getStoredAlerts();
  setStoredAlerts([newAlert, ...existing]);

  return {
    success: true,
    message: `Alert "${newAlert.title}" published successfully (Demo Data).`,
    alert: newAlert,
  };
}

/**
 * CRUD: Update an existing service alert
 */
export function updateServiceAlert(alertId, updates) {
  if (!alertId) return { success: false, message: "Alert ID required." };
  const existing = getStoredAlerts();
  const idx = existing.findIndex((a) => a.id === alertId);
  if (idx === -1) return { success: false, message: "Alert not found." };

  const current = existing[idx];
  const updated = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  existing[idx] = updated;
  setStoredAlerts([...existing]);

  return {
    success: true,
    message: `Alert ${alertId} updated successfully.`,
    alert: updated,
  };
}

/**
 * CRUD: Delete a service alert
 */
export function deleteServiceAlert(alertId) {
  if (!alertId) return { success: false };
  const existing = getStoredAlerts();
  const updated = existing.filter((a) => a.id !== alertId);
  setStoredAlerts(updated);

  // Clean read state
  const reads = getReadNotificationIds();
  reads.delete(alertId);
  localStorage.setItem(STORAGE_NOTIF_READS_KEY, JSON.stringify(Array.from(reads)));
  notifyNotifsChange();

  return { success: true, message: "Alert removed." };
}

/**
 * Toggle active / expired state
 */
export function toggleAlertActiveStatus(alertId) {
  const existing = getStoredAlerts();
  const target = existing.find((a) => a.id === alertId);
  if (!target) return { success: false };

  const newStatus = target.status === "active" ? "inactive" : "active";
  return updateServiceAlert(alertId, {
    status: newStatus,
    isActive: newStatus === "active",
  });
}

/**
 * Baseline alerts initializer
 */
export function initializeBaselineAlerts() {
  if (typeof window === "undefined" || !window.localStorage) return;
  const existingRaw = localStorage.getItem(STORAGE_ALERTS_KEY);
  if (existingRaw) return;

  const baseline = [
    {
      id: "ALERT-MTC-001",
      title: "Major Road Diversion on Anna Salai (Saidapet)",
      description: "Cathedral Road diversion in effect for Routes 15B, 27C, and 47A due to Saidapet flyover surface resurfacing. Commuters are advised to expect 15–20 min extra travel time.",
      category: "route_diversion",
      severity: "high",
      affectedRoutes: ["15B", "27C", "47A"],
      affectedStops: ["Saidapet", "Little Mount", "Guindy"],
      createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      status: "active",
      isActive: true,
    },
    {
      id: "ALERT-MTC-002",
      title: "Weekend Service Cancellation – Route 19H",
      description: "Route 19H (Tambaram to Velachery) is suspended for scheduled depot maintenance on Saturday and Sunday. Alternative recommendation: Take Route 108 to Guindy, transfer to Route 21E.",
      category: "cancellation",
      severity: "high",
      affectedRoutes: ["19H"],
      affectedStops: ["Tambaram Bus Terminus", "Medavakkam", "Velachery"],
      createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
      status: "active",
      isActive: true,
    },
    {
      id: "ALERT-MTC-003",
      title: "Peak Hour Congestion Delays – Koyambedu CMBT",
      description: "Severe traffic bottleneck on 100 Feet Road is delaying buses originating from CMBT towards Broadway and T. Nagar by approx 20 mins during 8–11 AM and 5–8 PM.",
      category: "bus_delay",
      severity: "medium",
      affectedRoutes: ["1A", "70", "M70", "52B"],
      affectedStops: ["Koyambedu CMBT", "Arumbakkam", "Vadapalani"],
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      status: "active",
      isActive: true,
    },
    {
      id: "ALERT-MTC-004",
      title: "Tambaram Terminus Platform Renovation – Boarding Point Shift",
      description: "Bay 2 boarding point temporarily shifted to Platform 4 (near railway bridge) for Routes 1A and 108 due to roof restoration.",
      category: "stop_change",
      severity: "low",
      affectedRoutes: ["1A", "108"],
      affectedStops: ["Tambaram Bus Terminus"],
      createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 120 * 3600 * 1000).toISOString(),
      status: "active",
      isActive: true,
    },
    {
      id: "ALERT-MTC-005",
      title: "Special Festival Night Shuttle Service Announced",
      description: "MTC to operate 25 additional overnight shuttle trips on key trunk corridors (Routes 1A, 5C, 70, 108) with departures every 15 minutes till 1:00 AM.",
      category: "announcement",
      severity: "low",
      affectedRoutes: ["1A", "5C", "70", "108"],
      affectedStops: ["Broadway", "T. Nagar Bus Stand", "Chennai Central"],
      createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      status: "active",
      isActive: true,
    },
  ];

  localStorage.setItem(STORAGE_ALERTS_KEY, JSON.stringify(baseline));
}
