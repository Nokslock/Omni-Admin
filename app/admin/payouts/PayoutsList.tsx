"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  formatMoney,
  payoutStatusMeta,
  type GiftCut,
  type Payout,
  type PayoutOverview,
  type PayoutStatus,
} from "../_lib/payouts";
import { toast } from "../_components/toast";
import {
  EmptyState,
  GUTTER,
  PageHeader,
  Panel,
  PanelHeader,
  SearchField,
  Segmented,
  StatGrid,
  StatTile,
  StatusPill,
  TD,
  TH,
  TR,
  btn,
  btnSm,
} from "../_components/ui";
import { markPayoutPaid, rejectPayout, verifyPayoutAccount } from "./actions";

type Tab = PayoutStatus | "all";
const TABS: { id: Tab; label: string }[] = [
  { id: "pending", label: "Waiting" },
  { id: "paid", label: "Paid" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
];

const DAY_MS = 86_400_000;

/** Fixed locale and time zone, so the server and the browser print the same text. */
function fmtDate(iso: string, withYear = false): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: withYear ? "numeric" : undefined,
    timeZone: "UTC",
  });
}

function ago(iso: string, nowMs: number): string {
  const m = Math.max(0, Math.floor((nowMs - Date.parse(iso)) / 60_000));
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

type Ask = { kind: "pay" | "reject"; payout: Payout };

export function PayoutsList({
  overview: o,
  canAct,
}: {
  overview: PayoutOverview;
  /** Admins only. Moderators can look but not pay, reject or verify. */
  canAct: boolean;
}) {
  const nowMs = o.loadedAtMs;
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pending");
  const [query, setQuery] = useState("");
  const [ask, setAsk] = useState<Ask | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<PayoutStatus, number> = { pending: 0, paid: 0, rejected: 0 };
    for (const p of o.payouts) c[p.status]++;
    return c;
  }, [o.payouts]);

  const money = (n: number) => formatMoney(n, o.currency);
  const pendingAmount = o.payouts.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const monthStart = new Date(nowMs).toISOString().slice(0, 7);
  const paidThisMonth = o.payouts
    .filter((p) => p.status === "paid" && (p.decidedAt ?? "").startsWith(monthStart))
    .reduce((s, p) => s + p.amount, 0);
  const heldCoins = o.schedule.reduce((s, d) => s + d.coins, 0);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return o.payouts.filter((p) => {
      if (tab !== "all" && p.status !== tab) return false;
      if (!q) return true;
      return `${p.userName} ${p.userEmail ?? ""} ${p.accountName} ${p.accountNumber} ${p.bankName} ${p.reference ?? ""}`
        .toLowerCase()
        .includes(q);
    });
  }, [o.payouts, tab, query]);

  async function verify(p: Payout) {
    if (!p.userId) return;
    setBusyId(p.id);
    const res = await verifyPayoutAccount(p.userId);
    setBusyId(null);
    if ("error" in res) toast(res.error, "error");
    else {
      toast(`${p.accountName}'s bank account is verified.`, "success");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Payouts"
        description={
          <>
            When a Kasala Pro member cashes out the earnings (points) they got from gifts, the
            request lands here. Send the bank transfer yourself, then mark it paid with the
            transfer reference. Rejecting a request returns the points to their earnings. One
            point is worth{" "}
            <span className="font-semibold text-fg">{money(o.coinValue)}</span>; the smallest
            cash-out is {o.minWithdrawal} points.
          </>
        }
      >
        <StatGrid>
          <StatTile
            label="Waiting to be paid"
            value={counts.pending}
            sub={counts.pending > 0 ? money(pendingAmount) : undefined}
            color="var(--warn)"
            active={tab === "pending"}
            onClick={() => setTab("pending")}
          />
          <StatTile
            label="Paid this month"
            value={money(paidThisMonth)}
            color="var(--ok)"
            active={tab === "paid"}
            onClick={() => setTab("paid")}
          />
          <StatTile
            label={`On hold (${o.holdDays} days)`}
            value={heldCoins.toLocaleString()}
            sub={`points · up to ${money(heldCoins * o.coinValue)}`}
            color="var(--info)"
          />
          <StatTile
            label="Earned, not cashed out"
            value={o.earnedOutstanding.toLocaleString()}
            sub={`points · ${money(o.earnedOutstanding * o.coinValue)}`}
          />
        </StatGrid>
      </PageHeader>

      <div className={`flex flex-1 flex-col gap-5 pb-8 ${GUTTER}`}>
        {!canAct && (
          <p className="rounded-xl border border-border bg-bg-card px-4 py-3 text-sm text-fg-muted">
            You can see payouts, but only admins can verify accounts, mark requests paid or
            reject them.
          </p>
        )}

        <GiftCutPanel gifts={o.gifts} money={money} coinValue={o.coinValue} />

        <Panel className="flex min-h-[380px] flex-col overflow-hidden">
          <div className="flex flex-wrap items-center gap-2.5 border-b border-border px-4 py-3">
            <Segmented
              label="Status"
              value={tab}
              onChange={setTab}
              items={TABS.map((t) => ({
                id: t.id,
                label: t.label,
                count: t.id === "all" ? o.payouts.length : counts[t.id],
              }))}
            />
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="Search name, account, reference…"
              className="ml-auto w-full sm:w-72"
            />
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {shown.length === 0 ? (
              <EmptyState
                title={
                  o.payouts.length === 0
                    ? "No cash-out requests yet"
                    : tab === "pending" && !query
                      ? "Nothing waiting to be paid"
                      : "No requests match"
                }
                hint={
                  o.payouts.length === 0
                    ? "When someone cashes out their earnings in the app, the request shows up here."
                    : "Try another tab or search."
                }
              />
            ) : (
              <table className="w-full min-w-[960px] text-sm">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th className={TH}>Person</th>
                    <th className={`${TH} text-right`}>Amount</th>
                    <th className={TH}>Pay to</th>
                    <th className={TH}>Requested</th>
                    <th className={TH}>Status</th>
                    <th className={`${TH} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((p) => {
                    const meta = payoutStatusMeta[p.status];
                    const busy = busyId === p.id;
                    return (
                      <tr key={p.id} className={TR}>
                        <td className={TD}>
                          <div className="flex items-center gap-1.5 font-medium text-fg">
                            {p.userName}
                            {p.userSuspended && (
                              <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-danger">
                                Suspended
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 text-xs text-fg-muted">
                            {[p.userEmail, p.userPhone].filter(Boolean).join(" · ") || "No contact details"}
                          </div>
                        </td>
                        <td className={`${TD} whitespace-nowrap text-right`}>
                          <div className="text-base font-semibold tabular-nums text-fg">
                            {formatMoney(p.amount, p.currency)}
                          </div>
                          <div className="mt-0.5 text-xs tabular-nums text-fg-muted">
                            {p.coins.toLocaleString()} points × {formatMoney(p.coinValue, p.currency)}
                          </div>
                        </td>
                        <td className={TD}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-fg">{p.accountName}</span>
                            {p.accountVerified ? (
                              <span className="rounded-full bg-ok/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-ok">
                                Verified
                              </span>
                            ) : (
                              <span className="rounded-full bg-warn/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-warn">
                                Not verified
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 text-xs text-fg-muted">
                            {p.bankName} · <span className="select-all font-mono text-fg">{p.accountNumber}</span>
                          </div>
                        </td>
                        <td className={`${TD} whitespace-nowrap`}>
                          <div className="text-fg">{fmtDate(p.createdAt, true)}</div>
                          <div className="mt-0.5 text-xs text-fg-muted">{ago(p.createdAt, nowMs)}</div>
                        </td>
                        <td className={TD}>
                          <StatusPill color={meta.color} label={meta.label} />
                          {p.status === "paid" && p.reference && (
                            <div className="mt-1 max-w-[200px] truncate font-mono text-[11px] text-fg-muted" title={p.reference}>
                              Ref {p.reference}
                            </div>
                          )}
                          {p.status === "rejected" && p.reason && (
                            <div className="mt-1 max-w-[200px] truncate text-xs text-fg-muted" title={p.reason}>
                              {p.reason}
                            </div>
                          )}
                        </td>
                        <td className={`${TD} text-right`}>
                          {p.status !== "pending" ? (
                            <span className="text-xs text-fg-subtle">
                              {p.decidedAt ? fmtDate(p.decidedAt, true) : "—"}
                            </span>
                          ) : !canAct ? (
                            <span className="text-xs text-fg-subtle">Admins only</span>
                          ) : (
                            <div className="inline-flex items-center gap-2">
                              {p.accountVerified ? (
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => setAsk({ kind: "pay", payout: p })}
                                  className={btnSm.ok}
                                >
                                  Mark paid
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={busy || !p.userId}
                                  onClick={() => verify(p)}
                                  title="Confirm the account name matches the person before paying"
                                  className={btnSm.warn}
                                >
                                  {busy ? "Verifying…" : "Verify account"}
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => setAsk({ kind: "reject", payout: p })}
                                className={btnSm.danger}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Panel>

        <Schedule overview={o} nowMs={nowMs} />
      </div>

      {ask && (
        <DecisionDialog
          key={`${ask.kind}-${ask.payout.id}`}
          ask={ask}
          onClose={() => setAsk(null)}
          onDone={() => {
            setAsk(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

/** What comes out of the hold period over the next days. */
function Schedule({ overview: o, nowMs }: { overview: PayoutOverview; nowMs: number }) {
  const today = new Date(nowMs).toISOString().slice(0, 10);
  const peak = Math.max(1, ...o.schedule.map((d) => d.coins));

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        title="Coming out of hold"
        hint={`Earnings from gifts are held for ${o.holdDays} days before they can be cashed out`}
      />
      {o.schedule.length === 0 ? (
        <EmptyState
          title="Nothing on hold"
          hint={`No gifts were received in the last ${o.holdDays} days, so no new earnings are about to become cash-out-able.`}
        />
      ) : (
        <>
          <ul>
            {o.schedule.map((d) => {
              const days = Math.round((Date.parse(d.date) - Date.parse(today)) / DAY_MS);
              return (
                <li
                  key={d.date}
                  className="grid grid-cols-[120px_minmax(0,1fr)_auto] items-center gap-4 border-t border-border px-5 py-3 text-sm first:border-t-0"
                >
                  <div>
                    <div className="font-medium text-fg">{fmtDate(d.date)}</div>
                    <div className="text-xs text-fg-muted">
                      {days <= 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`}
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-bg-elev">
                    <div className="h-full rounded-full bg-info" style={{ width: `${(d.coins / peak) * 100}%` }} />
                  </div>
                  <div className="text-right">
                    <div className="font-semibold tabular-nums text-fg">
                      {formatMoney(d.coins * o.coinValue, o.currency)}
                    </div>
                    <div className="text-xs tabular-nums text-fg-muted">
                      {d.coins.toLocaleString()} points · {d.people} {d.people === 1 ? "person" : "people"}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="border-t border-border px-5 py-3 text-xs text-fg-muted">
            These are upper limits: earnings can only be cashed out with Kasala Pro, and
            nothing is paid until someone sends a request.
          </p>
        </>
      )}
    </Panel>
  );
}

function DecisionDialog({
  ask,
  onClose,
  onDone,
}: {
  ask: Ask;
  onClose: () => void;
  onDone: () => void;
}) {
  const { kind, payout: p } = ask;
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pay = kind === "pay";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  async function submit() {
    setBusy(true);
    setError(null);
    const res = pay ? await markPayoutPaid(p.id, text) : await rejectPayout(p.id, text);
    setBusy(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    toast(
      pay
        ? `Marked ${formatMoney(p.amount, p.currency)} to ${p.accountName} as paid.`
        : `Request rejected. ${p.coins.toLocaleString()} points went back to ${p.userName}.`,
      "success",
    );
    onDone();
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={pay ? "Mark payout as paid" : "Reject payout"}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div className="w-full max-w-md animate-swap-in rounded-2xl border border-border-strong bg-bg-card p-6 shadow-2xl shadow-black/50">
        <h2 className="text-lg font-semibold tracking-tight">
          {pay ? "Mark this payout as paid?" : "Reject this request?"}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
          {pay
            ? "Only do this after the bank transfer has gone through. This records the payment; it doesn't send any money, and it can't be undone here."
            : `${p.coins.toLocaleString()} points go straight back to ${p.userName}'s earnings. This can't be undone here.`}
        </p>

        <dl className="mt-4 space-y-2 rounded-xl border border-border bg-bg-elev/50 px-4 py-3.5 text-sm">
          <Line label="Amount" value={formatMoney(p.amount, p.currency)} strong />
          <Line label="Account name" value={p.accountName} />
          <Line label="Bank" value={p.bankName} />
          <Line label="Account number" value={p.accountNumber} mono />
        </dl>

        <label className="mt-4 block text-sm">
          <span className="font-medium text-fg">{pay ? "Bank transfer reference" : "Reason"}</span>
          <span className="ml-1.5 text-xs text-fg-muted">
            {pay ? "from your bank's receipt" : "the person is shown this"}
          </span>
          <input
            autoFocus
            value={text}
            maxLength={pay ? 120 : 300}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && text.trim().length >= 3 && !busy) submit();
            }}
            placeholder={pay ? "e.g. FT26318XK2Q9" : "e.g. Account name doesn't match"}
            className="mt-1.5 h-11 w-full rounded-xl border border-border bg-bg px-3.5 text-fg placeholder:text-fg-subtle focus:border-fg-muted focus:outline-none focus:ring-2 focus:ring-fg-muted/15"
          />
        </label>

        {error && (
          <p role="alert" className="mt-3 rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={busy} className={btn.ghost}>
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy || text.trim().length < 3}
            className={
              pay
                ? `${btn.primary} px-5`
                : "inline-flex h-9 items-center justify-center rounded-lg bg-danger px-5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            }
          >
            {busy ? "Saving…" : pay ? "Mark as paid" : "Reject request"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Line({ label, value, mono, strong }: { label: string; value: string; mono?: boolean; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-fg-muted">{label}</dt>
      <dd
        className={`min-w-0 truncate text-right text-fg ${mono ? "select-all font-mono" : ""} ${
          strong ? "text-base font-semibold tabular-nums" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

/**
 * Gifts and Kasala's cut. The sender pays the gift's price in coins; the
 * reporter gets their share (60%) as earnings, in points, and Kasala keeps the
 * rest.
 */
function GiftCutPanel({
  gifts,
  money,
  coinValue,
}: {
  gifts: GiftCut;
  money: (n: number) => string;
  coinValue: number;
}) {
  const [range, setRange] = useState<"last30" | "allTime">("last30");
  const w = gifts[range];
  const keptShare = 100 - gifts.sharePercent;
  const since = gifts.cutSince
    ? new Date(gifts.cutSince).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        title="Gifts and Kasala's cut"
        hint={
          <>
            Reporters get {gifts.sharePercent}% of every gift, Kasala keeps {keptShare}%.
            {since ? ` Gifts before ${since} paid reporters in full.` : ""}
          </>
        }
        right={
          <Segmented
            label="Period"
            value={range}
            onChange={setRange}
            items={[
              { id: "last30", label: "Last 30 days" },
              { id: "allTime", label: "All time" },
            ]}
          />
        }
      />
      <div className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
        <CutFigure
          label="Gifts sent"
          value={w.sent.toLocaleString()}
          sub={`coins · ${w.gifts.toLocaleString()} ${w.gifts === 1 ? "gift" : "gifts"}`}
        />
        <CutFigure
          label={`To reporters (${gifts.sharePercent}%)`}
          value={w.toReporters.toLocaleString()}
          sub={`points · up to ${money(w.toReporters * coinValue)} if cashed out`}
          color="var(--info)"
        />
        <CutFigure
          label={`Kasala kept (${keptShare}%)`}
          value={w.kept.toLocaleString()}
          sub={`coins · ${money(w.kept * coinValue)} at today's coin value`}
          color="var(--ok)"
          strong
        />
        <CutFigure
          label="Share of gifts kept"
          value={w.sent > 0 ? `${Math.round((w.kept / w.sent) * 100)}%` : "—"}
          sub={
            w.sent > 0
              ? "rounding down small gifts nudges this above the set share"
              : "no gifts in this period"
          }
        />
      </div>
      <CutBar sent={w.sent} kept={w.kept} />
      {w.byGift.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-border px-5 py-3.5">
          {w.byGift.map((g) => (
            <span
              key={g.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-elev px-3 py-1 text-sm"
            >
              <span aria-hidden>{g.emoji}</span>
              <span className="text-fg">{g.name}</span>
              <span className="tabular-nums text-fg-muted">×{g.count.toLocaleString()}</span>
            </span>
          ))}
        </div>
      )}
    </Panel>
  );
}

function CutFigure({
  label,
  value,
  sub,
  color,
  strong,
}: {
  label: string;
  value: string;
  sub: string;
  color?: string;
  strong?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 bg-bg-card px-5 py-4">
      <span className="flex items-center gap-2 text-[13px] text-fg-muted">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: color ?? "var(--fg-subtle)" }}
          aria-hidden
        />
        {label}
      </span>
      <span className={`text-2xl tabular-nums ${strong ? "font-bold" : "font-semibold"}`}>{value}</span>
      <span className="text-xs text-fg-muted">{sub}</span>
    </div>
  );
}

/** One bar split into the reporters' part and Kasala's part. */
function CutBar({ sent, kept }: { sent: number; kept: number }) {
  if (sent <= 0) return null;
  const keptPct = (kept / sent) * 100;
  return (
    <div className="border-t border-border px-5 py-3.5">
      <div
        className="flex h-2.5 overflow-hidden rounded-full bg-bg-elev"
        role="img"
        aria-label={`${Math.round(100 - keptPct)}% to reporters, ${Math.round(keptPct)}% kept by Kasala`}
      >
        <div style={{ width: `${100 - keptPct}%`, background: "var(--info)" }} />
        <div style={{ width: `${keptPct}%`, background: "var(--ok)" }} />
      </div>
    </div>
  );
}

