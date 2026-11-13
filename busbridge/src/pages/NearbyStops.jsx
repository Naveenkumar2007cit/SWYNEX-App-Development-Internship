import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Navigation,
  Compass,
  Search,
  Filter,
  ArrowUpDown,
  LocateFixed,
  AlertTriangle,
  ChevronRight,
  Bus,
  RefreshCw,
  ExternalLink,
  Info,
  ShieldCheck,
} from "lucide-react";
import {
  findNearbyStops,
  requestUserGeolocation,
  CHENNAI_MANUAL_ANCHORS,
  getStopLocationsCatalog,
  calculateHaversineDistance,
  formatDistance,
} from "../services/geolocationService.js";
import MapView from "../components/MapView.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function NearbyStops() {
  const navigate = useNavigate();

  // Location state
  const [userLocation, setUserLocation] = useState(null); // { lat, lng }
  const [locationName, setLocationName] = useState("Manual Anchor: Guindy Hub");
  const [locationStatus, setLocationStatus] = useState("ready"); // 'ready' | 'loading' | 'error' | 'denied'
  const [statusMessage, setStatusMessage] = useState(null);

  // Discovery & Filter states
  const [selectedRadius, setSelectedRadius] = useState(3); // in km (0.5, 1, 2, 5)
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("nearest"); // 'nearest' | 'farthest' | 'routes'
  const [selectedStop, setSelectedStop] = useState(null);

  // Initialize with Chennai Guindy Hub by default (respecting privacy: no automatic GPS request)
  useEffect(() => {
    const defaultAnchor = CHENNAI_MANUAL_ANCHORS[0]; // Guindy Junction
    setUserLocation({ lat: defaultAnchor.lat, lng: defaultAnchor.lng });
    setLocationName(defaultAnchor.name);
  }, []);

  // Handle GPS location request (only triggered after user explicit click)
  const handleAcquireLocation = async () => {
    setLocationStatus("loading");
    setStatusMessage("Requesting browser GPS location permission...");

    const result = await requestUserGeolocation();

    if (result.success && result.coords) {
      setUserLocation({ lat: result.coords.lat, lng: result.coords.lng });
      setLocationName("Your Current Location (GPS)");
      setLocationStatus("ready");
      setStatusMessage(null);
    } else {
      setLocationStatus(result.errorType === "PERMISSION_DENIED" ? "denied" : "error");
      setStatusMessage(result.message);
    }
  };

  // Handle manual anchor selection fallback
  const handleSelectManualAnchor = (anchor) => {
    setUserLocation({ lat: anchor.lat, lng: anchor.lng });
    setLocationName(`Manual Anchor: ${anchor.name}`);
    setLocationStatus("ready");
    setStatusMessage(null);
  };

  // Calculate nearby stops based on current active location
  const nearbyStopsList = useMemo(() => {
    if (!userLocation) return [];
    return findNearbyStops(userLocation.lat, userLocation.lng, selectedRadius);
  }, [userLocation, selectedRadius]);

  // Filtered and sorted stops
  const processedStops = useMemo(() => {
    let list = [...nearbyStopsList];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((s) => {
        const nameMatch = s.name.toLowerCase().includes(q);
        const routeMatch = s.routes.some((r) => r.toLowerCase().includes(q));
        return nameMatch || routeMatch;
      });
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "farthest") {
        return b.distanceKm - a.distanceKm;
      }
      if (sortBy === "routes") {
        return b.routes.length - a.routes.length;
      }
      // 'nearest'
      return a.distanceKm - b.distanceKm;
    });

    return list;
  }, [nearbyStopsList, searchQuery, sortBy]);

  // Navigate to Journey Planner with this stop pre-filled
  const handlePlanFromStop = (stopName) => {
    navigate(`/planner?source=${encodeURIComponent(stopName)}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="bg-teal-500 text-white p-2 rounded-xl shadow-sm">
              <Navigation className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900">
              Nearby Bus Stops & Geolocation
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            Discover Chennai bus stops and passing routes within your walking radius
          </p>
        </div>

        {/* GPS Find Location Button */}
        <button
          onClick={handleAcquireLocation}
          disabled={locationStatus === "loading"}
          className="bg-navy-800 hover:bg-navy-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <LocateFixed className="h-4 w-4 text-teal-400" />
          <span>{locationStatus === "loading" ? "Acquiring GPS..." : "Find Nearby Stops"}</span>
        </button>
      </div>

      {/* Privacy Notice Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-900 flex items-center gap-2.5">
        <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
        <span className="leading-relaxed">
          <strong>Privacy Safeguard:</strong> Your GPS location is computed strictly inside your browser for distance calculations. Coordinates are <strong>never sent to any server or stored permanently</strong>.
        </span>
      </div>

      {/* Location Status Alerts (Permission denied / Error feedback) */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm border flex items-start gap-2.5 ${
            locationStatus === "denied"
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600" />
          <div className="flex-1">
            <p className="font-semibold">{statusMessage}</p>
            <p className="mt-1 text-xs opacity-90">
              Pick one of the major Chennai transit anchors below to continue discovering stops.
            </p>
          </div>
        </div>
      )}

      {/* Current Location Indicator & Manual Anchor Fallback Selector */}
      <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-teal-600" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Active Discovery Center:
            </span>
            <span className="font-bold text-xs sm:text-sm text-navy-900">
              {locationName}
            </span>
          </div>

          <span className="text-xs bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full font-semibold">
            {processedStops.length} Stops Found
          </span>
        </div>

        {/* Manual Anchor Pills */}
        <div>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
            Or select a Chennai Transit Anchor:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {CHENNAI_MANUAL_ANCHORS.map((anchor) => (
              <button
                key={anchor.id}
                onClick={() => handleSelectManualAnchor(anchor)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-all ${
                  locationName.includes(anchor.name)
                    ? "bg-navy-800 text-white border-navy-800 shadow-xs"
                    : "bg-gray-50 hover:bg-teal-50 hover:text-teal-700 text-gray-700 border-gray-200"
                }`}
              >
                {anchor.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Leaflet Map with User Marker + Stop Markers */}
      <div className="space-y-2">
        <MapView
          stops={processedStops}
          userLocation={userLocation}
          selectedStop={selectedStop}
          onStopSelect={(stop) => setSelectedStop(stop)}
          height="420px"
        />
        <p className="text-[11px] text-gray-400 text-center">
          Click any stop marker to inspect passing routes or pre-fill into the Journey Planner
        </p>
      </div>

      {/* Controls Bar: Radius Picker, Search, Sort */}
      <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-4 sm:p-5 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stops by name (e.g. Chromepet, Saidapet) or bus number (e.g. 1A)..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-teal-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-gray-100">
          {/* Radius Selector Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mr-1">
              Radius:
            </span>
            {[
              { val: 0.5, label: "500 m" },
              { val: 1.0, label: "1 km" },
              { val: 2.0, label: "2 km" },
              { val: 3.0, label: "3 km" },
              { val: 5.0, label: "5 km" },
              { val: 10.0, label: "10 km" },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => setSelectedRadius(val)}
                className={`text-xs px-2.5 py-1 rounded-xl font-medium transition-all ${
                  selectedRadius === val
                    ? "bg-teal-600 text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-1 outline-none focus:border-teal-500"
            >
              <option value="nearest">Nearest First</option>
              <option value="farthest">Farthest First</option>
              <option value="routes">Most Bus Routes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Selected Stop Highlight Card (if selected) */}
      {selectedStop && (
        <div className="bg-navy-900 text-white rounded-3xl p-5 shadow-lg space-y-3 animate-in fade-in">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                Selected Bus Stop
              </span>
              <h3 className="text-lg font-bold mt-0.5">{selectedStop.name}</h3>
              <p className="text-xs text-navy-200">
                📏 {selectedStop.formattedDistance} from your active location
              </p>
            </div>
            <button
              onClick={() => setSelectedStop(null)}
              className="text-navy-300 hover:text-white p-1"
            >
              ✕
            </button>
          </div>

          <div>
            <span className="text-xs font-medium text-navy-300 block mb-1.5">
              Available Bus Routes at this Stop:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedStop.routes.map((r) => (
                <span
                  key={r}
                  className="bg-teal-500 text-white font-bold text-xs px-2.5 py-1 rounded-lg"
                >
                  Bus {r}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-navy-800 flex justify-end">
            <button
              onClick={() => handlePlanFromStop(selectedStop.name)}
              className="bg-teal-400 hover:bg-teal-300 text-navy-950 font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Compass className="h-4 w-4" />
              Plan Journey from {selectedStop.name} →
            </button>
          </div>
        </div>
      )}

      {/* Nearby Bus Stops Cards Listing */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Discovered Bus Stops ({processedStops.length})
        </h3>

        {processedStops.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center space-y-2">
            <div className="text-3xl">📍</div>
            <h4 className="font-bold text-gray-800 text-sm">
              No bus stops found within {selectedRadius} km
            </h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Try increasing your discovery radius (e.g. 5 km or 10 km) or selecting another Chennai anchor.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {processedStops.map((stop) => {
              const isSelected = selectedStop?.name === stop.name;
              return (
                <div
                  key={stop.id || stop.name}
                  onClick={() => setSelectedStop(stop)}
                  className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-card hover:shadow-card-hover space-y-2.5 ${
                    isSelected
                      ? "border-teal-500 ring-2 ring-teal-400/30"
                      : "border-gray-100 hover:border-navy-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-teal-600 flex-shrink-0" />
                        <h4 className="font-bold text-sm text-gray-900 truncate">
                          {stop.name}
                        </h4>
                      </div>
                      {stop.majorStop && (
                        <span className="text-[10px] bg-navy-50 text-navy-700 font-semibold px-2 py-0.5 rounded-md mt-0.5 inline-block">
                          Major Interchange
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-black text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full flex-shrink-0">
                      {stop.formattedDistance}
                    </span>
                  </div>

                  {/* Passing Routes */}
                  <div className="flex items-center gap-1 flex-wrap pt-1">
                    <span className="text-[11px] text-gray-400 flex items-center gap-0.5 mr-1">
                      <Bus className="h-3 w-3" /> Routes:
                    </span>
                    {stop.routes.slice(0, 4).map((r) => (
                      <span
                        key={r}
                        className="bg-navy-800 text-white font-bold text-[11px] px-2 py-0.5 rounded-md"
                      >
                        {r}
                      </span>
                    ))}
                    {stop.routes.length > 4 && (
                      <span className="text-[10px] text-gray-400 font-medium">
                        +{stop.routes.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Quick Action Footer */}
                  <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">
                      {stop.lat?.toFixed(4)}, {stop.lng?.toFixed(4)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlanFromStop(stop.name);
                      }}
                      className="text-teal-600 font-bold hover:underline flex items-center gap-0.5"
                    >
                      Plan Trip →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
