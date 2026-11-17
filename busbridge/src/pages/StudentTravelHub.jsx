import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  MapPin,
  Bus,
  ArrowRight,
  ShieldCheck,
  Calendar,
  BookOpen,
  Navigation,
  ChevronRight,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Clock,
  Compass,
  Building,
  Info,
  Bookmark,
  Share2,
  Check
} from "lucide-react";

import {
  getAllColleges,
  getActiveCollegeId,
  setActiveCollegeId,
  getCollegeById,
  getCollegeJourneys,
  getCollegeNearbyStops,
  searchColleges,
  getKilambakkamTerminalGuide,
  getBeginnersBusGuide,
  getFestivalTravelSuggestions,
  COLLEGE_CHANGED_EVENT
} from "../services/collegeTransitService.js";

import {
  saveRoute,
  isRouteSaved,
  getLocalSaved
} from "../services/savedRoutesService.js";

export default function StudentTravelHub() {
  const navigate = useNavigate();

  // Selected college state
  const colleges = getAllColleges();
  const [selectedCollegeId, setSelectedCollegeId] = useState(() => getActiveCollegeId());
  const currentCollege = getCollegeById(selectedCollegeId) || colleges[0];

  // College selector modal / drawer
  const [isCollegeModalOpen, setIsCollegeModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Terminal Journeys state
  const journeys = getCollegeJourneys(currentCollege.id);
  const [activeDestination, setActiveDestination] = useState("kcbt-kilambakkam");
  const selectedJourney = journeys.find((j) => j.destinationId === activeDestination) || journeys[0] || {
    destinationId: "kcbt-kilambakkam",
    destinationTerminal: "Kilambakkam KCBT",
    options: []
  };

  // Filters & Tabs
  const [onlyGovtBus, setOnlyGovtBus] = useState(true);
  const [activeTab, setActiveTab] = useState("planner"); // 'planner', 'terminals', 'festivals', 'guide'
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // Sync with cross-tab / storage college changes
  useEffect(() => {
    const handleCollegeChange = (e) => {
      if (e.detail?.collegeId) {
        setSelectedCollegeId(e.detail.collegeId);
      }
    };
    window.addEventListener(COLLEGE_CHANGED_EVENT, handleCollegeChange);
    return () => window.removeEventListener(COLLEGE_CHANGED_EVENT, handleCollegeChange);
  }, []);

  const handleSelectCollege = (collegeId) => {
    setActiveCollegeId(collegeId);
    setSelectedCollegeId(collegeId);
    setIsCollegeModalOpen(false);
    setSearchQuery("");
  };

  const handleQuickSave = async (option) => {
    const journeyObj = {
      id: `${currentCollege.id}-${selectedJourney.destinationId}-${option.busNumber}`,
      busNumber: option.busNumber,
      source: `${currentCollege.shortName} (${option.boardingStop})`,
      destination: selectedJourney.destinationTerminal,
      from: option.boardingStop,
      to: selectedJourney.destinationTerminal,
      fare: "₹18 - ₹25",
      duration: `${option.durationMin || 60} mins`,
      frequency: option.frequency || "Frequent",
      operatorType: option.operator || "MTC Government City Bus",
      isStudentHubJourney: true,
      collegeId: currentCollege.id,
      timestamp: Date.now()
    };

    const res = await saveRoute(journeyObj);
    if (res.success) {
      setSaveSuccessMsg(`Saved Option: Route ${option.busNumber} to My Favourites!`);
    } else {
      setSaveSuccessMsg(res.message);
    }
    setTimeout(() => setSaveSuccessMsg(""), 3500);
  };

  const filteredColleges = searchQuery.trim()
    ? searchColleges(searchQuery)
    : colleges;

  const kilambakkamGuide = getKilambakkamTerminalGuide();
  const nearbyStops = getCollegeNearbyStops(currentCollege.id);
  const beginnersGuide = getBeginnersBusGuide();
  const festivalSuggestions = getFestivalTravelSuggestions();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-12 space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-950 to-emerald-950 text-white p-6 sm:p-8 shadow-xl border border-white/10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide uppercase">
              <GraduationCap className="h-3.5 w-3.5 text-emerald-400" />
              Student Travel Hub · Chennai
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              College to Government Bus Terminus
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Plan safe, suburban transit from your college or hostel to <span className="text-emerald-300 font-bold">Kilambakkam (KCBT)</span>, CMBT Koyambedu & major Chennai transit hubs via official MTC government buses.
            </p>
          </div>

          {/* College Selector Pill */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col gap-2 min-w-[260px] self-start md:self-auto">
            <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5" /> Selected Institution
            </span>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-extrabold text-white text-sm sm:text-base truncate">
                  {currentCollege.shortName}
                </p>
                <p className="text-xs text-slate-300 truncate">
                  {currentCollege.area}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCollegeModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-navy-950 font-bold text-xs transition-all shadow-md flex-shrink-0"
              >
                Change
              </button>
            </div>
          </div>
        </div>

        {/* Priority Banner for CIT Kundrathur */}
        {currentCollege.id === "cit-kundrathur" && (
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-200">
              <Sparkles className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>
                <strong>CIT Kundrathur ⇄ Kilambakkam (KCBT)</strong> corridor active with Route 66K connection and Tambaram transfer options.
              </span>
            </div>
            <span className="text-[11px] bg-emerald-900/60 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Hostel Weekend Corridor
            </span>
          </div>
        )}
      </div>

      {/* Save Success Alert Notification */}
      {saveSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{saveSuccessMsg}</span>
          </div>
          <Link to="/saved" className="underline hover:text-emerald-100 text-xs">
            View in Saved Journeys →
          </Link>
        </div>
      )}

      {/* Hub Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab("planner")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all shadow-xs ${
            activeTab === "planner"
              ? "bg-navy-900 text-white shadow-md dark:bg-emerald-600"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Compass className="h-4 w-4 text-emerald-400" />
          Terminal Journey Planner
        </button>

        <button
          onClick={() => setActiveTab("terminals")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all shadow-xs ${
            activeTab === "terminals"
              ? "bg-navy-900 text-white shadow-md dark:bg-emerald-600"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Bus className="h-4 w-4 text-emerald-400" />
          Kilambakkam (KCBT) Terminal Guide
        </button>

        <button
          onClick={() => setActiveTab("festivals")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all shadow-xs ${
            activeTab === "festivals"
              ? "bg-navy-900 text-white shadow-md dark:bg-emerald-600"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Calendar className="h-4 w-4 text-emerald-400" />
          Festival & Weekend Travel
        </button>

        <button
          onClick={() => setActiveTab("guide")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all shadow-xs ${
            activeTab === "guide"
              ? "bg-navy-900 text-white shadow-md dark:bg-emerald-600"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <BookOpen className="h-4 w-4 text-emerald-400" />
          Beginner&apos;s Guide (Freshers)
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: TERMINAL JOURNEY PLANNER */}
      {/* ======================================================== */}
      {activeTab === "planner" && (
        <div className="space-y-6">
          {/* Destination Terminals Carousel / Pills */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Navigation className="h-3.5 w-3.5 text-emerald-600" />
                Select Terminus Destination from {currentCollege.shortName}
              </h2>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyGovtBus}
                    onChange={(e) => setOnlyGovtBus(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                  />
                  <span>Govt Buses Only</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {journeys.map((j) => {
                const isActive = j.destinationId === selectedJourney.destinationId;
                const isPriority = j.destinationId === "kcbt-kilambakkam";
                return (
                  <button
                    key={j.destinationId}
                    type="button"
                    onClick={() => setActiveDestination(j.destinationId)}
                    className={`p-4 rounded-2xl text-left border transition-all relative overflow-hidden flex flex-col justify-between ${
                      isActive
                        ? "bg-navy-900 text-white border-emerald-500 ring-2 ring-emerald-400 shadow-md"
                        : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-emerald-300"
                    }`}
                  >
                    {isPriority && (
                      <span className="absolute top-2 right-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-navy-950">
                        Top Choice
                      </span>
                    )}
                    <div>
                      <p className={`text-xs font-medium uppercase ${isActive ? "text-emerald-300" : "text-slate-400"}`}>
                        {j.destinationId.toUpperCase()}
                      </p>
                      <h3 className="font-extrabold text-sm sm:text-base leading-tight mt-1">
                        {j.destinationTerminal}
                      </h3>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100/10">
                      <span className={isActive ? "text-slate-300" : "text-slate-500"}>
                        {j.options.length} route {j.options.length > 1 ? "options" : "option"}
                      </span>
                      <ChevronRight className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Journey Detail & Multi-Stage Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-lg border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Official Transit Corridor
                  </span>
                  {selectedJourney.recommendedRoute && (
                    <span className="text-xs text-slate-500">
                      Recommended: {selectedJourney.recommendedRoute}
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {currentCollege.shortName} ➔ {selectedJourney.destinationTerminal}
                </h2>
              </div>

              {/* Operator Badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  MTC Government City Buses
                </span>
              </div>
            </div>

            {/* Stage A vs Stage B Overview Notice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900">
                <span className="text-[11px] font-extrabold text-teal-800 dark:text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Bus className="h-3.5 w-3.5" /> Stage A · College to Terminus
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Operated by <strong>MTC Chennai</strong>. Board at verified boarding stops outside college campus. Ticket fares paid directly inside the bus to conductor.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900">
                <span className="text-[11px] font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Stage B · Intercity Journey to Hometown
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Operated by <strong>TNSTC / SETC</strong> at {selectedJourney.destinationTerminal}. Book online via official website <strong>tnstc.in</strong> or terminal counters.
                </p>
              </div>
            </div>

            {/* Route Options Cards */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Recommended Stage A Route Options ({selectedJourney.options.length})
              </h3>

              {selectedJourney.options.map((option, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 hover:border-emerald-400 transition-all bg-slate-50/50 dark:bg-slate-900/50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="bg-navy-900 text-white dark:bg-emerald-600 px-3 py-1.5 rounded-xl font-black text-sm tracking-wide shadow-xs flex-shrink-0">
                        Route {option.busNumber}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                          {option.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-500">
                          <span>⏱️ ~{option.durationMin || 60} mins</span>
                          <span>•</span>
                          <span>🔄 {option.frequency}</span>
                          <span>•</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100/60 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                            {option.operator}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleQuickSave(option)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Bookmark className="h-3.5 w-3.5 text-amber-500" />
                        Save Route
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate(`/planner?source=${encodeURIComponent(option.boardingStop)}&destination=${encodeURIComponent(selectedJourney.destinationTerminal)}`)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                      >
                        Open Planner
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Boarding and destination stops */}
                  <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <span className="font-bold text-slate-700 dark:text-slate-200">Board at:</span>
                    <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {option.boardingStop}
                    </span>
                    <span>➔</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">Terminates at:</span>
                    <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {option.destinationStop}
                    </span>
                  </div>

                  {/* Provenance Tag */}
                  {option.provenance && (
                    <div className="mt-2.5 p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-[10px] text-slate-600 dark:text-slate-400 flex flex-wrap items-center justify-between gap-1 border border-slate-200/60 dark:border-slate-700/60">
                      <span><strong>Provenance:</strong> {option.provenance.source}</span>
                      <span className="font-medium">Verified: {option.provenance.lastVerifiedDate} ({option.provenance.type.replace('_', ' ')})</span>
                    </div>
                  )}

                  {/* Intermediate stops list */}
                  {option.intermediateStops && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Key Intermediate Stops:
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {option.intermediateStops.map((st, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[11px] bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md"
                          >
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Walking guidance */}
                  {option.walkingToBoardingStop && (
                    <div className="mt-3 text-xs text-teal-700 dark:text-teal-400 font-medium">
                      🚶 Campus Link: {option.walkingToBoardingStop}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Nearby Boarding Stops Reference */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                Verified Boarding Stops Near {currentCollege.shortName}
              </h3>
              <p className="text-xs text-slate-500">
                MTC buses do not drive inside private college campuses. Board at one of these verified designated points:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {nearbyStops.map((stop, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 dark:text-white">
                          {stop.name}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                          {stop.walkingDistanceMeters}m
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        🚶 {stop.walkingTimeMin} mins walk · {stop.description}
                      </p>
                    </div>
                    {stop.connectedFeeders && (
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400">Feeders:</span>
                        {stop.connectedFeeders.map((r, rIdx) => (
                          <span key={rIdx} className="text-[10px] font-extrabold bg-navy-900 text-white px-1.5 py-0.5 rounded">
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                    {stop.provenance && (
                      <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/40 text-[9px] text-slate-400">
                        Source: {stop.provenance.source} · {stop.provenance.type.replace('_', ' ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: KILAMBAKKAM KCBT TERMINAL GUIDE */}
      {/* ======================================================== */}
      {activeTab === "terminals" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-lg border border-slate-100 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                Tamil Nadu&apos;s Largest Bus Port
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {kilambakkamGuide.terminalName} ({kilambakkamGuide.shortCode})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {kilambakkamGuide.location} · {kilambakkamGuide.dailyBusesCapacity}
              </p>
            </div>

            <a
              href="https://www.tnstc.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-900 dark:bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-navy-800 transition-colors"
            >
              <span>Official Booking (tnstc.in)</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Quick Notice on Operator Separation */}
          <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
            <strong>Important Difference for Students:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1 text-slate-600 dark:text-slate-300">
              <li><strong>MTC City Buses:</strong> Connect CIT/colleges to KCBT ({kilambakkamGuide.mtcPlatformZone.platforms}). Regular tickets bought on board.</li>
              <li><strong>TNSTC / SETC Government Buses:</strong> Intercity buses to Madurai, Trichy, Coimbatore, Salem, Tirunelveli, Kanyakumari. Depart from internal finger bays.</li>
              <li><strong>Official Enquiry Helpline:</strong> Call <strong>{kilambakkamGuide.helpline}</strong>.</li>
            </ul>
          </div>

          {/* Platform Layout Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Terminal Bays & Platform Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kilambakkamGuide.intercityZones.map((sec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {sec.operator}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                    {sec.serviceType}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <strong>Destinations:</strong> {sec.destinations.join(", ")}
                  </p>
                  <p className="text-[11px] text-slate-500 italic">
                    💡 Facilities: {sec.facilities}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Student Amenities & Return Journey Guide */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
            <h3 className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5" />
              Returning from Hometown Back to College
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              When returning on Sunday night or Monday early morning:
            </p>
            <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <li>Alight from your SETC/TNSTC bus at KCBT arrival bay.</li>
              <li>Follow the pedestrian overhead canopy walkway towards the <strong>MTC City Bus Terminal</strong> ({kilambakkamGuide.mtcPlatformZone.platforms}).</li>
              <li>Board <strong>Route 66K</strong> directly to Kundrathur Bus Stand, or take any Tambaram bus (Route 566 / 70V / G18) and transfer to Kundrathur.</li>
              <li>From Kundrathur Bus Stand, take a share auto (₹15) or local feeder directly to CIT gate.</li>
            </ol>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: FESTIVAL & WEEKEND TRAVEL */}
      {/* ======================================================== */}
      {activeTab === "festivals" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-lg border border-slate-100 dark:border-slate-800 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Festival, Vacation & Weekend Home Travel
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified transit guidelines for college students traveling home during peak rush periods.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {festivalSuggestions.map((fest, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      {fest.festival}
                    </h3>
                    <p className="text-xs text-emerald-600 font-semibold">{fest.tamil}</p>
                  </div>
                  <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full">
                    {fest.targetTerminal}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300">
                  <strong>Rush Period:</strong> {fest.dateHint}
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {fest.advice}
                </p>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">💡 Recommended Route:</p>
                  <p>{fest.recommendedRoute}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600" />
            <div>
              <strong>Official Notice:</strong> Special festival government buses are operated by TNSTC and SETC. Check official Tamil Nadu government press releases and <a href="https://www.tnstc.in" target="_blank" rel="noopener noreferrer" className="underline font-bold">www.tnstc.in</a> for temporary changes to departure terminals.
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: BEGINNER'S GUIDE (FRESHERS IN CHENNAI) */}
      {/* ======================================================== */}
      {activeTab === "guide" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-lg border border-slate-100 dark:border-slate-800 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              MTC Bus Beginner&apos;s Guide for College Students
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              New to Chennai? Essential survival steps for navigating MTC buses and reaching your bus terminal safely.
            </p>
          </div>

          <div className="space-y-4">
            {beginnersGuide.map((step) => (
              <div
                key={step.step}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row md:items-start gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                  {step.step}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      {step.title}
                    </h3>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                      {step.tamilTitle}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {step.description}
                  </p>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    ⚡ <strong>Pro Tip:</strong> {step.tip}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* COLLEGE SELECTION MODAL */}
      {/* ======================================================== */}
      {isCollegeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 w-full max-w-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[85vh] animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-emerald-600" />
                  Select Your College / Campus
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Routes & nearest boarding stops will customize to your selection
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCollegeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Search Input */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search college name or area (e.g. Kundrathur, Guindy, VIT)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Modal Colleges List */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredColleges.map((col) => {
                const isCurrent = col.id === currentCollege.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => handleSelectCollege(col.id)}
                    className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center justify-between gap-3 ${
                      isCurrent
                        ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {col.name}
                        </span>
                        {col.id === "cit-kundrathur" && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-navy-950">
                            Priority #1
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        📍 {col.area}
                      </p>
                    </div>

                    {isCurrent ? (
                      <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-600">
                        Select
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
