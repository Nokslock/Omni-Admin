import type { Metadata } from "next";
import { connection } from "next/server";
import { AdminNav } from "../_components/AdminNav";
import { getBroadcasts } from "../_lib/broadcasts.data";
import { BroadcastsList } from "./BroadcastsList";

export const metadata: Metadata = {
  title: "Broadcasts — Kasala Admin",
  description: "Manage announcements sent to the mobile app.",
};

export default async function BroadcastsPage() {
  await connection();
  const broadcasts = await getBroadcasts();

  return (
    <div className="flex h-dvh flex-col bg-bg text-fg">
      <AdminNav />
      <main className="flex min-h-0 flex-1 flex-col">
        <BroadcastsList broadcasts={broadcasts} />
      </main>
    </div>
  );
}
