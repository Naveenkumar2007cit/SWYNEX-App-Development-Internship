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
  Sparkles,
} from "lucide-react";
import { useSavedRoutes } from "../hooks/useSavedRoutes";
import { getAllRoutes } from "../services/routeService";
import { demoAlerts } from "../data/demoAlerts";
import AlertCard from "../components/AlertCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function SavedRoutes() {
  const navigate = useNavigate();
  const {
    savedRoutes,
    loading,
    feedback,
    saveRoute,
    removeRoute,
    clearFeedback,
  } = useSavedRoutes();

  const [alerts] = useState(demoAlerts.filter((a) => a.isActive));
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const allAvailableRoutes = useMemo(() => getAllRoutes(), []);

  // Filter out routes that are already saved to offer in the quick-select
  const unSavedRoutes = useMemo(() => {
    const savedIds = new Set(savedRoutes.map((r) => r.id));
    return allAvailableRoutes.filter((r) => !savedIds.has(r.id));
  }, [allAvailableRoutes, savedRoutes]);

  const filteredSavedRoutes = useMemo(() => {
    if (!filterQuery.trim()) return savedRoutes;
    const q = filterQuery.toLowerCase();
    return savedRoutes.filter(
      (r) =>
        r.busNumber?.toLowerCase().includes(q) ||
        r.from?.toLowerCase().includes(q) ||
        r.to?.toLowerCase().includes(q) ||
        r.name?.toLowerCase().includes(q)
    );
  }, [savedRoutes, filterQuery]);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!selectedRouteId) return;
    const target = allAvailableRoutes.find((r) => r.id === selectedRouteId);
    if (!target) return;
    await saveRoute(target);
    setSelectedRouteId("");
  };

  const handleUnsave = async (routeId, e) => {
    e.stopPropagation();
    await removeRoute(routeId);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <div className="bg-amber-400 p-2 rounded-xl text-navy-950">
            <Star className="h-5 w-5" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-navy-800">Saved Routes & Alerts</h1>
            <p className="text-sm text-gray-500">
              Manage your favourite daily bus routes with instant offline access
            </p>
          </div>
        </div>
      </div>

      {/* Floating / Inline Feedback Alert Banner */}
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
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={clearFeedback}
            className="p-1 hover:bg-black/5 rounded-lg text-gray-400 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Quick Route Selector to Save Directly */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4 text-teal-600" />
            <h2 className="text-sm font-semibold text-gray-800">Save a Bus Route</h2>
          </div>
          <span className="text-xs text-gray-400">
            {unSavedRoutes.length} available to add
          </span>
        </div>

        <form onSubmit={handleQuickAdd} className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all"
          >
            <option value="">-- Choose a Chennai bus route to save --</option>
            {allAvailableRoutes.map((r) => {
              const already = savedRoutes.some((s) => s.id === r.id);
              return (
                <option key={r.id} value={r.id}>
                  {r.busNumber} : {r.from} ➔ {r.to} {already ? "(Already Saved)" : ""}
                </option>
              );
            })}
          </select>
          <button
            type="submit"
            disabled={!selectedRouteId}
            className="bg-navy-800 hover:bg-navy-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 flex-shrink-0 shadow-sm"
          >
            <Bookmark className="h-4 w-4" />
            Save Route
          </button>
        </form>
        <p className="text-xs text-gray-400">
          Saved routes persist in your browser localStorage and stay accessible across reloads.
        </p>
      </div>

      {/* Saved routes listing */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-navy-700" />
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              My Favourite Routes
            </h2>
          </div>
          {savedRoutes.length > 0 && (
            <span className="text-xs bg-navy-100 text-navy-700 font-semibold px-2.5 py-0.5 rounded-full">
              {savedRoutes.length} saved
            </span>
          )}
        </div>

        {/* Filter input if there are multiple saved routes */}
        {savedRoutes.length > 2 && (
          <div className="relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter saved routes by number or stop..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-700 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-50"
            />
            {filterQuery && (
              <button
                onClick={() => setFilterQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {loading ? (
          <LoadingSpinner size="sm" text="Loading saved routes..." />
        ) : savedRoutes.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-card border border-dashed border-gray-300 p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Star className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-gray-800 text-base">No Favourite Routes Saved</h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                Save the bus routes you travel frequently. You'll get instant 1-tap journey details, stop sequence, and crowd reports right here.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={() => navigate("/search")}
                className="w-full sm:w-auto bg-navy-800 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-navy-700 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Search className="h-4 w-4" />
                Find Routes to Save
              </button>
            </div>
          </div>
        ) : filteredSavedRoutes.length === 0 ? (
          <div className="bg-white rounded-xl border p-6 text-center text-sm text-gray-500">
            No saved routes match "<span className="font-medium text-gray-700">{filterQuery}</span>".
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSavedRoutes.map((route) => (
              <div
                key={route.id}
                onClick={() => navigate(`/route/${route.id}`)}
                className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover border border-gray-100 p-4 cursor-pointer transition-all relative overflow-hidden"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-navy-800 text-white rounded-xl px-3 py-1.5 font-bold text-sm flex items-center gap-1.5 flex-shrink-0 shadow-sm group-hover:bg-navy-700 transition-colors">
                    <Bus className="h-3.5 w-3.5" />
                    {route.busNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate">
                      {route.name || `${route.from} – ${route.to}`}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <span className="font-medium text-gray-700">{route.from}</span>
                      <ArrowRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-gray-700">{route.to}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                      <span>⏱ {route.duration} min</span>
                      <span>📍 {route.totalStops} stops</span>
                      {route.frequency && <span>🔄 {route.frequency}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleUnsave(route.id, e)}
                      className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Remove from saved routes"
                      aria-label="Remove from saved"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-navy-700 transition-colors" />
                  </div>
                </div>

                {route.savedAt && (
                  <div className="mt-2.5 pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
                    <span>
                      Saved on {new Date(route.savedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-teal-600 font-medium group-hover:underline">
                      View details →
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Service alerts */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-navy-500" />
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Service Alerts
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
