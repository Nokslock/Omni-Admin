import type { Metadata } from "next";
import { connection } from "next/server";
import { AdminNav } from "../_components/AdminNav";
import { getIncidents } from "../_lib/incidents.data";
import { IncidentsTable } from "./IncidentsTable";

export const metadata: Metadata = {
  title: "Incidents — Omni Admin",
  description: "Browse, filter, and manage every incident report.",
};

export default async function IncidentsPage() {
  await connection();
  const incidents = await getIncidents();

  return (
    <div className="flex h-dvh flex-col bg-bg text-fg">
      <AdminNav />
      <main className="flex min-h-0 flex-1 flex-col">
        <IncidentsTable incidents={incidents} />
      </main>
    </div>
  );
}
