import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import BottomNavigation from "./components/BottomNavigation.jsx";
import Home from "./pages/Home.jsx";

// Code-split pages to drastically reduce main thread JavaScript parsing and reconciliation time
const JourneyPlanner = lazy(() => import("./pages/JourneyPlanner.jsx"));
const NearbyStops    = lazy(() => import("./pages/NearbyStops.jsx"));
const ServiceAlerts  = lazy(() => import("./pages/ServiceAlerts.jsx"));
const BusSearch      = lazy(() => import("./pages/BusSearch.jsx"));
const RouteDetails   = lazy(() => import("./pages/RouteDetails.jsx"));
const CrowdStatus    = lazy(() => import("./pages/CrowdStatus.jsx"));
const ReportIssue    = lazy(() => import("./pages/ReportIssue.jsx"));
const SavedRoutes    = lazy(() => import("./pages/SavedRoutes.jsx"));
const NotFound       = lazy(() => import("./pages/NotFound.jsx"));

function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 space-y-3">
      <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-gray-500 font-medium">Loading transit view...</span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-slate-50 to-teal-50/30 dark:from-slate-950 dark:via-navy-950 dark:to-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950 transition-colors">
        <Navbar />
        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/"           element={<Home />} />
              <Route path="/planner"    element={<JourneyPlanner />} />
              <Route path="/nearby"     element={<NearbyStops />} />
              <Route path="/alerts"     element={<ServiceAlerts />} />
              <Route path="/search"     element={<BusSearch />} />
              <Route path="/route/:id"  element={<RouteDetails />} />
              <Route path="/crowd"      element={<CrowdStatus />} />
              <Route path="/report"     element={<ReportIssue />} />
              <Route path="/saved"      element={<SavedRoutes />} />
              <Route path="*"           element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <BottomNavigation />
      </div>
    </BrowserRouter>
  );
}
