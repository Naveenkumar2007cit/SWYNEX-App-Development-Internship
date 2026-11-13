import { NavLink } from "react-router-dom";
import { Bus, Compass, Navigation, Search, Bell, Bookmark } from "lucide-react";
import { useState, useEffect } from "react";
import { getLocalSaved, SAVED_ROUTES_CHANGE_EVENT } from "../services/savedRoutesService.js";
import { getStoredAlerts, getReadNotificationIds, NOTIFICATIONS_CHANGE_EVENT } from "../services/alertService.js";

const navItems = [
  { to: "/",        icon: Bus,        label: "Home" },
  { to: "/planner", icon: Compass,    label: "Planner" },
  { to: "/nearby",  icon: Navigation, label: "Nearby" },
  { to: "/search",  icon: Search,     label: "Search" },
  { to: "/alerts",  icon: Bell,       label: "Alerts", hasAlertBadge: true },
  { to: "/saved",   icon: Bookmark,   label: "Saved", hasSavedBadge: true },
];

export default function BottomNavigation() {
  const [savedCount, setSavedCount] = useState(0);
  const [unreadAlertCount, setUnreadAlertCount] = useState(0);

  const updateCounts = () => {
    const list = getLocalSaved();
    setSavedCount(list.length);

    const alerts = getStoredAlerts().filter((a) => a.isActive);
    const reads = getReadNotificationIds();
    setUnreadAlertCount(alerts.filter((a) => !reads.has(a.id)).length);
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-lg bg-white/90 border-t border-emerald-100 lg:hidden safe-area-pb shadow-lg shadow-emerald-950/5">
      <div className="flex">
        {navItems.map(({ to, icon: Icon, label, hasSavedBadge, hasAlertBadge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex-1 py-2 flex flex-col items-center justify-center text-[10px] font-semibold transition-all relative ${
                isActive ? "text-emerald-700" : "text-slate-500 hover:text-emerald-600"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-all relative ${isActive ? "bg-emerald-100/70 text-emerald-700 scale-110" : ""}`}>
                  <Icon className="h-5 w-5" />
                  {hasSavedBadge && savedCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 bg-amber-400 text-slate-950 font-black text-[9px] px-1 rounded-full shadow-xs">
                      {savedCount}
                    </span>
                  )}
                  {hasAlertBadge && unreadAlertCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 bg-rose-500 text-white font-black text-[9px] px-1 rounded-full shadow-xs animate-pulse">
                      {unreadAlertCount}
                    </span>
                  )}
                </div>
                <span className="mt-0.5 tracking-tight">{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 w-8 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
