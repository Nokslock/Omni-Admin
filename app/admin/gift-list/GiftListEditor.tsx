"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GIFT_LANGS,
  LEGACY_PRICES,
  MAX_GIFT_COINS,
  MIN_GIFT_COINS,
  reporterShare,
  validateGift,
  type GiftInput,
  type GiftTypeRow,
} from "../_lib/gift-types";
import { EmptyState, GUTTER, Panel, PanelHeader, StatusPill, TD, TH, TR, btn, btnSm } from "../_components/ui";
import { ConfirmDialog } from "../_components/ConfirmDialog";
import { toast } from "../_components/toast";
import { deleteGift, reorderGifts, saveGift, setGiftActive, type GiftListResult } from "./actions";

type Editing = { mode: "new" } | { mode: "edit"; gift: GiftTypeRow };

export function GiftListEditor({
  gifts,
  sharePercent,
  canEdit,
}: {
  gifts: GiftTypeRow[];
  sharePercent: number;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<GiftTypeRow | null>(null);

  // Older app versions send these prices as plain amounts.
  const missingLegacy = LEGACY_PRICES.filter((p) => !gifts.some((g) => g.active && g.coins === p));

  async function run(key: string, action: () => Promise<GiftListResult>): Promise<boolean> {
    setBusy(key);
    const res = await action();
    setBusy(null);
    if ("error" in res) {
      toast(res.error, "error");
      return false;
    }
    toast(res.message, "success");
    router.refresh();
    return true;
  }

  function move(index: number, by: -1 | 1) {
    const ids = gifts.map((g) => g.id);
    const to = index + by;
    if (to < 0 || to >= ids.length) return;
    [ids[index], ids[to]] = [ids[to], ids[index]];
    void run(`move:${gifts[index].id}`, () => reorderGifts(ids));
  }

  return (
    <main className={`flex flex-1 flex-col gap-5 pb-8 ${GUTTER}`}>
      {!canEdit && (
        <p className="rounded-xl border border-border bg-bg-card px-4 py-3 text-sm text-fg-muted">
          You can see the gift list, but only admins can change it.
        </p>
      )}

      {missingLegacy.length > 0 && (
        <p className="rounded-xl border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">
          App versions from before the gift list send gifts as {LEGACY_PRICES.join(", ")} coins.
          There&rsquo;s no gift in the app at {missingLegacy.join(" or ")} coins, so people on those
          versions can&rsquo;t send that amount. Keep a gift at each of these prices until everyone
          has updated.
        </p>
      )}

      {editing && (
        <GiftForm
          key={editing.mode === "edit" ? editing.gift.id : "new"}
          editing={editing}
          sharePercent={sharePercent}
          busy={busy === "save"}
          onCancel={() => setEditing(null)}
          onSave={async (input) => {
            const ok = await run("save", () => saveGift(input, editing.mode === "new"));
            if (ok) setEditing(null);
          }}
        />
      )}

      <Panel className="overflow-hidden">
        <PanelHeader
          title="Gifts"
          hint="In the order the app shows them"
          right={
            canEdit && !editing ? (
              <button type="button" className={btn.primary} onClick={() => setEditing({ mode: "new" })}>
                Add gift
              </button>
            ) : undefined
          }
        />
        {gifts.length === 0 ? (
          <EmptyState title="No gifts yet" hint="Add a gift so people can thank reporters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr>
                  <th className={TH}>Gift</th>
                  <th className={`${TH} text-right`}>Price</th>
                  <th className={`${TH} text-right`}>Reporter gets</th>
                  <th className={`${TH} text-right`}>Sent (30 days · all)</th>
                  <th className={TH}>Status</th>
                  {canEdit && <th className={`${TH} text-right`}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {gifts.map((g, i) => (
                  <tr key={g.id} className={`${TR} ${g.active ? "" : "opacity-60"}`}>
                    <td className={TD}>
                      <div className="flex items-center gap-3">
                        <GiftArt gift={g} />
                        <div className="min-w-0">
                          <div className="font-semibold text-fg">{g.names.en ?? g.id}</div>
                          <div className="truncate text-xs text-fg-muted">
                            {GIFT_LANGS.filter((l) => l.code !== "en")
                              .map((l) => g.names[l.code])
                              .filter(Boolean)
                              .join(" · ") || "No translations, so English is shown"}
                          </div>
                          <div className="text-[11px] text-fg-subtle">ID: {g.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className={`${TD} text-right tabular-nums`}>{g.coins.toLocaleString()} coins</td>
                    <td className={`${TD} text-right tabular-nums`}>
                      {reporterShare(g.coins, sharePercent).toLocaleString()} points
                    </td>
                    <td className={`${TD} text-right tabular-nums`}>
                      {g.sentLast30.toLocaleString()} · {g.sentAllTime.toLocaleString()}
                    </td>
                    <td className={TD}>
                      <StatusPill
                        color={g.active ? "var(--ok)" : "var(--fg-subtle)"}
                        label={g.active ? "In the app" : "Hidden"}
                      />
                    </td>
                    {canEdit && (
                      <td className={`${TD} text-right`}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            className={btnSm.ghost}
                            aria-label={`Move ${g.names.en ?? g.id} up`}
                            disabled={i === 0 || busy !== null}
                            onClick={() => move(i, -1)}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className={btnSm.ghost}
                            aria-label={`Move ${g.names.en ?? g.id} down`}
                            disabled={i === gifts.length - 1 || busy !== null}
                            onClick={() => move(i, 1)}
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            className={btnSm.ghost}
                            disabled={busy !== null}
                            onClick={() => setEditing({ mode: "edit", gift: g })}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className={g.active ? btnSm.warn : btnSm.ok}
                            disabled={busy !== null}
                            onClick={() => void run(`active:${g.id}`, () => setGiftActive(g.id, !g.active))}
                          >
                            {g.active ? "Hide" : "Show"}
                          </button>
                          {g.sentAllTime === 0 && (
                            <button
                              type="button"
                              className={btnSm.danger}
                              disabled={busy !== null}
                              onClick={() => setConfirmDelete(g)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <p className="text-xs leading-relaxed text-fg-muted">
        Sent gifts can only be hidden, never deleted, so wallet history keeps their name. A price
        change applies to gifts sent from then on. Earnings from gifts can only be withdrawn with
        Kasala Pro.
      </p>

      <ConfirmDialog
        open={confirmDelete !== null}
        title={`Delete ${confirmDelete?.emoji ?? ""} ${confirmDelete?.names.en ?? ""}?`}
        message="It has never been sent, so nothing else changes. This can't be undone."
        confirmLabel="Delete gift"
        destructive
        busy={busy === "delete"}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          const g = confirmDelete;
          if (!g) return;
          await run("delete", () => deleteGift(g.id));
          setConfirmDelete(null);
        }}
      />
    </main>
  );
}

function GiftArt({ gift, size = 40 }: { gift: Pick<GiftTypeRow, "emoji" | "imageUrl">; size?: number }) {
  const [broken, setBroken] = useState(false);
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-xl border border-border bg-bg-elev"
      style={{ width: size, height: size, fontSize: size * 0.55 }}
      aria-hidden
    >
      {gift.imageUrl && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element -- any https host
        <img
          src={gift.imageUrl}
          alt=""
          width={size * 0.7}
          height={size * 0.7}
          onError={() => setBroken(true)}
        />
      ) : (
        gift.emoji
      )}
    </span>
  );
}

function GiftForm({
  editing,
  sharePercent,
  busy,
  onCancel,
  onSave,
}: {
  editing: Editing;
  sharePercent: number;
  busy: boolean;
  onCancel: () => void;
  onSave: (input: GiftInput) => void;
}) {
  const isNew = editing.mode === "new";
  const start = editing.mode === "edit" ? editing.gift : null;
  const [id, setId] = useState(start?.id ?? "");
  const [emoji, setEmoji] = useState(start?.emoji ?? "");
  const [imageUrl, setImageUrl] = useState(start?.imageUrl ?? "");
  const [names, setNames] = useState<GiftInput["names"]>(start?.names ?? {});
  const [coins, setCoins] = useState(String(start?.coins ?? 10));
  const [active, setActive] = useState(start?.active ?? true);
  const [touched, setTouched] = useState(false);

  const input: GiftInput = { id: id.trim(), emoji, imageUrl, names, coins: Number(coins), active };
  const problem = validateGift(input, isNew);
  const price = Number(coins);
  const priceOk = Number.isInteger(price) && price >= MIN_GIFT_COINS;
  const field =
    "h-10 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg placeholder:text-fg-subtle focus:border-fg-muted focus:outline-none";
  const label = "mb-1.5 block text-xs font-medium text-fg-muted";

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        title={isNew ? "Add a gift" : `Edit ${start?.emoji ?? ""} ${start?.names.en ?? ""}`}
        hint={isNew ? "It appears in the app as soon as it's saved, unless you hide it" : undefined}
      />
      <form
        className="grid gap-5 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          setTouched(true);
          if (!problem) onSave(input);
        }}
      >
        <div className="grid gap-4 sm:grid-cols-[120px_minmax(0,1fr)_160px]">
          <div>
            <label className={label} htmlFor="gift-emoji">Emoji</label>
            <input
              id="gift-emoji"
              className={`${field} text-center text-xl`}
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="🌺"
              maxLength={16}
            />
          </div>
          <div>
            <label className={label} htmlFor="gift-id">ID</label>
            <input
              id="gift-id"
              className={`${field} font-mono disabled:opacity-60`}
              value={id}
              onChange={(e) => setId(e.target.value.toLowerCase())}
              placeholder="candle"
              disabled={!isNew}
            />
            <p className="mt-1 text-[11px] text-fg-subtle">
              {isNew ? "Used in records. It can't be changed later." : "IDs can't be changed."}
            </p>
          </div>
          <div>
            <label className={label} htmlFor="gift-coins">Price (coins)</label>
            <input
              id="gift-coins"
              type="number"
              min={MIN_GIFT_COINS}
              max={MAX_GIFT_COINS}
              className={`${field} tabular-nums`}
              value={coins}
              onChange={(e) => setCoins(e.target.value)}
            />
            <p className="mt-1 text-[11px] text-fg-subtle">
              {priceOk ? `Reporter gets ${reporterShare(price, sharePercent)} points` : "At least 2 coins"}
            </p>
          </div>
        </div>

        <div>
          <span className={label}>Name in each language</span>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {GIFT_LANGS.map((l) => (
              <div key={l.code}>
                <label className="mb-1 block text-[11px] text-fg-subtle" htmlFor={`gift-name-${l.code}`}>
                  {l.label}
                  {l.code === "en" ? " (required)" : ""}
                </label>
                <input
                  id={`gift-name-${l.code}`}
                  className={field}
                  value={names[l.code] ?? ""}
                  onChange={(e) => setNames({ ...names, [l.code]: e.target.value })}
                  placeholder={l.code === "en" ? "Candle" : names.en || "Uses English"}
                  maxLength={24}
                />
              </div>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-fg-subtle">
            Empty languages show the English name. Names appear under the gift in the app and in the
            reporter&rsquo;s notification.
          </p>
        </div>

        <div>
          <label className={label} htmlFor="gift-image">Image link (optional)</label>
          <input
            id="gift-image"
            className={field}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…/candle.png"
          />
          <p className="mt-1 text-[11px] text-fg-subtle">
            A square PNG replaces the emoji in the app. If it fails to load, the emoji is shown.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4">
          <span className="flex items-center gap-3 text-sm text-fg-muted">
            Preview
            <span className="flex items-center gap-2 rounded-xl border border-border bg-bg-elev px-3 py-2 text-fg">
              <GiftArt gift={{ emoji: emoji || "🎁", imageUrl: imageUrl.trim() || null }} size={32} />
              <span className="font-semibold">{names.en?.trim() || "Name"}</span>
              <span className="tabular-nums text-fg-muted">{priceOk ? price : "—"} coins</span>
            </span>
          </span>
          <label className="flex items-center gap-2 text-sm text-fg">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 accent-[var(--ok)]"
            />
            Show in the app
          </label>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" className={btn.ghost} onClick={onCancel} disabled={busy}>
              Cancel
            </button>
            <button type="submit" className={btn.primary} disabled={busy}>
              {busy ? "Saving…" : isNew ? "Add gift" : "Save changes"}
            </button>
          </div>
        </div>
        {touched && problem && (
          <p className="-mt-2 text-sm text-danger" role="alert">
            {problem}
          </p>
        )}
      </form>
    </Panel>
  );
}
