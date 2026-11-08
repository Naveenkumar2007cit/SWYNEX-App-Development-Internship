import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapView({ stops = [], height = "360px" }) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || stops.length === 0) return;
    if (instanceRef.current) {
      instanceRef.current.remove();
      instanceRef.current = null;
    }

    const validStops = stops.filter((s) => s.lat && s.lng);
    if (validStops.length === 0) return;

    const center = [validStops[0].lat, validStops[0].lng];
    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false }).setView(center, 12);
    instanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map);

    const latlngs = validStops.map((s) => [s.lat, s.lng]);
    L.polyline(latlngs, { color: "#1e3a5f", weight: 3, opacity: 0.8, dashArray: "6 4" }).addTo(map);

    validStops.forEach((stop, idx) => {
      const isFirst = idx === 0;
      const isLast  = idx === validStops.length - 1;
      const color   = isFirst ? "#14b8a6" : isLast ? "#1e3a5f" : stop.majorStop ? "#3d70ad" : "#94a3b8";
      const radius  = isFirst || isLast ? 10 : stop.majorStop ? 7 : 5;
      const marker  = L.circleMarker([stop.lat, stop.lng], {
        radius, color: "white", weight: 2, fillColor: color, fillOpacity: 1,
      }).addTo(map);
      marker.bindPopup(`<strong>${stop.name}</strong><br/><small>Stop ${idx + 1}</small>`, { maxWidth: 180 });
    });

    const bounds = L.latLngBounds(latlngs);
    map.fitBounds(bounds, { padding: [30, 30] });

    return () => { if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null; } };
  }, [stops]);

  if (stops.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-50 rounded-2xl border" style={{ height }}>
        <p className="text-gray-400 text-sm">No map data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-card">
      <div ref={mapRef} style={{ height, width: "100%" }} />
      <div className="bg-gray-50 px-3 py-2 text-xs text-gray-400 flex items-center gap-2 border-t">
        <span className="inline-block w-3 h-0.5 bg-navy-800 opacity-70" style={{ borderTop: "2px dashed #1e3a5f" }} />
        Route path · OpenStreetMap · Not real-time GPS
      </div>
    </div>
  );
}
