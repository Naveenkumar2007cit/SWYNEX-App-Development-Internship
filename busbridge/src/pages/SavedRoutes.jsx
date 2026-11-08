import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Bookmark, Trash2, Bell, ChevronRight, Bus } from "lucide-react";
import { getSavedRoutes, unsaveRoute } from "../services/savedRoutesService";
import { demoAlerts } from "../data/demoAlerts";
import AlertCard from "../components/AlertCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function SavedRoutes() {
  const navigate = useNavigate();
  const [saved, setSaved]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerts]  = useState(demoAlerts.filter((a) => a.isActive));

  useEffect(() => { getSavedRoutes().then((r) => { setSaved(r); setLoading(false); }); }, []);

  const handleUnsave = async (routeId, e) => {
    e.stopPropagation();
    await unsaveRoute(routeId);
    setSaved((prev) => prev.filter((r) => r.id !== routeId));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-navy-800">Saved Routes & Alerts</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your favourite routes and service updates</p>
      </div>

      {/* Saved routes */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Star className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Favourite Routes</h2>
          {saved.length > 0 && <span className="ml-auto text-xs bg-navy-100 text-navy-600 px-2 py-0.5 rounded-full font-medium">{saved.length}</span>}
        </div>

        {loading ? <LoadingSpinner size="sm" text="Loading saved routes..." /> :
          saved.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 text-center">
              <div className="bg-amber-50 p-4 rounded-full inline-flex mb-3">
                <Bookmark className="h-8 w-8 text-amber-300" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-1">No saved routes yet</h3>
              <p className="text-sm text-gray-400 mb-4">Save bus routes you use often for quick access here.</p>
              <button onClick={() => navigate("/search")} className="bg-navy-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-navy-700 transition-colors">
                Search Routes
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {saved.map((route) => (
                <div key={route.id} onClick={() => navigate(`/route/${route.id}`)}
                  className="bg-white rounded-2xl shadow-card hover:shadow-card-hover border border-gray-100 p-4 cursor-pointer transition-all">
                  <div className="flex items-start gap-3">
                    <div className="bg-navy-800 text-white rounded-xl px-3 py-1.5 font-bold text-sm flex items-center gap-1.5 flex-shrink-0">
                      <Bus className="h-3.5 w-3.5" />{route.busNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">{route.name || `${route.from} – ${route.to}`}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{route.from} → {route.to}</p>
                      <div className="flex gap-3 mt-1.5 text-xs text-gray-400">
                        <span>{route.duration} min</span>
                        <span>{route.totalStops} stops</span>
                        <span>{route.frequency}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => handleUnsave(route.id, e)}
                        className="p-2 rounded-full text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                        aria-label="Remove from saved">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <ChevronRight className="h-4 w-4 text-gray-200" />
                    </div>
                  </div>
                  {route.savedAt && (
                    <p className="text-xs text-gray-300 mt-2 pl-0.5">
                      Saved {new Date(route.savedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )
        }
      </div>

      {/* Service alerts */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Bell className="h-4 w-4 text-navy-500" />
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Service Alerts</h2>
          <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">{alerts.length} active</span>
        </div>
        <div className="space-y-3">
          {alerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)}
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">⚠ Sample alerts for demonstration only. Not official MTC advisories.</p>
      </div>
    </div>
  );
}
