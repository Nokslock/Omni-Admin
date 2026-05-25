"use client";

import { useState } from "react";
import { type Incident, typeColor } from "./data";
import { IncidentDetailCard } from "./IncidentDetailCard";
import { TypeIcon } from "./icons";

type View = "map" | "satellite" | "heatmap";

const views: { id: View; label: string }[] = [
  { id: "map", label: "Map" },
  { id: "satellite", label: "Satellite" },
  { id: "heatmap", label: "Heatmap" },
];

type Props = {
  incidents: Incident[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function DashboardMap({ incidents, selectedId, onSelect }: Props) {
  const [view, setView] = useState<View>("map");
  const selected = incidents.find((i) => i.id === selectedId) ?? null;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0b1421] dark:bg-[#0b1421]">
      <svg
        viewBox="0 0 2000 1200"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-label="Live incident map"
      >
        <defs>
          <pattern id="dash-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1e3a52" strokeWidth="0.6" />
          </pattern>
          <pattern id="dash-grid-strong" width="240" height="240" patternUnits="userSpaceOnUse">
            <path d="M 240 0 L 0 0 0 240" fill="none" stroke="#2a4a66" strokeWidth="0.8" />
          </pattern>
          <radialGradient id="dash-vignette" cx="50%" cy="50%" r="80%">
            <stop offset="70%" stopColor="transparent" />
            <stop offset="100%" stopColor="#070d16" stopOpacity="0.6" />
          </radialGradient>
        </defs>

        <rect width="2000" height="1200" fill="#0b1421" />
        <rect width="2000" height="1200" fill="url(#dash-grid)" />
        <rect width="2000" height="1200" fill="url(#dash-grid-strong)" />

        {/* Lagoon */}
        <path
          d="M 0 880 C 300 850, 600 900, 900 875 C 1200 855, 1500 920, 1800 905 C 1900 900, 2000 905, 2000 905 L 2000 1100 C 1700 1110, 1400 1080, 1100 1095 C 800 1110, 500 1075, 200 1090 L 0 1095 Z"
          fill="#1a3a5c"
          fillOpacity="0.55"
        />
        <path
          d="M 0 880 C 300 850, 600 900, 900 875 C 1200 855, 1500 920, 1800 905 C 1900 900, 2000 905, 2000 905"
          fill="none"
          stroke="#3b6892"
          strokeOpacity="0.6"
          strokeWidth="1.2"
        />

        {/* Ocean (bottom) */}
        <rect y="1100" width="2000" height="100" fill="#0f2840" fillOpacity="0.6" />

        {/* Streets — main roads */}
        <g stroke="#2d4f72" strokeWidth="2.2" fill="none" strokeLinecap="round">
          <path d="M 0 280 L 2000 305" />
          <path d="M 0 460 L 2000 480" />
          <path d="M 0 640 L 2000 660" />
          <path d="M 0 780 C 600 770, 1200 800, 2000 790" />
          <path d="M 380 0 L 410 1100" />
          <path d="M 780 0 L 810 1100" />
          <path d="M 1180 0 L 1210 1100" />
          <path d="M 1580 0 L 1610 1100" />
          <path d="M 250 200 C 600 220, 900 180, 1300 220 S 1900 200, 2000 210" strokeOpacity="0.7" />
        </g>

        {/* Smaller streets */}
        <g stroke="#22405c" strokeWidth="1" fill="none">
          <path d="M 0 120 L 2000 140" />
          <path d="M 0 380 L 2000 400" />
          <path d="M 0 560 L 2000 580" />
          <path d="M 0 730 L 2000 750" />
          <path d="M 580 0 L 610 1100" />
          <path d="M 980 0 L 1010 1100" />
          <path d="M 1380 0 L 1410 1100" />
          <path d="M 1780 0 L 1810 1100" />
        </g>

        {/* District labels */}
        <g
          fill="#5a7c9f"
          fontFamily="var(--font-geist-mono), monospace"
          fontSize="22"
          letterSpacing="5"
        >
          <text x="1320" y="240">IKEJA</text>
          <text x="1700" y="260">MARYLAND</text>
          <text x="780" y="450">MUSHIN</text>
          <text x="1130" y="475">YABA</text>
          <text x="720" y="660">SURULERE</text>
          <text x="1140" y="690">LAGOS ISLAND</text>
          <text x="640" y="980">APAPA</text>
          <text x="1280" y="1080">IKOYI</text>
          <text x="1540" y="1080">VICTORIA ISL.</text>
          <text x="1860" y="1080">LEKKI</text>
        </g>

        {/* Highway labels */}
        <g
          fill="#6b8aae"
          fontFamily="var(--font-geist-sans), sans-serif"
          fontSize="14"
          fontStyle="italic"
        >
          <text x="60" y="270">Lagos–Ibadan Expy</text>
          <text x="1280" y="840">Third Mainland Br.</text>
          <text x="900" y="970">Lagos Lagoon</text>
          <text x="1850" y="1180">Atlantic Ocean</text>
          <text x="1380" y="1010">Lekki–Epe Expy</text>
        </g>

        <rect width="2000" height="1200" fill="url(#dash-vignette)" />

        {/* Pins */}
        {incidents.map((inc) => {
          const color = typeColor[inc.type];
          const isSelected = inc.id === selectedId;
          return (
            <g
              key={inc.id}
              transform={`translate(${inc.mapXY.x} ${inc.mapXY.y})`}
              className="cursor-pointer"
              onClick={() => onSelect(inc.id)}
              role="button"
              aria-label={inc.title}
            >
              <circle r="36" fill={color} fillOpacity="0.18">
                <animate
                  attributeName="r"
                  values="32;52;32"
                  dur="2.6s"
                  repeatCount="indefinite"
                  begin={`${(parseInt(inc.id.slice(-2), 16) % 10) * 0.25}s`}
                />
                <animate
                  attributeName="fill-opacity"
                  values="0.28;0;0.28"
                  dur="2.6s"
                  repeatCount="indefinite"
                  begin={`${(parseInt(inc.id.slice(-2), 16) % 10) * 0.25}s`}
                />
              </circle>
              {isSelected && (
                <circle r="42" fill="none" stroke={color} strokeWidth="2" strokeDasharray="4 4">
                  <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="14s" repeatCount="indefinite" />
                </circle>
              )}
              <g transform="translate(0 -8)">
                <path
                  d="M 0 -30 C -14 -30 -22 -22 -22 -10 C -22 6 0 24 0 24 C 0 24 22 6 22 -10 C 22 -22 14 -30 0 -30 Z"
                  fill={color}
                  stroke={isSelected ? "#fff" : "rgba(255,255,255,0.25)"}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                />
                <foreignObject x="-10" y="-20" width="20" height="20">
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                    }}
                  >
                    <TypeIcon type={inc.type} size={13} />
                  </div>
                </foreignObject>
              </g>
            </g>
          );
        })}
      </svg>

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

      {/* Zoom + coords */}
      <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
        <div className="flex flex-col overflow-hidden rounded-md border border-border-strong bg-bg-card/80 backdrop-blur">
          <button className="flex h-8 w-8 items-center justify-center text-fg-muted hover:text-fg" aria-label="Zoom in">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <span className="h-px bg-border" />
          <button className="flex h-8 w-8 items-center justify-center text-fg-muted hover:text-fg" aria-label="Zoom out">
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

      {/* Coordinates badge — bottom of zoom column */}
      {!selected && (
        <div className="absolute right-4 top-32 z-10 rounded-md border border-border bg-bg-card/80 px-2 py-1 font-mono text-[10px] text-fg-muted backdrop-blur">
          6.45°N · 3.40°E
        </div>
      )}

      {/* Scale */}
      <div className="absolute bottom-4 left-4 z-10 flex items-end gap-1.5">
        <div className="h-1.5 w-16 border border-fg-muted border-t-0" />
        <span className="font-mono text-[10px] text-fg-muted leading-none pb-0.5">2 km</span>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-3 right-4 z-10 font-mono text-[9px] text-fg-subtle">
        Omni Maps · OSM
      </div>
    </div>
  );
}
