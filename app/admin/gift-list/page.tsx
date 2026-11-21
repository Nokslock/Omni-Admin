import type { Metadata } from "next";
import { connection } from "next/server";
import { getCurrentAdmin } from "../_lib/admin";
import { getGiftTypes } from "../_lib/gift-types.data";
import { PageHeader, StatGrid, StatTile } from "../_components/ui";
import { GiftListEditor } from "./GiftListEditor";

export const metadata: Metadata = {
  title: "Gift list — Kasala Admin",
  description: "The gifts people buy with Kasala Coins and send to reporters.",
};

export default async function GiftListPage() {
  await connection();
  const [admin, { gifts, sharePercent }] = await Promise.all([getCurrentAdmin(), getGiftTypes()]);
  const active = gifts.filter((g) => g.active);
  const sent30 = gifts.reduce((s, g) => s + g.sentLast30, 0);
  const top = [...gifts].sort((a, b) => b.sentLast30 - a.sentLast30)[0];

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-bg text-fg">
      <PageHeader
        title="Gift list"
        description={`The gifts people buy with Kasala Coins and send to the reporters of verified incidents. The reporter's earnings go up by ${sharePercent}% of the price. Changes reach the app the next time someone opens a gift sheet; no app update is needed.`}
      >
        <StatGrid cols={3}>
          <StatTile label="In the app" value={`${active.length} of ${gifts.length}`} color="var(--ok)" />
          <StatTile label="Gifts sent, last 30 days" value={sent30.toLocaleString()} color="var(--info)" />
          <StatTile
            label="Most sent, last 30 days"
            value={top && top.sentLast30 > 0 ? `${top.emoji} ${top.names.en ?? top.id}` : "—"}
            color="var(--warn)"
          />
        </StatGrid>
      </PageHeader>

      <GiftListEditor gifts={gifts} sharePercent={sharePercent} canEdit={admin?.role === "admin"} />
    </div>
  );
}
