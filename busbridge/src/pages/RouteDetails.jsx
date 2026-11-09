import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, Bus, Star, Navigation, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { getRouteById } from "../services/routeService";
import { saveRoute, unsaveRoute, isRouteSaved, SAVED_ROUTES_CHANGE_EVENT } from "../services/savedRoutesService";
import BusStopList from "../components/BusStopList";
import MapView from "../components/MapView";
import LoadingSpinner from "../components/LoadingSpinner";

export default function RouteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved]   = useState(false);
  const [tab, setTab]       = useState("stops");
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'warning' | 'info', message: string }

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((curr) => (curr?.message === message ? null : curr));
    }, 3500);
  };

  useEffect(() => {
    getRouteById(id).then((r) => {
      setRoute(r);
      if (r?.id) setSaved(isRouteSaved(r.id));
      setLoading(false);
    });

    const updateSaved = () => {
      if (id) setSaved(isRouteSaved(id));
    };
    window.addEventListener(SAVED_ROUTES_CHANGE_EVENT, updateSaved);
    return () => window.removeEventListener(SAVED_ROUTES_CHANGE_EVENT, updateSaved);
  }, [id]);

  const handleSave = async () => {
    if (!route || !route.id) return;

    if (saved) {
      await unsaveRoute(route.id);
      setSaved(false);
      showFeedback("info", `Bus ${route.busNumber} removed from favourites.`);
    } else {
      const res = await saveRoute(route);
      if (res.success) {
        setSaved(true);
        showFeedback("success", `Bus ${route.busNumber} saved to favourites!`);
      } else if (res.alreadySaved) {
        setSaved(true);
        showFeedback("warning", res.message);
      } else {
        showFeedback("warning", res.message || "Failed to save route.");
      }
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-10"><LoadingSpinner text="Loading route details..." /></div>;

  if (!route) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-3">🚌</div>
      <h2 className="text-lg font-bold text-gray-700 mb-2">Route not found</h2>
      <button onClick={() => navigate("/search")} className="text-teal-600 text-sm font-medium">← Back to Search</button>
    </div>
  );

  const typeBadge = { "Ordinary":"bg-navy-100 text-navy-700", "Express":"bg-teal-100 text-teal-700", "Metro Feeder":"bg-purple-100 text-purple-700" }[route.type] || "bg-gray-100 text-gray-600";

  return (
    <div className="max-w-2xl mx-auto pb-24 md:pb-8">
      {/* Toast Feedback Notification */}
      {feedback && (
        <div className="sticky top-16 z-30 px-4 pt-2">
          <div
            className={`p-3.5 rounded-xl text-sm flex items-center justify-between shadow-lg border transition-all ${
              feedback.type === "success"
                ? "bg-teal-600 text-white border-teal-500"
                : feedback.type === "warning"
                ? "bg-amber-500 text-white border-amber-400"
                : "bg-navy-800 text-white border-navy-700"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              )}
              <span className="font-medium text-xs sm:text-sm">{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="p-1 hover:bg-white/20 rounded-lg text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-navy-800 text-white px-4 pt-4 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-navy-200">Route Details</span>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleSave}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                saved
                  ? "bg-amber-400 text-navy-950 shadow-md hover:bg-amber-300"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
              title={saved ? "Remove from saved routes" : "Save this route"}
            >
              <Star className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
              <span>{saved ? "Saved" : "Save Route"}</span>
            </button>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="bg-teal-500 p-2.5 rounded-xl flex-shrink-0">
            <Bus className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-3xl font-black">{route.busNumber}</span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${typeBadge}`}>{route.type}</span>
            </div>
            <p className="text-navy-200 text-sm mt-0.5">{route.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          {[{ icon: Clock, label: "Duration", value: `${route.duration} min` }, { icon: MapPin, label: "Stops", value: route.totalStops }, { icon: Navigation, label: "Distance", value: `${route.distance} km` }].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white/10 rounded-xl p-3 text-center">
              <Icon className="h-4 w-4 mx-auto mb-1 text-teal-300" />
              <p className="text-xs text-navy-300">{label}</p>
              <p className="font-bold text-sm">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Journey info */}
      <div className="px-4 -mt-3">
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-4 flex items-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-full bg-teal-500" />
            <div className="w-0.5 h-6 bg-gray-200" />
            <div className="h-2.5 w-2.5 rounded-full bg-navy-700" />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <div>
              <p className="font-semibold text-sm text-gray-800">{route.from}</p>
              <p className="text-xs text-gray-400">Starting point</p>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800">{route.to}</p>
              <p className="text-xs text-gray-400">Destination</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Frequency</p>
            <p className="text-sm font-semibold text-teal-600">{route.frequency}</p>
          </div>
        </div>
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-2">⚠ Sample data – durations are estimates, not live schedules</p>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-5">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {["stops","map"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${tab === t ? "bg-white text-navy-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {t === "stops" ? "Stop List" : "Route Map"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4">
        {tab === "stops" ? (
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4 text-sm">{route.stops?.length || 0} Stops</h3>
            <BusStopList stops={route.stops || []} />
          </div>
        ) : (
          <div>
            <MapView stops={route.stops || []} height="400px" />
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        <button onClick={() => navigate(`/crowd?route=${route.id}&bus=${route.busNumber}`)}
          className="bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
          Check Crowd
        </button>
        <button onClick={() => navigate(`/report?bus=${route.busNumber}`)}
          className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
          Report Issue
        </button>
      </div>
    </div>
  );
}
