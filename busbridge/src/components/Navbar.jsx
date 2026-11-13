import { NavLink } from "react-router-dom";
import { Bus, Search, Compass, Users, AlertOctagon, Bookmark, Bell, Navigation, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { getLocalSaved, SAVED_ROUTES_CHANGE_EVENT } from "../services/savedRoutesService.js";
import { getStoredAlerts, getReadNotificationIds, NOTIFICATIONS_CHANGE_EVENT } from "../services/alertService.js";

const navItems = [
  { to: "/",             icon: Bus,           label: "Home" },
  { to: "/planner",      icon: Compass,       label: "Planner" },
  { to: "/nearby",       icon: Navigation,    label: "Nearby" },
  { to: "/search",       icon: Search,        label: "Search" },
  { to: "/alerts",       icon: Bell,          label: "Alerts", hasAlertBadge: true },
  { to: "/crowd",        icon: Users,         label: "Crowd" },
  { to: "/report",       icon: AlertOctagon,  label: "Reports" },
  { to: "/saved",        icon: Bookmark,      label: "Saved", hasSavedBadge: true },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [unreadAlertCount, setUnreadAlertCount] = useState(0);

  const updateCounts = () => {
    const list = getLocalSaved();
    setSavedCount(list.length);

    const alerts = getStoredAlerts().filter((a) => a.isActive);
    const reads = getReadNotificationIds();
    const unread = alerts.filter((a) => !reads.has(a.id)).length;
    setUnreadAlertCount(unread);
  };

  useEffect(() => {
    updateCounts();

    window.addEventListener(SAVED_ROUTES_CHANGE_EVENT, updateCounts);
    window.addEventListener(NOTIFICATIONS_CHANGE_EVENT, updateCounts);
    window.addEventListener("storage", updateCounts);

    return () => {
      window.removeEventListener(SAVED_ROUTES_CHANGE_EVENT, updateCounts);
      window.removeEventListener(NOTIFICATIONS_CHANGE_EVENT, updateCounts);
      window.removeEventListener("storage", updateCounts);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-navy-900/90 border-b border-white/10 text-white shadow-lg transition-all">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight group">
          <div className="bg-gradient-to-tr from-emerald-600 to-teal-400 p-2 rounded-xl shadow-md group-hover:scale-105 transition-transform">
            <Bus className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="bg-gradient-to-r from-white via-teal-100 to-emerald-300 bg-clip-text text-transparent font-black tracking-tight leading-none text-xl">
              BusBridge
            </span>
            <span className="text-[10px] text-teal-300/80 font-medium tracking-wider uppercase mt-0.5">
              Chennai Transit
            </span>
          </div>
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-white/5 backdrop-blur-sm p-1.5 rounded-2xl border border-white/10">
          {navItems.map(({ to, icon: Icon, label, hasSavedBadge, hasAlertBadge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all relative ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-900/20"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>

              {hasSavedBadge && savedCount > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
                  {savedCount}
                </span>
              )}

              {hasAlertBadge && unreadAlertCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-md animate-pulse">
                  {unreadAlertCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Mobile / Tablet actions */}
        <div className="flex items-center gap-2 lg:hidden">
          {unreadAlertCount > 0 && (
            <NavLink
              to="/alerts"
              className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 relative hover:bg-rose-500/30 transition-colors"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-navy-900 animate-pulse" />
            </NavLink>
          )}

          <button
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="lg:hidden backdrop-blur-xl bg-navy-950/95 border-t border-white/10 px-4 pb-4 animate-fadeIn">
          {navItems.map(({ to, icon: Icon, label, hasSavedBadge, hasAlertBadge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors mt-1 ${
                  isActive ? "bg-emerald-600 text-white shadow-sm" : "text-slate-300 hover:bg-white/5"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasSavedBadge && savedCount > 0 && (
                  <span className="bg-amber-400 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full">
                    {savedCount}
                  </span>
                )}
                {hasAlertBadge && unreadAlertCount > 0 && (
                  <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {unreadAlertCount} unread
                  </span>
                )}
              </div>
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
