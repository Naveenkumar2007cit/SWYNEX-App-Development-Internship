import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Users,
  Search,
  ChevronDown,
  Send,
  CheckCircle,
  AlertTriangle,
  Clock,
  Filter,
  ArrowUpDown,
  Sparkles,
  MapPin,
  Bus,
  RefreshCw,
  X,
} from "lucide-react";
import { getAllRoutes } from "../services/routeService.js";
import {
  submitCrowdReport,
  getCrowdReports,
  getStoredCrowdReports,
  calculateCrowdIntelligence,
  initializeBaselineCrowdData,
  CROWD_LEVELS,
  CROWD_CHANGE_EVENT,
} from "../services/crowdService.js";
import CrowdStatusCard from "../components/CrowdStatusCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function CrowdStatus() {
  const [searchParams] = useSearchParams();
  const routes = useMemo(() => getAllRoutes(), []);

  // Form states
  const [selectedRouteId, setSelectedRouteId] = useState(searchParams.get("route") || "");
  const [selectedBusNumber, setSelectedBusNumber] = useState(searchParams.get("bus") || "");
  const [boardingStop, setBoardingStop] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [observationNotes, setObservationNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState(null); // { type: 'success' | 'error' | 'warning', message: string }

  // Dashboard list states
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState("all"); // 'all' | 'low' | 'medium' | 'high'
  const [sortBy, setSortBy] = useState("highest"); // 'highest' | 'lowest' | 'recent' | 'reports'

  // Initialize and load reports
  const reloadReports = () => {
    initializeBaselineCrowdData();
    const stored = getStoredCrowdReports();
    setAllReports(stored);
    setLoading(false);
  };

  useEffect(() => {
    reloadReports();

    const handleUpdate = () => {
      reloadReports();
    };

    window.addEventListener(CROWD_CHANGE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(CROWD_CHANGE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // When user picks a route in the report form
  const handleRouteChange = (routeId) => {
    setSelectedRouteId(routeId);
    const matched = routes.find((r) => r.id === routeId);
    if (matched) {
      setSelectedBusNumber(matched.busNumber);
      if (!boardingStop) setBoardingStop(matched.from);
    }
  };

  // Group and compute intelligence for every bus route
  const routeCrowdSummaries = useMemo(() => {
    return routes.map((r) => {
      const routeReports = allReports.filter(
        (rep) =>
          rep.routeId === r.id ||
          rep.busNumber.toLowerCase() === r.busNumber.toLowerCase()
      );
      const intel = calculateCrowdIntelligence(routeReports);
      return {
        route: r,
        intelligence: intel,
        reports: routeReports,
      };
    });
  }, [routes, allReports]);

  // Filtered and sorted routes for the dashboard
  const filteredRouteSummaries = useMemo(() => {
    let list = [...routeCrowdSummaries];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.route.busNumber.toLowerCase().includes(q) ||
          item.route.from.toLowerCase().includes(q) ||
          item.route.to.toLowerCase().includes(q) ||
          item.route.name.toLowerCase().includes(q)
      );
    }

    // Filter by crowd level
    if (filterLevel !== "all") {
      list = list.filter((item) => item.intelligence.level === filterLevel);
    }

    // Sort by criteria
    list.sort((a, b) => {
      if (sortBy === "highest") {
        return b.intelligence.averageScore - a.intelligence.averageScore;
      }
      if (sortBy === "lowest") {
        return a.intelligence.averageScore - b.intelligence.averageScore;
      }
      if (sortBy === "reports") {
        return b.intelligence.reportCount - a.intelligence.reportCount;
      }
      // 'recent'
      const timeA = a.intelligence.lastReportedAt ? new Date(a.intelligence.lastReportedAt).getTime() : 0;
      const timeB = b.intelligence.lastReportedAt ? new Date(b.intelligence.lastReportedAt).getTime() : 0;
      return timeB - timeA;
    });

    return list;
  }, [routeCrowdSummaries, searchQuery, filterLevel, sortBy]);

  // Selected route summary for top preview
  const currentSelectedRouteSummary = useMemo(() => {
    if (!selectedBusNumber && !selectedRouteId) return null;
    return routeCrowdSummaries.find(
      (s) =>
        s.route.id === selectedRouteId ||
        s.route.busNumber.toLowerCase() === selectedBusNumber.toLowerCase()
    );
  }, [selectedRouteId, selectedBusNumber, routeCrowdSummaries]);

  // Submit handler
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setFormFeedback(null);

    const busToReport = selectedBusNumber.trim();
    if (!busToReport) {
      setFormFeedback({ type: "error", message: "Please select or enter a bus route number." });
      return;
    }
    if (!selectedLevel) {
      setFormFeedback({ type: "error", message: "Please select a crowd condition (Low, Medium, or High)." });
      return;
    }

    setSubmitting(true);
    const matched = routes.find((r) => r.busNumber.toLowerCase() === busToReport.toLowerCase());

    const result = await submitCrowdReport({
      busNumber: busToReport,
      routeName: matched?.name || `Route ${busToReport}`,
      stopLocation: boardingStop.trim() || matched?.from || "Chennai Junction",
      crowdLevel: selectedLevel,
      notes: observationNotes,
      routeId: matched?.id || selectedRouteId,
    });

    if (result.success) {
      setFormFeedback({ type: "success", message: result.message });
      setSelectedLevel("");
      setObservationNotes("");
      reloadReports();
    } else {
      setFormFeedback({
        type: result.cooldown ? "warning" : "error",
        message: result.message,
      });
    }

    setSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="bg-amber-500 text-white p-2 rounded-xl shadow-sm">
            <Users className="h-5 w-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900">
            Smart Crowd Intelligence
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500">
          Community-calculated crowd density estimations across Chennai public bus corridors
        </p>
      </div>

      {/* Community Disclaimer Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-800 space-y-1">
        <div className="font-semibold flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-blue-600" />
          <span>Community Estimation Algorithm</span>
        </div>
        <p className="opacity-90 leading-relaxed">
          Crowd levels are calculated using recent passenger submissions (Low=1, Med=2, High=3). Reports under 2 hours are given greater statistical weight. This is <strong>not official live passenger telemetry</strong>.
        </p>
      </div>

      {/* Selected Route Status Card (if route selected) */}
      {currentSelectedRouteSummary && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Intelligence Summary for Bus {currentSelectedRouteSummary.route.busNumber}
            </span>
            <button
              onClick={() => {
                setSelectedRouteId("");
                setSelectedBusNumber("");
              }}
              className="text-xs text-teal-600 hover:underline"
            >
              Clear selected
            </button>
          </div>
          <CrowdStatusCard
            level={currentSelectedRouteSummary.intelligence.level}
            busNumber={currentSelectedRouteSummary.route.busNumber}
            routeName={currentSelectedRouteSummary.route.name}
            timestamp={currentSelectedRouteSummary.intelligence.lastReportedAt}
            reportCount={currentSelectedRouteSummary.intelligence.reportCount}
            averageScore={currentSelectedRouteSummary.intelligence.averageScore}
            confidence={currentSelectedRouteSummary.intelligence.confidence}
          />
        </div>
      )}

      {/* Report Submission Form */}
      <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-sm sm:text-base">
              Submit a Crowd Observation
            </h2>
            <p className="text-xs text-gray-400">
              Help fellow Chennai commuters by reporting what you see
            </p>
          </div>
          <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
            3-Min Cooldown Protected
          </span>
        </div>

        {/* Feedback Alert Banner */}
        {formFeedback && (
          <div
            className={`p-3.5 rounded-2xl flex items-center justify-between text-xs sm:text-sm border transition-all ${
              formFeedback.type === "success"
                ? "bg-teal-50 border-teal-200 text-teal-800"
                : formFeedback.type === "warning"
                ? "bg-amber-50 border-amber-200 text-amber-900"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {formFeedback.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-teal-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
              )}
              <span>{formFeedback.message}</span>
            </div>
            <button
              onClick={() => setFormFeedback(null)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleReportSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Bus Route Selector */}
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                Bus Route *
              </label>
              <div className="relative">
                <select
                  value={selectedRouteId}
                  onChange={(e) => handleRouteChange(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-gray-800 bg-white outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-100"
                >
                  <option value="">-- Choose bus route --</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      Bus {r.busNumber} : {r.from} ➔ {r.to}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Boarding Stop / Location */}
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                Boarding / Observed Stop
              </label>
              <input
                type="text"
                value={boardingStop}
                onChange={(e) => setBoardingStop(e.target.value)}
                placeholder="e.g. Guindy, Saidapet, CMBT"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-100"
              />
            </div>
          </div>

          {/* Crowd Level Radio Options (Low, Medium, High) */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-2">
              Observed Crowd Condition *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CROWD_LEVELS.map((lvl) => {
                const isSelected = selectedLevel === lvl.value;
                return (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() => setSelectedLevel(lvl.value)}
                    className={`border-2 rounded-2xl p-3 text-left transition-all ${
                      isSelected
                        ? `${lvl.bgColor} ${lvl.border} ring-2 ring-teal-400/30`
                        : "border-gray-200 bg-gray-50/50 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs sm:text-sm text-gray-900">
                        {lvl.label}
                      </span>
                      <span className="text-base">
                        {lvl.value === "low" ? "🟢" : lvl.value === "medium" ? "🟡" : "🔴"}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-tight">
                      {lvl.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Observation Note */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Passenger Observation (Optional)
            </label>
            <textarea
              value={observationNotes}
              onChange={(e) => setObservationNotes(e.target.value)}
              rows={2}
              maxLength={300}
              placeholder="e.g. Seats filled at Guindy, heavy rush near rear door..."
              className="w-full border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-gray-800 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-100 resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !selectedBusNumber || !selectedLevel}
            className="w-full bg-navy-800 hover:bg-navy-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Send className="h-4 w-4" />
            {submitting ? "Verifying & Submitting..." : "Submit Crowd Report"}
          </button>
        </form>
      </div>

      {/* Crowd Intelligence Dashboard List */}
      <div className="space-y-4">
        {/* Controls Toolbar: Search, Filter, Sort */}
        <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-bold text-gray-900 text-sm sm:text-base">
                Chennai Bus Corridor Crowd Intelligence
              </h2>
              <p className="text-xs text-gray-400">
                Live calculated status for {routes.length} key routes
              </p>
            </div>
            <button
              onClick={reloadReports}
              className="self-start sm:self-auto text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1 font-medium bg-teal-50 px-2.5 py-1 rounded-lg"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search route (e.g., 1A, M70, Tambaram)..."
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

          {/* Filter and Sort options */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-gray-100">
            {/* Filter pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mr-1 flex items-center gap-1">
                <Filter className="h-3 w-3" /> Filter:
              </span>
              <button
                onClick={() => setFilterLevel("all")}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                  filterLevel === "all"
                    ? "bg-navy-800 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterLevel("low")}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                  filterLevel === "low"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                🟢 Low
              </button>
              <button
                onClick={() => setFilterLevel("medium")}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                  filterLevel === "medium"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                🟡 Medium
              </button>
              <button
                onClick={() => setFilterLevel("high")}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                  filterLevel === "high"
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                🔴 High
              </button>
            </div>

            {/* Sort selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3" /> Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2 py-1 outline-none focus:border-teal-500"
              >
                <option value="highest">Highest Crowd First</option>
                <option value="lowest">Lowest Crowd First</option>
                <option value="reports">Most Reports</option>
                <option value="recent">Recently Updated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dashboard Route Cards */}
        {loading ? (
          <LoadingSpinner text="Computing community crowd scores..." />
        ) : filteredRouteSummaries.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center space-y-2">
            <div className="text-3xl">🔍</div>
            <h3 className="font-bold text-gray-800 text-sm">
              No matching routes found
            </h3>
            <p className="text-xs text-gray-400">
              Try adjusting your search terms or resetting the crowd level filter.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRouteSummaries.map(({ route: r, intelligence: intel, reports: rReports }) => {
              const badgeClass =
                intel.level === "low"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : intel.level === "medium"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : intel.level === "high"
                  ? "bg-red-50 text-red-800 border-red-200"
                  : "bg-gray-100 text-gray-600 border-gray-200";

              return (
                <div
                  key={r.id}
                  onClick={() => handleRouteChange(r.id)}
                  className="bg-white rounded-2xl shadow-card hover:shadow-card-hover border border-gray-100 p-4 transition-all cursor-pointer group space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-navy-800 text-white font-bold text-xs px-2.5 py-1.5 rounded-xl shadow-sm group-hover:bg-navy-700 transition-colors">
                        Bus {r.busNumber}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs sm:text-sm text-gray-800 group-hover:text-navy-900">
                          {r.name}
                        </h4>
                        <p className="text-[11px] text-gray-400">
                          {r.from} ➔ {r.to}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badgeClass} inline-flex items-center gap-1`}>
                        <span>{intel.level === "low" ? "🟢" : intel.level === "medium" ? "🟡" : intel.level === "high" ? "🔴" : "⚪"}</span>
                        <span>{intel.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-50 gap-1">
                    <div className="flex items-center gap-3">
                      <span>Score: <strong>{intel.averageScore}</strong>/3</span>
                      <span>•</span>
                      <span>{intel.reportCount} report{intel.reportCount !== 1 ? "s" : ""}</span>
                      <span>•</span>
                      <span className="text-gray-400">Confidence: {intel.confidence}</span>
                    </div>

                    <div className="flex items-center gap-1 text-teal-600 font-semibold group-hover:underline">
                      <span>Report for this bus →</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
