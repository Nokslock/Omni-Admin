import type { Metadata } from "next";
import { connection } from "next/server";
import { getBroadcasts } from "../_lib/broadcasts.data";
import { BroadcastsList } from "./BroadcastsList";

export const metadata: Metadata = {
  title: "Broadcasts — Kasala Admin",
  description: "Manage announcements sent to the mobile app.",
};

export default async function BroadcastsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : undefined;
  const openNew = sp.new === "1";
  const broadcasts = await getBroadcasts();

  return (
    <div className="flex h-full flex-col bg-bg text-fg">
      <main className="flex min-h-0 flex-1 flex-col">
        <BroadcastsList
          key={`${status ?? "all"}-${openNew}`}
          broadcasts={broadcasts}
          initialStatus={status}
          openNew={openNew}
        />
      </main>
    </div>
  );
}
