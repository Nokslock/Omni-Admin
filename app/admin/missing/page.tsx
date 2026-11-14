import type { Metadata } from "next";
import { connection } from "next/server";
import { getMissingRequests } from "../_lib/missing.data";
import { MissingList } from "./MissingList";

export const metadata: Metadata = {
  title: "Missing persons — Kasala Admin",
  description: "Review missing-person broadcast requests submitted from the mobile app.",
};

export default async function MissingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : undefined;
  const requests = await getMissingRequests();

  return (
    <div className="flex h-full flex-col bg-bg text-fg">
      <main className="flex min-h-0 flex-1 flex-col">
        <MissingList key={status ?? "pending"} requests={requests} initialTab={status} />
      </main>
    </div>
  );
}
