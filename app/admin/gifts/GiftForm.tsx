"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "../_components/ConfirmDialog";
import { ProBadge } from "../_components/ProBadge";
import {
  COIN_PRESETS,
  MAX_COINS,
  MAX_PRO_DAYS,
  PRO_PRESETS,
  type Recipient,
  type UserHit,
} from "../_lib/gifts";
import { searchUsers, sendGift } from "./actions";

type Kind = "coins" | "pro";

export function GiftForm({
  recipient,
  isAdmin,
}: {
  recipient: Recipient | null;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [kind, setKind] = useState<Kind>("coins");
  const [coins, setCoins] = useState("25");
  const [days, setDays] = useState("30");
  const [note, setNote] = useState("");
  const [ask, setAsk] = useState<"send" | "end" | null>(null);
  const [busy, startBusy] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const amount = Number(kind === "coins" ? coins : days);
  const max = kind === "coins" ? MAX_COINS : MAX_PRO_DAYS;
  const valid = Number.isInteger(amount) && amount >= 1 && amount <= max;
  const storePro = recipient?.pro && recipient.pro.store !== "kasala";
  const blocked =
    !recipient || recipient.suspended || recipient.deleting || (kind === "pro" && storePro);

  function confirm() {
    if (!recipient) return;
    const which = ask;
    startBusy(async () => {
      const res =
        which === "end"
          ? await sendGift({ kind: "end_pro", userId: recipient.id, note })
          : kind === "coins"
            ? await sendGift({ kind: "coins", userId: recipient.id, coins: amount, note })
            : await sendGift({ kind: "pro", userId: recipient.id, days: amount, note });
      setAsk(null);
      if ("error" in res) {
        setResult({ ok: false, text: res.error });
      } else {
        setResult({ ok: true, text: res.message });
        setNote("");
        router.refresh();
      }
    });
  }

  const what =
    kind === "coins"
      ? `${amount} Kasala ${amount === 1 ? "Coin" : "Coins"}`
      : `${amount} ${amount === 1 ? "day" : "days"} of Kasala Pro`;

  return (
    <div className="space-y-4">
      <UserPicker />

      {recipient ? (
        <RecipientCard r={recipient} />
      ) : (
        <p className="rounded-2xl border border-dashed border-border-strong px-4 py-12 text-center text-sm text-fg-muted">
          Search for someone to send them a gift.
        </p>
      )}

      {recipient && (
        <div className="rounded-2xl border border-border bg-bg-card p-5">
          <div className="inline-flex gap-0.5 rounded-xl border border-border bg-bg p-1">
            {(["coins", "pro"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setKind(k);
                  setResult(null);
                }}
                className={`h-9 rounded-lg px-3.5 text-sm font-medium transition-colors ${
                  kind === k ? "bg-bg-elev text-fg shadow-sm shadow-black/10" : "text-fg-muted hover:text-fg"
                }`}
              >
                {k === "coins" ? "Kasala Coins" : "Kasala Pro"}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {kind === "coins"
              ? COIN_PRESETS.map((n) => (
                  <Preset key={n} on={coins === String(n)} onClick={() => setCoins(String(n))}>
                    {n} coins
                  </Preset>
                ))
              : PRO_PRESETS.map((p) => (
                  <Preset
                    key={p.days}
                    on={days === String(p.days)}
                    onClick={() => setDays(String(p.days))}
                  >
                    {p.label}
                  </Preset>
                ))}
            <label className="ml-1 flex items-center gap-2 text-sm text-fg-muted">
              or
              <input
                type="number"
                min={1}
                max={max}
                value={kind === "coins" ? coins : days}
                onChange={(e) => (kind === "coins" ? setCoins : setDays)(e.target.value)}
                className="h-9 w-24 rounded-lg border border-border bg-bg px-2.5 text-fg tabular-nums focus:border-fg-muted focus:outline-none"
              />
              {kind === "coins" ? "coins" : "days"}
            </label>
          </div>

          <p className="mt-3 text-xs text-fg-muted">
            {kind === "coins"
              ? "Gifted coins can be spent on gifts in the app but can't be withdrawn as cash."
              : recipient.pro?.store === "kasala"
                ? "Days are added on to the gifted Pro they already have."
                : "Pro starts now and ends by itself. It doesn't renew or charge them."}
          </p>

          <label className="mt-4 block text-sm">
            <span className="text-fg-muted">Reason (staff only, optional)</span>
            <input
              value={note}
              maxLength={300}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Top referrer in October"
              className="mt-1.5 h-10 w-full rounded-xl border border-border bg-bg px-3 text-fg placeholder:text-fg-subtle focus:border-fg-muted focus:outline-none focus:ring-2 focus:ring-fg-muted/15"
            />
          </label>

          {kind === "pro" && storePro && (
            <p className="mt-3 rounded-xl bg-warn/10 px-3.5 py-2.5 text-sm text-warn">
              They already pay for Pro through the{" "}
              {recipient.pro?.store === "play_store" ? "Play Store" : "App Store"}, so days
              can&rsquo;t be added here.
            </p>
          )}
          {(recipient.suspended || recipient.deleting) && (
            <p className="mt-3 rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
              This account is {recipient.suspended ? "suspended" : "being deleted"}, so it
              can&rsquo;t receive gifts.
            </p>
          )}
          {!isAdmin && (
            <p className="mt-3 text-sm text-fg-muted">Only admins can send gifts.</p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!isAdmin || !valid || !!blocked || busy}
              onClick={() => {
                setResult(null);
                setAsk("send");
              }}
              className="h-10 rounded-xl bg-fg px-5 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Send {valid ? what : "gift"}
            </button>
            {isAdmin && recipient.pro?.store === "kasala" && (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setResult(null);
                  setAsk("end");
                }}
                className="h-10 rounded-xl border border-danger/35 px-4 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
              >
                End gifted Pro now
              </button>
            )}
          </div>

          {result && (
            <p
              role="status"
              className={`mt-4 rounded-xl px-3.5 py-2.5 text-sm ${
                result.ok ? "bg-ok/10 text-ok" : "bg-danger/10 text-danger"
              }`}
            >
              {result.text}
            </p>
          )}
        </div>
      )}

      <ConfirmDialog
        open={ask !== null}
        busy={busy}
        destructive={ask === "end"}
        title={ask === "end" ? "End gifted Pro?" : `Send ${what}?`}
        message={
          ask === "end"
            ? `${recipient?.name} loses Kasala Pro straight away.`
            : `${recipient?.name} gets ${what} and a notification saying it's from Kasala.\nThis can't be taken back from here.`
        }
        confirmLabel={ask === "end" ? "End Pro" : "Send gift"}
        onConfirm={confirm}
        onCancel={() => setAsk(null)}
      />
    </div>
  );
}

function Preset({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 rounded-full border px-3.5 text-sm font-medium ${
        on ? "border-fg bg-fg text-bg" : "border-border text-fg hover:bg-bg-elev"
      }`}
    >
      {children}
    </button>
  );
}

function UserPicker() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<UserHit[]>([]);

  useEffect(() => {
    if (q.trim().length < 2) return;
    let live = true;
    const t = setTimeout(async () => {
      const found = await searchUsers(q);
      if (live) setHits(found);
    }, 250);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [q]);

  const show = q.trim().length >= 2;
  return (
    <div className="relative">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Find someone by name, email or phone"
        className="h-11 w-full rounded-xl border border-border bg-bg-card px-4 text-sm text-fg placeholder:text-fg-subtle transition-colors hover:border-border-strong focus:border-fg-muted focus:outline-none focus:ring-2 focus:ring-fg-muted/15"
      />
      {show && (
        <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-border-strong bg-bg-card p-1 shadow-xl shadow-black/30">
          {hits.length === 0 ? (
            <li className="px-3.5 py-2.5 text-sm text-fg-muted">No one found.</li>
          ) : (
            hits.map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    setHits([]);
                    router.push(`/admin/gifts?user=${encodeURIComponent(h.id)}`);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-bg-elev"
                >
                  <span className="font-medium">{h.name}</span>
                  {h.pro && <ProBadge size={12} />}
                  {h.email && <span className="truncate text-fg-muted">{h.email}</span>}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

function RecipientCard({ r }: { r: Recipient }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-card p-5">
      <div className="flex items-center gap-1.5 text-lg font-semibold">
        {r.name}
        {r.pro && <ProBadge size={16} />}
      </div>
      <div className="text-sm text-fg-muted">
        {[r.email, r.phone].filter(Boolean).join(" · ") || "No contact details"}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-border bg-bg-elev/50 px-4 py-3">
          <dt className="text-xs text-fg-muted">Kasala Coins</dt>
          <dd className="mt-1 text-xl font-semibold tabular-nums">{r.coins.total}</dd>
          <dd className="text-xs text-fg-subtle">
            {r.coins.bought} bought or gifted · {r.coins.earned} received
          </dd>
        </div>
        <div className="rounded-xl border border-border bg-bg-elev/50 px-4 py-3">
          <dt className="text-xs text-fg-muted">Kasala Pro</dt>
          <dd className="mt-0.5 font-semibold">
            {r.pro ? `Until ${new Date(r.pro.until).toLocaleDateString()}` : "No"}
          </dd>
          {r.pro && (
            <dd className="text-xs text-fg-subtle">
              {r.pro.store === "kasala"
                ? "Gift from Kasala"
                : `${r.pro.store === "play_store" ? "Play Store" : "App Store"}${
                    r.pro.willRenew ? ", renews" : ", ends"
                  }`}
            </dd>
          )}
        </div>
      </dl>
    </div>
  );
}
