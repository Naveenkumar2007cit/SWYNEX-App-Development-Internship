import { AlertTriangle, Info, XCircle, X } from "lucide-react";

const config = {
  info:     { bg: "bg-blue-50",   border: "border-blue-200",  text: "text-blue-800",  icon: Info,          iconColor: "text-blue-500" },
  warning:  { bg: "bg-amber-50",  border: "border-amber-200", text: "text-amber-800", icon: AlertTriangle,  iconColor: "text-amber-500" },
  critical: { bg: "bg-red-50",    border: "border-red-200",   text: "text-red-800",   icon: XCircle,       iconColor: "text-red-500" },
};

export default function AlertCard({ alert, onDismiss }) {
  const c = config[alert.severity] || config.info;
  const Icon = c.icon;
  return (
    <div className={`${c.bg} ${c.border} border rounded-xl p-4 flex gap-3`}>
      <Icon className={`${c.iconColor} h-5 w-5 mt-0.5 flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className={`${c.text} font-semibold text-sm`}>{alert.title}</p>
        <p className={`${c.text} text-xs mt-1 opacity-80 leading-relaxed`}>{alert.message}</p>
        {alert.affectedRoutes?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {alert.affectedRoutes.map((r) => (
              <span key={r} className={`${c.text} ${c.border} border text-xs font-medium px-2 py-0.5 rounded-full bg-white/60`}>Bus {r}</span>
            ))}
          </div>
        )}
      </div>
      {onDismiss && (
        <button onClick={() => onDismiss(alert.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
