import { useSyncExternalStore } from "react";
import { statusMeta, type Incident, type IncidentStatus } from "../_lib/incidents";

/** Status names and colours, shared with the rest of the admin. */
export const STATUS_UI: Record<IncidentStatus, { label: string; color: string }> = statusMeta;

const noop = () => () => {};
/** True only in the browser, so clock- and locale-based text never differs between server and client HTML. */
export function useIsClient(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}

/** Follows a CSS media query. False on the server. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** A slice of time picked on the time bar. */
export type TimeFocus = { from: number; to: number };

export const STATUS_ORDER: IncidentStatus[] = ["unverified", "active", "resolved", "false_alarm"];

export type TimeRange = "1h" | "6h" | "24h" | "7d";

export const RANGE_MS: Record<TimeRange, number> = {
  "1h": 3_600_000,
  "6h": 6 * 3_600_000,
  "24h": 24 * 3_600_000,
  "7d": 7 * 24 * 3_600_000,
};

/** Two-letter badge for a pin or list row, e.g. "Bandit attack" → "BA". */
export function typeInitials(inc: Pick<Incident, "typeLabel">): string {
  const words = inc.typeLabel.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return inc.typeLabel.slice(0, 2).toUpperCase();
}

/** "Dwayne Adeyemi" → "Dwayne A." */
export function shortName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] ?? "Anonymous";
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export function reportedMs(inc: Pick<Incident, "reportedAtIso">): number {
  return new Date(inc.reportedAtIso).getTime();
}

/** Compact age: "45m", "11h", "1d". */
export function shortAge(ms: number): string {
  const min = Math.max(0, Math.floor(ms / 60_000));
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.max(10, Math.round((km * 1000) / 10) * 10)} m`;
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

/** Geographic bounding box. */
export type GeoBounds = { north: number; south: number; east: number; west: number };

/** Point-in-bounds test that tolerates antimeridian-crossing viewports. */
export function inBounds(lat: number, lng: number, b: GeoBounds): boolean {
  const latOk = lat <= b.north && lat >= b.south;
  const lngOk = b.west <= b.east ? lng >= b.west && lng <= b.east : lng >= b.west || lng <= b.east;
  return latOk && lngOk;
}
