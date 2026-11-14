import type { Metadata } from "next";
import { connection } from "next/server";
import { getIncidents } from "../_lib/incidents.data";
import { IncidentsTable } from "./IncidentsTable";

export const metadata: Metadata = {
  title: "Incidents — Kasala Admin",
  description: "Browse, filter, and manage every incident report.",
};

export default async function IncidentsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : undefined;
  const incidents = await getIncidents();

  return (
    <div className="flex h-full flex-col bg-bg text-fg">
      <main className="flex min-h-0 flex-1 flex-col">
        <IncidentsTable key={status ?? "all"} incidents={incidents} initialStatus={status} />
      </main>
    </div>
  );
}
