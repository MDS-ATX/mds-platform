"use client";

import { useEffect, useRef, useState } from "react";

interface MapPin {
  lat: number;
  lng: number;
  label: string;
  href?: string;
  description?: string;
  distance?: string;
}

interface MapSectionProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  buildings: MapPin[];
  pois?: MapPin[];
}

const DEFAULT_CENTER = { lat: 30.2983, lng: -97.7012 };
const DEFAULT_ZOOM = 14;

export default function MapSection({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  buildings,
  pois = [],
}: MapSectionProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapRef.current) return;

    let map: L.Map | null = null;

    const init = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (!mapRef.current) return;

      map = L.map(mapRef.current, {
        center: [center.lat, center.lng],
        zoom,
        scrollWheelZoom: false,
        zoomControl: true,
      });

      L.tileLayer(
        "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 20,
          subdomains: "abcd",
        }
      ).addTo(map);

      // Building markers (dark pins)
      const buildingIcon = L.divIcon({
        className: "",
        html: `<div style="width:28px;height:28px;background:#000000;border:2px solid #000000;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3)"><div style="width:8px;height:8px;background:white;border-radius:50%;transform:rotate(45deg)"></div></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
      });

      buildings.forEach((b) => {
        const marker = L.marker([b.lat, b.lng], { icon: buildingIcon }).addTo(
          map!
        );
        const popupContent = b.href
          ? `<div style="padding:4px"><p style="font-weight:700;font-size:13px;margin:0">${b.label}</p><a href="${b.href}" style="font-size:11px;color:#5e5f5e;font-weight:600">View project</a></div>`
          : `<div style="padding:4px"><p style="font-weight:700;font-size:13px;margin:0">${b.label}</p></div>`;
        marker.bindPopup(popupContent);
      });

      // POI markers (brand-colored dots)
      const poiIcon = L.divIcon({
        className: "",
        html: `<div style="width:12px;height:12px;background:#5e5f5e;border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
        popupAnchor: [0, -8],
      });

      pois.forEach((poi) => {
        const marker = L.marker([poi.lat, poi.lng], { icon: poiIcon }).addTo(
          map!
        );
        let popupContent = `<div style="padding:4px"><p style="font-weight:700;font-size:13px;margin:0">${poi.label}</p>`;
        if (poi.description)
          popupContent += `<p style="font-size:11px;color:#6b7280;margin:2px 0 0">${poi.description}</p>`;
        if (poi.distance)
          popupContent += `<p style="font-size:11px;color:#5e5f5e;font-weight:600;margin:4px 0 0">${poi.distance}</p>`;
        popupContent += `</div>`;
        marker.bindPopup(popupContent);
      });
    };

    init();

    return () => {
      if (map) {
        map.remove();
        map = null;
      }
    };
  }, [mounted, center, zoom, buildings, pois]);

  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-gray-100 relative z-0 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading map...</p>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-[400px] relative z-0 overflow-hidden"
    />
  );
}
