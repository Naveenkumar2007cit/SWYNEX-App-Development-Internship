import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import BottomNavigation from "./components/BottomNavigation.jsx";
import Home from "./pages/Home.jsx";
import JourneyPlanner from "./pages/JourneyPlanner.jsx";
import NearbyStops from "./pages/NearbyStops.jsx";
import ServiceAlerts from "./pages/ServiceAlerts.jsx";
import BusSearch from "./pages/BusSearch.jsx";
import RouteDetails from "./pages/RouteDetails.jsx";
import CrowdStatus from "./pages/CrowdStatus.jsx";
import ReportIssue from "./pages/ReportIssue.jsx";
import SavedRoutes from "./pages/SavedRoutes.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">
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
        </main>
        <BottomNavigation />
      </div>
    </BrowserRouter>
  );
}
