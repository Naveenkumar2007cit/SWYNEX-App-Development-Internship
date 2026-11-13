import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Bookmark,
  Trash2,
  Bell,
  ChevronRight,
  Bus,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  X,
  Search,
  ArrowRight,
  Shuffle,
  ShieldCheck,
  Compass,
  Clock,
  MapPin,
  Calendar,
  AlertOctagon,
  Filter,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";
import { useSavedRoutes } from "../hooks/useSavedRoutes.js";
import { getAllRoutes } from "../services/routeService.js";
import { demoAlerts } from "../data/demoAlerts.js";
import AlertCard from "../components/AlertCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function SavedRoutes() {
  const navigate = useNavigate();
  const {
    savedRoutes,
    loading,
    feedback,
    saveRoute,
    removeRoute,
    clearAll,
    clearFeedback,
  } = useSavedRoutes();

  const [alerts] = useState(demoAlerts.filter((a) => a.isActive));
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'direct' | 'transfer'
  const [sortBy, setSortBy] = useState("recent"); // 'recent' | 'duration' | 'stops'
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const allAvailableRoutes = useMemo(() => getAllRoutes(), []);

  // Filtered and Sorted Saved Routes
  const processedRoutes = useMemo(() => {
    let list = [...savedRoutes];

    // 1. Text Search (filter by route number, origin, destination, or transfer stop)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((r) => {
        const bus = (r.busNumber || "").toLowerCase();
        const from = (r.from || r.origin || "").toLowerCase();
        const to = (r.to || r.destination || "").toLowerCase();
        const name = (r.name || r.routeName || "").toLowerCase();
        const transfer = (r.transferStopName || "").toLowerCase();
        return (
          bus.includes(q) ||
          from.includes(q) ||
          to.includes(q) ||
          name.includes(q) ||
          transfer.includes(q)
        );
      });
    }

    // 2. Type Filter (All / Direct / 1-Transfer)
    if (typeFilter === "direct") {
      list = list.filter((r) => (r.transfersCount ?? 0) === 0);
    } else if (typeFilter === "transfer") {
      list = list.filter((r) => (r.transfersCount ?? 0) > 0);
    }

    // 3. Sorting
    list.sort((a, b) => {
      if (sortBy === "duration") {
        const durA = a.totalDuration || a.duration || 0;
        const durB = b.totalDuration || b.duration || 0;
        return durA - durB;
      }
      if (sortBy === "stops") {
        const stA = a.totalStopsCount || a.totalStops || 0;
        const stB = b.totalStopsCount || b.totalStops || 0;
        return stA - stB;
      }
      // Default: 'recent' saved first
      const timeA = a.savedAt ? new Date(a.savedAt).getTime() : 0;
      const timeB = b.savedAt ? new Date(b.savedAt).getTime() : 0;
      return timeB - timeA;
    });

    return list;
  }, [savedRoutes, searchQuery, typeFilter, sortBy]);

  // Counts for filter pills
  const directCount = useMemo(
    () => savedRoutes.filter((r) => (r.transfersCount ?? 0) === 0).length,
    [savedRoutes]
  );
  const transferCount = useMemo(
    () => savedRoutes.filter((r) => (r.transfersCount ?? 0) > 0).length,
    [savedRoutes]
  );

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!selectedRouteId) return;
    const target = allAvailableRoutes.find((r) => r.id === selectedRouteId);
    if (!target) return;
    await saveRoute(target);
    setSelectedRouteId("");
  };

  const handleOpenJourney = (route) => {
    const fromStop = route.from || route.origin;
    const toStop = route.to || route.destination;

    // If it's a transfer route or from the planner, navigate to planner
    if (route.transfersCount > 0 || (route.legs && route.legs.length > 1)) {
      navigate(`/planner?source=${encodeURIComponent(fromStop)}&destination=${encodeURIComponent(toStop)}`);
    } else if (route.id && !route.id.startsWith("saved-") && !route.id.startsWith("direct-")) {
      // Standard single bus route (e.g. R001)
      navigate(`/route/${route.id}`);
    } else {
      // Fallback: search or planner
      navigate(`/planner?source=${encodeURIComponent(fromStop)}&destination=${encodeURIComponent(toStop)}`);
    }
  };

  const handleUnsave = async (routeId, e) => {
    e.stopPropagation();
    await removeRoute(routeId);
    setDeletingId(null);
  };

  const confirmClearAll = () => {
    clearAll();
    setShowClearConfirm(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-6">
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-amber-400 p-2.5 rounded-2xl text-navy-950 shadow-sm">
            <Star className="h-6 w-6" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900">
              Saved Journeys Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Persistent offline storage for daily routes & transfers
            </p>
          </div>
        </div>

        {savedRoutes.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-navy-100 text-navy-800">
              {savedRoutes.length} Total Saved
            </span>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl font-medium transition-colors border border-red-200/60"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Clear All */}
      {showClearConfirm && (
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-5 space-y-3 shadow-md animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 text-red-800 font-bold text-sm">
            <AlertOctagon className="h-5 w-5 text-red-600" />
            <span>Clear all saved journeys?</span>
          </div>
          <p className="text-xs text-red-700 leading-relaxed">
            This will permanently remove all {savedRoutes.length} saved direct routes and transfer journeys from this browser's localStorage. This cannot be undone.
          </p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={confirmClearAll}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              Yes, Clear Everything
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 font-medium text-xs px-4 py-2 rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Feedback Alert Toast Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-sm shadow-sm border transition-all ${
            feedback.type === "success"
              ? "bg-teal-50 border-teal-200 text-teal-800"
              : feedback.type === "warning"
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : feedback.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-navy-50 border-navy-200 text-navy-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0" />
            ) : feedback.type === "warning" ? (
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            ) : (
              <Bookmark className="h-5 w-5 text-navy-600 flex-shrink-0" />
            )}
            <span className="font-medium text-xs sm:text-sm">{feedback.message}</span>
          </div>
          <button
            onClick={clearFeedback}
            className="p-1 hover:bg-black/5 rounded-lg text-gray-400 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Quick Add Route from Catalog */}
      <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4 text-teal-600" />
            <h2 className="text-sm font-semibold text-gray-800">
              Quick Save Direct Route
            </h2>
          </div>
          <span className="text-xs text-gray-400">
            {allAvailableRoutes.length} Chennai routes
          </span>
        </div>

        <form onSubmit={handleQuickAdd} className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-gray-700 bg-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
          >
            <option value="">-- Choose a Chennai bus route to bookmark --</option>
            {allAvailableRoutes.map((r) => {
              const already = savedRoutes.some(
                (s) => s.id === r.id || (s.from === r.from && s.to === r.to && s.busNumber === r.busNumber)
              );
              return (
                <option key={r.id} value={r.id}>
                  Bus {r.busNumber}: {r.from} ➔ {r.to} {already ? "(Saved)" : ""}
                </option>
              );
            })}
          </select>
          <button
            type="submit"
            disabled={!selectedRouteId}
            className="bg-navy-800 hover:bg-navy-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 flex-shrink-0 shadow-sm"
          >
            <Bookmark className="h-4 w-4" />
            Save Route
          </button>
        </form>
      </div>

      {/* Main Saved Journeys Section */}
      <div className="space-y-4">
        {/* Search, Filter & Sort Toolbar */}
        {savedRoutes.length > 0 && (
          <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-4 space-y-3">
            {/* Search input */}
            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search saved journeys by stop name, bus number (e.g., 1A), or transfer..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-teal-500 focus:bg-white focus:ring-1 focus:ring-teal-100 transition-all"
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

            {/* Filter and Sort controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-gray-100">
              {/* Type Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mr-1 flex items-center gap-1">
                  <Filter className="h-3 w-3" /> Filter:
                </span>
                <button
                  onClick={() => setTypeFilter("all")}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                    typeFilter === "all"
                      ? "bg-navy-800 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All ({savedRoutes.length})
                </button>
                <button
                  onClick={() => setTypeFilter("direct")}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                    typeFilter === "direct"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Direct ({directCount})
                </button>
                <button
                  onClick={() => setTypeFilter("transfer")}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                    typeFilter === "transfer"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  1-Transfer ({transferCount})
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                  <ArrowUpDown className="h-3 w-3" /> Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-1 outline-none focus:border-teal-500"
                >
                  <option value="recent">Recently Saved</option>
                  <option value="duration">Fastest Duration</option>
                  <option value="stops">Fewest Stops</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Content list or empty state */}
        {loading ? (
          <LoadingSpinner size="sm" text="Loading saved journeys from storage..." />
        ) : savedRoutes.length === 0 ? (
          /* Empty State (No Saved Journeys) */
          <div className="bg-white rounded-3xl shadow-card border border-dashed border-gray-300 p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Star className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-gray-800 text-base">
                No Favourite Journeys Saved Yet
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                Bookmark direct bus routes or transfer combinations from the{" "}
                <strong>Smart Journey Planner</strong> or <strong>Bus Search</strong> for instant 1-tap offline access.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={() => navigate("/planner")}
                className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Compass className="h-4 w-4" />
                Open Journey Planner
              </button>
              <button
                onClick={() => navigate("/search")}
                className="w-full sm:w-auto bg-navy-800 hover:bg-navy-700 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Search className="h-4 w-4" />
                Search Chennai Buses
              </button>
            </div>
          </div>
        ) : processedRoutes.length === 0 ? (
          /* No Search Results State */
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-3">
            <div className="text-3xl">🔍</div>
            <h3 className="font-bold text-gray-800 text-sm">
              No matching saved journeys found
            </h3>
            <p className="text-xs text-gray-400">
              No saved routes match the query "{searchQuery}" under the current filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("all");
              }}
              className="text-xs text-teal-600 font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          /* Saved Journeys Cards */
          <div className="space-y-3">
            {processedRoutes.map((item) => {
              const isDirect = (item.transfersCount ?? 0) === 0;
              const sourceStop = item.from || item.origin;
              const destStop = item.to || item.destination;
              const duration = item.totalDuration || item.duration || 0;
              const distance = item.totalDistance || item.distance || 0;
              const stopsCount = item.totalStopsCount || item.totalStops || 0;

              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenJourney(item)}
                  className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover border border-gray-100 p-4 sm:p-5 cursor-pointer transition-all relative overflow-hidden"
                >
                  {/* Top Bar: Badges + Action Buttons */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isDirect ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          Direct Bus
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Shuffle className="h-3 w-3" />
                          Transfer at {item.transferStopName || "Hub"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-navy-900 font-bold text-xs sm:text-sm">
                        <Clock className="h-3.5 w-3.5 text-teal-600" />
                        <span>{duration} min</span>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleUnsave(item.id, e)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove from saved"
                        aria-label="Remove from saved"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Route Numbers Sequence */}
                  <div className="flex items-center gap-2 py-1 flex-wrap">
                    {item.legs && item.legs.length > 0 ? (
                      item.legs.map((leg, lIdx) => (
                        <div key={leg.legIndex || lIdx} className="flex items-center gap-1.5">
                          <div className="bg-navy-800 text-white font-bold text-xs px-2.5 py-1 rounded-xl shadow-sm flex items-center gap-1">
                            <Bus className="h-3 w-3 text-teal-300" />
                            <span>Bus {leg.busNumber}</span>
                          </div>
                          {lIdx < item.legs.length - 1 && (
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="bg-navy-800 text-white font-bold text-xs px-2.5 py-1 rounded-xl shadow-sm flex items-center gap-1">
                        <Bus className="h-3 w-3 text-teal-300" />
                        <span>Bus {item.busNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Journey Path */}
                  <div className="mt-2.5 flex items-start gap-2 text-xs text-gray-600 border-t border-gray-100 pt-2.5">
                    <div className="flex flex-col items-center mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-teal-500" />
                      <div className="w-0.5 h-3.5 bg-gray-200" />
                      <div className="h-2 w-2 rounded-full bg-navy-800" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-semibold text-gray-800">
                        {sourceStop}
                      </div>
                      <div className="truncate font-semibold text-gray-800">
                        {destStop}
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-gray-400">
                      {stopsCount > 0 && <div>📍 {stopsCount} stops</div>}
                      {distance > 0 && <div>📏 ~{distance} km</div>}
                    </div>
                  </div>

                  {/* Card Footer: Saved Date + Planner Navigation Callout */}
                  <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Saved on{" "}
                      {item.savedAt
                        ? new Date(item.savedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Recently"}
                    </span>
                    <span className="text-teal-600 font-semibold group-hover:underline flex items-center gap-0.5">
                      Open Journey Details
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Service alerts */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-navy-500" />
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Active Chennai Service Alerts
          </h2>
          <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
            {alerts.length} active
          </span>
        </div>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center">
          ⚠ Sample alerts for demonstration only. Not official MTC advisories.
        </p>
      </div>
    </div>
  );
}
