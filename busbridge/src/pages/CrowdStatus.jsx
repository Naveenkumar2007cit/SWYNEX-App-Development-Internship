import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Users, ChevronDown, Send, CheckCircle } from "lucide-react";
import { getAllRoutes } from "../services/routeService";
import { submitCrowdReport, getCrowdReports, CROWD_LEVELS } from "../services/crowdService";
import CrowdStatusCard from "../components/CrowdStatusCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function CrowdStatus() {
  const [searchParams] = useSearchParams();
  const [routes]       = useState(() => getAllRoutes());
  const [selectedRoute, setSelectedRoute] = useState(searchParams.get("route") || "");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [notes, setNotes]   = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const route = routes.find((r) => r.id === selectedRoute);

  useEffect(() => {
    if (selectedRoute) {
      setLoading(true);
      getCrowdReports(selectedRoute).then((r) => { setReports(r); setLoading(false); });
    }
  }, [selectedRoute]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoute) return setError("Please select a bus route.");
    if (!selectedLevel) return setError("Please select a crowd level.");
    setError(""); setSubmitting(true);
    const result = await submitCrowdReport({ routeId: selectedRoute, busNumber: route?.busNumber || "", crowdLevel: selectedLevel, notes });
    if (result.success) {
      setReports((prev) => [result.report, ...prev]);
      setSubmitted(true);
      setSelectedLevel(""); setNotes("");
      setTimeout(() => setSubmitted(false), 4000);
    }
    setSubmitting(false);
  };

  const latestReport = reports[0];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-navy-800">Crowd Status</h1>
        <p className="text-sm text-gray-500 mt-0.5">View and report bus crowd conditions</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
        ℹ️ Crowd information is <strong>community-reported</strong> and not official live occupancy data from MTC.
      </div>

      {/* Route selector */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-4 space-y-3">
        <h2 className="font-semibold text-gray-800 text-sm">Select Route</h2>
        <div className="relative">
          <select value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 appearance-none outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 bg-white">
            <option value="">Choose a bus route...</option>
            {routes.map((r) => <option key={r.id} value={r.id}>Bus {r.busNumber} – {r.from} to {r.to}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Current crowd status */}
      {selectedRoute && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Latest Community Report</h2>
          {loading ? <LoadingSpinner size="sm" text="Loading reports..." /> :
            latestReport ? <CrowdStatusCard level={latestReport.crowdLevel} timestamp={latestReport.reportedAt} busNumber={latestReport.busNumber} notes={latestReport.notes} /> :
            <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
              <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No crowd reports yet for this route.</p>
              <p className="text-xs text-gray-400 mt-1">Be the first to report!</p>
            </div>
          }
        </div>
      )}

      {/* Report form */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-4 space-y-4">
        <h2 className="font-semibold text-gray-800">Report Crowd Status</h2>
        {submitted && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />Thank you! Your report has been submitted.
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Crowd Level *</label>
            <div className="grid grid-cols-2 gap-2">
              {CROWD_LEVELS.map((lvl) => {
                const colMap = { green:"border-green-400 bg-green-50 text-green-700", yellow:"border-yellow-400 bg-yellow-50 text-yellow-700", orange:"border-orange-400 bg-orange-50 text-orange-700", red:"border-red-400 bg-red-50 text-red-700" };
                const col = colMap[lvl.colour] || "border-gray-200 bg-gray-50 text-gray-600";
                return (
                  <button key={lvl.value} type="button" onClick={() => setSelectedLevel(lvl.value)}
                    className={`border-2 rounded-xl p-3 text-left transition-all ${selectedLevel === lvl.value ? col : "border-gray-200 hover:border-gray-300"}`}>
                    <p className="font-semibold text-sm">{lvl.label}</p>
                    <p className="text-xs opacity-80 mt-0.5">{lvl.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Additional Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              placeholder="e.g. All seats taken, many standing near exit..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 resize-none" />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={submitting || !selectedRoute || !selectedLevel}
            className="w-full bg-navy-800 hover:bg-navy-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Send className="h-4 w-4" />{submitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>

      {/* Recent reports list */}
      {reports.length > 1 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Reports ({reports.length})</h2>
          <div className="space-y-2">
            {reports.slice(1, 5).map((r) => (
              <div key={r.id} className="bg-white rounded-xl shadow-card border border-gray-100 px-4 py-3 flex items-center gap-3">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                  r.crowdLevel === "low" ? "bg-green-100 text-green-700" :
                  r.crowdLevel === "medium" ? "bg-yellow-100 text-yellow-700" :
                  r.crowdLevel === "high" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                }`}>
                  {CROWD_LEVELS.find((l) => l.value === r.crowdLevel)?.label || r.crowdLevel}
                </span>
                {r.notes && <p className="text-xs text-gray-500 flex-1 truncate">"{r.notes}"</p>}
                <p className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(r.reportedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
