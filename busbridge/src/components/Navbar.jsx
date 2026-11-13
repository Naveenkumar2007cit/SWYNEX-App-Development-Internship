import { NavLink } from "react-router-dom";
import { Bus, Search, Compass, Users, AlertOctagon, Bookmark, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { getLocalSaved, SAVED_ROUTES_CHANGE_EVENT } from "../services/savedRoutesService.js";

const navItems = [
  { to: "/",             icon: Bus,           label: "Home" },
  { to: "/planner",      icon: Compass,       label: "Planner" },
  { to: "/search",       icon: Search,        label: "Search" },
  { to: "/crowd",        icon: Users,         label: "Crowd" },
  { to: "/report",       icon: AlertOctagon,  label: "Report" },
  { to: "/saved",        icon: Bookmark,      label: "Saved", hasBadge: true },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
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
    <header className="bg-navy-800 text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="bg-teal-500 p-1.5 rounded-lg">
            <Bus className="h-5 w-5 text-white" />
          </div>
          <span>BusBridge</span>
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, icon: Icon, label, hasBadge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                  isActive ? "bg-white/20 text-white" : "text-navy-200 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {hasBadge && savedCount > 0 && (
                <span className="bg-amber-400 text-navy-950 text-[10px] font-black px-1.5 py-0.2 rounded-full ml-0.5">
                  {savedCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/10 relative"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          {savedCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-400" />
          )}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden bg-navy-900 border-t border-white/10 px-4 pb-4">
          {navItems.map(({ to, icon: Icon, label, hasBadge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-colors mt-1 ${
                  isActive ? "bg-white/20 text-white" : "text-navy-200 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </div>
              {hasBadge && savedCount > 0 && (
                <span className="bg-amber-400 text-navy-950 text-xs font-bold px-2 py-0.5 rounded-full">
                  {savedCount}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
