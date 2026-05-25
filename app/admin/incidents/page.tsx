import type { Metadata } from "next";
import { AdminNav } from "../_components/AdminNav";
import { IncidentsTable } from "./IncidentsTable";

export const metadata: Metadata = {
  title: "Incidents — Omni Admin",
  description: "Browse, filter, and manage every incident report.",
};

export default function IncidentsPage() {
  return (
    <div className="flex h-dvh flex-col bg-bg text-fg">
      <AdminNav />
      <main className="flex min-h-0 flex-1 flex-col">
        <IncidentsTable />
      </main>
    </div>
  );
}
