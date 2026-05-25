type IncidentType = "fire" | "crash" | "bandits" | "medical" | "flood" | "power" | "protest" | "other";

const incidents: { x: number; y: number; type: IncidentType }[] = [
  { x: 230, y: 250, type: "fire" },
  { x: 305, y: 245, type: "medical" },
  { x: 370, y: 295, type: "crash" },
  { x: 460, y: 285, type: "power" },
  { x: 345, y: 350, type: "flood" },
  { x: 425, y: 420, type: "fire" },
  { x: 680, y: 340, type: "bandits" },
  { x: 770, y: 320, type: "other" },
];

const incidentColor: Record<IncidentType, string> = {
  fire: "#ef4444",
  crash: "#f59e0b",
  bandits: "#ef4444",
  medical: "#22c55e",
  flood: "#3b82f6",
  power: "#eab308",
  protest: "#a855f7",
  other: "#f97316",
};

export function MapPreview() {
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
          <span className="font-mono text-[11px] text-fg-muted">omni.ng/admin/dashboard</span>
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
        <svg
          viewBox="0 0 960 540"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
          aria-label="Live incident map of Lagos"
        >
          <defs>
            <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.5" className="text-fg" />
            </pattern>
            <pattern id="map-grid-strong" width="160" height="160" patternUnits="userSpaceOnUse">
              <path d="M 160 0 L 0 0 0 160" fill="none" stroke="currentColor" strokeOpacity="0.16" strokeWidth="0.5" className="text-fg" />
            </pattern>
            <radialGradient id="map-vignette" cx="50%" cy="50%" r="70%">
              <stop offset="60%" stopColor="transparent" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" className="text-bg" />
            </radialGradient>
          </defs>

          {/* Grid background */}
          <rect width="960" height="540" fill="url(#map-grid)" />
          <rect width="960" height="540" fill="url(#map-grid-strong)" />

          {/* Lagoon / water */}
          <path
            d="M 0 380 C 140 360, 280 410, 420 395 C 560 380, 700 420, 840 405 C 900 400, 960 410, 960 410 L 960 540 L 0 540 Z"
            fill="#3b82f6"
            fillOpacity="0.18"
          />
          <path
            d="M 0 380 C 140 360, 280 410, 420 395 C 560 380, 700 420, 840 405 C 900 400, 960 410, 960 410"
            fill="none"
            stroke="#3b82f6"
            strokeOpacity="0.4"
            strokeWidth="1"
          />

          {/* Main roads */}
          <g stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" fill="none" className="text-fg">
            <path d="M 0 260 L 960 280" />
            <path d="M 0 180 L 960 200" />
            <path d="M 200 0 L 220 540" />
            <path d="M 480 0 L 500 540" />
            <path d="M 760 0 L 780 540" />
            <path d="M 0 100 C 240 120, 480 80, 720 120 S 960 110, 960 110" strokeOpacity="0.12" />
          </g>

          {/* District labels */}
          <g className="text-fg-subtle" fill="currentColor" fontFamily="var(--font-geist-mono), monospace" fontSize="10" letterSpacing="2">
            <text x="180" y="220">MUSHIN</text>
            <text x="320" y="180">YABA</text>
            <text x="560" y="190">GBAGADA</text>
            <text x="790" y="220">KETU</text>
            <text x="170" y="320">SURULERE</text>
            <text x="380" y="330">LAGOS ISLAND</text>
            <text x="780" y="320">KOSOFE</text>
            <text x="120" y="480" className="text-fg-muted" fill="currentColor">APAPA</text>
            <text x="540" y="450">VICTORIA ISLAND</text>
            <text x="800" y="475">LEKKI</text>
          </g>

          {/* Roadway label */}
          <g fill="currentColor" className="text-fg-subtle" fontFamily="var(--font-geist-sans), sans-serif" fontSize="9" fontStyle="italic">
            <text x="430" y="375">Third Mainland Br.</text>
            <text x="540" y="510">Lekki-Epe Expy</text>
          </g>

          {/* Vignette */}
          <rect width="960" height="540" fill="url(#map-vignette)" />

          {/* Incident pins */}
          {incidents.map((i, idx) => (
            <IncidentPin key={idx} x={i.x} y={i.y} color={incidentColor[i.type]} delay={idx * 0.3} />
          ))}
        </svg>

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

        {/* Zoom controls */}
        <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-md border border-border-strong bg-bg-card shadow-sm">
          <button className="flex h-7 w-7 items-center justify-center text-fg-muted hover:text-fg" aria-label="Zoom in">+</button>
          <span className="h-px bg-border" />
          <button className="flex h-7 w-7 items-center justify-center text-fg-muted hover:text-fg" aria-label="Zoom out">−</button>
        </div>

        {/* Coordinates */}
        <div className="absolute right-3 top-20 rounded-md border border-border bg-bg-card/80 px-2 py-1 font-mono text-[10px] text-fg-muted backdrop-blur">
          6.45°N · 3.40°E
        </div>

        {/* Scale */}
        <div className="absolute bottom-3 left-3 flex items-end gap-1.5">
          <div className="h-1.5 w-12 border border-fg-muted border-t-0" />
          <span className="font-mono text-[10px] text-fg-muted leading-none pb-0.5">2 km</span>
        </div>

        {/* Attribution */}
        <div className="absolute bottom-2 right-3 font-mono text-[9px] text-fg-subtle">
          © Omni Maps · OSM
        </div>
      </div>
    </div>
  );
}

function IncidentPin({ x, y, color, delay }: { x: number; y: number; color: string; delay: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="14" fill={color} fillOpacity="0.18">
        <animate attributeName="r" values="14;26;14" dur="2.4s" begin={`${delay}s`} repeatCount="indefinite" />
        <animate attributeName="fill-opacity" values="0.25;0;0.25" dur="2.4s" begin={`${delay}s`} repeatCount="indefinite" />
      </circle>
      <path d="M 0 -16 C -7 -16 -11 -11 -11 -5 C -11 3 0 12 0 12 C 0 12 11 3 11 -5 C 11 -11 7 -16 0 -16 Z" fill={color} />
      <circle cx="0" cy="-5" r="3.5" fill="#fff" fillOpacity="0.95" />
    </g>
  );
}
