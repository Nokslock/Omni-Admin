import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { getCurrentAdmin } from "../_lib/admin";
import { getGiftTotals, getGrantHistory, getRecipient } from "../_lib/gifts.data";
import { relTime } from "../_lib/moderation";
import { EmptyState, GUTTER, PageHeader, Panel, PanelHeader, StatGrid, StatTile } from "../_components/ui";
import { GiftForm } from "./GiftForm";

export const metadata: Metadata = {
  title: "Gifts — Kasala Admin",
  description: "Give Kasala Coins or Kasala Pro to someone.",
};

type Props = { searchParams: Promise<{ user?: string }> };

export default async function GiftsPage({ searchParams }: Props) {
  await connection();
  const { user } = await searchParams;
  const [admin, recipient, history, totals] = await Promise.all([
    getCurrentAdmin(),
    user ? getRecipient(user) : Promise.resolve(null),
    getGrantHistory(),
    getGiftTotals(),
  ]);

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-bg text-fg">
      <PageHeader
        title="Gifts"
        description="Give Kasala Coins or Kasala Pro, for example to thank a top referrer or a reliable reporter. They get a notification saying it’s from Kasala. Every gift is recorded below."
      >
        <StatGrid cols={3}>
          <StatTile label="Coins given this month" value={totals.coinsThisMonth.toLocaleString()} color="var(--warn)" />
          <StatTile label="Pro gifts this month" value={totals.proGiftsThisMonth.toLocaleString()} color="var(--info)" />
          <StatTile label="On gifted Pro now" value={totals.giftedProActive.toLocaleString()} color="var(--ok)" />
        </StatGrid>
      </PageHeader>

      <main className={`grid flex-1 items-start gap-5 pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] ${GUTTER}`}>
        <GiftForm
          key={recipient?.id ?? "none"}
          recipient={recipient}
          isAdmin={admin?.role === "admin"}
        />

        <Panel className="overflow-hidden">
          <PanelHeader title="Gift history" hint={history.length > 0 ? `${history.length} most recent` : undefined} />
          {history.length === 0 ? (
            <EmptyState title="No gifts yet" hint="Gifts you send will be listed here." />
          ) : (
            <ul>
              {history.map((g) => (
                <li key={g.id} className="border-t border-border px-5 py-3.5 text-sm transition-colors first:border-t-0 hover:bg-bg-elev/50">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span>
                      {g.userId ? (
                        <Link
                          href={`/admin/gifts?user=${encodeURIComponent(g.userId)}`}
                          className="font-medium hover:underline"
                        >
                          {g.userName}
                        </Link>
                      ) : (
                        <span className="font-medium">{g.userName}</span>
                      )}{" "}
                      <span className="text-fg-muted">
                        {g.kind === "coins"
                          ? `got ${g.coins} coins`
                          : g.kind === "pro"
                            ? `got ${g.proDays} days of Pro`
                            : "had gifted Pro ended"}
                      </span>
                    </span>
                    <span className="text-xs text-fg-subtle">
                      {relTime(g.createdAt)} · by {g.byName}
                    </span>
                  </div>
                  {g.note && <p className="mt-1 text-xs text-fg-muted">&ldquo;{g.note}&rdquo;</p>}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </main>
    </div>
  );
}
