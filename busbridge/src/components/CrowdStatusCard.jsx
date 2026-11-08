const CROWD_CONFIG = {
  low:       { label: "Low",       color: "bg-green-500",  light: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  bars: 1, emoji: "🟢" },
  medium:    { label: "Medium",    color: "bg-yellow-500", light: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", bars: 2, emoji: "🟡" },
  high:      { label: "High",      color: "bg-orange-500", light: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", bars: 3, emoji: "🟠" },
  very_high: { label: "Very High", color: "bg-red-500",    light: "bg-red-50",    text: "text-red-700",    border: "border-red-200",    bars: 4, emoji: "🔴" },
};

export default function CrowdStatusCard({ level, timestamp, busNumber, notes }) {
  const c = CROWD_CONFIG[level] || CROWD_CONFIG.medium;
  return (
    <div className={`${c.light} ${c.border} border rounded-2xl p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Crowd Status</p>
          {busNumber && <p className="text-xs text-gray-400">Bus {busNumber}</p>}
        </div>
        <span className="text-2xl">{c.emoji}</span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className={`text-lg font-bold ${c.text}`}>{c.label}</span>
      </div>

      <div className="flex gap-1 mb-3">
        {[1,2,3,4].map((bar) => (
          <div key={bar} className={`h-2 flex-1 rounded-full ${bar <= c.bars ? c.color : "bg-gray-200"}`} />
        ))}
      </div>

      {notes && <p className="text-xs text-gray-600 mb-2 italic">"{notes}"</p>}

      {timestamp && (
        <p className="text-xs text-gray-400">
          Reported: {new Date(timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
        </p>
      )}
      <p className="text-xs text-gray-400 mt-1">⚠ Community-reported · Not official live occupancy data</p>
    </div>
  );
}
