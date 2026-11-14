"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { type Incident, typeColor } from "../_lib/incidents";
import { currentMapStyle, observeMapTheme } from "../_lib/mapTheme";
import { WORLDWIDE, countryLabel } from "@/app/lib/countries";
import { COUNTRY_BBOX } from "@/app/lib/country-bounds";
import { typeInitials, type GeoBounds } from "./dashboard-utils";

export type MapMode = "pins" | "heat" | "satellite";

const LAGOS = { lat: 6.5244, lng: 3.3792 };
/** Pins closer than this on screen merge into a numbered cluster. */
const CLUSTER_PX = 44;

type Props = {
  incidents: Incident[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  mode: MapMode;
  /** Selected country (ISO alpha-2) or the WORLDWIDE sentinel. */
  country: string;
  /** Called with the locked country's box, or null for worldwide. */
  onBoundsResolved: (bounds: GeoBounds | null) => void;
  /** Called whenever the visible map area settles. */
  onViewportChange: (bounds: GeoBounds) => void;
  onClearCountry: () => void;
  /** Space reserved on the left for the floating list, so fitting/panning keeps pins visible. */
  leftInset?: number;
};

type Projected = { inc: Incident; x: number; y: number };
type Cluster = { x: number; y: number; members: Incident[] };

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export function DashboardMap({
  incidents,
  selectedId,
  onSelect,
  mode,
  country,
  onBoundsResolved,
  onViewportChange,
  onClearCountry,
  leftInset = 0,
}: Props) {
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(
    apiKey ? null : "Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.",
  );
  // Bumped on every overlay draw so pins re-project after zooms.
  const [drawTick, setDrawTick] = useState(0);
  const [layerDiv, setLayerDiv] = useState<HTMLDivElement | null>(null);

  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const layerRef = useRef<google.maps.OverlayView | null>(null);
  const cbRef = useRef({ onBoundsResolved, onViewportChange });

  useEffect(() => {
    cbRef.current = { onBoundsResolved, onViewportChange };
  });

  // Initialise the map and an HTML overlay layer for pins, once.
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
          styles: currentMapStyle(),
          clickableIcons: false,
        });
        map.addListener("idle", () => {
          const b = map.getBounds();
          if (!b) return;
          const ne = b.getNorthEast();
          const sw = b.getSouthWest();
          cbRef.current.onViewportChange({
            north: ne.lat(),
            east: ne.lng(),
            south: sw.lat(),
            west: sw.lng(),
          });
        });

        class PinLayer extends google.maps.OverlayView {
          div = document.createElement("div");
          onAdd() {
            this.div.style.position = "absolute";
            this.div.style.left = "0";
            this.div.style.top = "0";
            this.getPanes()?.overlayMouseTarget.appendChild(this.div);
            setLayerDiv(this.div);
          }
          draw() {
            setDrawTick((t) => t + 1);
          }
          onRemove() {
            this.div.remove();
          }
        }
        const layer = new PinLayer();
        layer.setMap(map);
        layerRef.current = layer;
        mapRef.current = map;
        setReady(true);
      })
      .catch(() => setLoadError("Failed to load Google Maps."));

    return () => {
      cancelled = true;
      layerRef.current?.setMap(null);
    };
  }, []);

  // Project every incident into overlay pixel space.
  const projected = useMemo<Projected[]>(() => {
    const proj = layerRef.current?.getProjection();
    if (!ready || !proj || drawTick < 0) return [];
    const out: Projected[] = [];
    for (const inc of incidents) {
      const p = proj.fromLatLngToDivPixel(new google.maps.LatLng(inc.coords.lat, inc.coords.lng));
      if (p) out.push({ inc, x: p.x, y: p.y });
    }
    return out;
  }, [ready, incidents, drawTick]);

  // Greedy screen-space clustering; the selected pin always stands alone.
  const { singles, clusters } = useMemo(() => {
    const singles: Projected[] = [];
    const clusters: Cluster[] = [];
    const pool = projected.filter((p) => p.inc.id !== selectedId);
    const used = new Set<number>();
    pool.forEach((p, i) => {
      if (used.has(i)) return;
      const group = [p];
      for (let j = i + 1; j < pool.length; j++) {
        if (used.has(j)) continue;
        if (Math.hypot(pool[j].x - p.x, pool[j].y - p.y) < CLUSTER_PX) {
          group.push(pool[j]);
          used.add(j);
        }
      }
      if (group.length === 1) singles.push(p);
      else
        clusters.push({
          x: group.reduce((s, g) => s + g.x, 0) / group.length,
          y: group.reduce((s, g) => s + g.y, 0) / group.length,
          members: group.map((g) => g.inc),
        });
    });
    const sel = projected.find((p) => p.inc.id === selectedId);
    if (sel) singles.push(sel);
    return { singles, clusters };
  }, [projected, selectedId]);

  // Pan to a newly selected incident if it's off-screen.
  useEffect(() => {
    const map = mapRef.current;
    const sel = incidents.find((i) => i.id === selectedId);
    if (!ready || !map || !sel) return;
    const latLng = new google.maps.LatLng(sel.coords.lat, sel.coords.lng);
    if (!map.getBounds()?.contains(latLng)) map.panTo(latLng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map.setMapTypeId(mode === "satellite" ? "hybrid" : "roadmap");
  }, [ready, mode]);

  useEffect(() => {
    if (!ready) return;
    return observeMapTheme((styles) => mapRef.current?.setOptions({ styles }));
  }, [ready]);

  // Lock the map to the selected country using a static bounding box.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const box = country === WORLDWIDE ? null : COUNTRY_BBOX[country];
    if (!box) {
      cbRef.current.onBoundsResolved(null);
      return;
    }
    const [west, south, east, north] = box;
    map.fitBounds(new google.maps.LatLngBounds({ lat: south, lng: west }, { lat: north, lng: east }), {
      left: leftInset + 24,
      top: 80,
      right: 24,
      bottom: 100,
    });
    cbRef.current.onBoundsResolved({ north, south, east, west });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, country]);

  function zoom(delta: number) {
    const map = mapRef.current;
    if (map) map.setZoom((map.getZoom() ?? 12) + delta);
  }

  function openCluster(c: Cluster) {
    const map = mapRef.current;
    if (!map) return;
    const b = new google.maps.LatLngBounds();
    c.members.forEach((m) => b.extend(m.coords));
    map.fitBounds(b, { left: leftInset + 80, top: 120, right: 80, bottom: 140 });
  }

  const overlay =
    layerDiv &&
    createPortal(
      <>
        {mode === "heat"
          ? projected.map(({ inc, x, y }) => (
              <span
                key={inc.id}
                aria-hidden
                className="pointer-events-none absolute h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  left: x,
                  top: y,
                  background: `radial-gradient(circle, color-mix(in oklab, ${typeColor[inc.type]} 70%, transparent) 0%, transparent 65%)`,
                  mixBlendMode: "screen",
                }}
              />
            ))
          : (
            <>
              {clusters.map((c) => (
                <button
                  key={c.members.map((m) => m.id).join("|")}
                  type="button"
                  onClick={() => openCluster(c)}
                  aria-label={`${c.members.length} incidents here — zoom in`}
                  className="absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-danger/50 bg-[color-mix(in_oklab,var(--danger)_22%,var(--bg-card))] text-lg font-bold text-fg shadow-lg shadow-black/40 transition-transform hover:scale-105"
                  style={{ left: c.x, top: c.y }}
                >
                  {c.members.length}
                </button>
              ))}
              {singles.map(({ inc, x, y }) => (
                <Pin
                  key={inc.id}
                  incident={inc}
                  x={x}
                  y={y}
                  selected={inc.id === selectedId}
                  onClick={() => onSelect(inc.id)}
                />
              ))}
            </>
          )}
      </>,
      layerDiv,
    );

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: "var(--map-bg)" }}>
      <div ref={mapDiv} className="absolute inset-0 h-full w-full" aria-label="Live incident map" />
      {overlay}

      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-fg-muted">
          {loadError}
        </div>
      )}

      {country !== WORLDWIDE && (
        <div className="absolute left-1/2 top-20 z-10 -translate-x-1/2">
          <div className="inline-flex items-center gap-2 rounded-full border border-info/40 bg-bg-card/85 py-1 pl-3 pr-1.5 text-xs font-medium text-fg shadow-lg shadow-black/20 backdrop-blur">
            Locked to {countryLabel(country)}
            <button
              type="button"
              onClick={onClearCountry}
              aria-label="Clear country lock"
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-fg-muted hover:bg-bg-elev hover:text-fg"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="absolute right-6 top-20 z-10 flex flex-col overflow-hidden rounded-lg border border-border-strong bg-bg-card/85 backdrop-blur">
        <button onClick={() => zoom(1)} className="flex h-10 w-10 items-center justify-center text-fg-muted hover:text-fg" aria-label="Zoom in">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <span className="h-px bg-border" />
        <button onClick={() => zoom(-1)} className="flex h-10 w-10 items-center justify-center text-fg-muted hover:text-fg" aria-label="Zoom out">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/** Initials pin: dashed ring while unverified, solid once verified. */
export function Pin({
  incident,
  x,
  y,
  selected,
  onClick,
}: {
  incident: Incident;
  x: number;
  y: number;
  selected: boolean;
  onClick: () => void;
}) {
  const color = typeColor[incident.type];
  const dashed = incident.status === "unverified";
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${incident.title} · ${incident.location}`}
      aria-label={incident.title}
      className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-transform hover:scale-110 ${
        selected ? "z-10 h-[52px] w-[52px] p-[5px]" : "h-9 w-9"
      }`}
      style={{
        left: x,
        top: y,
        background: selected ? color : `color-mix(in oklab, ${color} 22%, #0b0d12)`,
        boxShadow: selected ? `0 0 0 8px color-mix(in oklab, ${color} 22%, transparent), 0 0 32px ${color}` : "0 2px 8px rgba(0,0,0,.45)",
      }}
    >
      <span
        className="flex h-full w-full items-center justify-center rounded-full text-[11px] font-bold"
        style={{
          border: `2px ${dashed ? "dashed" : "solid"} ${selected ? "#fff" : color}`,
          color: selected ? "#fff" : color,
        }}
      >
        {typeInitials(incident)}
      </span>
    </button>
  );
}

/** Small ring icon used in list rows and the legend. */
export function RingBadge({ incident, size = 40 }: { incident: Incident; size?: number }) {
  const color = typeColor[incident.type];
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
      style={{
        width: size,
        height: size,
        color,
        background: `color-mix(in oklab, ${color} 12%, transparent)`,
        border: `2px ${incident.status === "unverified" ? "dashed" : "solid"} ${color}`,
      }}
    >
      {typeInitials(incident)}
    </span>
  );
}
