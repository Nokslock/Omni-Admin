"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adFormatLabel, adRunState, adStatusMeta, type Ad, type AdFormat, type AdStatus } from "../_lib/ads";
import { countryLabel, WORLDWIDE } from "@/app/lib/countries";
import { toast } from "../_components/toast";
import { setAdSchedule, setAdStatus } from "./actions";
import { EmptyState, GUTTER, PageHeader, Segmented, StatGrid, StatTile, StatusPill } from "../_components/ui";

type Tab = AdStatus | "all";

const TABS: { id: Tab; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "paused", label: "Paused" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
];

const MIGRATION_PATH = "supabase/migrations/20261111120000_ads.sql";

function relTime(iso: string, nowMs: number): string {
  const s = Math.max(0, Math.floor((nowMs - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

/** ISO → value for <input type="date"> in local time. */
function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function AdsList({ ads, tableMissing }: { ads: Ad[]; tableMissing: boolean }) {
  const [tab, setTab] = useState<Tab>("pending");
  const [format, setFormat] = useState<AdFormat | "all">("all");
  const [nowMs] = useState(() => Date.now());

  const counts = useMemo(() => {
    const c: Record<AdStatus, number> = { pending: 0, approved: 0, paused: 0, rejected: 0 };
    for (const a of ads) c[a.status]++;
    return c;
  }, [ads]);
  const live = ads.filter((a) => adRunState(a, nowMs) === "live").length;
  const shown = ads.filter(
    (a) => (tab === "all" || a.status === tab) && (format === "all" || a.format === format),
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Ads"
        description="Ads people request from the mobile app: sponsored cards, or banners they designed themselves. Approved ads show in the incident timeline."
      >
        {!tableMissing && (
          <StatGrid>
            <StatTile label="Waiting for review" value={counts.pending} color="var(--warn)" active={tab === "pending"} onClick={() => setTab("pending")} />
            <StatTile label="Live now" value={live} sub={`of ${counts.approved} approved`} color="var(--ok)" active={tab === "approved"} onClick={() => setTab("approved")} />
            <StatTile label="Paused" value={counts.paused} active={tab === "paused"} onClick={() => setTab("paused")} />
            <StatTile label="Rejected" value={counts.rejected} color="var(--danger)" active={tab === "rejected"} onClick={() => setTab("rejected")} />
          </StatGrid>
        )}
      </PageHeader>

      <div className={`flex flex-wrap items-center justify-between gap-3 pb-5 ${GUTTER}`}>
        <Segmented
          label="Status"
          value={tab}
          onChange={setTab}
          items={TABS.map((t) => ({ id: t.id, label: t.label, count: t.id === "all" ? ads.length : counts[t.id] }))}
        />
        <Segmented
          label="Format"
          value={format}
          onChange={setFormat}
          items={[
            { id: "all", label: "All formats" },
            { id: "card", label: "Cards" },
            { id: "banner", label: "Banners" },
          ]}
        />
      </div>

      <div className={`flex-1 pb-8 ${GUTTER}`}>
        {tableMissing ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border-strong px-8 py-10 text-center">
            <div className="text-base font-semibold">Ads aren&apos;t set up in the database yet</div>
            <p className="mt-2 text-sm text-fg-muted">
              Run <code className="rounded bg-bg-elev px-1.5 py-0.5 font-mono text-xs text-fg">{MIGRATION_PATH}</code> in
              the Supabase SQL editor. It creates the <code className="font-mono text-xs">ads</code> table and the{" "}
              <code className="font-mono text-xs">ad-logos</code> storage bucket the mobile app submits to.
            </p>
          </div>
        ) : shown.length === 0 ? (
          <EmptyState
            title={tab === "pending" ? "Nothing waiting for review" : `No ${tab === "all" ? "" : `${tab} `}ads`}
            hint="Requests sent from the mobile app land here."
          />
        ) : (
          <ul className="max-w-6xl space-y-4">
            {shown.map((ad) => (
              <AdRow key={ad.id} ad={ad} nowMs={nowMs} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function AdRow({ ad, nowMs }: { ad: Ad; nowMs: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [start, setStart] = useState(toDateInput(ad.startsAt));
  const [end, setEnd] = useState(toDateInput(ad.endsAt));
  const meta = adStatusMeta[ad.status];
  const run = adRunState(ad, nowMs);
  const datesChanged = start !== toDateInput(ad.startsAt) || end !== toDateInput(ad.endsAt);

  async function change(next: AdStatus, done: string, notes?: string) {
    setBusy(true);
    const res = await setAdStatus(ad.id, next, notes);
    setBusy(false);
    if ("error" in res) {
      toast(res.error, "error");
      return;
    }
    toast(done, "success");
    setRejecting(false);
    router.refresh();
  }

  async function saveDates() {
    setBusy(true);
    // Start at the beginning of the chosen day; end at the end of it.
    const res = await setAdSchedule(
      ad.id,
      start ? new Date(`${start}T00:00:00`).toISOString() : null,
      end ? new Date(`${end}T23:59:59`).toISOString() : null,
    );
    setBusy(false);
    if ("error" in res) toast(res.error, "error");
    else {
      toast("Run dates saved", "success");
      router.refresh();
    }
  }

  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-bg-card">
      <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,340px)_1fr]">
        <div>
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-subtle">In the app</div>
          <SponsoredPreview ad={ad} />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill color={meta.color} label={meta.label} />
            <Tag className="text-fg">{adFormatLabel[ad.format]}</Tag>
            {run === "live" && <Tag className="text-ok">Live now</Tag>}
            {run === "scheduled" && <Tag className="text-info">Starts {fmtDate(ad.startsAt)}</Tag>}
            {run === "ended" && <Tag className="text-fg-muted">Ended {fmtDate(ad.endsAt)}</Tag>}
          </div>

          <p className="mt-2 text-xs text-fg-muted">
            Requested {relTime(ad.createdAt, nowMs)} by {ad.submitterName ?? "an unknown user"}
            {ad.submitterEmail ? ` · ${ad.submitterEmail}` : ""}
            {ad.reviewedAt && ` · reviewed ${relTime(ad.reviewedAt, nowMs)}${ad.reviewerName ? ` by ${ad.reviewerName}` : ""}`}
          </p>

          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <Pair label="Shown in" value={ad.country === WORLDWIDE ? "Everywhere" : countryLabel(ad.country)} />
            {ad.format === "card" ? (
              <Pair label="Button" value={ad.ctaLabel} />
            ) : (
              <Pair
                label="Banner image"
                value={
                  ad.bannerUrl ? (
                    <a href={ad.bannerUrl} target="_blank" rel="noopener noreferrer" className="text-info hover:underline">
                      Open full size
                    </a>
                  ) : (
                    "Missing"
                  )
                }
              />
            )}
            <Pair
              label="Link"
              value={
                ad.linkUrl ? (
                  <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-info hover:underline">
                    {ad.linkUrl}
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <Pair label="Contact" value={[ad.contactPhone, ad.contactEmail].filter(Boolean).join(" · ") || "—"} mono />
          </dl>

          {ad.status === "rejected" && ad.adminNotes && (
            <p className="mt-4 rounded-lg border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-fg">
              <span className="font-semibold text-danger">Rejected: </span>
              {ad.adminNotes}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-border pt-4">
            <label className="text-xs text-fg-muted">
              Runs from
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="mt-1 block h-9 rounded-lg border border-border bg-bg-elev px-2.5 text-sm text-fg dark:[color-scheme:dark]"
              />
            </label>
            <label className="text-xs text-fg-muted">
              until
              <input
                type="date"
                value={end}
                min={start || undefined}
                onChange={(e) => setEnd(e.target.value)}
                className="mt-1 block h-9 rounded-lg border border-border bg-bg-elev px-2.5 text-sm text-fg dark:[color-scheme:dark]"
              />
            </label>
            {datesChanged && (
              <button
                type="button"
                disabled={busy}
                onClick={saveDates}
                className="h-9 rounded-lg border border-border-strong px-3 text-sm font-medium hover:bg-bg-elev disabled:opacity-60"
              >
                Save dates
              </button>
            )}
            {!start && !end && <span className="pb-2 text-xs text-fg-subtle">No dates: runs until paused.</span>}
          </div>

          {rejecting ? (
            <div className="mt-4">
              <textarea
                autoFocus
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                maxLength={300}
                placeholder="Why is it rejected? The advertiser sees this."
                className="w-full rounded-lg border border-border bg-bg-elev px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:border-fg-muted focus:outline-none"
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  disabled={busy || !reason.trim()}
                  onClick={() => change("rejected", "Ad rejected", reason)}
                  className="h-9 rounded-lg bg-danger px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {busy ? "Saving…" : "Reject ad"}
                </button>
                <button
                  type="button"
                  onClick={() => setRejecting(false)}
                  className="h-9 rounded-lg px-3 text-sm text-fg-muted hover:text-fg"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {(ad.status === "pending" || ad.status === "rejected") && (
                <ActionButton primary disabled={busy} onClick={() => change("approved", "Ad approved")}>
                  {ad.status === "rejected" ? "Approve anyway" : "Approve"}
                </ActionButton>
              )}
              {ad.status === "paused" && (
                <ActionButton primary disabled={busy} onClick={() => change("approved", "Ad resumed")}>
                  Resume
                </ActionButton>
              )}
              {ad.status === "approved" && (
                <ActionButton disabled={busy} onClick={() => change("paused", "Ad paused")}>
                  Pause
                </ActionButton>
              )}
              {ad.status !== "rejected" && (
                <ActionButton danger disabled={busy} onClick={() => setRejecting(true)}>
                  Reject
                </ActionButton>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

/** Mirrors the "Sponsored" card in the mobile incident timeline. */
function SponsoredPreview({ ad }: { ad: Ad }) {
  if (ad.format === "banner") return <BannerPreview ad={ad} />;
  return (
    <div className="rounded-2xl border border-border-strong bg-bg p-4">
      <span className="inline-block rounded-md bg-bg-elev px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-fg-muted">
        Sponsored
      </span>
      <div className="mt-3 flex gap-3">
        {ad.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ad.logoUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl border border-border object-cover" />
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-elev text-base font-bold text-fg-muted">
            {ad.businessName.trim()[0]?.toUpperCase() ?? "?"}
          </span>
        )}
        <div className="min-w-0">
          <div className="truncate text-xs text-fg-muted">{ad.businessName}</div>
          <div className="mt-0.5 text-[15px] font-bold leading-snug">{ad.headline}</div>
          {ad.body && <p className="mt-1 text-[13px] leading-snug text-fg-muted">{ad.body}</p>}
        </div>
      </div>
      {ad.linkUrl && (
        <div className="mt-3 flex justify-end">
          <span className="inline-flex h-9 items-center gap-1 rounded-full border border-border-strong px-4 text-[13px] font-semibold">
            {ad.ctaLabel}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </span>
        </div>
      )}
    </div>
  );
}

/** Mirrors a banner ad in the app: the label, the business name, the 2:1 image. */
function BannerPreview({ ad }: { ad: Ad }) {
  return (
    <div className="rounded-2xl border border-border-strong bg-bg p-3">
      <div className="flex items-center gap-2">
        <span className="inline-block rounded-md bg-bg-elev px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-fg-muted">
          Sponsored
        </span>
        <span className="min-w-0 flex-1 truncate text-xs text-fg-muted">{ad.businessName}</span>
        {ad.linkUrl && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-fg-muted">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        )}
      </div>
      <div className="mt-2.5 aspect-[2/1] overflow-hidden rounded-xl border border-border bg-bg-elev">
        {ad.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ad.bannerUrl} alt={`Banner for ${ad.businessName}`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-fg-subtle">No image</div>
        )}
      </div>
      <p className="mt-2 text-[11px] text-fg-subtle">
        Shown at 2:1, cropped to fit. Check that any text in the image is readable at phone width.
      </p>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  primary,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`h-9 rounded-lg px-4 text-sm font-semibold transition-colors disabled:opacity-60 ${
        primary
          ? "bg-fg text-bg hover:opacity-90"
          : danger
            ? "border border-danger/40 text-danger hover:bg-danger/10"
            : "border border-border-strong text-fg hover:bg-bg-elev"
      }`}
    >
      {children}
    </button>
  );
}

function Pair({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-fg-subtle">{label}</dt>
      <dd className={`mt-0.5 text-fg ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}

function Tag({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span className={`rounded-full border border-border px-2.5 py-1 text-xs font-medium ${className}`}>{children}</span>
  );
}
