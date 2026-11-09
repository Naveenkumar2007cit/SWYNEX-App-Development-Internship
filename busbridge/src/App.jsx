import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import BottomNavigation from "./components/BottomNavigation";
import Home from "./pages/Home";
import JourneyPlanner from "./pages/JourneyPlanner";
import BusSearch from "./pages/BusSearch";
import RouteDetails from "./pages/RouteDetails";
import CrowdStatus from "./pages/CrowdStatus";
import ReportIssue from "./pages/ReportIssue";
import SavedRoutes from "./pages/SavedRoutes";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/"           element={<Home />} />
            <Route path="/planner"    element={<JourneyPlanner />} />
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
