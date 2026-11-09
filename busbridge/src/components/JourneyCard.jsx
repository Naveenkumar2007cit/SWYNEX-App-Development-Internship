import {
  Clock,
  ArrowRight,
  Bus,
  MapPin,
  ChevronRight,
  Shuffle,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

export default function JourneyCard({ journey, onSelect, isSelected = false }) {
  if (!journey) return null;

  const isDirect = journey.transfersCount === 0;

  return (
    <div
      onClick={() => onSelect && onSelect(journey)}
      className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-card hover:shadow-card-hover relative overflow-hidden ${
        isSelected
          ? "border-teal-500 ring-2 ring-teal-400/30"
          : "border-gray-100 hover:border-navy-200"
      }`}
    >
      {/* Badge ribbon */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {isDirect ? (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Direct Route (No Transfer)
            </span>
          ) : (
            <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Shuffle className="h-3.5 w-3.5" />
              1 Transfer at {journey.transferStopName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-navy-900 font-bold text-sm">
          <Clock className="h-4 w-4 text-teal-600" />
          <span>{journey.totalDuration} min</span>
        </div>
      </div>

      {/* Bus Sequence Flow */}
      <div className="flex items-center gap-2 py-1 flex-wrap">
        {journey.legs.map((leg, idx) => (
          <div key={leg.legIndex} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-navy-800 text-white font-bold text-xs px-2.5 py-1.5 rounded-xl shadow-sm">
              <Bus className="h-3.5 w-3.5 text-teal-300" />
              <span>Bus {leg.busNumber}</span>
            </div>
            {idx < journey.legs.length - 1 && (
              <div className="flex items-center gap-1 text-gray-400 text-xs font-medium px-1">
                <ArrowRight className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-[11px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                  Switch at {journey.transferStopName}
                </span>
                <ArrowRight className="h-3.5 w-3.5 hidden sm:inline" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Origin -> Destination description */}
      <div className="mt-3 flex items-start gap-2 text-xs text-gray-600 border-t border-gray-100 pt-2.5">
        <div className="flex flex-col items-center mt-0.5">
          <div className="h-2 w-2 rounded-full bg-teal-500" />
          <div className="w-0.5 h-4 bg-gray-200" />
          <div className="h-2 w-2 rounded-full bg-navy-800" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="truncate font-medium text-gray-800">
            {journey.origin}
          </div>
          <div className="truncate font-medium text-gray-800">
            {journey.destination}
          </div>
        </div>
        <div className="text-right text-xs text-gray-400">
          <div>📍 {journey.totalStopsCount} stops</div>
          <div>📏 ~{journey.totalDistance} km</div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-50">
        <span className="text-amber-600 font-medium">⚠ Demo estimates</span>
        <span className="text-teal-600 font-medium flex items-center gap-0.5">
          {isSelected ? "Selected view below" : "View step-by-step & map"}
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}
