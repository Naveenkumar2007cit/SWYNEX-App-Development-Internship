import { MapPin } from "lucide-react";

export default function BusStopList({ stops, activeStopId = null }) {
  if (!stops || stops.length === 0) return <p className="text-sm text-gray-400">No stop information available.</p>;
  return (
    <div className="relative">
      {stops.map((stop, idx) => {
        const isFirst = idx === 0;
        const isLast  = idx === stops.length - 1;
        const isActive = stop.id === activeStopId;
        const dotColor = isFirst ? "bg-teal-500" : isLast ? "bg-navy-800" : stop.majorStop ? "bg-navy-500" : "bg-gray-300";
        return (
          <div key={stop.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`h-3 w-3 rounded-full border-2 border-white shadow-sm flex-shrink-0 mt-1 ${dotColor} ${isActive ? "ring-2 ring-teal-400 ring-offset-1" : ""}`} />
              {!isLast && <div className={`w-0.5 flex-1 my-0.5 ${stop.majorStop ? "bg-navy-200" : "bg-gray-200"}`} style={{ minHeight: "24px" }} />}
            </div>
            <div className={`pb-4 flex-1 ${isLast ? "pb-0" : ""}`}>
              <div className="flex items-center gap-2">
                <span className={`text-sm leading-tight ${isFirst || isLast ? "font-bold text-navy-800" : stop.majorStop ? "font-semibold text-navy-700" : "text-gray-600"}`}>
                  {stop.name}
                </span>
                {stop.majorStop && !isFirst && !isLast && (
                  <span className="text-xs bg-navy-50 text-navy-600 px-1.5 py-0.5 rounded-full font-medium">Major</span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs text-gray-400">Stop {idx + 1}</span>
                {(stop.lat && stop.lng) && <span className="text-xs text-gray-300">· {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
