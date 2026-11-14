import type { Metadata } from "next";
import { connection } from "next/server";
import { getCurrentAdmin } from "../_lib/admin";
import {
  getDeletionRequests,
  getScheduledDeletions,
} from "../_lib/deletion-requests.data";
import { DeletionTable } from "./DeletionTable";

export const metadata: Metadata = {
  title: "Deletion Requests — Kasala Admin",
  description: "Review and process account deletion requests.",
};

export default async function DeletionRequestsPage() {
  await connection();
  const requests = await getDeletionRequests();
  const scheduled = await getScheduledDeletions(requests);
  const admin = await getCurrentAdmin();

  return (
    <div className="flex h-full flex-col bg-bg text-fg">
      <main className="flex min-h-0 flex-1 flex-col">
        <DeletionTable
          requests={requests}
          scheduled={scheduled}
          canErase={admin?.role === "admin"}
        />
      </main>
    </div>
  );
}
