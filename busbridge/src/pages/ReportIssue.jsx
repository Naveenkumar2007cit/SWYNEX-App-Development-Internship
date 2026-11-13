import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  AlertOctagon,
  Send,
  CheckCircle,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  FileText,
  UserCheck,
  ChevronDown,
  Trash2,
  X,
  PlusCircle,
  HelpCircle,
  MapPin,
  Bus,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { getAllRoutes } from "../services/routeService.js";
import {
  submitIssueReport,
  getStoredIssues,
  updateIssueStatus,
  deleteIssueReport,
  initializeBaselineIssues,
  ISSUE_CATEGORIES,
  ISSUE_STATUSES,
  ISSUE_CHANGE_EVENT,
} from "../services/reportService.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function ReportIssue() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const routes = useMemo(() => getAllRoutes(), []);

  // Form input states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [busNumber, setBusNumber] = useState(searchParams.get("bus") || "");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Dashboard / Tracking states
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest"); // 'newest' | 'oldest'

  // Modal / Detail state
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [adminFeedback, setAdminFeedback] = useState(null);

  const reloadIssues = () => {
    initializeBaselineIssues();
    const stored = getStoredIssues();
    setIssues(stored);
    setLoading(false);
  };

  useEffect(() => {
    reloadIssues();

    const handleUpdate = () => {
      reloadIssues();
    };

    window.addEventListener(ISSUE_CHANGE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(ISSUE_CHANGE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Sync selected issue if list updates
  useEffect(() => {
    if (selectedIssue) {
      const refreshed = issues.find((i) => i.id === selectedIssue.id);
      if (refreshed) setSelectedIssue(refreshed);
    }
  }, [issues]);

  const validateForm = () => {
    const errors = {};
    if (!title.trim()) {
      errors.title = "Issue title is required.";
    } else if (title.trim().length < 4 || title.trim().length > 80) {
      errors.title = "Title must be between 4 and 80 characters.";
    }

    if (!category) {
      errors.category = "Please select an issue category.";
    }

    if (!busNumber.trim()) {
      errors.busNumber = "Bus number is required.";
    }

    if (!location.trim()) {
      errors.location = "Please provide the bus stop or incident location.";
    }

    if (!description.trim()) {
      errors.description = "Please describe the problem.";
    } else if (description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters long.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitSuccess(null);

    const result = await submitIssueReport({
      title,
      category,
      busNumber,
      location,
      description,
    });

    if (result.success) {
      setSubmitSuccess(result.report);
      // Reset form
      setTitle("");
      setCategory("");
      setBusNumber("");
      setLocation("");
      setDescription("");
      setFormErrors({});
      reloadIssues();
    } else {
      setFormErrors({ general: result.message });
    }

    setSubmitting(false);
  };

  // Filtered and sorted issue list
  const filteredIssues = useMemo(() => {
    let list = [...issues];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.busNumber.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      list = list.filter((i) => i.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      list = list.filter((i) => i.status === statusFilter);
    }

    // Sort order
    list.sort((a, b) => {
      const timeA = new Date(a.reportedAt).getTime();
      const timeB = new Date(b.reportedAt).getTime();
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });

    return list;
  }, [issues, searchQuery, categoryFilter, statusFilter, sortOrder]);

  // Demo Admin status transition handler
  const handleAdminStatusChange = (newStatus) => {
    if (!selectedIssue) return;
    const res = updateIssueStatus(selectedIssue.id, newStatus, adminNote);
    if (res.success) {
      setAdminFeedback({ type: "success", message: res.message });
      setAdminNote("");
      reloadIssues();
    } else {
      setAdminFeedback({ type: "error", message: res.message });
    }
    setTimeout(() => setAdminFeedback(null), 3500);
  };

  const handleDeleteIssue = (id, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove issue report ${id}?`)) {
      deleteIssueReport(id);
      if (selectedIssue?.id === id) setSelectedIssue(null);
      reloadIssues();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="bg-red-500 text-white p-2 rounded-xl shadow-sm">
            <AlertOctagon className="h-5 w-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900">
            Community Issue Reporting & Tracking
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500">
          Report Chennai transit breakdowns, delays, overcrowding & track resolution status
        </p>
      </div>

      {/* Demo Workflow Disclaimer Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
        <div className="font-semibold flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 text-amber-600" />
          <span>Demo Community System</span>
        </div>
        <p className="opacity-90 leading-relaxed">
          Reports are stored in your browser's persistent localStorage. The interactive status workflow (Pending ➔ Under Review ➔ Resolved) allows testing end-to-end community tracking. Reports are <strong>not directly transmitted to MTC authorities</strong>.
        </p>
      </div>

      {/* Success Notification Banner after submission */}
      {submitSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-emerald-900 space-y-2 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>Report #{submitSuccess.id} Submitted Successfully!</span>
            </div>
            <button
              onClick={() => setSubmitSuccess(null)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-emerald-800">
            Your issue has been recorded under status: <strong>Pending</strong>. You can track its history in the Community Reports section below.
          </p>
        </div>
      )}

      {/* Submission Form */}
      <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-5 sm:p-6 space-y-4">
        <div className="border-b border-gray-100 pb-2">
          <h2 className="font-bold text-gray-900 text-sm sm:text-base">
            Report a Bus Service Issue
          </h2>
          <p className="text-xs text-gray-400">
            All fields marked with an asterisk (*) are required.
          </p>
        </div>

        {formErrors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl">
            {formErrors.general}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Issue Title */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Issue Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bus 1A delayed 40 minutes at Tambaram"
              className={`w-full border rounded-xl px-3 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-100 ${
                formErrors.title ? "border-red-400 bg-red-50/30" : "border-gray-200"
              }`}
            />
            {formErrors.title && (
              <p className="text-[11px] text-red-600 mt-1">{formErrors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category Selector */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Category *
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2.5 text-xs sm:text-sm text-gray-800 bg-white outline-none focus:border-teal-500 ${
                    formErrors.category ? "border-red-400 bg-red-50/30" : "border-gray-200"
                  }`}
                >
                  <option value="">-- Select Category --</option>
                  {ISSUE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {formErrors.category && (
                <p className="text-[11px] text-red-600 mt-1">{formErrors.category}</p>
              )}
            </div>

            {/* Bus Number */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Bus Route Number *
              </label>
              <input
                type="text"
                value={busNumber}
                onChange={(e) => setBusNumber(e.target.value)}
                placeholder="e.g. 1A, M70, 5C, 108"
                className={`w-full border rounded-xl px-3 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-teal-500 ${
                  formErrors.busNumber ? "border-red-400 bg-red-50/30" : "border-gray-200"
                }`}
              />
              {formErrors.busNumber && (
                <p className="text-[11px] text-red-600 mt-1">{formErrors.busNumber}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Bus Stop or Location *
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Guindy Bus Depot, Saidapet, Koyambedu CMBT"
              className={`w-full border rounded-xl px-3 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-teal-500 ${
                formErrors.location ? "border-red-400 bg-red-50/30" : "border-gray-200"
              }`}
            />
            {formErrors.location && (
              <p className="text-[11px] text-red-600 mt-1">{formErrors.location}</p>
            )}
          </div>

          {/* Detailed Description */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Detailed Description * (min 10 characters)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={800}
              placeholder="Provide specific details about what happened, time of incident, bus direction, etc."
              className={`w-full border rounded-xl p-3 text-xs sm:text-sm text-gray-800 outline-none focus:border-teal-500 resize-none ${
                formErrors.description ? "border-red-400 bg-red-50/30" : "border-gray-200"
              }`}
            />
            <div className="flex justify-between text-[11px] text-gray-400 mt-1">
              <span>{formErrors.description && <span className="text-red-600">{formErrors.description}</span>}</span>
              <span>{description.length}/800</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Send className="h-4 w-4" />
            {submitting ? "Submitting Issue..." : "Submit Issue Report"}
          </button>
        </form>
      </div>

      {/* Community Reports Dashboard */}
      <div className="space-y-4">
        {/* Search, Filter, Sort Toolbar */}
        <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-sm sm:text-base">
              Community Reports & Tracking
            </h2>
            <span className="text-xs bg-navy-100 text-navy-800 font-semibold px-2.5 py-1 rounded-full">
              {issues.length} Total Reports
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by title, bus route (e.g. 1A), or location..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-gray-800 outline-none focus:border-teal-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter by Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-gray-100">
            {/* Category */}
            <div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">
                Category
              </span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-teal-500"
              >
                <option value="all">All Categories</option>
                {ISSUE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">
                Status
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-teal-500"
              >
                <option value="all">All Statuses</option>
                {ISSUE_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort order */}
            <div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">
                Sort
              </span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-teal-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Listing */}
        {loading ? (
          <LoadingSpinner text="Loading community issue reports..." />
        ) : filteredIssues.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center space-y-2">
            <div className="text-3xl">📝</div>
            <h3 className="font-bold text-gray-800 text-sm">
              No matching issue reports found
            </h3>
            <p className="text-xs text-gray-400">
              No reports match your current search query or filter settings.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIssues.map((issue) => {
              const statusCfg =
                ISSUE_STATUSES.find((s) => s.value === issue.status) ||
                ISSUE_STATUSES[0];
              const categoryLabel =
                ISSUE_CATEGORIES.find((c) => c.value === issue.category)?.label ||
                issue.category;

              return (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className="bg-white rounded-2xl shadow-card hover:shadow-card-hover border border-gray-100 p-4 sm:p-5 transition-all cursor-pointer group space-y-3"
                >
                  {/* Card Header: Category + Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-navy-800 text-white font-bold text-xs px-2.5 py-1 rounded-xl shadow-sm">
                        Bus {issue.busNumber}
                      </span>
                      <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                        {categoryLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusCfg.color} flex items-center gap-1.5`}
                      >
                        <span className={`h-2 w-2 rounded-full ${statusCfg.dot}`} />
                        <span>{statusCfg.label}</span>
                      </span>

                      <button
                        onClick={(e) => handleDeleteIssue(issue.id, e)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete report"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-navy-900">
                      {issue.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                      {issue.description}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-50 gap-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-teal-600 flex-shrink-0" />
                      <span className="text-gray-600 font-medium">{issue.location}</span>
                      <span className="mx-1">•</span>
                      <span>ID: {issue.id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-teal-600 font-semibold group-hover:underline">
                      <span>View Timeline & Manage →</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Issue Details Modal with Status Management Workflow */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 space-y-5 animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-navy-800 text-white font-bold text-xs px-2.5 py-1 rounded-xl">
                    Bus {selectedIssue.busNumber}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    ID: {selectedIssue.id}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-navy-900 mt-1">
                  {selectedIssue.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Admin Feedback Banner */}
            {adminFeedback && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                  adminFeedback.type === "success"
                    ? "bg-teal-50 border-teal-200 text-teal-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span>{adminFeedback.message}</span>
              </div>
            )}

            {/* Key Information */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div>
                <span className="text-gray-400 block font-semibold uppercase text-[10px]">
                  Category
                </span>
                <span className="font-semibold text-gray-800">
                  {ISSUE_CATEGORIES.find((c) => c.value === selectedIssue.category)?.label ||
                    selectedIssue.category}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold uppercase text-[10px]">
                  Incident Location
                </span>
                <span className="font-semibold text-gray-800">
                  {selectedIssue.location}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-gray-200/60 mt-1">
                <span className="text-gray-400 block font-semibold uppercase text-[10px]">
                  Reported Timestamp
                </span>
                <span className="text-gray-600">
                  {new Date(selectedIssue.reportedAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Detailed Passenger Description
              </h4>
              <p className="text-xs sm:text-sm text-gray-700 bg-white border border-gray-200 rounded-xl p-3 leading-relaxed">
                {selectedIssue.description}
              </p>
            </div>

            {/* Status History Timeline */}
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-navy-700" />
                <span>Status History & Audit Timeline</span>
              </h4>
              <div className="space-y-2 border-l-2 border-navy-200 ml-2 pl-3">
                {(selectedIssue.timeline || []).map((t, idx) => {
                  const sCfg =
                    ISSUE_STATUSES.find((s) => s.value === t.status) ||
                    ISSUE_STATUSES[0];
                  return (
                    <div key={idx} className="relative pb-2">
                      <div className={`absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full ${sCfg.dot} ring-2 ring-white`} />
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-gray-800 capitalize">
                          {sCfg.label}
                        </span>
                        <span className="text-gray-400">
                          {new Date(t.timestamp).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">{t.note}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">By: {t.author}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Demo / Admin Workflow Status Controls */}
            <div className="bg-navy-50 border border-navy-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5 text-teal-600" />
                  <span>Demo Admin Status Transition</span>
                </span>
                <span className="text-[10px] bg-white border border-navy-200 text-navy-700 px-2 py-0.5 rounded-md font-semibold">
                  Prototype Workflow
                </span>
              </div>

              <div>
                <label className="text-[11px] text-gray-600 block mb-1">
                  Internal update note (optional)
                </label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="e.g. Assigned to depot crew, or verified fixed."
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {ISSUE_STATUSES.map((statusOption) => {
                  const isCurrent = selectedIssue.status === statusOption.value;
                  return (
                    <button
                      key={statusOption.value}
                      type="button"
                      disabled={isCurrent}
                      onClick={() => handleAdminStatusChange(statusOption.value)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${
                        isCurrent
                          ? "bg-navy-800 text-white cursor-default shadow-sm"
                          : "bg-white hover:bg-navy-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {isCurrent ? `✓ ${statusOption.label}` : `Set ${statusOption.label}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedIssue(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
