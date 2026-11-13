import { useState, useEffect, useRef } from "react";
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
  Check,
  Radio,
} from "lucide-react";
import { getRecentSearches } from "../services/routeService.js";
import { getSavedRoutes, SAVED_ROUTES_CHANGE_EVENT } from "../services/savedRoutesService.js";
import { getStoredAlerts, getReadNotificationIds, NOTIFICATIONS_CHANGE_EVENT } from "../services/alertService.js";
import { nearbyStops, allStopNames } from "../data/demoRoutes.js";
import AlertCard from "../components/AlertCard.jsx";

export default function Home() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo]     = useState("");
  const [recent, setRecent]   = useState([]);
  const [saved, setSaved]     = useState([]);
  const [alerts, setAlerts]   = useState([]);
  const [unreadAlertCount, setUnreadAlertCount] = useState(0);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const fromBoxRef = useRef(null);
  const toBoxRef = useRef(null);

  const getFilteredStops = (query) => {
    if (!query || query.trim().length === 0) return allStopNames.slice(0, 5);
    const q = query.toLowerCase().trim();
    return allStopNames.filter((s) => s.toLowerCase().includes(q)).slice(0, 6);
  };

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

    const handleClickOutside = (e) => {
      if (fromBoxRef.current && !fromBoxRef.current.contains(e.target)) {
        setShowFromSuggestions(false);
      }
      if (toBoxRef.current && !toBoxRef.current.contains(e.target)) {
        setShowToSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    window.addEventListener(SAVED_ROUTES_CHANGE_EVENT, loadAll);
    window.addEventListener(NOTIFICATIONS_CHANGE_EVENT, loadAll);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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

  const handleSwapStops = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const quickLinks = [
    { label: "Smart Planner",  icon: Compass,    to: "/planner", color: "from-emerald-500 to-teal-600", desc: "Direct & 1-Transfer" },
    { label: "Nearby Stops",   icon: Navigation, to: "/nearby",  color: "from-teal-500 to-emerald-700",  desc: "GPS Haversine Radar" },
    { label: "Service Alerts", icon: Bell,       to: "/alerts",  color: "from-amber-500 to-amber-700",   desc: "Advisories & Badges", badge: unreadAlertCount },
    { label: "Crowd Status",   icon: Users,      to: "/crowd",   color: "from-navy-700 to-navy-900",     desc: "Community Occupancy" },
    { label: "Saved Routes",   icon: Star,       to: "/saved",   color: "from-purple-500 to-indigo-700", desc: "Offline Favourites", badge: saved.length },
    { label: "Search Routes",  icon: Search,     to: "/search",  color: "from-blue-600 to-blue-800",     desc: "Bus Directory" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28 md:pb-12 space-y-7">
      {/* Hero with Chennai Emerald Glassmorphism Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-emerald-950 p-6 sm:p-7 text-white shadow-xl shadow-emerald-950/15 border border-white/10">
        {/* Glow ambient background accents */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                MTC Chennai Transit
              </span>
            </div>
            <span className="text-[11px] text-teal-200/70 font-semibold">Live Demo Grid</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3 mb-2 leading-tight">
            Chennai Public Bus <br />
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-white bg-clip-text text-transparent">
              Smart Journey Planner
            </span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mb-6 max-w-lg">
            Search connected direct & 1-transfer MTC routes, scan nearby stops with GPS, and track real-time advisories.
          </p>

          <form onSubmit={handleSearch} className="space-y-2.5">
            {/* From Input with Autocomplete */}
            <div ref={fromBoxRef} className="relative">
              <div className="backdrop-blur-md bg-white/95 text-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-md focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                <div className="h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 flex-shrink-0" />
                <input
                  value={from}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    setShowFromSuggestions(true);
                  }}
                  onFocus={() => setShowFromSuggestions(true)}
                  placeholder="Starting stop (e.g., Tambaram, Guindy, Koyambedu)"
                  className="flex-1 text-slate-800 font-medium text-sm outline-none bg-transparent placeholder-slate-400"
                />
                {from && (
                  <button
                    type="button"
                    onClick={() => setFrom("")}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showFromSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1.5 backdrop-blur-xl bg-white/95 rounded-2xl shadow-xl border border-emerald-100 overflow-hidden z-30 max-h-52 overflow-y-auto divide-y divide-slate-100 animate-fadeIn">
                  <div className="px-3 py-1.5 bg-emerald-50/70 text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-emerald-600" /> Suggested Chennai Stops
                  </div>
                  {getFilteredStops(from).map((stop) => (
                    <button
                      key={stop}
                      type="button"
                      onClick={() => {
                        setFrom(stop);
                        setShowFromSuggestions(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors flex items-center justify-between"
                    >
                      <span>{stop}</span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-full font-medium">Select</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Swap Button Row */}
            <div className="flex justify-end pr-2 -my-1 relative z-10">
              <button
                type="button"
                onClick={handleSwapStops}
                title="Swap source and destination"
                className="bg-navy-950/80 hover:bg-navy-900 border border-white/20 text-teal-300 p-1.5 rounded-full shadow-md hover:scale-105 transition-all text-xs flex items-center gap-1 px-2.5"
              >
                <Shuffle className="h-3 w-3" />
                <span className="text-[10px] font-semibold">Swap</span>
              </button>
            </div>

            {/* To Input with Autocomplete */}
            <div ref={toBoxRef} className="relative">
              <div className="backdrop-blur-md bg-white/95 text-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-md focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                <div className="h-3 w-3 rounded-full bg-rose-500 ring-4 ring-rose-100 flex-shrink-0" />
                <input
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setShowToSuggestions(true);
                  }}
                  onFocus={() => setShowToSuggestions(true)}
                  placeholder="Destination stop (e.g., Broadway, Adyar, Velachery)"
                  className="flex-1 text-slate-800 font-medium text-sm outline-none bg-transparent placeholder-slate-400"
                />
                {to && (
                  <button
                    type="button"
                    onClick={() => setTo("")}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showToSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1.5 backdrop-blur-xl bg-white/95 rounded-2xl shadow-xl border border-emerald-100 overflow-hidden z-30 max-h-52 overflow-y-auto divide-y divide-slate-100 animate-fadeIn">
                  <div className="px-3 py-1.5 bg-emerald-50/70 text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-emerald-600" /> Suggested Chennai Stops
                  </div>
                  {getFilteredStops(to).map((stop) => (
                    <button
                      key={stop}
                      type="button"
                      onClick={() => {
                        setTo(stop);
                        setShowToSuggestions(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors flex items-center justify-between"
                    >
                      <span>{stop}</span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-full font-medium">Select</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="submit"
                disabled={!from.trim() || !to.trim()}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-900/30 text-xs sm:text-sm active:scale-95"
              >
                <Compass className="h-4 w-4" />
                Find Routes
              </button>
              <button
                type="button"
                onClick={() => navigate("/nearby")}
                className="backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all text-xs sm:text-sm active:scale-95"
              >
                <Navigation className="h-4 w-4 text-emerald-300" />
                Nearby Radar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Quick links Grid with Emerald Glassmorphism Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            Quick Transit Features
          </h2>
          <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
            All-in-One
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickLinks.map(({ label, icon: Icon, to, color, desc, badge }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="backdrop-blur-md bg-white/80 hover:bg-white rounded-2xl shadow-sm hover:shadow-md p-4 flex flex-col justify-between transition-all border border-emerald-950/5 hover:border-emerald-200 text-left relative overflow-hidden group hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between w-full mb-3">
                <div className={`bg-gradient-to-tr ${color} p-2.5 rounded-xl text-white shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className="h-4 w-4" />
                </div>
                {badge > 0 && (
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                    {badge}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-xs sm:text-sm text-slate-800 block truncate group-hover:text-emerald-800 transition-colors">
                  {label}
                </span>
                <span className="text-[10px] text-slate-400 block truncate mt-0.5 font-medium">
                  {desc}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Nearby stops summary with high contrast and interactive pills */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
            Nearby Bus Stops
          </h2>
          <button
            onClick={() => navigate("/nearby")}
            className="text-xs text-emerald-700 font-bold hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100/80 px-2.5 py-1 rounded-full transition-colors"
          >
            Radar Map <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="backdrop-blur-md bg-white/80 rounded-2xl shadow-sm border border-emerald-950/5 divide-y divide-slate-100 overflow-hidden">
          {nearbyStops.map((stop) => (
            <div
              key={stop.id}
              className="p-3.5 sm:px-4 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-emerald-50/40 transition-colors"
            >
              <div
                onClick={() => navigate(`/planner?source=${encodeURIComponent(stop.name)}`)}
                className="cursor-pointer group flex-1"
              >
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-slate-800 group-hover:text-emerald-700 transition-colors">
                    {stop.name}
                  </p>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    {stop.distance}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <span>Tap to plan journey from this stop</span>
                </p>
              </div>

              {/* Responsive interactive route pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Routes:</span>
                {stop.routes.map((r) => (
                  <button
                    key={r}
                    onClick={() => navigate(`/search?query=${encodeURIComponent(r)}`)}
                    title={`View schedule for Bus ${r}`}
                    className="text-xs bg-navy-900 hover:bg-emerald-700 text-white font-black px-2.5 py-1 rounded-xl shadow-xs transition-all hover:scale-105 active:scale-95"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5 px-2 flex items-center gap-1 font-medium">
          <span>📍 Chennai MTC GPS verified coordinates · Calculated via Haversine</span>
        </p>
      </div>

      {/* Recent searches with interactive touch targets */}
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              Recent Searches
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">1-Tap Repeat</span>
          </div>
          <div className="space-y-2">
            {recent.slice(0, 3).map((r, i) => (
              <button
                key={i}
                onClick={() => navigate(`/planner?source=${encodeURIComponent(r.from)}&destination=${encodeURIComponent(r.to)}`)}
                className="w-full backdrop-blur-md bg-white/80 rounded-2xl shadow-xs border border-emerald-950/5 px-4 py-3 flex items-center gap-3 hover:bg-white hover:shadow-md hover:border-emerald-200 transition-all text-left group"
              >
                <div className="p-2 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-slate-700 truncate">{r.from}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-slate-700 truncate">{r.to}</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white px-3 py-1 rounded-xl transition-all">
                  Search
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Saved routes preview */}
      {saved.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              Favourite Journeys
            </h2>
            <button onClick={() => navigate("/saved")} className="text-xs text-emerald-700 font-bold hover:underline">
              View all ({saved.length}) →
            </button>
          </div>
          <div className="space-y-2">
            {saved.slice(0, 3).map((route) => (
              <button
                key={route.id}
                onClick={() => navigate(`/planner?source=${encodeURIComponent(route.from || route.origin)}&destination=${encodeURIComponent(route.to || route.destination)}`)}
                className="w-full backdrop-blur-md bg-white/80 rounded-2xl shadow-xs border border-emerald-950/5 px-4 py-3 flex items-center gap-3 hover:bg-white hover:shadow-md transition-all text-left"
              >
                <div className="bg-navy-900 text-white rounded-xl px-2.5 py-1 text-xs font-black shadow-xs">
                  {route.busNumber}
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-700 flex-1 truncate">
                  {route.from || route.origin} → {route.to || route.destination}
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Service alerts preview */}
      {alerts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              Active Service Advisories
            </h2>
            <button
              onClick={() => navigate("/alerts")}
              className="text-xs text-emerald-700 font-bold hover:underline"
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

      {/* Quick Access Floating Action Button (FAB) on Mobile */}
      <div className="fixed bottom-20 right-4 z-30 lg:hidden">
        <button
          onClick={() => navigate("/nearby")}
          className="bg-gradient-to-tr from-emerald-600 to-teal-500 text-white p-3.5 rounded-2xl shadow-xl shadow-emerald-900/30 flex items-center gap-2 border border-white/20 active:scale-90 hover:scale-105 transition-all"
          title="Nearby Bus Stops Radar"
        >
          <Navigation className="h-5 w-5" />
          <span className="text-xs font-bold pr-1">Nearby Radar</span>
        </button>
      </div>
    </div>
  );
}
