import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Star, Clock, AlertCircle, ChevronRight, Bus, ArrowRight, Zap } from "lucide-react";
import { getRecentSearches } from "../services/routeService";
import { getSavedRoutes } from "../services/savedRoutesService";
import { nearbyStops } from "../data/demoRoutes";
import { demoAlerts } from "../data/demoAlerts";
import AlertCard from "../components/AlertCard";

export default function Home() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo]     = useState("");
  const [recent, setRecent]   = useState([]);
  const [saved, setSaved]     = useState([]);
  const [alerts, setAlerts]   = useState(demoAlerts.filter((a) => a.isActive).slice(0, 2));

  useEffect(() => {
    setRecent(getRecentSearches());
    getSavedRoutes().then(setSaved);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (from.trim() && to.trim()) navigate(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
  };

  const quickLinks = [
    { label: "Search Routes", icon: Search,       to: "/search",  color: "bg-teal-500" },
    { label: "Crowd Status",  icon: Bus,          to: "/crowd",   color: "bg-amber-500" },
    { label: "Report Issue",  icon: AlertCircle,  to: "/report",  color: "bg-red-500"  },
    { label: "Saved Routes",  icon: Star,         to: "/saved",   color: "bg-purple-500"},
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-3xl p-6 text-white">
        <div className="flex items-center gap-2 mb-1">
          <div className="bg-teal-500 p-1 rounded-lg"><Bus className="h-4 w-4" /></div>
          <span className="text-teal-300 text-sm font-medium">BusBridge · Chennai</span>
        </div>
        <h1 className="text-2xl font-bold mt-2 mb-1">Where are you<br />heading today?</h1>
        <p className="text-navy-300 text-sm mb-5">Search bus routes, check crowd, report issues.</p>

        <form onSubmit={handleSearch} className="space-y-2">
          <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-teal-500 flex-shrink-0" />
            <input
              value={from} onChange={(e) => setFrom(e.target.value)}
              placeholder="From – e.g. Tambaram"
              className="flex-1 text-gray-800 text-sm outline-none bg-transparent placeholder-gray-400"
            />
          </div>
          <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-navy-700 flex-shrink-0" />
            <input
              value={to} onChange={(e) => setTo(e.target.value)}
              placeholder="To – e.g. Broadway"
              className="flex-1 text-gray-800 text-sm outline-none bg-transparent placeholder-gray-400"
            />
          </div>
          <button
            type="submit"
            disabled={!from.trim() || !to.trim()}
            className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Search className="h-4 w-4" />Search Bus Routes
          </button>
        </form>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map(({ label, icon: Icon, to, color }) => (
            <button key={to} onClick={() => navigate(to)}
              className="bg-white rounded-2xl shadow-card hover:shadow-card-hover p-4 flex items-center gap-3 transition-all border border-gray-100 text-left"
            >
              <div className={`${color} p-2.5 rounded-xl`}><Icon className="h-5 w-5 text-white" /></div>
              <span className="font-medium text-sm text-gray-700">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Nearby stops */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4" />Nearby Bus Stops
        </h2>
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 divide-y divide-gray-50">
          {nearbyStops.map((stop) => (
            <div key={stop.id} className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-800">{stop.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stop.distance} away</p>
              </div>
              <div className="flex flex-wrap gap-1 justify-end">
                {stop.routes.slice(0, 3).map((r) => (
                  <span key={r} className="text-xs bg-navy-50 text-navy-600 px-2 py-0.5 rounded-full font-medium">{r}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1 px-1">📍 Sample nearby stops · Location not tracked</p>
      </div>

      {/* Recent searches */}
      {recent.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />Recent Searches
          </h2>
          <div className="space-y-2">
            {recent.slice(0, 3).map((r, i) => (
              <button key={i} onClick={() => navigate(`/search?from=${encodeURIComponent(r.from)}&to=${encodeURIComponent(r.to)}`)}
                className="w-full bg-white rounded-xl shadow-card border border-gray-100 px-4 py-3 flex items-center gap-3 hover:shadow-card-hover transition-all text-left"
              >
                <Clock className="h-4 w-4 text-gray-300 flex-shrink-0" />
                <span className="text-sm text-gray-700">{r.from}</span>
                <ArrowRight className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                <span className="text-sm text-gray-700 flex-1">{r.to}</span>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Saved routes preview */}
      {saved.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <Star className="h-4 w-4" />Favourite Routes
            </h2>
            <button onClick={() => navigate("/saved")} className="text-xs text-teal-600 font-medium">View all</button>
          </div>
          <div className="space-y-2">
            {saved.slice(0, 2).map((route) => (
              <button key={route.id} onClick={() => navigate(`/route/${route.id}`)}
                className="w-full bg-white rounded-xl shadow-card border border-gray-100 px-4 py-3 flex items-center gap-3 hover:shadow-card-hover transition-all text-left"
              >
                <div className="bg-navy-800 text-white rounded-lg px-2 py-1 text-xs font-bold">{route.busNumber}</div>
                <span className="text-sm text-gray-700 flex-1">{route.from} → {route.to}</span>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Service alerts */}
      {alerts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4" />Service Alerts
          </h2>
          <div className="space-y-3">
            {alerts.map((alert) => <AlertCard key={alert.id} alert={alert} onDismiss={(id) => setAlerts((a) => a.filter((x) => x.id !== id))} />)}
          </div>
        </div>
      )}
    </div>
  );
}
