import {
  Users,
  Clock,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

const CROWD_CONFIG = {
  low: {
    label: "Low Crowd",
    badge: "Seats Available",
    color: "bg-emerald-500",
    lightBg: "bg-emerald-50/80",
    text: "text-emerald-800",
    border: "border-emerald-200",
    bars: 1,
    emoji: "🟢",
  },
  medium: {
    label: "Medium Crowd",
    badge: "Standing Space",
    color: "bg-amber-500",
    lightBg: "bg-amber-50/80",
    text: "text-amber-800",
    border: "border-amber-200",
    bars: 2,
    emoji: "🟡",
  },
  high: {
    label: "High Crowd",
    badge: "Heavily Packed",
    color: "bg-red-500",
    lightBg: "bg-red-50/80",
    text: "text-red-800",
    border: "border-red-200",
    bars: 3,
    emoji: "🔴",
  },
  unknown: {
    label: "No Reports",
    badge: "Awaiting Data",
    color: "bg-gray-400",
    lightBg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
    bars: 0,
    emoji: "⚪",
  },
};

export default function CrowdStatusCard({
  level = "medium",
  timestamp,
  busNumber,
  routeName,
  stopLocation,
  notes,
  reportCount = 1,
  averageScore,
  confidence = "Moderate",
}) {
  const normLevel = (level || "medium").toLowerCase();
  const c = CROWD_CONFIG[normLevel] || CROWD_CONFIG.medium;

  return (
    <div className={`${c.lightBg} ${c.border} border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 relative overflow-hidden transition-all`}>
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Community Crowd Status
            </span>
            {confidence && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-gray-200 text-gray-600">
                Confidence: {confidence}
              </span>
            )}
          </div>
          {busNumber && (
            <h3 className="text-lg font-black text-navy-900 mt-0.5">
              Bus {busNumber} {routeName ? `· ${routeName}` : ""}
            </h3>
          )}
          {stopLocation && (
            <p className="text-xs text-gray-500">
              Reported around: <span className="font-semibold text-gray-700">{stopLocation}</span>
            </p>
          )}
        </div>

        <div className="text-3xl flex-shrink-0 animate-pulse">
          {c.emoji}
        </div>
      </div>

      {/* Main Condition and Level Indicators */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/70 rounded-2xl p-3 border border-white/60">
        <div>
          <span className={`text-xl font-black ${c.text}`}>
            {c.label}
          </span>
          <span className="text-xs text-gray-500 ml-2 font-medium">
            ({c.badge})
          </span>
        </div>

        {averageScore !== undefined && (
          <div className="text-xs font-semibold text-navy-800">
            Score: <span className="font-black text-teal-700">{averageScore}</span> / 3.0
          </div>
        )}
      </div>

      {/* Multi-segment crowd meter bars */}
      <div className="space-y-1">
        <div className="flex gap-1.5 h-2.5">
          {[1, 2, 3].map((bar) => (
            <div
              key={bar}
              className={`flex-1 rounded-full transition-all duration-300 ${
                bar <= c.bars ? c.color : "bg-gray-200/80"
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 px-0.5 font-medium">
          <span>Low (≤1.5)</span>
          <span>Medium (1.6 - 2.5)</span>
          <span>High (&gt;2.5)</span>
        </div>
      </div>

      {/* Passenger Notes if provided */}
      {notes && (
        <div className="bg-white/80 rounded-xl p-3 border border-gray-100 text-xs text-gray-700 italic">
          "{notes}"
        </div>
      )}

      {/* Card Footer Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-gray-500 pt-1 border-t border-gray-200/60">
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-gray-400" />
          <span>
            Based on <strong>{reportCount}</strong> community report{reportCount !== 1 ? "s" : ""}
          </span>
        </div>

        {timestamp && (
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="h-3 w-3" />
            <span>
              Updated {new Date(timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        )}
      </div>

      <p className="text-[10px] text-gray-400 text-center">
        ⚠ Estimated from community reports · Not official live bus occupancy sensor data
      </p>
    </div>
  );
}
