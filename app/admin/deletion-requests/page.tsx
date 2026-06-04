import type { Metadata } from "next";
import { connection } from "next/server";
import { AdminNav } from "../_components/AdminNav";
import { getDeletionRequests } from "../_lib/deletion-requests.data";
import { DeletionTable } from "./DeletionTable";

export const metadata: Metadata = {
  title: "Deletion Requests — Kasala Admin",
  description: "Review and process account deletion requests.",
};

export default async function DeletionRequestsPage() {
  await connection();
  const requests = await getDeletionRequests();

  return (
    <div className="flex h-dvh flex-col bg-bg text-fg">
      <AdminNav />
      <main className="flex min-h-0 flex-1 flex-col">
        <DeletionTable requests={requests} />
      </main>
    </div>
  );
}
