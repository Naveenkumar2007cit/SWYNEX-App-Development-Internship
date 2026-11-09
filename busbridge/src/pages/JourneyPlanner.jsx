import { useState, useMemo } from "react";
import {
  Compass,
  ArrowUpDown,
  Search,
  X,
  Clock,
  Shuffle,
  ShieldCheck,
  MapPin,
  Bus,
  ArrowRight,
  Info,
  AlertTriangle,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import {
  findJourneys,
  sortJourneys,
  getAllStopsCatalog,
  areStopsEqual,
} from "../services/journeyService";
import JourneyCard from "../components/JourneyCard";
import BusStopList from "../components/BusStopList";
import MapView from "../components/MapView";
import LoadingSpinner from "../components/LoadingSpinner";

export default function JourneyPlanner() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [sourceSuggest, setSourceSuggest] = useState([]);
  const [destSuggest, setDestSuggest] = useState([]);

  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [journeys, setJourneys] = useState([]);
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [sortCriteria, setSortCriteria] = useState("fastest");
  const [activeTab, setActiveTab] = useState("directions"); // 'directions' | 'map'

  // Pre-load all available stops for autocomplete catalog
  const stopCatalog = useMemo(() => getAllStopsCatalog(), []);
  const stopNames = useMemo(() => stopCatalog.map((s) => s.name), [stopCatalog]);

  const getSuggestions = (query) => {
    if (!query || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    return stopNames
      .filter((name) => name.toLowerCase().includes(q))
      .slice(0, 7);
  };

  const handleSourceChange = (val) => {
    setSource(val);
    setValidationError("");
    setSourceSuggest(getSuggestions(val));
  };

  const handleDestChange = (val) => {
    setDestination(val);
    setValidationError("");
    setDestSuggest(getSuggestions(val));
  };

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
    setValidationError("");
    setSourceSuggest([]);
    setDestSuggest([]);
    if (searched && destination && temp) {
      executeSearch(destination, temp);
    }
  };

  const validate = () => {
    if (!source.trim() && !destination.trim()) {
      setValidationError("Please select or enter both starting and destination stops.");
      return false;
    }
    if (!source.trim()) {
      setValidationError("Please enter your starting bus stop.");
      return false;
    }
    if (!destination.trim()) {
      setValidationError("Please enter your destination bus stop.");
      return false;
    }
    if (areStopsEqual(source, destination)) {
      setValidationError("Source and destination cannot be the same stop. Please select different stops.");
      return false;
    }
    setValidationError("");
    return true;
  };

  const executeSearch = (s, d) => {
    setLoading(true);
    setSearched(true);
    setSelectedJourney(null);
    setSourceSuggest([]);
    setDestSuggest([]);

    // Brief simulated search delay for realistic UI state
    setTimeout(() => {
      const results = findJourneys(s.trim(), d.trim());
      const sorted = sortJourneys(results, sortCriteria);
      setJourneys(sorted);
      if (sorted.length > 0) {
        setSelectedJourney(sorted[0]);
      }
      setLoading(false);
    }, 350);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    executeSearch(source, destination);
  };

  const handleSortChange = (crit) => {
    setSortCriteria(crit);
    const sorted = sortJourneys(journeys, crit);
    setJourneys(sorted);
  };

  // Flatten stops from all legs for the interactive Leaflet Map
  const combinedMapStops = useMemo(() => {
    if (!selectedJourney) return [];
    const allStops = [];
    const seenNames = new Set();
    selectedJourney.legs.forEach((leg) => {
      leg.stops.forEach((st) => {
        if (!seenNames.has(st.name)) {
          seenNames.add(st.name);
          allStops.push(st);
        }
      });
    });
    return allStops;
  }, [selectedJourney]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-6">
      {/* Header Banner */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="bg-teal-500 text-white p-2 rounded-xl shadow-sm">
            <Compass className="h-5 w-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy-800">
            Smart Journey Planner
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          Find direct bus routes and seamless 1-transfer connections across Chennai
        </p>
      </div>

      {/* Input Card Form */}
      <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-4 sm:p-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          {/* Source Stop Autocomplete */}
          <div className="relative">
            <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-50 transition-all bg-white">
              <div className="h-3 w-3 rounded-full bg-teal-500 flex-shrink-0" />
              <input
                type="text"
                value={source}
                onChange={(e) => handleSourceChange(e.target.value)}
                onFocus={() => setSourceSuggest(getSuggestions(source))}
                placeholder="Starting bus stop (e.g., Tambaram, Guindy, Koyambedu)"
                className="flex-1 text-sm text-gray-800 outline-none bg-transparent placeholder-gray-400"
              />
              {source && (
                <button
                  type="button"
                  onClick={() => {
                    setSource("");
                    setSourceSuggest([]);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {sourceSuggest.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-xl mt-1.5 z-30 overflow-hidden divide-y divide-gray-50">
                {sourceSuggest.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onMouseDown={() => {
                      setSource(name);
                      setSourceSuggest([]);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-800 flex items-center gap-2 transition-colors"
                  >
                    <MapPin className="h-3.5 w-3.5 text-teal-600 flex-shrink-0" />
                    <span>{name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-1">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap start and destination stops"
              className="p-2.5 rounded-full bg-gray-100 hover:bg-teal-50 hover:text-teal-600 text-gray-500 transition-colors shadow-sm active:scale-95"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>

          {/* Destination Stop Autocomplete */}
          <div className="relative">
            <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-50 transition-all bg-white">
              <div className="h-3 w-3 rounded-full bg-navy-800 flex-shrink-0" />
              <input
                type="text"
                value={destination}
                onChange={(e) => handleDestChange(e.target.value)}
                onFocus={() => setDestSuggest(getSuggestions(destination))}
                placeholder="Destination bus stop (e.g., Broadway, Adyar, Velachery)"
                className="flex-1 text-sm text-gray-800 outline-none bg-transparent placeholder-gray-400"
              />
              {destination && (
                <button
                  type="button"
                  onClick={() => {
                    setDestination("");
                    setDestSuggest([]);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {destSuggest.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-xl mt-1.5 z-30 overflow-hidden divide-y divide-gray-50">
                {destSuggest.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onMouseDown={() => {
                      setDestination(name);
                      setDestSuggest([]);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-gray-700 hover:bg-navy-50 hover:text-navy-900 flex items-center gap-2 transition-colors"
                  >
                    <MapPin className="h-3.5 w-3.5 text-navy-600 flex-shrink-0" />
                    <span>{name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Validation Warning Message */}
          {validationError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl p-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-500" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Search Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] text-sm sm:text-base"
          >
            <Search className="h-4 w-4" />
            {loading ? "Calculating Journey Options..." : "Find Best Journeys"}
          </button>
        </form>

        {/* Quick Popular Sample Trips */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-2 font-medium">
            Try popular Chennai routes:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { s: "Tambaram", d: "Broadway", note: "Direct" },
              { s: "Tambaram", d: "Velachery", note: "Direct" },
              { s: "Adyar", d: "Broadway", note: "Direct" },
              { s: "Koyambedu", d: "Adyar", note: "Transfer @ T. Nagar" },
              { s: "Perambur", d: "Adyar", note: "Transfer @ T. Nagar" },
            ].map(({ s, d, note }) => (
              <button
                key={`${s}-${d}`}
                type="button"
                onClick={() => {
                  setSource(s);
                  setDestination(d);
                  executeSearch(s, d);
                }}
                className="text-xs bg-gray-50 hover:bg-teal-50 hover:text-teal-700 border border-gray-200 px-2.5 py-1.5 rounded-xl text-gray-600 transition-colors"
              >
                {s} ➔ {d} <span className="opacity-60 text-[10px]">({note})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <LoadingSpinner text="Searching direct buses and transfer combinations..." />
      )}

      {/* Results Section */}
      {!loading && searched && (
        <div className="space-y-5">
          {journeys.length === 0 ? (
            /* No Route Found State */
            <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-8 text-center space-y-3">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">
                No Connecting Route Found
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                No direct bus or verified 1-transfer connection was found between{" "}
                <span className="font-medium text-gray-800">"{source}"</span> and{" "}
                <span className="font-medium text-gray-800">"{destination}"</span> in the demo dataset.
              </p>
              <div className="pt-2 text-xs text-gray-400">
                Tip: Try selecting major hubs such as Guindy, T. Nagar, CMBT Koyambedu, or Broadway.
              </div>
            </div>
          ) : (
            <>
              {/* Results Bar with Sort Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div>
                  <h2 className="font-bold text-gray-800 text-sm sm:text-base">
                    {journeys.length} Journey Option{journeys.length !== 1 ? "s" : ""} Available
                  </h2>
                  <p className="text-xs text-gray-400">
                    From {source} to {destination}
                  </p>
                </div>

                {/* Sorter Tabs */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs">
                  {[
                    { id: "fastest", label: "Fastest", icon: Clock },
                    { id: "fewest_transfers", label: "Fewest Transfers", icon: Shuffle },
                    { id: "shortest_distance", label: "Shortest Dist", icon: MapPin },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => handleSortChange(id)}
                      className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-all ${
                        sortCriteria === id
                          ? "bg-white text-navy-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Journey Cards List */}
              <div className="space-y-3">
                {journeys.map((j) => (
                  <JourneyCard
                    key={j.id}
                    journey={j}
                    isSelected={selectedJourney?.id === j.id}
                    onSelect={(chosen) => {
                      setSelectedJourney(chosen);
                    }}
                  />
                ))}
              </div>

              {/* Selected Journey Detailed Breakdown */}
              {selectedJourney && (
                <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-5 sm:p-6 space-y-5 mt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                          {selectedJourney.transfersCount === 0
                            ? "Direct Trip"
                            : "1 Transfer Journey"}
                        </span>
                        <span className="text-xs text-gray-400">
                          Est. Duration: ~{selectedJourney.totalDuration} mins
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-navy-900 mt-1">
                        Step-by-Step Directions
                      </h3>
                    </div>

                    {/* View Switcher: Directions / Map */}
                    <div className="flex bg-gray-100 p-1 rounded-xl text-xs">
                      <button
                        onClick={() => setActiveTab("directions")}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                          activeTab === "directions"
                            ? "bg-white text-navy-800 shadow-sm"
                            : "text-gray-500"
                        }`}
                      >
                        Directions
                      </button>
                      <button
                        onClick={() => setActiveTab("map")}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                          activeTab === "map"
                            ? "bg-white text-navy-800 shadow-sm"
                            : "text-gray-500"
                        }`}
                      >
                        Route Map
                      </button>
                    </div>
                  </div>

                  {activeTab === "directions" ? (
                    <div className="space-y-6">
                      {selectedJourney.legs.map((leg, legIdx) => (
                        <div
                          key={leg.legIndex}
                          className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200/80 space-y-4"
                        >
                          {/* Leg Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="bg-navy-800 text-white font-black text-sm px-3 py-1.5 rounded-xl shadow-sm">
                                Bus {leg.busNumber}
                              </div>
                              <div>
                                <p className="font-semibold text-xs sm:text-sm text-navy-900">
                                  Leg {leg.legIndex}: Take Bus {leg.busNumber}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                  {leg.routeName} ({leg.routeType})
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-teal-700 bg-white border border-teal-200 px-2.5 py-1 rounded-full">
                              ~{leg.duration} min
                            </span>
                          </div>

                          {/* Boarding instruction */}
                          <div className="bg-white rounded-xl p-3 border border-gray-100 flex items-start gap-2.5 text-xs text-gray-700">
                            <div className="h-2.5 w-2.5 rounded-full bg-teal-500 mt-1 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-gray-900">
                                Board at: {leg.boardStop.name}
                              </p>
                              <p className="text-gray-400">
                                Bus frequency: {leg.frequency} · Covers {leg.stops.length} stops (~{leg.distance} km)
                              </p>
                            </div>
                          </div>

                          {/* Stop sequence */}
                          <div className="pl-2 pt-1 border-l-2 border-dashed border-teal-300 ml-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 pl-2">
                              Stops along this leg:
                            </p>
                            <div className="bg-white rounded-xl p-3 border border-gray-100 max-h-48 overflow-y-auto">
                              <BusStopList stops={leg.stops} />
                            </div>
                          </div>

                          {/* Alighting instruction */}
                          <div className="bg-white rounded-xl p-3 border border-gray-100 flex items-start gap-2.5 text-xs text-gray-700">
                            <div className="h-2.5 w-2.5 rounded-full bg-navy-800 mt-1 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-gray-900">
                                Alight at: {leg.alightStop.name}
                              </p>
                            </div>
                          </div>

                          {/* Transfer Notice if next leg exists */}
                          {legIdx < selectedJourney.legs.length - 1 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center gap-2">
                              <Shuffle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                              <span>
                                <strong>Transfer Point:</strong> Switch to{" "}
                                <strong>Bus {selectedJourney.legs[legIdx + 1].busNumber}</strong> at{" "}
                                <strong>{selectedJourney.transferStopName}</strong>. Est. transfer wait: ~{selectedJourney.transferWaitTime} min.
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Interactive Leaflet Map */
                    <div className="space-y-2">
                      <MapView stops={combinedMapStops} height="420px" />
                      <p className="text-xs text-gray-400 text-center">
                        Visualizing stops for Bus{" "}
                        {selectedJourney.legs.map((l) => l.busNumber).join(" + Bus ")}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
