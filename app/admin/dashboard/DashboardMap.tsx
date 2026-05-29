"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { type Incident, typeColor } from "../_lib/incidents";
import { IncidentDetailCard } from "./IncidentDetailCard";

type View = "map" | "satellite";

const views: { id: View; label: string }[] = [
  { id: "map", label: "Map" },
  { id: "satellite", label: "Satellite" },
];

const LAGOS = { lat: 6.5244, lng: 3.3792 };

// Dark basemap style (raster map type, no Map ID required).
const DARK_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0f1115" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f1115" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a93a3" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#222730" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1a1e25" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2d333d" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a1622" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#2a2f38" }] },
];

type Props = {
  incidents: Incident[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

function markerIcon(color: string, selected: boolean): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 0.95,
    strokeColor: selected ? "#ffffff" : "rgba(255,255,255,0.55)",
    strokeWeight: selected ? 3 : 1.5,
    scale: selected ? 11 : 8,
  };
}

export function DashboardMap({ incidents, selectedId, onSelect }: Props) {
  const [view, setView] = useState<View>("map");
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(
    apiKey ? null : "Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.",
  );
  const [center, setCenter] = useState(LAGOS);

  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Record<string, google.maps.Marker>>({});
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  });

  const selected = incidents.find((i) => i.id === selectedId) ?? null;

  // Initialise the map once.
  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    setOptions({ key: apiKey, v: "weekly" });

    importLibrary("maps")
      .then(() => {
        if (cancelled || !mapDiv.current) return;
        const map = new google.maps.Map(mapDiv.current, {
          center: LAGOS,
          zoom: 12,
          disableDefaultUI: true,
          gestureHandling: "greedy",
          styles: DARK_STYLE,
          clickableIcons: false,
        });
        map.addListener("idle", () => {
          const c = map.getCenter();
          if (c) setCenter({ lat: c.lat(), lng: c.lng() });
        });
        mapRef.current = map;
        setReady(true);
      })
      .catch(() => setLoadError("Failed to load Google Maps."));

    return () => {
      cancelled = true;
    };
  }, []);

  // Sync markers whenever incidents change.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;

    try {
      Object.values(markersRef.current).forEach((m) => m.setMap(null));
      markersRef.current = {};

      incidents.forEach((inc) => {
        const marker = new google.maps.Marker({
          position: { lat: inc.coords.lat, lng: inc.coords.lng },
          map,
          title: inc.title,
          icon: markerIcon(typeColor[inc.type], inc.id === selectedId),
        });
        marker.addListener("click", () => onSelectRef.current(inc.id));
        markersRef.current[inc.id] = marker;
      });
    } catch (err) {
      console.error("Map markers failed to render:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, incidents]);

  // Reflect selection on the markers + pan to it.
  useEffect(() => {
    if (!ready) return;
    incidents.forEach((inc) => {
      const marker = markersRef.current[inc.id];
      marker?.setIcon(markerIcon(typeColor[inc.type], inc.id === selectedId));
    });
    if (selected && mapRef.current) {
      mapRef.current.panTo({ lat: selected.coords.lat, lng: selected.coords.lng });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, selectedId]);

  // Switch between Map / Satellite views.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map.setMapTypeId(view === "satellite" ? "hybrid" : "roadmap");
  }, [ready, view]);

  function zoom(delta: number) {
    const map = mapRef.current;
    if (map) map.setZoom((map.getZoom() ?? 12) + delta);
  }

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: "var(--map-bg)" }}>
      <div ref={mapDiv} className="absolute inset-0 h-full w-full" aria-label="Live incident map" />

      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-fg-muted">
          {loadError}
        </div>
      )}

      {/* View tabs */}
      <div className="absolute left-4 top-4 z-10 flex overflow-hidden rounded-lg border border-border-strong bg-bg-card/80 backdrop-blur">
        {views.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`px-3.5 py-1.5 text-xs font-medium transition-colors ${
              view === v.id ? "bg-bg-elev text-fg" : "text-fg-muted hover:text-fg"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Zoom controls */}
      <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
        <div className="flex flex-col overflow-hidden rounded-md border border-border-strong bg-bg-card/80 backdrop-blur">
          <button onClick={() => zoom(1)} className="flex h-8 w-8 items-center justify-center text-fg-muted hover:text-fg" aria-label="Zoom in">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <span className="h-px bg-border" />
          <button onClick={() => zoom(-1)} className="flex h-8 w-8 items-center justify-center text-fg-muted hover:text-fg" aria-label="Zoom out">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Selected detail overlay */}
      {selected && (
        <div className="pointer-events-none absolute right-4 top-16 z-10">
          <IncidentDetailCard incident={selected} onClose={() => onSelect("")} />
        </div>
      )}

      {/* Live center coordinates */}
      {!selected && (
        <div className="absolute right-4 top-32 z-10 rounded-md border border-border bg-bg-card/80 px-2 py-1 font-mono text-[10px] text-fg-muted backdrop-blur">
          {center.lat.toFixed(2)}°N · {center.lng.toFixed(2)}°E
        </div>
      )}

      {/* Attribution */}
      <div className="absolute bottom-3 right-4 z-10 font-mono text-[9px] text-fg-subtle">
        Google Maps
      </div>
    </div>
  );
}
