import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ProBadge } from "../_components/ProBadge";
import { relTime } from "../_lib/moderation";
import { getReferralOverview } from "../_lib/referrals.data";
import { EmptyState, GUTTER, PageHeader, Panel, PanelHeader, StatGrid, StatTile, TD, TH, TR, btnSm } from "../_components/ui";

export const metadata: Metadata = {
  title: "Referrals — Kasala Admin",
  description: "Who is inviting people to Kasala, and how those people are doing.",
};

const pct = (n: number) => `${Math.round(n * 100)}%`;

/** Weeks start Monday in UTC, so label them in UTC too or they slip a day. */
const weekLabel = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", timeZone: "UTC" });

export default async function ReferralsPage() {
  await connection();
  const o = await getReferralOverview();
  const peak = Math.max(...o.weekly.map((w) => w.count));
  const weeklyTotal = o.weekly.reduce((s, w) => s + w.count, 0);
  // A whole-number scale with 2–4 steps, so small counts still get a readable axis.
  const step = Math.max(1, Math.ceil(peak / 4));
  const scaleMax = Math.max(step * Math.ceil(Math.max(peak, 1) / step), 2);
  const ticks: number[] = [];
  for (let t = scaleMax; t >= 0; t -= step) ticks.push(t);
  if (ticks[ticks.length - 1] !== 0) ticks.push(0);

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-bg text-fg">
      <PageHeader
        title="Referrals"
        description="Everyone gets a referral code in the app. When someone signs up with it, they count here. “Active” means they have sent at least one report."
      >
        <StatGrid>
          <StatTile label="Joined through a referral" value={o.totalReferred.toLocaleString()}
            sub={`of ${o.totalUsers} accounts`} color="var(--danger)" />
          <StatTile label="Last 7 days" value={o.last7.toLocaleString()} color="var(--info)" />
          <StatTile label="Last 30 days" value={o.last30.toLocaleString()}
            sub={`${pct(o.share30)} of ${o.signups30} sign-ups`} color="var(--info)" />
          <StatTile label="Referred people who are active"
            value={pct(o.activeRate)} sub={`${pct(o.proRate)} have Pro`} color="var(--ok)" />
        </StatGrid>
      </PageHeader>

      <main className={`flex-1 space-y-5 pb-8 ${GUTTER}`}>
        <Panel className="p-5">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-sm font-semibold">Referred sign-ups per week</h2>
            <span className="text-xs text-fg-muted">
              {weeklyTotal} in the last 12 weeks
            </span>
          </div>

          <div className="mt-5 flex gap-3">
            {/* Y axis */}
            <div className="flex h-40 flex-col justify-between pb-px text-right text-[11px] tabular-nums text-fg-subtle">
              {ticks.map((t) => (
                <span key={t} className="-my-[7px] leading-[14px]">{t}</span>
              ))}
            </div>

            <div className="min-w-0 flex-1">
              {/* Plot */}
              <div className="relative h-40">
                {ticks.map((t) => (
                  <div
                    key={t}
                    className={`absolute inset-x-0 border-t ${t === 0 ? "border-border-strong" : "border-dashed border-border"}`}
                    style={{ bottom: `${(t / scaleMax) * 100}%` }}
                  />
                ))}
                <div className="absolute inset-0 flex items-end gap-2 sm:gap-3">
                  {o.weekly.map((w, i) => {
                    const current = i === o.weekly.length - 1;
                    return (
                      <div
                        key={w.weekStart}
                        className="group relative flex h-full flex-1 items-end justify-center"
                        title={`${w.count} sign-up${w.count === 1 ? "" : "s"} in the week of ${weekLabel(w.weekStart)}`}
                      >
                        {w.count > 0 && (
                          <div
                            className={`relative w-full max-w-12 rounded-t-md transition-colors group-hover:bg-danger ${
                              current ? "bg-danger" : "bg-danger/70"
                            }`}
                            style={{ height: `${(w.count / scaleMax) * 100}%` }}
                          >
                            <span className="absolute inset-x-0 -top-5 text-center text-[11px] font-semibold tabular-nums text-fg">
                              {w.count}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X axis */}
              <div className="mt-2 flex gap-2 sm:gap-3">
                {o.weekly.map((w, i) => (
                  <span
                    key={w.weekStart}
                    className={`flex-1 truncate text-center text-[11px] ${
                      i === o.weekly.length - 1 ? "font-semibold text-fg" : "text-fg-subtle"
                    } ${i % 2 === 1 && i !== o.weekly.length - 1 ? "max-sm:invisible" : ""}`}
                  >
                    {i === o.weekly.length - 1 ? "This week" : weekLabel(w.weekStart)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <PanelHeader title="Top referrers" hint={o.referrers.length > 0 ? `${o.referrers.length} people` : undefined} />
          {o.referrers.length === 0 ? (
            <EmptyState title="No referrals yet" hint="Nobody has signed up with a referral code yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr>
                    <th className={TH}>#</th>
                    <th className={TH}>Referrer</th>
                    <th className={TH}>Code</th>
                    <th className={`${TH} text-right`}>Referred</th>
                    <th className={`${TH} text-right`}>Last 30 days</th>
                    <th className={`${TH} text-right`}>Active</th>
                    <th className={`${TH} text-right`}>Pro</th>
                    <th className={TH}>Latest</th>
                    <th className={TH} />
                  </tr>
                </thead>
                <tbody>
                  {o.referrers.map((r, i) => (
                    <tr key={r.id} className={TR}>
                      <td className={TD}>
                        <span
                          className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums ${
                            i < 3 ? "bg-warn/15 text-warn" : "bg-bg-elev text-fg-muted"
                          }`}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td className={TD}>
                        <div className="flex items-center gap-1.5 font-medium">
                          {r.name}
                          {r.pro && <ProBadge />}
                        </div>
                        {r.email && <div className="text-xs text-fg-muted">{r.email}</div>}
                      </td>
                      <td className={`${TD} font-mono text-xs`}>{r.code ?? "—"}</td>
                      <td className={`${TD} text-right font-semibold tabular-nums`}>{r.total}</td>
                      <td className={`${TD} text-right tabular-nums`}>{r.last30}</td>
                      <td className={`${TD} text-right tabular-nums`}>{r.active}</td>
                      <td className={`${TD} text-right tabular-nums`}>{r.proReferred}</td>
                      <td className={`${TD} text-xs text-fg-muted`}>{relTime(r.lastAt)}</td>
                      <td className={`${TD} text-right`}>
                        <Link
                          href={`/admin/gifts?user=${encodeURIComponent(r.id)}`}
                          className={btnSm.ghost}
                        >
                          Send a gift
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel className="overflow-hidden">
          <PanelHeader title="Latest referred sign-ups" />
          {o.recent.length === 0 ? (
            <EmptyState title="None yet" hint="New referred sign-ups will be listed here." />
          ) : (
            <ul>
              {o.recent.map((u) => (
                <li
                  key={u.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3.5 text-sm transition-colors first:border-t-0 hover:bg-bg-elev/50"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-medium">
                      {u.name}
                      {u.pro && <ProBadge />}
                      {u.suspended && (
                        <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-danger">
                          Suspended
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-fg-muted">
                      invited by {u.referrerName} · {relTime(u.joinedAt)}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      u.reports > 0 ? "bg-ok/10 text-ok" : "bg-bg-elev text-fg-muted"
                    }`}
                  >
                    {u.reports > 0
                      ? `${u.reports} ${u.reports === 1 ? "report" : "reports"}`
                      : "No reports yet"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </main>
    </div>
  );
}
