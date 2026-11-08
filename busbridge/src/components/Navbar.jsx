import { NavLink } from "react-router-dom";
import { Bus, Search, Users, AlertOctagon, Bookmark, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/",             icon: Bus,           label: "Home" },
  { to: "/search",       icon: Search,        label: "Search" },
  { to: "/crowd",        icon: Users,         label: "Crowd" },
  { to: "/report",       icon: AlertOctagon,  label: "Report" },
  { to: "/saved",        icon: Bookmark,      label: "Saved" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
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
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-white/20 text-white" : "text-navy-200 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" />{label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 rounded-lg hover:bg-white/10" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden bg-navy-900 border-t border-white/10 px-4 pb-4">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors mt-1 ${
                  isActive ? "bg-white/20 text-white" : "text-navy-200 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" />{label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
