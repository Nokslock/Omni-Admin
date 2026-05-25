import { type Incident, typeColor } from "../../_lib/incidents";

export function MiniMap({ incident }: { incident: Incident }) {
  const color = typeColor[incident.type];
  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border"
      style={{ background: "var(--map-bg)" }}
    >
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <pattern id="mini-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" style={{ stroke: "var(--map-grid)" }} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="400" height="300" style={{ fill: "var(--map-bg)" }} />
        <rect width="400" height="300" fill="url(#mini-grid)" />

        {/* Curved roads */}
        <g style={{ stroke: "var(--map-road-strong)" }} strokeWidth="1.5" fill="none" strokeLinecap="round">
          <path d="M 0 100 C 100 90, 200 110, 400 105" />
          <path d="M 0 200 C 100 195, 250 215, 400 205" />
          <path d="M 120 0 L 130 300" />
          <path d="M 260 0 L 280 300" />
        </g>
        <g style={{ stroke: "var(--map-road)" }} strokeWidth="0.8" fill="none">
          <path d="M 0 50 L 400 60" />
          <path d="M 0 250 L 400 255" />
          <path d="M 60 0 L 70 300" />
          <path d="M 340 0 L 350 300" />
        </g>

        {/* District label nearby */}
        <text
          x="200"
          y="40"
          textAnchor="middle"
          style={{ fill: "var(--map-label)" }}
          fontFamily="var(--font-geist-mono), monospace"
          fontSize="9"
          letterSpacing="2"
        >
          {incident.address.toUpperCase()}
        </text>

        {/* Center pin with pulse */}
        <g transform="translate(200 165)">
          <circle r="22" fill={color} fillOpacity="0.18">
            <animate attributeName="r" values="22;36;22" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="fill-opacity" values="0.28;0;0.28" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle r="28" fill="none" stroke={color} strokeOpacity="0.8" strokeWidth="1.5" strokeDasharray="3 3">
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="14s" repeatCount="indefinite" />
          </circle>
          <path
            d="M 0 -20 C -9 -20 -14 -14 -14 -6 C -14 4 0 16 0 16 C 0 16 14 4 14 -6 C 14 -14 9 -20 0 -20 Z"
            fill={color}
            stroke="#fff"
            strokeWidth="1.5"
          />
          <circle cx="0" cy="-4" r="3" fill="#fff" />
        </g>
      </svg>

      <div className="absolute bottom-2 left-2 rounded-md border border-border bg-bg-card/80 px-2 py-1 font-mono text-[10px] text-fg-muted backdrop-blur">
        {incident.coords.lat.toFixed(4)}°N · {incident.coords.lng.toFixed(4)}°E
      </div>
      <button
        className="absolute bottom-2 right-2 inline-flex h-7 items-center gap-1 rounded-md border border-border bg-bg-card/80 px-2 font-mono text-[10px] text-fg-muted backdrop-blur hover:text-fg"
        aria-label="Open in maps"
      >
        Open in maps
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M14 3h7v7" />
          <path d="M10 14L21 3" />
          <path d="M21 14v7H3V3h7" />
        </svg>
      </button>
    </div>
  );
}
