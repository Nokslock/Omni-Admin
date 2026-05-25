import type { Metadata } from "next";
import { AdminNav } from "./AdminNav";
import { StatsRow } from "./StatsRow";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard — Omni Admin",
  description: "Live operations dashboard for the Omni admin team.",
};

export default function DashboardPage() {
  return (
    <div className="flex h-dvh flex-col bg-bg text-fg">
      <AdminNav />
      <StatsRow />
      <div className="min-h-0 flex-1">
        <DashboardClient />
      </div>
    </div>
  );
}
