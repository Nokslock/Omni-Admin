"use client";

import { useMemo, useState } from "react";
import type { Incident } from "../_lib/incidents";
import { WORLDWIDE } from "@/app/lib/countries";
import { IncidentFeed } from "./IncidentFeed";
import { DashboardMap, type GeoBounds } from "./DashboardMap";

/** Point-in-bounds test that tolerates antimeridian-crossing viewports. */
function inBounds(lat: number, lng: number, b: GeoBounds): boolean {
  const latOk = lat <= b.north && lat >= b.south;
  const lngOk =
    b.west <= b.east
      ? lng >= b.west && lng <= b.east
      : lng >= b.west || lng <= b.east;
  return latOk && lngOk;
}

export function DashboardClient({ incidents }: { incidents: Incident[] }) {
  const [selectedId, setSelectedId] = useState<string | null>("INC-7F2B");
  const [country, setCountry] = useState<string>(WORLDWIDE);
  const [bounds, setBounds] = useState<GeoBounds | null>(null);

  function handleSelect(id: string) {
    setSelectedId((curr) => (id === "" ? null : curr === id ? null : id));
  }

  function handleCountry(code: string) {
    setCountry(code);
    // Worldwide clears the lock immediately; a real country's bounds arrive
    // from the map once it has geocoded the viewport.
    if (code === WORLDWIDE) setBounds(null);
  }

  // While a country is locked, only show incidents that fall inside its
  // viewport. Until bounds resolve (or worldwide), show everything.
  const visibleIncidents = useMemo(() => {
    if (country === WORLDWIDE || !bounds) return incidents;
    return incidents.filter((i) => inBounds(i.coords.lat, i.coords.lng, bounds));
  }, [incidents, country, bounds]);

  return (
    <div className="grid h-full grid-cols-[400px_1fr] overflow-hidden">
      <IncidentFeed
        incidents={visibleIncidents}
        selectedId={selectedId}
        onSelect={handleSelect}
        country={country}
        onCountryChange={handleCountry}
      />
      <DashboardMap
        incidents={visibleIncidents}
        selectedId={selectedId}
        onSelect={handleSelect}
        country={country}
        onBoundsResolved={setBounds}
        onClearCountry={() => handleCountry(WORLDWIDE)}
      />
    </div>
  );
}
