import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Star,
  Clock,
  AlertCircle,
  ChevronRight,
  Bus,
  ArrowRight,
  Zap,
  Compass,
  Shuffle,
  Sparkles,
  Navigation,
  Bell,
  Users,
} from "lucide-react";
import { getRecentSearches } from "../services/routeService.js";
import { getSavedRoutes, SAVED_ROUTES_CHANGE_EVENT } from "../services/savedRoutesService.js";
import { getStoredAlerts, getReadNotificationIds, NOTIFICATIONS_CHANGE_EVENT } from "../services/alertService.js";
import { nearbyStops } from "../data/demoRoutes.js";
import AlertCard from "../components/AlertCard.jsx";

export default function Home() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo]     = useState("");
  const [recent, setRecent]   = useState([]);
  const [saved, setSaved]     = useState([]);
  const [alerts, setAlerts]   = useState([]);
  const [unreadAlertCount, setUnreadAlertCount] = useState(0);

  const loadAll = () => {
    getSavedRoutes().then(setSaved);
    const storedAlerts = getStoredAlerts().filter((a) => a.isActive);
    setAlerts(storedAlerts.slice(0, 2));

    const reads = getReadNotificationIds();
    setUnreadAlertCount(storedAlerts.filter((a) => !reads.has(a.id)).length);
  };

  useEffect(() => {
    setRecent(getRecentSearches());
    loadAll();

    window.addEventListener(SAVED_ROUTES_CHANGE_EVENT, loadAll);
    window.addEventListener(NOTIFICATIONS_CHANGE_EVENT, loadAll);
    return () => {
      window.removeEventListener(SAVED_ROUTES_CHANGE_EVENT, loadAll);
      window.removeEventListener(NOTIFICATIONS_CHANGE_EVENT, loadAll);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (from.trim() && to.trim()) {
      navigate(`/planner?source=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}`);
    }
  };

  const quickLinks = [
    { label: "Smart Planner",  icon: Compass,    to: "/planner", color: "bg-teal-500",   desc: "Direct & 1-Transfer" },
    { label: "Nearby Stops",   icon: Navigation, to: "/nearby",  color: "bg-emerald-600", desc: "GPS Haversine Search" },
    { label: "Service Alerts", icon: Bell,       to: "/alerts",  color: "bg-amber-500",  desc: "Advisories & Badges", badge: unreadAlertCount },
    { label: "Crowd Status",   icon: Users,      to: "/crowd",   color: "bg-navy-700",   desc: "Occupancy Intelligence" },
    { label: "Saved Routes",   icon: Star,       to: "/saved",   color: "bg-purple-500", desc: "Offline Favourites", badge: saved.length },
    { label: "Search Routes",  icon: Search,     to: "/search",  color: "bg-blue-600",   desc: "Route Directory" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-3xl p-6 text-white shadow-card">
        <div className="flex items-center gap-2 mb-1">
          <div className="bg-teal-500 p-1 rounded-lg">
            <Bus className="h-4 w-4" />
          </div>
          <span className="text-teal-300 text-sm font-medium">BusBridge · Chennai</span>
        </div>
        <h1 className="text-2xl font-bold mt-2 mb-1">
          Smart Public Bus<br />Journey Planner & Transit Hub
        </h1>
        <p className="text-navy-300 text-sm mb-5">
          Find connected direct and transfer bus journeys, nearby stops & live advisories.
        </p>

        <form onSubmit={handleSearch} className="space-y-2">
          <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-teal-500 flex-shrink-0" />
            <input
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="From – e.g. Tambaram or Koyambedu"
              className="flex-1 text-gray-800 text-sm outline-none bg-transparent placeholder-gray-400"
            />
          </div>
          <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-navy-700 flex-shrink-0" />
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="To – e.g. Broadway or Adyar"
              className="flex-1 text-gray-800 text-sm outline-none bg-transparent placeholder-gray-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="submit"
              disabled={!from.trim() || !to.trim()}
              className="bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <Compass className="h-4 w-4" />
              Plan Journey
            </button>
            <button
              type="button"
              onClick={() => navigate("/nearby")}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <Navigation className="h-4 w-4 text-teal-300" />
              Find Nearby Stops
            </button>
          </div>
        </form>
      </div>

      {/* Quick links Grid */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Quick Transit Features
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickLinks.map(({ label, icon: Icon, to, color, desc, badge }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="bg-white rounded-2xl shadow-card hover:shadow-card-hover p-4 flex flex-col justify-between transition-all border border-gray-100 text-left relative overflow-hidden group"
            >
              <div className="flex items-start justify-between w-full mb-2">
                <div className={`${color} p-2 rounded-xl text-white shadow-xs group-hover:scale-105 transition-transform`}>
                  <Icon className="h-4 w-4" />
                </div>
                {badge > 0 && (
                  <span className="bg-amber-400 text-navy-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs sm:text-sm text-gray-800 block truncate">
                  {label}
                </span>
                <span className="text-[10px] text-gray-400 block truncate mt-0.5">
                  {desc}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Nearby stops summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
            <MapPin className="h-4 w-4" />Nearby Bus Stops
          </h2>
          <button
            onClick={() => navigate("/nearby")}
            className="text-xs text-teal-600 font-semibold hover:underline"
          >
            Explore on Map →
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 divide-y divide-gray-50">
          {nearbyStops.map((stop) => (
            <div
              key={stop.id}
              onClick={() => navigate(`/planner?source=${encodeURIComponent(stop.name)}`)}
              className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50/80 transition-colors"
            >
              <div>
                <p className="font-semibold text-sm text-gray-800">{stop.name}</p>
                <p className="text-xs text-teal-600 font-medium mt-0.5">📏 {stop.distance} away</p>
              </div>
              <div className="flex flex-wrap gap-1 justify-end">
                {stop.routes.slice(0, 3).map((r) => (
                  <span key={r} className="text-xs bg-navy-800 text-white font-bold px-2 py-0.5 rounded-lg shadow-xs">{r}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1 px-1">📍 Chennai verified coordinates · Haversine calculated</p>
      </div>

      {/* Recent searches */}
      {recent.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />Recent Searches
          </h2>
          <div className="space-y-2">
            {recent.slice(0, 3).map((r, i) => (
              <button
                key={i}
                onClick={() => navigate(`/planner?source=${encodeURIComponent(r.from)}&destination=${encodeURIComponent(r.to)}`)}
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
              <Star className="h-4 w-4 text-amber-400" />Favourite Journeys
            </h2>
            <button onClick={() => navigate("/saved")} className="text-xs text-teal-600 font-semibold hover:underline">
              View all ({saved.length}) →
            </button>
          </div>
          <div className="space-y-2">
            {saved.slice(0, 3).map((route) => (
              <button
                key={route.id}
                onClick={() => navigate(`/planner?source=${encodeURIComponent(route.from || route.origin)}&destination=${encodeURIComponent(route.to || route.destination)}`)}
                className="w-full bg-white rounded-xl shadow-card border border-gray-100 px-4 py-3 flex items-center gap-3 hover:shadow-card-hover transition-all text-left"
              >
                <div className="bg-navy-800 text-white rounded-lg px-2 py-1 text-xs font-bold">{route.busNumber}</div>
                <span className="text-sm text-gray-700 flex-1 truncate">{route.from || route.origin} → {route.to || route.destination}</span>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Service alerts preview */}
      {alerts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />Active Service Advisories
            </h2>
            <button
              onClick={() => navigate("/alerts")}
              className="text-xs text-teal-600 font-semibold hover:underline"
            >
              Alerts Center →
            </button>
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} showActions={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
