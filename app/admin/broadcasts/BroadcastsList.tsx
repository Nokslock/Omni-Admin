"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type Broadcast,
  severityMeta,
  audienceMeta,
  expiryLabel,
} from "../_lib/broadcasts";
import { WORLDWIDE, countryLabel } from "@/app/lib/countries";
import { FilterDropdown } from "../_components/FilterDropdown";
import { ConfirmDialog } from "../_components/ConfirmDialog";
import { BroadcastModal } from "../users/BroadcastModal";
import { toast } from "../_components/toast";
import {
  deleteBroadcast,
  expireBroadcast,
  archiveBroadcast,
  restoreBroadcast,
} from "./actions";
import { EmptyState, GUTTER, PageHeader, Panel, SearchField, StatGrid, StatTile, StatusPill, TD, TH, TR, btnSm } from "../_components/ui";

const severityOptions = [
  { value: "all", label: "All" },
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "critical", label: "Critical" },
];

const audienceOptions = [
  { value: "all", label: "All" },
  { value: "users", label: "Users only" },
  { value: "admins", label: "Admins only" },
];

const statusOptions = [
  { value: "all", label: "All active" },
  { value: "live", label: "Live" },
  { value: "expired", label: "Expired" },
  { value: "archived", label: "Archived" },
];

export function BroadcastsList({
  broadcasts,
  initialStatus,
  openNew = false,
}: {
  broadcasts: Broadcast[];
  initialStatus?: string;
  openNew?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");
  const [audience, setAudience] = useState("all");
  const [status, setStatus] = useState(
    statusOptions.some((o) => o.value === initialStatus) ? initialStatus! : "all",
  );
  const [location, setLocation] = useState("all");

  // Only surface locations that actually appear in the broadcasts.
  const locationOptions = useMemo(() => {
    const codes = new Set(broadcasts.map((b) => b.country));
    const opts = [{ value: "all", label: "All" }];
    if (codes.has(WORLDWIDE)) {
      opts.push({ value: WORLDWIDE, label: "🌍 Worldwide" });
    }
    Array.from(codes)
      .filter((c) => c !== WORLDWIDE)
      .map((c) => ({ value: c, label: countryLabel(c) }))
      .sort((a, b) => a.label.localeCompare(b.label))
      .forEach((o) => opts.push(o));
    return opts;
  }, [broadcasts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return broadcasts.filter((b) => {
      if (q && !`${b.title} ${b.body}`.toLowerCase().includes(q)) return false;
      if (severity !== "all" && b.severity !== severity) return false;
      if (audience !== "all" && b.audience !== audience) return false;
      if (location !== "all" && b.country !== location) return false;
      // Archived rows only appear under the "Archived" status; every other
      // view (all/live/expired) hides them.
      if (status === "archived") {
        if (!b.isArchived) return false;
      } else {
        if (b.isArchived) return false;
        if (status === "live" && b.isExpired) return false;
        if (status === "expired" && !b.isExpired) return false;
      }
      return true;
    });
  }, [broadcasts, query, severity, audience, location, status]);

  const stats = useMemo(() => {
    const total = broadcasts.length;
    const archived = broadcasts.filter((b) => b.isArchived).length;
    const expired = broadcasts.filter((b) => !b.isArchived && b.isExpired).length;
    const live = broadcasts.filter((b) => !b.isArchived && !b.isExpired).length;
    return { total, live, expired, archived };
  }, [broadcasts]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Broadcasts"
        description={
          <>
            Announcements pushed to everyone&rsquo;s phone. Showing{" "}
            <span className="font-semibold text-fg">{filtered.length}</span> of {broadcasts.length}.
          </>
        }
        actions={<BroadcastModal variant="primary" label="Send broadcast" defaultOpen={openNew} />}
      >
        <StatGrid>
          <StatTile label="Total sent" value={stats.total.toLocaleString()} color="var(--info)" />
          <StatTile label="Live now" value={stats.live.toLocaleString()} color="var(--ok)" />
          <StatTile label="Expired" value={stats.expired.toLocaleString()} />
          <StatTile label="Archived" value={stats.archived.toLocaleString()} />
        </StatGrid>
      </PageHeader>

      <div className={`flex min-h-0 flex-1 flex-col pb-6 ${GUTTER}`}>
      <Panel className="flex min-h-[440px] flex-1 flex-col overflow-hidden">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-border px-4 py-3">
        <SearchField value={query} onChange={setQuery} placeholder="Search title, message…" />
        <FilterDropdown label="Severity" value={severity} options={severityOptions} onChange={setSeverity} />
        <FilterDropdown label="Audience" value={audience} options={audienceOptions} onChange={setAudience} />
        <FilterDropdown label="Location" value={location} options={locationOptions} onChange={setLocation} />
        <FilterDropdown label="Status" value={status} options={statusOptions} onChange={setStatus} />
      </div>

      {/* Table */}
      <div className="min-h-0 flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <EmptyState
            title={broadcasts.length === 0 ? "No broadcasts yet" : "No broadcasts match"}
            hint={broadcasts.length === 0 ? "Send one to reach everyone on the app." : "Try a different search or filter."}
          />
        ) : (
          <table className="w-full min-w-[880px] text-sm">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className={TH}>Broadcast</th>
                <th className={TH}>Audience</th>
                <th className={TH}>Location</th>
                <th className={TH}>Sent</th>
                <th className={TH}>Status</th>
                <th className={`${TH} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <BroadcastRow key={b.id} broadcast={b} />
              ))}
            </tbody>
          </table>
        )}
      </div>
      </Panel>
      </div>
    </div>
  );
}

function BroadcastRow({ broadcast: b }: { broadcast: Broadcast }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const sev = severityMeta[b.severity];
  const exp = expiryLabel(b.expiresAt);

  async function endNow() {
    setBusy(true);
    const res = await expireBroadcast(b.id);
    setBusy(false);
    if ("ok" in res) {
      toast("Broadcast ended. It will stop showing in the app.", "success");
      router.refresh();
    } else {
      toast(res.error, "error");
    }
  }

  async function archive() {
    setBusy(true);
    const res = await archiveBroadcast(b.id);
    setBusy(false);
    if ("ok" in res) {
      toast("Broadcast archived.", "success");
      router.refresh();
    } else {
      toast(res.error, "error");
    }
  }

  async function restore() {
    setBusy(true);
    const res = await restoreBroadcast(b.id);
    setBusy(false);
    if ("ok" in res) {
      toast("Broadcast restored.", "success");
      router.refresh();
    } else {
      toast(res.error, "error");
    }
  }

  async function remove() {
    setBusy(true);
    const res = await deleteBroadcast(b.id);
    if ("ok" in res) {
      setConfirmDelete(false);
      toast("Broadcast deleted.", "success");
      router.refresh();
    } else {
      setBusy(false);
      setConfirmDelete(false);
      toast(res.error, "error");
    }
  }

  return (
    <tr className={TR}>
      <td className={TD}>
        <div className="flex items-start gap-3">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: sev.color, boxShadow: `0 0 0 4px color-mix(in oklab, ${sev.color} 16%, transparent)` }} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-fg">{b.title}</span>
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{
                  color: sev.color,
                  borderColor: `color-mix(in oklab, ${sev.color} 28%, transparent)`,
                  background: `color-mix(in oklab, ${sev.color} 12%, transparent)`,
                  borderWidth: 1,
                }}
              >
                {sev.label}
              </span>
            </div>
            <p className="mt-0.5 line-clamp-2 max-w-md text-[13px] text-fg-muted">{b.body}</p>
            {b.sentByName && (
              <p className="mt-1 text-[11px] text-fg-subtle">by {b.sentByName}</p>
            )}
          </div>
        </div>
      </td>
      <td className={`${TD} whitespace-nowrap text-fg-muted`}>{audienceMeta[b.audience].label}</td>
      <td className={`${TD} whitespace-nowrap text-fg-muted`}>
        {b.country === WORLDWIDE ? "🌍 Worldwide" : countryLabel(b.country)}
      </td>
      <td className={`${TD} whitespace-nowrap text-fg-muted`}>{b.createdAgo}</td>
      <td className={TD}>
        {b.isArchived ? (
          <StatusPill color="var(--fg-subtle)" label="Archived" />
        ) : b.isExpired ? (
          <StatusPill color="var(--fg-subtle)" label="Expired" />
        ) : (
          <StatusPill color="var(--ok)" label={exp ?? "Live · no expiry"} />
        )}
      </td>
      <td className={`${TD} text-right`}>
        <div className="inline-flex items-center gap-2">
          {b.isArchived ? (
            <button
              onClick={restore}
              disabled={busy}
              className={btnSm.ghost}
            >
              Restore
            </button>
          ) : (
            <>
              {!b.isExpired && (
                <button
                  onClick={endNow}
                  disabled={busy}
                  className={btnSm.ghost}
                >
                  End now
                </button>
              )}
              <button
                onClick={archive}
                disabled={busy}
                aria-label="Archive broadcast"
                title="Archive broadcast"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-fg-muted hover:border-border-strong hover:text-fg transition-colors disabled:opacity-50"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="3" y="4" width="18" height="4" rx="1" />
                  <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" />
                  <line x1="10" y1="12" x2="14" y2="12" />
                </svg>
              </button>
            </>
          )}
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={busy}
            aria-label="Delete broadcast"
            title="Delete broadcast"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-fg-muted hover:border-danger/40 hover:text-danger transition-colors disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
        <ConfirmDialog
          open={confirmDelete}
          title="Delete broadcast?"
          message={`This permanently removes "${b.title}" from the app feed. This can't be undone.`}
          confirmLabel="Delete"
          destructive
          busy={busy}
          onConfirm={remove}
          onCancel={() => setConfirmDelete(false)}
        />
      </td>
    </tr>
  );
}
