import { type Incident, statusMeta, typeColor } from "../_lib/incidents";
import { TypeIcon } from "../_lib/icons";

type Props = {
  incident: Incident;
  selected: boolean;
  onSelect: () => void;
};

export function IncidentCard({ incident, selected, onSelect }: Props) {
  const color = typeColor[incident.type];
  const status = statusMeta[incident.status];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative w-full border-b border-border px-4 py-4 text-left transition-colors hover:bg-bg-elev/50 ${
        selected ? "bg-bg-elev/40" : ""
      }`}
    >
      {selected && (
        <span
          className="absolute inset-y-0 left-0 w-[3px]"
          style={{ background: color }}
          aria-hidden
        />
      )}
      <div className="flex gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: `color-mix(in oklab, ${color} 14%, transparent)`,
            color,
          }}
        >
          <TypeIcon type={incident.type} size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-fg-subtle">
            <span>{incident.id}</span>
            <span style={{ color }} className="font-semibold tracking-normal">
              {incident.typeLabel}
            </span>
          </div>
          <div className="mt-1 truncate text-sm font-semibold text-fg">{incident.title}</div>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-fg-muted">
            {incident.description}
          </p>
          <div className="mt-2.5 flex items-center gap-2.5 text-[10px] text-fg-muted">
            <span
              className="inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 font-medium"
              style={{
                color: status.color,
                borderColor: `color-mix(in oklab, ${status.color} 28%, transparent)`,
                background: `color-mix(in oklab, ${status.color} 10%, transparent)`,
              }}
            >
              <span className="h-1 w-1 rounded-full" style={{ background: status.color }} />
              {status.label}
            </span>
            <span className="inline-flex items-center gap-1">
              <PinIcon />
              <span className="max-w-[8ch] truncate">{incident.reporter.split(" ")[0]} {incident.reporter.split(" ")[1]?.[0]}.</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <ClockIcon />
              {incident.reportedAt}
            </span>
          </div>
        </div>
        <ChevronIcon />
      </div>
    </button>
  );
}

function PinIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-1 shrink-0 text-fg-subtle" aria-hidden>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
