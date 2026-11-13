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
    <header className="bg-navy-800 text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="bg-teal-500 p-1.5 rounded-lg">
            <Bus className="h-5 w-5 text-white" />
          </div>
          <span>BusBridge</span>
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map(({ to, icon: Icon, label, hasSavedBadge, hasAlertBadge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors relative ${
                  isActive ? "bg-white/20 text-white" : "text-navy-200 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>

              {hasSavedBadge && savedCount > 0 && (
                <span className="bg-amber-400 text-navy-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {savedCount}
                </span>
              )}

              {hasAlertBadge && unreadAlertCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                  {unreadAlertCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Mobile / Tablet hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          {unreadAlertCount > 0 && (
            <NavLink to="/alerts" className="p-2 rounded-lg bg-red-600/30 text-white relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
            </NavLink>
          )}

          <button
            className="p-2 rounded-lg hover:bg-white/10 relative"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="lg:hidden bg-navy-900 border-t border-white/10 px-4 pb-4">
          {navItems.map(({ to, icon: Icon, label, hasSavedBadge, hasAlertBadge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mt-1 ${
                  isActive ? "bg-white/20 text-white" : "text-navy-200 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasSavedBadge && savedCount > 0 && (
                  <span className="bg-amber-400 text-navy-950 text-xs font-bold px-2 py-0.5 rounded-full">
                    {savedCount}
                  </span>
                )}
                {hasAlertBadge && unreadAlertCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
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
