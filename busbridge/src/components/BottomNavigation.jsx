import { NavLink } from "react-router-dom";
import { Bus, Compass, Search, Users, AlertOctagon, Bookmark } from "lucide-react";
import { useState, useEffect } from "react";
import { getLocalSaved, SAVED_ROUTES_CHANGE_EVENT } from "../services/savedRoutesService.js";

const navItems = [
  { to: "/",        icon: Bus,          label: "Home" },
  { to: "/planner", icon: Compass,      label: "Planner" },
  { to: "/search",  icon: Search,       label: "Search" },
  { to: "/crowd",   icon: Users,        label: "Crowd" },
  { to: "/report",  icon: AlertOctagon, label: "Report" },
  { to: "/saved",   icon: Bookmark,     label: "Saved", hasBadge: true },
];

export default function BottomNavigation() {
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const list = getLocalSaved();
      setSavedCount(list.length);
    };

    updateCount();
    window.addEventListener(SAVED_ROUTES_CHANGE_EVENT, updateCount);
    window.addEventListener("storage", updateCount);

    return () => {
      window.removeEventListener(SAVED_ROUTES_CHANGE_EVENT, updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden safe-area-pb">
      <div className="flex">
        {navItems.map(({ to, icon: Icon, label, hasBadge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1.5 gap-0.5 text-[11px] font-medium transition-colors relative ${
                isActive ? "text-teal-600" : "text-gray-400 hover:text-gray-600"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-colors relative ${isActive ? "bg-teal-50" : ""}`}>
                  <Icon className="h-4 w-4" />
                  {hasBadge && savedCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-400 text-navy-950 font-black text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {savedCount > 9 ? "9+" : savedCount}
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
