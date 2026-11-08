import { NavLink } from "react-router-dom";
import { Bus, Search, Users, AlertOctagon, Bookmark } from "lucide-react";

const navItems = [
  { to: "/",       icon: Bus,          label: "Home" },
  { to: "/search", icon: Search,       label: "Search" },
  { to: "/crowd",  icon: Users,        label: "Crowd" },
  { to: "/report", icon: AlertOctagon, label: "Report" },
  { to: "/saved",  icon: Bookmark,     label: "Saved" },
];

export default function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden safe-area-pb">
      <div className="flex">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-2 gap-0.5 text-xs font-medium transition-colors ${
                isActive ? "text-teal-600" : "text-gray-400 hover:text-gray-600"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? "bg-teal-50" : ""}`}>
                  <Icon className="h-5 w-5" />
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
