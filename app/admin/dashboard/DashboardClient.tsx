"use client";

import { useState } from "react";
import type { Incident } from "../_lib/incidents";
import { IncidentFeed } from "./IncidentFeed";
import { DashboardMap } from "./DashboardMap";

export function DashboardClient({ incidents }: { incidents: Incident[] }) {
  const [selectedId, setSelectedId] = useState<string | null>("INC-7F2B");

  function handleSelect(id: string) {
    setSelectedId((curr) => (id === "" ? null : curr === id ? null : id));
  }

  return (
    <div className="grid h-full grid-cols-[400px_1fr] overflow-hidden">
      <IncidentFeed incidents={incidents} selectedId={selectedId} onSelect={handleSelect} />
      <DashboardMap incidents={incidents} selectedId={selectedId} onSelect={handleSelect} />
    </div>
  );
}
