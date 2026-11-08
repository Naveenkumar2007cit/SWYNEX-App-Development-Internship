import { useNavigate } from "react-router-dom";
import { Bus, Home } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="bg-navy-50 p-5 rounded-full inline-flex mb-5">
        <Bus className="h-12 w-12 text-navy-300" />
      </div>
      <h1 className="text-4xl font-black text-navy-800 mb-2">404</h1>
      <h2 className="text-lg font-bold text-gray-700 mb-2">Page Not Found</h2>
      <p className="text-sm text-gray-400 mb-6">Looks like this bus route doesn't exist. Let's get you back on track.</p>
      <button onClick={() => navigate("/")} className="bg-navy-800 hover:bg-navy-700 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 mx-auto transition-colors">
        <Home className="h-4 w-4" />Back to Home
      </button>
    </div>
  );
}
