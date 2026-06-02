import type { Metadata } from "next";
import { connection } from "next/server";
import { AdminNav } from "../_components/AdminNav";
import { getIncidents } from "../_lib/incidents.data";
import { StatsRow } from "./StatsRow";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard — Kasala Admin",
  description: "Live operations dashboard for the Kasala admin team.",
};

export default async function DashboardPage() {
  await connection();
  const incidents = await getIncidents();

  return (
    <div className="flex h-dvh flex-col bg-bg text-fg">
      <AdminNav />
      <StatsRow incidents={incidents} />
      <div className="min-h-0 flex-1">
        <DashboardClient incidents={incidents} />
      </div>
    </div>
  );
}
