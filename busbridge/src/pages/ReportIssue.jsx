import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertOctagon, ChevronDown, Send, CheckCircle, Clock, XCircle, Users, Navigation, MoreHorizontal } from "lucide-react";
import { getAllRoutes } from "../services/routeService";
import { submitIssueReport, ISSUE_CATEGORIES } from "../services/reportService";

const categoryIcons = { delayed: Clock, cancelled: XCircle, overcrowding: Users, not_stopping: AlertOctagon, route_deviation: Navigation, other: MoreHorizontal };

export default function ReportIssue() {
  const [searchParams] = useSearchParams();
  const [routes]       = useState(() => getAllRoutes());
  const [busNumber, setBusNumber] = useState(searchParams.get("bus") || "");
  const [category, setCategory]  = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]  = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!busNumber.trim()) e.busNumber = "Please enter or select a bus number.";
    if (!category) e.category = "Please select an issue category.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const result = await submitIssueReport({ busNumber: busNumber.trim(), category, description });
    if (result.success) {
      setSubmitted(true);
      setBusNumber(""); setCategory(""); setDescription(""); setErrors({});
    }
    setSubmitting(false);
  };

  const reset = () => setSubmitted(false);

  if (submitted) return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8">
      <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-8 text-center mt-10">
        <div className="bg-green-100 p-4 rounded-full inline-flex mb-4">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Report Submitted!</h2>
        <p className="text-gray-500 text-sm mb-6">Thank you for helping improve bus services in Chennai. Your report has been recorded.</p>
        <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 text-xs text-gray-500 space-y-1">
          <p>✓ Report ID: IR{Date.now()}</p>
          <p>✓ Submitted at: {new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
          <p>✓ Status: Recorded (demo mode)</p>
        </div>
        <button onClick={reset} className="w-full bg-navy-800 hover:bg-navy-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
          Submit Another Report
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-navy-800">Report Bus Issue</h1>
        <p className="text-sm text-gray-500 mt-0.5">Help improve bus services by reporting problems</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Bus number */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-4 space-y-3">
          <h2 className="font-semibold text-gray-800 text-sm">Bus Details</h2>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Bus Number *</label>
            <div className="flex gap-2">
              <input value={busNumber} onChange={(e) => setBusNumber(e.target.value)}
                placeholder="e.g. 1A, M70, 108"
                className={`flex-1 border rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 ${errors.busNumber ? "border-red-300" : "border-gray-200"}`}
              />
            </div>
            {errors.busNumber && <p className="text-xs text-red-500 mt-1">{errors.busNumber}</p>}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {routes.slice(0, 8).map((r) => (
                <button key={r.id} type="button" onClick={() => setBusNumber(r.busNumber)}
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${busNumber === r.busNumber ? "bg-navy-800 text-white border-navy-800" : "border-gray-200 text-gray-600 hover:border-navy-300"}`}>
                  {r.busNumber}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Issue category */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-4 space-y-3">
          <h2 className="font-semibold text-gray-800 text-sm">Issue Category *</h2>
          <div className="grid grid-cols-2 gap-2">
            {ISSUE_CATEGORIES.map((cat) => {
              const Icon = categoryIcons[cat.value] || AlertOctagon;
              return (
                <button key={cat.value} type="button" onClick={() => setCategory(cat.value)}
                  className={`flex items-center gap-2 border-2 rounded-xl p-3 text-left transition-all ${category === cat.value ? "border-navy-600 bg-navy-50 text-navy-700" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}>
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs font-medium">{cat.label}</span>
                </button>
              );
            })}
          </div>
          {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-4 space-y-3">
          <div>
            <h2 className="font-semibold text-gray-800 text-sm">Description</h2>
            <p className="text-xs text-gray-400 mt-0.5">Optional but helpful</p>
          </div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
            placeholder="Describe the issue in detail. E.g. Bus 1A has been waiting at Tambaram for 25 minutes without moving..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 resize-none"
          />
          <p className="text-xs text-gray-400 text-right">{description.length} characters</p>
        </div>

        <button type="submit" disabled={submitting}
          className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
          <Send className="h-4 w-4" />{submitting ? "Submitting..." : "Submit Report"}
        </button>
        <p className="text-xs text-center text-gray-400">Reports are saved locally in demo mode and not sent to MTC.</p>
      </form>
    </div>
  );
}
