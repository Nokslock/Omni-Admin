"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { currentMapStyle, observeMapTheme } from "../admin/_lib/mapTheme";

type PinType =
  | "fire"
  | "crash"
  | "bandits"
  | "medical"
  | "flood"
  | "power"
  | "protest"
  | "other";

const pins: { lat: number; lng: number; type: PinType }[] = [
  { lat: 6.5341, lng: 3.3539, type: "fire" },     // Mushin
  { lat: 6.5095, lng: 3.3735, type: "medical" },  // Yaba
  { lat: 6.5511, lng: 3.3858, type: "crash" },    // Gbagada
  { lat: 6.5917, lng: 3.3850, type: "power" },    // Ikeja / Ketu
  { lat: 6.4928, lng: 3.3589, type: "flood" },    // Surulere
  { lat: 6.4488, lng: 3.3621, type: "fire" },     // Apapa
  { lat: 6.4541, lng: 3.3947, type: "bandits" },  // Lagos Island
  { lat: 6.4382, lng: 3.4717, type: "other" },    // Lekki
];

const pinColor: Record<PinType, string> = {
  fire: "#ef4444",
  crash: "#f59e0b",
  bandits: "#ef4444",
  medical: "#22c55e",
  flood: "#3b82f6",
  power: "#eab308",
  protest: "#a855f7",
  other: "#f97316",
};

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Teardrop pin SVG path — anchored at the bottom tip (0, 8).
const TEARDROP_PATH =
  "M 0 -32 C -10 -32 -16 -24 -16 -16 C -16 -4 0 8 0 8 C 0 8 16 -4 16 -16 C 16 -24 10 -32 0 -32 Z";

export function MapPreview() {
  const mapDiv = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(
    apiKey ? null : "Map unavailable",
  );

  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    let stopThemeObserver: (() => void) | undefined;

    try {
      setOptions({ key: apiKey, v: "weekly" });
    } catch (e) {
      // Already configured by another mount/page — that's fine, keep going.
      console.warn("MapPreview: setOptions skipped:", e);
    }

    importLibrary("maps")
      .then(() => {
        if (cancelled || !mapDiv.current) return;
        const map = new google.maps.Map(mapDiv.current, {
          center: { lat: 6.5, lng: 3.4 },
          zoom: 11,
          disableDefaultUI: true,
          gestureHandling: "none",
          keyboardShortcuts: false,
          clickableIcons: false,
          styles: currentMapStyle(),
        });

        for (const p of pins) {
          new google.maps.Marker({
            position: { lat: p.lat, lng: p.lng },
            map,
            icon: {
              path: TEARDROP_PATH,
              fillColor: pinColor[p.type],
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 1.5,
              scale: 0.9,
              anchor: new google.maps.Point(0, 8),
            },
          });
        }

        stopThemeObserver = observeMapTheme((styles) => map.setOptions({ styles }));
      })
      .catch((err) => {
        console.error("MapPreview load failed:", err);
        setError("Failed to load map");
      });

    return () => {
      cancelled = true;
      stopThemeObserver?.();
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border-strong bg-bg-card shadow-2xl shadow-black/40">
      {/* Browser chrome */}
      <div className="flex items-center gap-3 border-b border-border bg-bg-elev px-3.5 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 text-center">
          <span className="font-mono text-[11px] text-fg-muted">kasalaalert.com/admin/dashboard</span>
        </div>
        <div className="inline-flex items-center gap-1.5 text-[10px] font-medium text-ok">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-ok animate-ping-slow" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ok" />
          </span>
          LIVE
        </div>
      </div>

      {/* Map area */}
      <div className="relative aspect-[16/9] w-full bg-bg-elev">
        <div
          ref={mapDiv}
          className="absolute inset-0 h-full w-full"
          aria-label="Live incident map"
        />

        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-fg-muted">
            {error}
          </div>
        )}

        {/* Scan sweep */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div
            className="absolute inset-x-0 h-32 animate-scan"
            style={{
              background:
                "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--ok) 18%, transparent), transparent)",
            }}
          />
        </div>

        {/* Zoom controls (decorative) */}
        <div className="pointer-events-none absolute right-3 top-3 flex flex-col overflow-hidden rounded-md border border-border-strong bg-bg-card shadow-sm">
          <span className="flex h-7 w-7 items-center justify-center text-fg-muted">+</span>
          <span className="h-px bg-border" />
          <span className="flex h-7 w-7 items-center justify-center text-fg-muted">−</span>
        </div>

        {/* Coordinates */}
        <div className="pointer-events-none absolute right-3 top-20 rounded-md border border-border bg-bg-card/80 px-2 py-1 font-mono text-[10px] text-fg-muted backdrop-blur">
          6.45°N · 3.40°E
        </div>
      </div>
    </div>
  );
}
