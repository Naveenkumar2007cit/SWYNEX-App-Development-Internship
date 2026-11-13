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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden safe-area-pb shadow-lg">
      <div className="flex">
        {navItems.map(({ to, icon: Icon, label, hasSavedBadge, hasAlertBadge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1.5 gap-0.5 text-[10px] font-medium transition-colors relative ${
                isActive ? "text-teal-600 font-bold" : "text-gray-400 hover:text-gray-600"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-colors relative ${isActive ? "bg-teal-50" : ""}`}>
                  <Icon className="h-4 w-4" />
                  {hasSavedBadge && savedCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-400 text-navy-950 font-black text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {savedCount > 9 ? "9+" : savedCount}
                    </span>
                  )}
                  {hasAlertBadge && unreadAlertCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {unreadAlertCount > 9 ? "9+" : unreadAlertCount}
                    </span>
                  )}
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
