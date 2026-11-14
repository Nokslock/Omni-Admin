import type { Metadata } from "next";
import { connection } from "next/server";
import { getAds } from "../_lib/ads.data";
import { AdsList } from "./AdsList";

export const metadata: Metadata = {
  title: "Ads — Kasala Admin",
  description: "Review sponsored ad requests submitted from the Kasala mobile app.",
};

export default async function AdsPage() {
  await connection();
  const { ads, tableMissing } = await getAds();

  return (
    <div className="flex h-full flex-col bg-bg text-fg">
      <main className="flex min-h-0 flex-1 flex-col">
        <AdsList ads={ads} tableMissing={tableMissing} />
      </main>
    </div>
  );
}
