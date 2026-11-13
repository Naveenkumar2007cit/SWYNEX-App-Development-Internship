import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapView({
  stops = [],
  userLocation = null, // { lat, lng }
  selectedStop = null,
  onStopSelect = null,
  height = "380px",
  center = null,
  zoom = 12,
}) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (instanceRef.current) {
      instanceRef.current.remove();
      instanceRef.current = null;
    }

    const validStops = stops.filter((s) => s.lat && s.lng);

    // Determine initial center
    let initialCenter = [13.0067, 80.2206]; // Guindy, Chennai default
    if (center && center.lat && center.lng) {
      initialCenter = [center.lat, center.lng];
    } else if (userLocation && userLocation.lat && userLocation.lng) {
      initialCenter = [userLocation.lat, userLocation.lng];
    } else if (validStops.length > 0) {
      initialCenter = [validStops[0].lat, validStops[0].lng];
    }

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView(initialCenter, zoom);

    instanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map);

    const boundsLatLngs = [];

    // 1. Render User GPS Location marker with pulsating pulse circle if provided
    if (userLocation && userLocation.lat && userLocation.lng) {
      const uPos = [userLocation.lat, userLocation.lng];
      boundsLatLngs.push(uPos);

      // Outer accuracy / pulse ring
      L.circle(uPos, {
        radius: 350,
        color: "#14b8a6",
        fillColor: "#14b8a6",
        fillOpacity: 0.15,
        weight: 1,
      }).addTo(map);

      // Solid user marker
      const userMarker = L.circleMarker(uPos, {
        radius: 8,
        color: "#ffffff",
        weight: 3,
        fillColor: "#0f766e",
        fillOpacity: 1,
      }).addTo(map);

      userMarker.bindPopup(
        `<strong>📍 Your Current Location</strong><br/><small>Nearby bus stop discovery center</small>`,
        { maxWidth: 220 }
      );
    }

    // 2. Render stops and markers
    validStops.forEach((stop, idx) => {
      const sPos = [stop.lat, stop.lng];
      boundsLatLngs.push(sPos);

      const isSelected = selectedStop && (selectedStop.id === stop.id || selectedStop.name === stop.name);
      const isMajor = Boolean(stop.majorStop);

      const markerColor = isSelected
        ? "#e11d48" // Rose red for selected
        : isMajor
        ? "#1e3a5f" // Deep navy for major terminal
        : "#0d9488"; // Teal for regular stop

      const radius = isSelected ? 12 : isMajor ? 8 : 6;

      const marker = L.circleMarker(sPos, {
        radius,
        color: "#ffffff",
        weight: isSelected ? 3 : 2,
        fillColor: markerColor,
        fillOpacity: 1,
      }).addTo(map);

      // Popup with stop details and route chips
      const routePills = stop.routes && stop.routes.length > 0
        ? `<div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:2px;">` +
          stop.routes.map((r) => `<span style="background:#1e3a5f;color:#fff;border-radius:4px;padding:1px 5px;font-size:10px;font-weight:bold;">${r}</span>`).join("") +
          `</div>`
        : "";

      const distText = stop.formattedDistance ? `<div style="color:#0d9488;font-size:11px;font-weight:600;margin-top:2px;">📏 ${stop.formattedDistance} from you</div>` : "";

      marker.bindPopup(
        `<div style="font-family:sans-serif;">` +
        `<strong>${stop.name}</strong>` +
        distText +
        `<small style="color:#64748b;">${isMajor ? "Major Interchange" : "Bus Stop"}</small>` +
        routePills +
        `</div>`,
        { maxWidth: 220 }
      );

      if (onStopSelect) {
        marker.on("click", () => {
          onStopSelect(stop);
        });
      }
    });

    // 3. Render route polyline if stops form a continuous sequence (e.g. from RouteDetails)
    if (validStops.length > 1 && !userLocation) {
      const latlngs = validStops.map((s) => [s.lat, s.lng]);
      L.polyline(latlngs, {
        color: "#1e3a5f",
        weight: 3.5,
        opacity: 0.85,
        dashArray: "6 4",
      }).addTo(map);
    }

    // Auto-fit bounds if we have multiple points
    if (boundsLatLngs.length > 1) {
      map.fitBounds(L.latLngBounds(boundsLatLngs), { padding: [35, 35] });
    } else if (boundsLatLngs.length === 1) {
      map.setView(boundsLatLngs[0], 14);
    }

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, [stops, userLocation, selectedStop, center, zoom]);

  return (
    <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-card bg-gray-50 relative">
      <div ref={mapRef} style={{ height, width: "100%" }} />
      <div className="bg-white/90 backdrop-blur-xs px-3.5 py-2 text-[11px] text-gray-500 flex items-center justify-between border-t border-gray-100">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-teal-600 inline-block" />
          <span>Interactive OpenStreetMap · Chennai Verified Demo Coordinates</span>
        </span>
        <span className="text-gray-400">Leaflet v1.9</span>
      </div>
    </div>
  );
}
