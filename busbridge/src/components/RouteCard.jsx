import { useNavigate } from "react-router-dom";
import { Clock, MapPin, Star, ChevronRight, Bus, Check, AlertTriangle } from "lucide-react";
import { isRouteSaved, saveRoute, unsaveRoute, SAVED_ROUTES_CHANGE_EVENT } from "../services/savedRoutesService";
import { useState, useEffect } from "react";

export default function RouteCard({ route, showSave = true, onSaveStatusChange }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(() => (route?.id ? isRouteSaved(route.id) : false));
  const [toast, setToast] = useState(null); // { type: 'success' | 'warning', message: string }

  useEffect(() => {
    if (route?.id) {
      setSaved(isRouteSaved(route.id));
    }
    const update = () => {
      if (route?.id) {
        setSaved(isRouteSaved(route.id));
      }
    };
    window.addEventListener(SAVED_ROUTES_CHANGE_EVENT, update);
    return () => window.removeEventListener(SAVED_ROUTES_CHANGE_EVENT, update);
  }, [route?.id]);

  const triggerToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 3000);
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!route || !route.id) return;

    if (saved) {
      await unsaveRoute(route.id);
      setSaved(false);
      triggerToast("warning", `Removed Bus ${route.busNumber} from favourites`);
      if (onSaveStatusChange) onSaveStatusChange(route.id, false);
    } else {
      const res = await saveRoute(route);
      if (res.success) {
        setSaved(true);
        triggerToast("success", `Saved Bus ${route.busNumber} to favourites!`);
        if (onSaveStatusChange) onSaveStatusChange(route.id, true);
      } else if (res.alreadySaved) {
        setSaved(true);
        triggerToast("warning", res.message);
      } else {
        triggerToast("warning", res.message || "Could not save route");
      }
    }
  };

  if (!route) return null;

  const typeBadge = {
    "Ordinary":     "bg-navy-100 text-navy-700",
    "Express":      "bg-teal-100 text-teal-700",
    "Metro Feeder": "bg-purple-100 text-purple-700",
  }[route.type] || "bg-gray-100 text-gray-600";

  return (
    <div
      onClick={() => navigate(`/route/${route.id}`)}
      className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer border border-gray-100 p-4 flex flex-col gap-3 relative overflow-hidden"
    >
      {/* Mini notification banner if save/unsave clicked inside card */}
      {toast && (
        <div
          className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
            toast.type === "success"
              ? "bg-teal-50 text-teal-700 border border-teal-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {toast.type === "success" ? (
            <Check className="h-3.5 w-3.5 text-teal-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
          )}
          <span className="truncate">{toast.message}</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-navy-800 text-white rounded-xl px-3 py-1.5 font-bold text-sm flex items-center gap-1.5">
            <Bus className="h-3.5 w-3.5" />
            {route.busNumber}
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${typeBadge}`}>{route.type}</span>
        </div>
        {showSave && (
          <button
            onClick={handleSave}
            title={saved ? "Remove from saved favourites" : "Save to favourites"}
            className={`p-2 rounded-full transition-all active:scale-95 ${
              saved
                ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                : "text-gray-300 hover:text-amber-400 hover:bg-amber-50"
            }`}
            aria-label={saved ? "Remove from saved" : "Save route"}
          >
            <Star className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm">
        <div className="flex flex-col items-center">
          <div className="h-2 w-2 rounded-full bg-teal-500" />
          <div className="w-0.5 h-6 bg-gray-200" />
          <div className="h-2 w-2 rounded-full bg-navy-700" />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="font-medium text-gray-800">{route.from}</span>
          <span className="font-medium text-gray-800">{route.to}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 border-t pt-2">
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{route.duration} min</span>
        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{route.totalStops} stops</span>
        <span className="flex items-center gap-1 text-gray-400">{route.distance} km</span>
        <ChevronRight className="h-4 w-4 text-gray-300 ml-auto" />
      </div>
      <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1">⚠ Sample data – not official MTC schedule</p>
    </div>
  );
}
