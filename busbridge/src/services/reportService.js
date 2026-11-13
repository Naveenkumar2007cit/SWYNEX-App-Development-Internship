import supabase from "./supabaseClient.js";
import { demoRoutes } from "../data/demoRoutes.js";

const STORAGE_KEY = "busbridge_issue_reports";
export const ISSUE_CHANGE_EVENT = "busbridge_issue_changed";

export const ISSUE_CATEGORIES = [
  { value: "delayed",            label: "Bus Delayed",              desc: "Bus arrived significantly behind schedule" },
  { value: "bus_not_arriving",   label: "Bus Not Arriving / Skipped", desc: "Scheduled service missed or did not show up" },
  { value: "overcrowding",       label: "Extreme Overcrowding",      desc: "Unable to board due to unsafe passenger density" },
  { value: "breakdown",          label: "Bus Breakdown",             desc: "Mechanical failure or vehicle stopped en route" },
  { value: "incorrect_route",    label: "Incorrect Route Info",      desc: "Bus diverted without notice or board mismatch" },
  { value: "stop_problem",       label: "Bus Stop Problem",          desc: "Shelter damaged, sign missing, or stop obstructed" },
  { value: "other",              label: "Other Service Issue",       desc: "Staff behavior, ticketing issue, or general feedback" },
];

export const ISSUE_STATUSES = [
  { value: "pending",      label: "Pending",      color: "bg-amber-100 text-amber-800 border-amber-300", dot: "bg-amber-500" },
  { value: "under_review", label: "Under Review", color: "bg-blue-100 text-blue-800 border-blue-300",   dot: "bg-blue-500" },
  { value: "resolved",     label: "Resolved",     color: "bg-emerald-100 text-emerald-800 border-emerald-300", dot: "bg-emerald-500" },
  { value: "rejected",     label: "Rejected",     color: "bg-red-100 text-red-800 border-red-300",       dot: "bg-red-500" },
];

function notifyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ISSUE_CHANGE_EVENT));
  }
}

/**
 * Validate issue report object schema
 */
export function isValidIssueReport(item) {
  return Boolean(
    item &&
    typeof item === "object" &&
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    item.title.trim().length >= 3 &&
    typeof item.busNumber === "string" &&
    item.busNumber.trim() !== "" &&
    typeof item.category === "string" &&
    typeof item.status === "string" &&
    typeof item.reportedAt === "string"
  );
}

/**
 * Read stored issue reports from localStorage safely
 */
export function getStoredIssues() {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidIssueReport);
  } catch (err) {
    console.error("Failed to read issue reports from storage:", err);
    return [];
  }
}

function setStoredIssues(issues) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const valid = issues.filter(isValidIssueReport);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valid.slice(0, 200)));
    notifyChange();
  } catch (err) {
    console.error("Failed to write issue reports to storage:", err);
  }
}

/**
 * Submit a new community issue report with complete validation
 */
export async function submitIssueReport({
  title,
  category,
  busNumber,
  location,
  description,
  routeId,
  imageAttachment,
}) {
  const normTitle = (title || "").trim();
  const normCategory = (category || "").trim();
  const normBus = (busNumber || "").trim();
  const normLocation = (location || "").trim();
  const normDesc = (description || "").trim();

  // Field Validations
  if (!normTitle) {
    return { success: false, errorField: "title", message: "Please provide a concise issue title." };
  }
  if (normTitle.length < 4 || normTitle.length > 80) {
    return { success: false, errorField: "title", message: "Title must be between 4 and 80 characters." };
  }

  if (!normCategory) {
    return { success: false, errorField: "category", message: "Please select an issue category." };
  }
  if (!ISSUE_CATEGORIES.some((c) => c.value === normCategory)) {
    return { success: false, errorField: "category", message: "Invalid issue category selected." };
  }

  if (!normBus) {
    return { success: false, errorField: "busNumber", message: "Please enter or select a bus route number." };
  }

  if (!normLocation) {
    return { success: false, errorField: "location", message: "Please specify the bus stop or incident location." };
  }

  if (!normDesc || normDesc.length < 10) {
    return { success: false, errorField: "description", message: "Please provide at least 10 characters describing the problem." };
  }
  if (normDesc.length > 800) {
    return { success: false, errorField: "description", message: "Description cannot exceed 800 characters." };
  }

  const now = new Date().toISOString();
  const uniqueId = `ISSUE-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newReport = {
    id: uniqueId,
    title: normTitle,
    category: normCategory,
    busNumber: normBus,
    location: normLocation,
    description: normDesc,
    routeId: routeId || null,
    imageAttachment: imageAttachment || null,
    status: "pending",
    reportedAt: now,
    updatedAt: now,
    timeline: [
      {
        status: "pending",
        note: "Issue report submitted by passenger.",
        timestamp: now,
        author: "Passenger (Community)",
      },
    ],
  };

  // Optional Supabase submission
  if (supabase) {
    try {
      await supabase.from("issue_reports").insert([newReport]);
    } catch (_) {}
  }

  const existing = getStoredIssues();
  setStoredIssues([newReport, ...existing]);

  return {
    success: true,
    message: `Issue report ${uniqueId} submitted successfully.`,
    report: newReport,
  };
}

/**
 * Demo / Admin Status Management Workflow
 * Records status transitions in chronological timeline
 */
export function updateIssueStatus(issueId, newStatus, note = "") {
  const normStatus = (newStatus || "").trim().toLowerCase();
  const validStatus = ISSUE_STATUSES.find((s) => s.value === normStatus);

  if (!validStatus) {
    return { success: false, message: `Invalid status: ${newStatus}` };
  }

  const existing = getStoredIssues();
  const targetIndex = existing.findIndex((i) => i.id === issueId);

  if (targetIndex === -1) {
    return { success: false, message: "Issue report not found." };
  }

  const current = existing[targetIndex];
  if (current.status === normStatus) {
    return { success: false, message: `Issue is already in ${validStatus.label} status.` };
  }

  const now = new Date().toISOString();
  const timelineEntry = {
    status: normStatus,
    note: note || `Status updated to ${validStatus.label} (Demo/Admin Workflow).`,
    timestamp: now,
    author: "Transit Admin (Demo Workflow)",
  };

  const updatedIssue = {
    ...current,
    status: normStatus,
    updatedAt: now,
    timeline: [timelineEntry, ...(current.timeline || [])],
  };

  existing[targetIndex] = updatedIssue;
  setStoredIssues([...existing]);

  return {
    success: true,
    message: `Status updated to "${validStatus.label}".`,
    issue: updatedIssue,
  };
}

/**
 * Delete an issue report
 */
export function deleteIssueReport(issueId) {
  if (!issueId) return { success: false };
  const existing = getStoredIssues();
  const updated = existing.filter((i) => i.id !== issueId);
  setStoredIssues(updated);
  return { success: true, message: "Issue report removed." };
}

/**
 * Seed baseline sample issues if storage is completely empty
 */
export function initializeBaselineIssues() {
  if (typeof window === "undefined" || !window.localStorage) return;
  const existing = getStoredIssues();
  if (existing.length > 0) return;

  const sampleIssues = [
    {
      id: "ISSUE-MTC-001",
      title: "Bus 1A 40-minute delay during morning peak",
      category: "delayed",
      busNumber: "1A",
      location: "Tambaram Bus Terminus",
      description: "Waited at platform 2 from 8:15 AM to 8:55 AM without any departure. Two consecutive scheduled trips missed.",
      status: "under_review",
      reportedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      timeline: [
        {
          status: "under_review",
          note: "Noted by terminal supervisor. Investigating depot scheduling.",
          timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
          author: "Depot Supervisor (Demo)",
        },
        {
          status: "pending",
          note: "Issue report submitted by commuter.",
          timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
          author: "Commuter",
        },
      ],
    },
    {
      id: "ISSUE-MTC-002",
      title: "Bus stop sign missing at Saidapet metro junction",
      category: "stop_problem",
      busNumber: "5C",
      location: "Saidapet",
      description: "The official route board for 5C was knocked over during road maintenance work. New commuters cannot find where to wait.",
      status: "resolved",
      reportedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      timeline: [
        {
          status: "resolved",
          note: "Signboard restored and fixed securely.",
          timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
          author: "Maintenance Team (Demo)",
        },
        {
          status: "pending",
          note: "Report submitted.",
          timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          author: "Passenger",
        },
      ],
    },
    {
      id: "ISSUE-MTC-003",
      title: "Dangerous overcrowding near front footboard",
      category: "overcrowding",
      busNumber: "108",
      location: "Porur",
      description: "Passengers clinging to doors while bus moving fast along highway. Needs an extra peak-hour shuttle.",
      status: "pending",
      reportedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      timeline: [
        {
          status: "pending",
          note: "Report recorded from daily commuter.",
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          author: "Student Commuter",
        },
      ],
    },
  ];

  setStoredIssues(sampleIssues);
}

// Backwards compatibility alias
export const getIssueReports = getStoredIssues;
