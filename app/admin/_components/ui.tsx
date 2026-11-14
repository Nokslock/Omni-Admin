import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Shared page furniture for the admin portal, so every screen has the same header,
 * stat tiles, tabs, panels and pills as the dashboard. No hooks in here: these work
 * from server and client components alike.
 */

/** Page gutter, shared by the header and the content below it. */
export const GUTTER = "px-5 sm:px-6 lg:px-8";

export function PageHeader({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  /** Stat tiles or tabs that belong to the header. */
  children?: ReactNode;
}) {
  return (
    <header className={`shrink-0 pb-5 pt-7 ${GUTTER}`}>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-fg-muted">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children && <div className="mt-6">{children}</div>}
    </header>
  );
}

export function StatGrid({ children, cols = 4 }: { children: ReactNode; cols?: 3 | 4 | 5 }) {
  const lg = cols === 5 ? "lg:grid-cols-5" : cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";
  return <div className={`grid grid-cols-2 gap-3 ${lg}`}>{children}</div>;
}

export function StatTile({
  label,
  value,
  sub,
  color,
  active,
  onClick,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  /** Dot colour. Leave out for a neutral tile. */
  color?: string;
  active?: boolean;
  /** Makes the tile a filter button. */
  onClick?: () => void;
}) {
  const body = (
    <>
      <span className="flex items-center gap-2 text-[13px] text-fg-muted">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: color ?? "var(--fg-subtle)" }}
          aria-hidden
        />
        <span className="truncate">{label}</span>
      </span>
      <span className="mt-3 flex items-baseline gap-2">
        <span className="text-[28px] font-semibold leading-none tracking-tight tabular-nums">{value}</span>
        {sub && <span className="truncate text-xs text-fg-subtle">{sub}</span>}
      </span>
    </>
  );
  const base = "flex min-w-0 flex-col rounded-2xl border px-5 py-4 text-left";
  if (!onClick) return <div className={`${base} border-border bg-bg-card`}>{body}</div>;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`${base} transition-colors ${
        active
          ? "border-border-strong bg-bg-elev"
          : "border-border bg-bg-card hover:border-border-strong"
      }`}
    >
      {body}
    </button>
  );
}

export type SegmentedItem<T extends string> = {
  id: T;
  label: string;
  count?: number;
  /** Renders a link instead of a button. */
  href?: string;
};

/** Pill tabs, the same control as Pins / Heat / Satellite on the dashboard. */
export function Segmented<T extends string>({
  items,
  value,
  onChange,
  label,
}: {
  items: SegmentedItem<T>[];
  value: T;
  onChange?: (id: T) => void;
  label?: string;
}) {
  return (
    <div
      className="inline-flex max-w-full gap-0.5 overflow-x-auto rounded-xl border border-border bg-bg-card p-1"
      role="tablist"
      aria-label={label}
    >
      {items.map((it) => {
        const on = it.id === value;
        const cls = `inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3.5 text-sm font-medium transition-colors ${
          on ? "bg-bg-elev text-fg shadow-sm shadow-black/10" : "text-fg-muted hover:text-fg"
        }`;
        const inner = (
          <>
            {it.label}
            {it.count != null && (
              <span
                className={`rounded-md px-1.5 py-px font-mono text-[11px] tabular-nums ${
                  on ? "bg-fg/10 text-fg" : "bg-bg-elev text-fg-muted"
                }`}
              >
                {it.count}
              </span>
            )}
          </>
        );
        return it.href ? (
          <Link key={it.id} href={it.href} role="tab" aria-selected={on} className={cls}>
            {inner}
          </Link>
        ) : (
          <button
            key={it.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange?.(it.id)}
            className={cls}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}

export function Panel({
  children,
  className = "",
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "li" | "aside";
}) {
  return <Tag className={`rounded-2xl border border-border bg-bg-card ${className}`}>{children}</Tag>;
}

export function PanelHeader({ title, hint, right }: { title: string; hint?: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-5 py-3.5">
      <h2 className="text-sm font-semibold">{title}</h2>
      {hint && <span className="text-xs text-fg-muted">{hint}</span>}
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
  className = "w-full sm:w-72",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-fg-subtle">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-border bg-bg pl-10 pr-3 text-sm text-fg placeholder:text-fg-subtle transition-colors hover:border-border-strong focus:border-fg-muted focus:outline-none focus:ring-2 focus:ring-fg-muted/15"
      />
    </div>
  );
}

/** Coloured status pill with a dot. */
export function StatusPill({ color, label, className = "" }: { color: string; label: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
      style={{
        color,
        borderColor: `color-mix(in oklab, ${color} 26%, transparent)`,
        background: `color-mix(in oklab, ${color} 10%, transparent)`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} aria-hidden />
      {label}
    </span>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-bg-elev text-fg-subtle">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M22 12h-6l-2 3h-4l-2-3H2" />
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
      </span>
      <p className="mt-4 text-sm font-semibold text-fg">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-fg-muted">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Table cell classes, so every table has the same header band and row rhythm. */
export const TH =
  "whitespace-nowrap border-b border-border bg-bg-elev px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-fg-subtle first:pl-5 last:pr-5";
export const TD = "px-4 py-3.5 align-middle first:pl-5 last:pr-5";
export const TR = "border-b border-border transition-colors last:border-b-0 hover:bg-bg-elev/50";

/** Action buttons. `btn` for cards and headers, `btnSm` inside table rows. */
const BASE = "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-semibold transition-colors disabled:opacity-40";
const TONES = {
  ghost: "border border-border text-fg hover:border-border-strong hover:bg-bg-elev",
  ok: "border border-ok/35 bg-ok/10 text-ok hover:bg-ok/20",
  danger: "border border-danger/35 bg-danger/10 text-danger hover:bg-danger/20",
  info: "border border-info/35 bg-info/10 text-info hover:bg-info/20",
  warn: "border border-warn/35 bg-warn/10 text-warn hover:bg-warn/20",
  primary: "bg-fg text-bg hover:opacity-90",
} as const;
type Tone = keyof typeof TONES;
const sized = (size: string) =>
  Object.fromEntries(
    (Object.keys(TONES) as Tone[]).map((t) => [t, `${BASE} ${size} ${TONES[t]}`]),
  ) as Record<Tone, string>;
export const btn = sized("h-9 rounded-lg px-3.5 text-[13px]");
export const btnSm = sized("h-8 rounded-lg px-3 text-xs");
