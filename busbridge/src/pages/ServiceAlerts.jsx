import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Filter,
  ArrowUpDown,
  CheckCheck,
  AlertTriangle,
  Clock,
  PlusCircle,
  X,
  Trash2,
  Calendar,
  Bus,
  MapPin,
  CheckCircle2,
  ShieldAlert,
  Star,
  Settings,
  AlertOctagon,
  RefreshCw,
} from "lucide-react";
import {
  getStoredAlerts,
  getReadNotificationIds,
  markAlertAsRead,
  markAlertAsUnread,
  markAllAlertsAsRead,
  clearNotificationHistory,
  getPersonalizedAlerts,
  createServiceAlert,
  updateServiceAlert,
  deleteServiceAlert,
  toggleAlertActiveStatus,
  initializeBaselineAlerts,
  ALERT_CATEGORIES,
  ALERT_SEVERITIES,
  ALERTS_CHANGE_EVENT,
  NOTIFICATIONS_CHANGE_EVENT,
} from "../services/alertService.js";
import { getLocalSaved } from "../services/savedRoutesService.js";
import { getAllRoutes } from "../services/routeService.js";
import AlertCard from "../components/AlertCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function ServiceAlerts() {
  const navigate = useNavigate();
  const routes = useMemo(() => getAllRoutes(), []);

  // Alerts & Notification states
  const [alerts, setAlerts] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const [savedJourneys, setSavedJourneys] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusTab, setStatusTab] = useState("active"); // 'active' | 'personalized' | 'expired' | 'all'
  const [sortOrder, setSortOrder] = useState("newest"); // 'newest' | 'highest_severity'

  // Admin / Demo Create Form State
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("route_diversion");
  const [newSeverity, setNewSeverity] = useState("medium");
  const [selectedRouteInput, setSelectedRouteInput] = useState("");
  const [affectedRoutesList, setAffectedRoutesList] = useState(["1A"]);
  const [expiryDays, setExpiryDays] = useState(3);
  const [formFeedback, setFormFeedback] = useState(null);

  // Clear confirmation
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const loadData = () => {
    initializeBaselineAlerts();
    setAlerts(getStoredAlerts());
    setReadIds(getReadNotificationIds());
    setSavedJourneys(getLocalSaved());
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener(ALERTS_CHANGE_EVENT, handleUpdate);
    window.addEventListener(NOTIFICATIONS_CHANGE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(ALERTS_CHANGE_EVENT, handleUpdate);
      window.removeEventListener(NOTIFICATIONS_CHANGE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Personalized alerts calculation
  const personalizedAlertList = useMemo(() => {
    return getPersonalizedAlerts(savedJourneys);
  }, [alerts, savedJourneys]);

  const personalizedAlertIds = useMemo(() => {
    return new Set(personalizedAlertList.map((a) => a.id));
  }, [personalizedAlertList]);

  // Unread count
  const unreadCount = useMemo(() => {
    return alerts.filter((a) => a.isActive && !readIds.has(a.id)).length;
  }, [alerts, readIds]);

  // Filtered & Sorted alerts
  const processedAlerts = useMemo(() => {
    let list = [...alerts];

    // Status Tab filtering
    if (statusTab === "active") {
      list = list.filter((a) => a.isActive);
    } else if (statusTab === "personalized") {
      list = list.filter((a) => a.isActive && personalizedAlertIds.has(a.id));
    } else if (statusTab === "expired") {
      list = list.filter((a) => !a.isActive || a.status === "expired");
    }

    // Text Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((a) => {
        const titleMatch = a.title.toLowerCase().includes(q);
        const descMatch = (a.description || a.message || "").toLowerCase().includes(q);
        const routeMatch = a.affectedRoutes?.some((r) => r.toLowerCase().includes(q));
        const stopMatch = a.affectedStops?.some((s) => s.toLowerCase().includes(q));
        return titleMatch || descMatch || routeMatch || stopMatch;
      });
    }

    // Category filter
    if (categoryFilter !== "all") {
      list = list.filter((a) => a.category === categoryFilter);
    }

    // Severity filter
    if (severityFilter !== "all") {
      list = list.filter((a) => a.severity.toLowerCase() === severityFilter.toLowerCase());
    }

    // Sorting
    list.sort((a, b) => {
      if (sortOrder === "highest_severity") {
        const scoreA = a.severity === "high" || a.severity === "critical" ? 3 : a.severity === "medium" || a.severity === "warning" ? 2 : 1;
        const scoreB = b.severity === "high" || b.severity === "critical" ? 3 : b.severity === "medium" || b.severity === "warning" ? 2 : 1;
        if (scoreB !== scoreA) return scoreB - scoreA;
      }
      const timeA = new Date(a.createdAt || a.startDate || 0).getTime();
      const timeB = new Date(b.createdAt || b.startDate || 0).getTime();
      return timeB - timeA;
    });

    return list;
  }, [alerts, statusTab, personalizedAlertIds, searchQuery, categoryFilter, severityFilter, sortOrder]);

  const handleToggleRead = (id) => {
    if (readIds.has(id)) {
      markAlertAsUnread(id);
    } else {
      markAlertAsRead(id);
    }
  };

  const handleMarkAllRead = () => {
    markAllAlertsAsRead();
  };

  const handleClearHistory = () => {
    clearNotificationHistory();
    setShowClearConfirm(false);
  };

  // Add route pill to new alert draft
  const handleAddRouteToDraft = () => {
    const r = selectedRouteInput.trim().toUpperCase();
    if (r && !affectedRoutesList.includes(r)) {
      setAffectedRoutesList([...affectedRoutesList, r]);
      setSelectedRouteInput("");
    }
  };

  const handleRemoveRouteFromDraft = (r) => {
    setAffectedRoutesList(affectedRoutesList.filter((x) => x !== r));
  };

  const handleCreateAlertSubmit = (e) => {
    e.preventDefault();
    setFormFeedback(null);

    const expDate = new Date(Date.now() + Number(expiryDays) * 24 * 3600 * 1000).toISOString();
    const res = createServiceAlert({
      title: newTitle,
      description: newDescription,
      category: newCategory,
      severity: newSeverity,
      affectedRoutes: affectedRoutesList,
      expiresAt: expDate,
    });

    if (res.success) {
      setFormFeedback({ type: "success", message: res.message });
      setNewTitle("");
      setNewDescription("");
      setAffectedRoutesList(["1A"]);
      setTimeout(() => setShowAdminForm(false), 1500);
    } else {
      setFormFeedback({ type: "error", message: res.message });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-6">
      {/* Page Header & Notification Center Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 text-white p-2.5 rounded-2xl shadow-sm relative">
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900">
              Smart Service Alerts & Notifications
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Chennai transit advisories, delays, diversions & personalized saved journey alerts
            </p>
          </div>
        </div>

        {/* Action Buttons: Mark all read / Demo Admin toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors flex items-center gap-1.5"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark All Read
            </button>
          )}

          <button
            onClick={() => setShowAdminForm(!showAdminForm)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-navy-800 text-white hover:bg-navy-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Settings className="h-3.5 w-3.5 text-teal-300" />
            {showAdminForm ? "Close Admin Form" : "Demo Alert Creator"}
          </button>
        </div>
      </div>

      {/* Demo Advisory Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 space-y-1">
        <div className="font-semibold flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 text-blue-600" />
          <span>Demo Service Advisories System</span>
        </div>
        <p className="opacity-90 leading-relaxed">
          Alerts are generated as prototype demonstration data and stored in localStorage. Personalized alerts are automatically matched against your <strong>Saved Routes</strong>. They do <strong>not reflect real-time MTC announcements</strong>.
        </p>
      </div>

      {/* Personalized Match Banner (if user has relevant alerts) */}
      {personalizedAlertList.length > 0 && (
        <div
          onClick={() => setStatusTab("personalized")}
          className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-4 text-white flex items-center justify-between cursor-pointer shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Star className="h-5 w-5 fill-white" />
            </div>
            <div>
              <p className="font-bold text-sm">
                {personalizedAlertList.length} Active Alert{personalizedAlertList.length !== 1 ? "s" : ""} Impacting Your Saved Journeys
              </p>
              <p className="text-xs text-amber-100">
                Click to view alerts tailored specifically to your saved bus corridors
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-white text-navy-950 px-2.5 py-1 rounded-full">
            View Matches →
          </span>
        </div>
      )}

      {/* Demo / Admin Alert Creation Form */}
      {showAdminForm && (
        <div className="bg-white rounded-3xl shadow-card border-2 border-navy-200 p-5 sm:p-6 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div>
              <h2 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-teal-600" />
                Publish Demo Service Alert (Admin Workflow)
              </h2>
              <p className="text-xs text-gray-400">
                Create custom advisories to test notification badges, filtering and saved route matching
              </p>
            </div>
            <button
              onClick={() => setShowAdminForm(false)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {formFeedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                formFeedback.type === "success"
                  ? "bg-teal-50 border-teal-200 text-teal-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {formFeedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-teal-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <span>{formFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handleCreateAlertSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Alert Title *
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Surface Repairs near Guindy Flyover"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Alert Category *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white outline-none focus:border-teal-500"
                >
                  {ALERT_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Severity *
                </label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white outline-none focus:border-teal-500"
                >
                  <option value="low">Low Severity</option>
                  <option value="medium">Medium Severity</option>
                  <option value="high">High Severity</option>
                </select>
              </div>
            </div>

            {/* Affected Routes Selector */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Affected Bus Route Numbers *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={selectedRouteInput}
                  onChange={(e) => setSelectedRouteInput(e.target.value)}
                  placeholder="e.g. 1A, M70, 5C"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={handleAddRouteToDraft}
                  className="bg-navy-800 text-white text-xs font-semibold px-4 py-2 rounded-xl"
                >
                  Add Route
                </button>
              </div>

              {/* Added route pills */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {affectedRoutesList.map((r) => (
                  <span
                    key={r}
                    className="bg-navy-100 text-navy-800 text-xs font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1"
                  >
                    <span>Bus {r}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRouteFromDraft(r)}
                      className="hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Detailed Description *
              </label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
                placeholder="Details of diversion, expected delays or temporary stop locations..."
                className="w-full border border-gray-200 rounded-xl p-3 text-xs sm:text-sm outline-none focus:border-teal-500 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Valid Duration: {expiryDays} Day(s)
              </label>
              <input
                type="range"
                min="1"
                max="14"
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
                className="w-full accent-teal-600"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-sm"
            >
              Publish Alert
            </button>
          </form>
        </div>
      )}

      {/* Main Alerts Dashboard Controls */}
      <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-4 space-y-3">
        {/* Status Tabs: Active | Personalized | Expired */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-2xl">
          {[
            { id: "active", label: `Active (${alerts.filter((a) => a.isActive).length})` },
            { id: "personalized", label: `My Saved (${personalizedAlertList.length})` },
            { id: "expired", label: `Expired / Archived (${alerts.filter((a) => !a.isActive).length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id)}
              className={`flex-1 text-xs py-2 rounded-xl font-bold transition-all ${
                statusTab === tab.id
                  ? "bg-white text-navy-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts by route (e.g. 1A), stop, or title keyword..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-gray-800 outline-none focus:border-teal-500 focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters and Sorting Toolbar */}
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
              {ALERT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">
              Severity
            </span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-teal-500"
            >
              <option value="all">All Severities</option>
              <option value="high">High Severity</option>
              <option value="medium">Medium Severity</option>
              <option value="low">Low Severity</option>
            </select>
          </div>

          {/* Sort */}
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
              <option value="highest_severity">Highest Severity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      {loading ? (
        <LoadingSpinner text="Loading service notifications..." />
      ) : processedAlerts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center space-y-2">
          <div className="text-3xl">🔔</div>
          <h3 className="font-bold text-gray-800 text-sm">
            No service alerts found
          </h3>
          <p className="text-xs text-gray-400">
            {statusTab === "personalized"
              ? "None of your saved bus routes are currently affected by active service advisories."
              : "No advisories match your current filter selection or search query."}
          </p>
          {statusTab === "personalized" && (
            <button
              onClick={() => setStatusTab("active")}
              className="text-xs text-teal-600 font-semibold hover:underline pt-2 block mx-auto"
            >
              View all active alerts →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {processedAlerts.map((alert) => (
            <div key={alert.id} className="relative group">
              <AlertCard
                alert={alert}
                isRead={readIds.has(alert.id)}
                isRelevant={personalizedAlertIds.has(alert.id)}
                onToggleRead={handleToggleRead}
                onDismiss={(id) => deleteServiceAlert(id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
