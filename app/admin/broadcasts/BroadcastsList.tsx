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

export function BroadcastsList({ broadcasts }: { broadcasts: Broadcast[] }) {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");
  const [audience, setAudience] = useState("all");
  const [status, setStatus] = useState("all");
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
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="border-b border-border bg-bg px-6 pb-5 pt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <nav className="mb-3 flex items-center gap-1.5 text-xs text-fg-muted">
              <span>Admin</span>
              <span className="text-fg-subtle">›</span>
              <span className="text-fg">Broadcasts</span>
            </nav>
            <h1 className="text-3xl font-semibold tracking-tight">Broadcasts</h1>
            <p className="mt-1 text-sm text-fg-muted">
              Announcements pushed to the mobile app · {broadcasts.length} total
            </p>
          </div>
          <BroadcastModal variant="primary" label="Send broadcast" />
        </div>

        {/* Stat cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total sent" value={stats.total} />
          <StatCard label="Live now" value={stats.live} accent="#22c55e" />
          <StatCard label="Expired" value={stats.expired} accent="#64748b" />
          <StatCard label="Archived" value={stats.archived} accent="#64748b" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-bg px-6 py-4">
        <div className="relative w-full max-w-xs">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-fg-subtle">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, message…"
            className="h-10 w-full rounded-lg border border-border bg-bg-card pl-9 pr-3 text-sm text-fg placeholder:text-fg-subtle focus:border-fg-muted focus:outline-none focus:ring-1 focus:ring-fg-muted/30"
          />
        </div>
        <span className="hidden h-6 w-px bg-border md:block" aria-hidden />
        <FilterDropdown label="Severity" value={severity} options={severityOptions} onChange={setSeverity} />
        <FilterDropdown label="Audience" value={audience} options={audienceOptions} onChange={setAudience} />
        <FilterDropdown label="Location" value={location} options={locationOptions} onChange={setLocation} />
        <FilterDropdown label="Status" value={status} options={statusOptions} onChange={setStatus} />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <div className="flex h-48 items-center justify-center px-6 text-center text-sm text-fg-muted">
            No broadcasts match these filters.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-bg">
              <tr className="text-left text-[10px] uppercase tracking-wider text-fg-subtle">
                <th className="border-b border-border px-6 py-3 font-medium">Broadcast</th>
                <th className="border-b border-border py-3 font-medium">Audience</th>
                <th className="border-b border-border py-3 font-medium">Location</th>
                <th className="border-b border-border py-3 font-medium">Sent</th>
                <th className="border-b border-border py-3 font-medium">Status</th>
                <th className="border-b border-border px-6 py-3 text-right font-medium">Actions</th>
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
    <tr className="border-b border-border align-top transition-colors hover:bg-bg-elev/40">
      <td className="px-6 py-4">
        <div className="flex items-start gap-2.5">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: sev.color }} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-fg">{b.title}</span>
              <span
                className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
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
      <td className="py-4 pr-6 text-fg-muted">{audienceMeta[b.audience].label}</td>
      <td className="py-4 pr-6 text-fg-muted">
        {b.country === WORLDWIDE ? "🌍 Worldwide" : countryLabel(b.country)}
      </td>
      <td className="py-4 pr-6 text-fg-muted">{b.createdAgo}</td>
      <td className="py-4 pr-6">
        {b.isArchived ? (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-fg-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-fg-subtle" />
            Archived
          </span>
        ) : b.isExpired ? (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-fg-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-fg-subtle" />
            Expired
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-ok/30 bg-ok/10 px-2 py-1 text-[11px] font-medium text-ok">
            <span className="h-1.5 w-1.5 rounded-full bg-ok" />
            {exp ?? "Live · no expiry"}
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="inline-flex items-center gap-2">
          {b.isArchived ? (
            <button
              onClick={restore}
              disabled={busy}
              className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium text-fg hover:border-border-strong transition-colors disabled:opacity-50"
            >
              Restore
            </button>
          ) : (
            <>
              {!b.isExpired && (
                <button
                  onClick={endNow}
                  disabled={busy}
                  className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium text-fg hover:border-border-strong transition-colors disabled:opacity-50"
                >
                  End now
                </button>
              )}
              <button
                onClick={archive}
                disabled={busy}
                aria-label="Archive broadcast"
                title="Archive broadcast"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-fg-muted hover:border-border-strong hover:text-fg transition-colors disabled:opacity-50"
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
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-fg-muted hover:border-danger/40 hover:text-danger transition-colors disabled:opacity-50"
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

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-xl border border-border bg-bg-card px-5 py-4">
      <div className="text-xs text-fg-muted">{label}</div>
      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight" style={accent ? { color: accent } : undefined}>
          {value.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
