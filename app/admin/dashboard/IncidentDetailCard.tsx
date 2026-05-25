import { type Incident, statusMeta, typeColor } from "./data";
import { TypeIcon } from "./icons";

export function IncidentDetailCard({
  incident,
  onClose,
}: {
  incident: Incident;
  onClose: () => void;
}) {
  const color = typeColor[incident.type];
  const status = statusMeta[incident.status];

  return (
    <div className="pointer-events-auto w-[340px] overflow-hidden rounded-xl border border-border-strong bg-bg-card shadow-2xl shadow-black/40">
      {/* Status header with tinted gradient */}
      <div
        className="relative flex items-center justify-between px-4 py-2.5"
        style={{
          background: `linear-gradient(180deg, color-mix(in oklab, ${status.color} 22%, transparent), color-mix(in oklab, ${status.color} 6%, transparent))`,
        }}
      >
        <span className="inline-flex items-center gap-2 text-[11px] font-medium" style={{ color: status.color }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.color }} />
          {status.label}
        </span>
        <button
          onClick={onClose}
          aria-label="Close"
          className="inline-flex h-6 w-6 items-center justify-center rounded text-fg-muted hover:bg-bg-elev hover:text-fg"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{
              background: `color-mix(in oklab, ${color} 16%, transparent)`,
              color,
            }}
          >
            <TypeIcon type={incident.type} size={18} />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold" style={{ color }}>{incident.typeLabel}</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-fg-subtle">{incident.id}</div>
          </div>
        </div>

        <h3 className="mt-4 text-base font-semibold leading-snug tracking-tight">
          {incident.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-fg-muted">{incident.description}</p>

        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[12px]">
          <dt className="text-fg-muted">Reporter</dt>
          <dd className="text-right font-medium">{incident.reporter}</dd>
          <dt className="text-fg-muted">Contact</dt>
          <dd className="text-right font-mono text-fg">{incident.reporterPhone}</dd>
          <dt className="text-fg-muted">Coordinates</dt>
          <dd className="text-right font-mono text-fg">
            {incident.coords.lat.toFixed(4)}°N · {incident.coords.lng.toFixed(4)}°E
          </dd>
          <dt className="text-fg-muted">Reported</dt>
          <dd className="text-right text-fg">{incident.reportedAt}</dd>
        </dl>

        <div className="mt-5 flex items-center gap-2">
          <button className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-fg text-sm font-medium text-bg hover:opacity-90 transition-opacity">
            Full Details
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
          <button
            aria-label={`Call ${incident.reporter}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-fg-muted hover:text-fg hover:border-border-strong transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
