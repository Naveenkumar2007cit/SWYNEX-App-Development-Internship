import {
  AlertTriangle,
  Info,
  XCircle,
  X,
  Clock,
  MapPin,
  Bus,
  Check,
  CheckCircle2,
  Calendar,
  ShieldAlert,
  Star,
} from "lucide-react";

const severityConfig = {
  info:     { bg: "bg-blue-50/90",   border: "border-blue-200",   text: "text-blue-900",   icon: Info,          iconColor: "text-blue-600",    badge: "Info" },
  low:      { bg: "bg-blue-50/90",   border: "border-blue-200",   text: "text-blue-900",   icon: Info,          iconColor: "text-blue-600",    badge: "Low Severity" },
  warning:  { bg: "bg-amber-50/90",  border: "border-amber-200",  text: "text-amber-900",  icon: AlertTriangle, iconColor: "text-amber-600",   badge: "Moderate" },
  medium:   { bg: "bg-amber-50/90",  border: "border-amber-200",  text: "text-amber-900",  icon: AlertTriangle, iconColor: "text-amber-600",   badge: "Medium Severity" },
  critical: { bg: "bg-rose-50/90",   border: "border-rose-200",   text: "text-rose-900",   icon: XCircle,       iconColor: "text-rose-600",    badge: "High Severity" },
  high:     { bg: "bg-rose-50/90",   border: "border-rose-200",   text: "text-rose-900",   icon: XCircle,       iconColor: "text-rose-600",    badge: "High Severity" },
};

export default function AlertCard({
  alert,
  onDismiss,
  onToggleRead,
  isRead = false,
  isRelevant = false,
  showActions = true,
}) {
  if (!alert) return null;

  const sevKey = (alert.severity || "info").toLowerCase();
  const c = severityConfig[sevKey] || severityConfig.info;
  const Icon = c.icon;

  const categoryLabel = {
    bus_delay: "Bus Delay",
    route_diversion: "Route Diversion",
    service_disruption: "Service Disruption",
    stop_change: "Stop Change",
    cancellation: "Cancellation",
    announcement: "General Advisory",
  }[alert.category] || alert.category || "Service Notice";

  return (
    <div
      className={`${c.bg} ${c.border} border rounded-2xl p-4 sm:p-5 transition-all relative overflow-hidden shadow-sm space-y-3 ${
        isRelevant ? "ring-2 ring-amber-400/60" : ""
      } ${isRead ? "opacity-75" : "opacity-100"}`}
    >
      {/* Top Header: Category, Severity, Relevance & Read/Unread Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Icon className={`${c.iconColor} h-4 w-4 flex-shrink-0 mt-0.5`} />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
            {categoryLabel}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white/70 ${c.text} ${c.border}`}>
            {c.badge}
          </span>

          {isRelevant && (
            <span className="bg-amber-400 text-navy-950 font-black text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <Star className="h-3 w-3 fill-navy-950" />
              Affects Your Saved Journey
            </span>
          )}

          {!isRead && (
            <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" title="Unread alert" />
          )}
        </div>

        {/* Read / Unread toggle and dismiss */}
        {showActions && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {onToggleRead && (
              <button
                onClick={() => onToggleRead(alert.id)}
                className={`text-[11px] font-medium px-2 py-1 rounded-lg transition-colors border ${
                  isRead
                    ? "bg-white/60 text-gray-500 border-gray-200 hover:bg-white"
                    : "bg-teal-600 text-white border-teal-500 hover:bg-teal-700"
                }`}
                title={isRead ? "Mark as unread" : "Mark as read"}
              >
                {isRead ? "Mark Unread" : "Mark Read"}
              </button>
            )}

            {onDismiss && (
              <button
                onClick={() => onDismiss(alert.id)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-black/5"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Title & Description */}
      <div>
        <h4 className={`font-bold text-sm sm:text-base ${c.text} leading-snug`}>
          {alert.title}
        </h4>
        <p className={`text-xs mt-1 ${c.text} opacity-90 leading-relaxed`}>
          {alert.message || alert.description}
        </p>
      </div>

      {/* Affected Route Pills */}
      {alert.affectedRoutes && alert.affectedRoutes.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
            <Bus className="h-3 w-3" /> Affected:
          </span>
          {alert.affectedRoutes.map((r) => (
            <span
              key={r}
              className="bg-navy-800 text-white font-bold text-xs px-2.5 py-0.5 rounded-lg shadow-xs"
            >
              Bus {r}
            </span>
          ))}
        </div>
      )}

      {/* Affected Stops if present */}
      {alert.affectedStops && alert.affectedStops.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-gray-600">
          <MapPin className="h-3 w-3 text-teal-600" />
          <span>Stops: {alert.affectedStops.join(", ")}</span>
        </div>
      )}

      {/* Footer Timing Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-200/50 gap-1">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-gray-400" />
          Posted: {alert.createdAt || alert.startDate ? new Date(alert.createdAt || alert.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Active"}
        </span>

        {alert.expiresAt && (
          <span className="text-gray-400">
            Valid until: {new Date(alert.expiresAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
          </span>
        )}
      </div>
    </div>
  );
}
