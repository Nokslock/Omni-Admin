"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { type Incident, typeColor } from "../../_lib/incidents";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const DARK_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0f1115" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f1115" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a93a3" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#222730" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2d333d" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a1622" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

export function MiniMap({ incident }: { incident: Incident }) {
  const { lat, lng } = incident.coords;
  const color = typeColor[incident.type];
  const mapDiv = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(
    apiKey ? null : "Map unavailable",
  );

  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    setOptions({ key: apiKey, v: "weekly" });

    importLibrary("maps")
      .then(() => {
        if (cancelled || !mapDiv.current) return;
        const map = new google.maps.Map(mapDiv.current, {
          center: { lat, lng },
          zoom: 15,
          disableDefaultUI: true,
          gestureHandling: "none",
          keyboardShortcuts: false,
          clickableIcons: false,
          styles: DARK_STYLE,
        });
        new google.maps.Marker({
          position: { lat, lng },
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: color,
            fillOpacity: 0.95,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            scale: 8,
          },
        });
      })
      .catch(() => setError("Failed to load map"));

    return () => {
      cancelled = true;
    };
  }, [lat, lng, color]);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border"
      style={{ background: "var(--map-bg)" }}
    >
      <div ref={mapDiv} className="absolute inset-0 h-full w-full" aria-label="Incident location map" />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-fg-muted">
          {error}
        </div>
      )}

      <div className="absolute bottom-2 left-2 rounded-md border border-border bg-bg-card/80 px-2 py-1 font-mono text-[10px] text-fg-muted backdrop-blur">
        {lat.toFixed(4)}°N · {lng.toFixed(4)}°E
      </div>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 inline-flex h-7 items-center gap-1 rounded-md border border-border bg-bg-card/80 px-2 font-mono text-[10px] text-fg-muted backdrop-blur hover:text-fg"
        aria-label="Open in Google Maps"
      >
        Open in maps
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M14 3h7v7" />
          <path d="M10 14L21 3" />
          <path d="M21 14v7H3V3h7" />
        </svg>
      </a>
    </div>
  );
}
