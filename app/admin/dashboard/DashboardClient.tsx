"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Incident, IncidentStatus } from "../_lib/incidents";
import { WORLDWIDE } from "@/app/lib/countries";
import { CountryFilter } from "./CountryFilter";
import { DashboardMap, RingBadge, type MapMode } from "./DashboardMap";
import { TimelineBar } from "./TimelineBar";
import { TriageView } from "./TriageView";
import {
  RANGE_MS,
  STATUS_ORDER,
  STATUS_UI,
  inBounds,
  reportedMs,
  shortAge,
  useIsClient,
  useMediaQuery,
  type GeoBounds,
  type TimeFocus,
  type TimeRange,
} from "./dashboard-utils";

const MODES: { id: MapMode; label: string }[] = [
  { id: "pins", label: "Pins" },
  { id: "heat", label: "Heat" },
  { id: "satellite", label: "Satellite" },
];

/** Width of the floating "In this area" list, so the map keeps pins clear of it. */
const LIST_W = 360;
/** How often the dashboard asks the server for new reports. */
const REFRESH_MS = 30_000;

export function DashboardClient({ incidents }: { incidents: Incident[] }) {
  const [screen, setScreen] = useState<"map" | "triage">("map");
  // True while the triage view plays its exit animation before unmounting.
  const [closing, setClosing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [country, setCountry] = useState<string>(WORLDWIDE);
  const [countryBounds, setCountryBounds] = useState<GeoBounds | null>(null);
  const [viewport, setViewport] = useState<GeoBounds | null>(null);
  const [mode, setMode] = useState<MapMode>("pins");
  const [range, setRange] = useState<TimeRange>("7d");
  // Live reports by default; resolved / false alarms can be switched on.
  const [shown, setShown] = useState<Set<IncidentStatus>>(() => new Set(["unverified", "active"]));
  // Re-read "now" each minute (and on refresh) so ages and the time window stay current.
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- new server data → new "now"
  useEffect(() => setNowMs(Date.now()), [incidents]);

  // Keep the data live: re-fetch on a timer, and straight away when the tab is looked at again.
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") startRefresh(() => router.refresh());
    };
    const t = setInterval(refresh, REFRESH_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);

  // A bar picked on the time bar narrows the map and list to that slice.
  const [focus, setFocus] = useState<TimeFocus | null>(null);
  function changeRange(r: TimeRange) {
    setRange(r);
    setFocus(null);
  }

  // The list covers too much of the map on a narrow window, so it starts closed there.
  const narrow = useMediaQuery("(max-width: 1279px)");
  const [listPref, setListPref] = useState<boolean | null>(null);
  const listOpen = listPref ?? !narrow;
  const isClient = useIsClient();

  function handleCountry(code: string) {
    setCountry(code);
    if (code === WORLDWIDE) setCountryBounds(null);
  }

  function openIncident(id: string) {
    setSelectedId(id);
    setClosing(false);
    setScreen("triage");
  }

  // Country lock first; everything else builds on this.
  const inCountry = useMemo(() => {
    if (country === WORLDWIDE || !countryBounds) return incidents;
    return incidents.filter((i) => inBounds(i.coords.lat, i.coords.lng, countryBounds));
  }, [incidents, country, countryBounds]);

  const statusCounts = useMemo(() => {
    const c: Record<IncidentStatus, number> = { unverified: 0, active: 0, resolved: 0, false_alarm: 0 };
    for (const i of inCountry) c[i.status]++;
    return c;
  }, [inCountry]);

  const onMap = useMemo(() => {
    const from = focus ? focus.from : nowMs - RANGE_MS[range];
    const to = focus ? focus.to : Infinity;
    return inCountry.filter((i) => {
      const t = reportedMs(i);
      return shown.has(i.status) && t >= from && t < to;
    });
  }, [inCountry, shown, range, nowMs, focus]);

  // Headline figures for the selected country, whatever the map filters say.
  const headline = useMemo(() => {
    const dayAgo = nowMs - 86_400_000;
    let last24 = 0;
    let oldestUnverified: number | null = null;
    for (const i of inCountry) {
      const t = reportedMs(i);
      if (t >= dayAgo) last24++;
      if (i.status === "unverified" && (oldestUnverified === null || t < oldestUnverified)) oldestUnverified = t;
    }
    return { last24, longestWait: oldestUnverified === null ? null : shortAge(nowMs - oldestUnverified) };
  }, [inCountry, nowMs]);

  const inArea = useMemo(() => {
    const list = viewport ? onMap.filter((i) => inBounds(i.coords.lat, i.coords.lng, viewport)) : onMap;
    // Unverified first, then newest.
    return [...list].sort(
      (a, b) =>
        STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || reportedMs(b) - reportedMs(a),
    );
  }, [onMap, viewport]);

  function toggleStatus(s: IncidentStatus) {
    setShown((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }

  return (
    <div className="@container relative h-full overflow-hidden">
      {/* Map stays mounted under the triage screen so its viewport survives the round trip. */}
      <div
        className={`absolute inset-0 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
          screen === "map" || closing ? "opacity-100" : "pointer-events-none scale-[0.985] opacity-0"
        }`}
        aria-hidden={screen !== "map"}
      >
        <DashboardMap
          incidents={onMap}
          selectedId={selectedId}
          onSelect={openIncident}
          mode={mode}
          country={country}
          onBoundsResolved={setCountryBounds}
          onViewportChange={setViewport}
          onClearCountry={() => handleCountry(WORLDWIDE)}
          leftInset={listOpen ? LIST_W + 24 : 0}
        />

        {/* Toolbar */}
        {/* Above the list (z-20) so the country dropdown opens over it. */}
        <div className="pointer-events-none absolute inset-x-6 top-5 z-30 flex items-start gap-3">
          <div className="pointer-events-auto max-w-[46%] shrink-0" style={{ width: LIST_W }}>
            <CountryFilter value={country} onChange={handleCountry} count={onMap.length} />
          </div>
          <div className="pointer-events-auto flex min-w-0 gap-2">
            {STATUS_ORDER.map((s) => {
              const on = shown.has(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleStatus(s)}
                  aria-pressed={on}
                  title={on ? `Hide ${STATUS_UI[s].label.toLowerCase()}` : `Show ${STATUS_UI[s].label.toLowerCase()}`}
                  aria-label={`${STATUS_UI[s].label}: ${statusCounts[s]}`}
                  className={`inline-flex h-11 shrink-0 items-center gap-2.5 rounded-xl border px-3 text-sm shadow-lg shadow-black/20 backdrop-blur transition-colors @[1240px]:px-4 ${
                    on
                      ? "border-border-strong bg-bg-card/90 text-fg"
                      : "border-border bg-bg-card/60 text-fg-subtle hover:text-fg-muted"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: STATUS_UI[s].color, opacity: on ? 1 : 0.4 }}
                  />
                  <span className="text-lg font-bold tabular-nums leading-none">{statusCounts[s]}</span>
                  <span className={`hidden @[1240px]:inline ${on ? "text-fg-muted" : ""}`}>{STATUS_UI[s].label}</span>
                </button>
              );
            })}
          </div>
          <div className="pointer-events-auto ml-auto flex shrink-0 rounded-xl border border-border-strong bg-bg-card/90 p-1 shadow-lg shadow-black/20 backdrop-blur">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                aria-pressed={mode === m.id}
                className={`h-9 rounded-lg px-2.5 text-sm font-semibold transition-colors @[1000px]:px-4 ${
                  mode === m.id ? "bg-bg-elev text-fg" : "text-fg-muted hover:text-fg"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* In this area */}
        {!listOpen && (
          <button
            type="button"
            onClick={() => setListPref(true)}
            className="absolute left-6 top-[84px] z-20 inline-flex h-11 items-center gap-2 rounded-xl border border-border-strong bg-bg-card/95 px-4 text-sm font-semibold shadow-xl shadow-black/30 backdrop-blur transition-colors hover:bg-bg-elev"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
            In this area
            <span className="rounded-md bg-bg-elev px-1.5 font-mono text-xs text-fg-muted">{inArea.length}</span>
          </button>
        )}
        <section
          className={`absolute bottom-[112px] left-6 top-[84px] z-20 flex max-w-[calc(100%-3rem)] flex-col overflow-hidden rounded-2xl border border-border bg-bg-card/95 shadow-xl shadow-black/30 backdrop-blur ${
            listOpen ? "animate-swap-in" : "hidden"
          }`}
          style={{ width: LIST_W }}
          aria-label="Incidents in this area"
        >
          <header className="flex items-center gap-2 border-b border-border py-3 pl-5 pr-3">
            <h2 className="text-base font-semibold">In this area</h2>
            <span className="rounded-md bg-bg-elev px-1.5 font-mono text-xs text-fg-muted">{inArea.length}</span>
            <span
              className="ml-auto inline-flex items-center gap-1.5 text-sm text-ok"
              title={`Checks for new reports every ${REFRESH_MS / 1000} seconds`}
            >
              <span className="relative inline-flex h-1.5 w-1.5">
                {refreshing && <span className="absolute inset-0 animate-ping-slow rounded-full bg-ok" />}
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ok" />
              </span>
              Live
            </span>
            <button
              type="button"
              onClick={() => setListPref(false)}
              aria-label="Hide the list"
              title="Hide the list"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-bg-elev hover:text-fg"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </header>
          <dl className="grid grid-cols-2 divide-x divide-border border-b border-border">
            <div className="px-5 py-3">
              <dt className="text-xs text-fg-muted">Reported in the last 24h</dt>
              <dd className="mt-0.5 text-xl font-semibold tabular-nums">{isClient ? headline.last24 : "–"}</dd>
            </div>
            <div className="px-5 py-3">
              <dt className="text-xs text-fg-muted">Longest unverified wait</dt>
              <dd
                className={`mt-0.5 text-xl font-semibold tabular-nums ${
                  isClient && headline.longestWait ? "text-warn" : ""
                }`}
              >
                {!isClient ? "–" : (headline.longestWait ?? "None")}
              </dd>
            </div>
          </dl>
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {inArea.length === 0 && (
              <li className="px-5 py-10 text-center text-sm text-fg-muted">
                {focus
                  ? "No incidents here in the period you picked. Clear it on the time bar, or zoom out."
                  : `No incidents here in the last ${range}. Zoom out or widen the time window.`}
              </li>
            )}
            {inArea.map((inc) => (
              <li key={inc.id}>
                <button
                  type="button"
                  onClick={() => openIncident(inc.id)}
                  className={`flex w-full items-center gap-3.5 border-b border-border px-5 py-3.5 text-left transition-colors hover:bg-bg-elev/60 ${
                    inc.id === selectedId ? "bg-bg-elev" : ""
                  }`}
                >
                  <RingBadge incident={inc} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-semibold">{inc.title}</div>
                    <div className="truncate text-sm text-fg-muted">
                      {inc.location} · {inc.reportedAt}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-semibold" style={{ color: STATUS_UI[inc.status].color }}>
                    {STATUS_UI[inc.status].label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* What the pin rings mean */}
        <div className="pointer-events-none absolute bottom-[108px] right-6 z-10 hidden items-center gap-4 rounded-xl border border-border bg-bg-card/90 px-3.5 py-2 text-xs text-fg-muted shadow-lg shadow-black/20 backdrop-blur @[900px]:flex">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-dashed border-fg-muted" />
            Unverified
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-fg-muted" />
            Verified
          </span>
        </div>

        {/* Timeline */}
        <div className="pointer-events-none absolute inset-x-6 bottom-5 z-20">
          <TimelineBar
            incidents={inCountry.filter((i) => shown.has(i.status))}
            range={range}
            onRangeChange={changeRange}
            nowMs={nowMs}
            focus={focus}
            onFocus={setFocus}
          />
        </div>
      </div>

      {screen === "triage" && selectedId && (
        <div
          className={`absolute inset-0 z-30 bg-bg ${closing ? "pointer-events-none animate-view-out" : "animate-view-in"}`}
          onAnimationEnd={(e) => {
            // Only the wrapper's own exit animation ends the triage screen.
            if (closing && e.target === e.currentTarget) {
              setClosing(false);
              setScreen("map");
            }
          }}
        >
          <TriageView
            incidents={inCountry}
            allIncidents={incidents}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onBack={() => setClosing(true)}
            country={country}
            onCountryChange={handleCountry}
            nowMs={nowMs}
          />
        </div>
      )}
    </div>
  );
}
