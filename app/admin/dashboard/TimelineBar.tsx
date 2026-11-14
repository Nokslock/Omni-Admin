"use client";

import { useMemo } from "react";
import type { Incident } from "../_lib/incidents";
import { RANGE_MS, reportedMs, useIsClient, type TimeFocus, type TimeRange } from "./dashboard-utils";

const RANGES: TimeRange[] = ["1h", "6h", "24h", "7d"];
/** The histogram shows 4× the chosen window so you can see what led up to it. */
const SPAN_FACTOR = 4;
const BINS = 28;

type Bin = { from: number; to: number; count: number; height: number; inWindow: boolean; label: string };

export function TimelineBar({
  incidents,
  range,
  onRangeChange,
  nowMs,
  focus,
  onFocus,
}: {
  incidents: Incident[];
  range: TimeRange;
  onRangeChange: (r: TimeRange) => void;
  nowMs: number;
  /** The slice picked by clicking a bar; the map and list show only that slice. */
  focus: TimeFocus | null;
  onFocus: (f: TimeFocus | null) => void;
}) {
  const isClient = useIsClient();
  // Bars depend on the browser's clock and locale, so they're only computed there.
  const bins = useMemo<Bin[] | null>(() => {
    if (!isClient) return null;
    const span = RANGE_MS[range] * SPAN_FACTOR;
    const start = nowMs - span;
    const binMs = span / BINS;
    const counts = new Array<number>(BINS).fill(0);
    for (const inc of incidents) {
      const t = reportedMs(inc);
      if (t < start || t > nowMs) continue;
      counts[Math.min(BINS - 1, Math.floor((t - start) / binMs))]++;
    }
    const max = Math.max(1, ...counts);
    const windowStart = nowMs - RANGE_MS[range];
    return counts.map((c, i) => ({
      from: start + i * binMs,
      to: start + (i + 1) * binMs,
      count: c,
      height: c === 0 ? 0 : 0.18 + (c / max) * 0.82,
      inWindow: start + (i + 1) * binMs > windowStart,
      label: new Date(start + i * binMs).toLocaleString(undefined, {
        weekday: range === "7d" ? "short" : undefined,
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
  }, [incidents, range, nowMs, isClient]);

  const inFocus = (b: Bin) => !!focus && b.from < focus.to && b.to > focus.from;
  const focused = bins?.filter(inFocus) ?? [];
  const windowCount = bins?.filter((b) => b.inWindow).reduce((s, b) => s + b.count, 0) ?? 0;

  return (
    <div className="pointer-events-auto flex h-[72px] items-center gap-4 rounded-2xl border border-border bg-bg-card/90 px-4 shadow-xl shadow-black/30 backdrop-blur sm:gap-6 sm:px-5">
      <div className="flex shrink-0 items-center gap-1" role="radiogroup" aria-label="Time window">
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            role="radio"
            aria-checked={range === r}
            onClick={() => onRangeChange(r)}
            className={`h-9 rounded-lg px-2.5 text-sm font-semibold transition-colors sm:px-3 ${
              range === r ? "bg-bg-elev text-fg" : "text-fg-muted hover:text-fg"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="flex h-10 min-w-0 flex-1 items-end gap-[3px]" role="group" aria-label="Reports over time. Pick a bar to show only that period.">
        {bins
          ? bins.map((b) => {
              const on = inFocus(b);
              const dim = !!focus && !on;
              return (
                <button
                  key={b.from}
                  type="button"
                  disabled={b.count === 0}
                  aria-pressed={on}
                  onClick={() => onFocus(on ? null : { from: b.from, to: b.to })}
                  title={`${b.label} · ${b.count} report${b.count === 1 ? "" : "s"}${b.count > 0 ? (on ? " · click to clear" : " · click to show only these") : ""}`}
                  className="group flex h-full flex-1 items-end rounded-sm enabled:cursor-pointer disabled:cursor-default"
                >
                  <span
                    className={`block w-full rounded-t-[2px] transition-[opacity,background-color] ${
                      on ? "bg-fg" : b.inWindow ? "bg-danger group-hover:bg-danger/75" : "bg-fg/15 group-hover:bg-fg/35"
                    }`}
                    style={{
                      height: b.count === 0 ? 3 : `${b.height * 100}%`,
                      opacity: b.count === 0 ? 0.5 : dim ? 0.35 : 1,
                    }}
                  />
                </button>
              );
            })
          : // Same footprint before the browser takes over, so nothing jumps.
            Array.from({ length: BINS }, (_, i) => (
              <span key={i} className="flex h-full flex-1 items-end" aria-hidden>
                <span className="block h-[3px] w-full rounded-t-[2px] bg-fg/10" />
              </span>
            ))}
      </div>

      <div className="hidden shrink-0 text-right text-sm md:block">
        {focus && focused.length > 0 ? (
          <button
            type="button"
            onClick={() => onFocus(null)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border-strong bg-bg-elev px-3 font-medium text-fg transition-colors hover:border-fg-muted"
            title="Show the whole time window again"
          >
            {focused[0].label}
            <span className="text-fg-muted">· {focused.reduce((s, b) => s + b.count, 0)}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <span className="text-fg-muted">
            <span className="font-semibold tabular-nums text-fg">{bins ? windowCount : "–"}</span> in the last {range}
          </span>
        )}
      </div>
    </div>
  );
}
