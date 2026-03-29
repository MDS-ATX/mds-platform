"use client";

import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import { useState } from "react";
import Link from "next/link";

interface MapPin {
  lat: number;
  lng: number;
  label: string;
  href?: string;
}

interface MapSectionProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  buildings: MapPin[];
  pois?: MapPin[];
}

const DEFAULT_CENTER = { lat: 30.2970, lng: -97.7038 };
const DEFAULT_ZOOM = 15;

export default function MapSection({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  buildings,
  pois = [],
}: MapSectionProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [activePin, setActivePin] = useState<string | null>(null);

  if (!apiKey) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-gray-400 text-sm">Map coming soon</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          mapId="iris-concourse-map"
          gestureHandling="cooperative"
          disableDefaultUI={false}
          zoomControl={true}
          streetViewControl={false}
          mapTypeControl={false}
          fullscreenControl={false}
        >
          {buildings.map((b) => (
            <AdvancedMarker
              key={b.label}
              position={{ lat: b.lat, lng: b.lng }}
              onClick={() => setActivePin(activePin === b.label ? null : b.label)}
            >
              <Pin
                background="#1f2937"
                borderColor="#1f2937"
                glyphColor="#ffffff"
              />
              {activePin === b.label && (
                <InfoWindow
                  position={{ lat: b.lat, lng: b.lng }}
                  onCloseClick={() => setActivePin(null)}
                >
                  <div className="p-1">
                    <p className="font-bold text-sm">{b.label}</p>
                    {b.href && (
                      <Link
                        href={b.href}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View project
                      </Link>
                    )}
                  </div>
                </InfoWindow>
              )}
            </AdvancedMarker>
          ))}

          {pois.map((poi) => (
            <AdvancedMarker
              key={poi.label}
              position={{ lat: poi.lat, lng: poi.lng }}
            >
              <div className="w-3 h-3 bg-brand-500 rounded-full border-2 border-white shadow" />
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>
    </div>
  );
}
