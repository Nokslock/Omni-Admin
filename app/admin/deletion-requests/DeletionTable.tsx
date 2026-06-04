"use client";

import { useMemo, useState, useTransition } from "react";
import {
  type DeletionRequest,
  type DeletionStatus,
  deletionStatusMeta,
} from "../_lib/deletion-requests";
import { FilterDropdown } from "../_components/FilterDropdown";
import { setDeletionStatus } from "./actions";

const statusFilterOptions = [
  { value: "open", label: "Open (pending + in progress)" },
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
];

export function DeletionTable({ requests }: { requests: DeletionRequest[] }) {
  const [filter, setFilter] = useState("open");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests.filter((r) => {
      if (filter === "open" && r.status !== "pending" && r.status !== "in_progress") return false;
      if (
        filter !== "all" &&
        filter !== "open" &&
        r.status !== (filter as DeletionStatus)
      )
        return false;
      if (q) {
        const hay = `${r.email} ${r.phone ?? ""} ${r.userName ?? ""} ${r.userId ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [requests, filter, query]);

  const selected = filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? null;

  function update(id: string, status: DeletionStatus, note?: string) {
    setError(null);
    startTransition(async () => {
      const res = await setDeletionStatus(id, status, note);
      if ("error" in res) setError(res.error);
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="border-b border-border bg-bg px-6 pb-5 pt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <nav className="mb-3 flex items-center gap-1.5 text-xs text-fg-muted">
              <span>Admin</span>
              <span className="text-fg-subtle">›</span>
              <span className="text-fg">Deletion requests</span>
            </nav>
            <h1 className="text-3xl font-semibold tracking-tight">Account deletion requests</h1>
            <p className="mt-1 text-sm text-fg-muted">
              Submitted via{" "}
              <code className="rounded bg-bg-elev px-1.5 py-0.5 font-mono text-[11px]">
                /account-deletion
              </code>{" "}
              — required for the Google Play listing.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-3 text-xs">
            {(
              [
                ["pending", "Pending"],
                ["in_progress", "In progress"],
                ["completed", "Completed"],
                ["rejected", "Rejected"],
              ] as const
            ).map(([k, label]) => {
              const count = requests.filter((r) => r.status === k).length;
              const meta = deletionStatusMeta[k];
              return (
                <div
                  key={k}
                  className="rounded-lg border border-border bg-bg-card px-3 py-2.5"
                  style={{ minWidth: 100 }}
                >
                  <div className="text-fg-muted">{label}</div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-semibold">{count}</span>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                  </div>
                </div>
              );
            })}
          </div>
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
            placeholder="Search email, phone, name…"
            className="h-10 w-full rounded-lg border border-border bg-bg-card pl-9 pr-3 text-sm text-fg placeholder:text-fg-subtle focus:border-fg-muted focus:outline-none focus:ring-1 focus:ring-fg-muted/30"
          />
        </div>
        <span className="hidden h-6 w-px bg-border md:block" aria-hidden />
        <FilterDropdown label="Status" value={filter} options={statusFilterOptions} onChange={setFilter} />
        <div className="ml-auto text-xs text-fg-muted">
          {filtered.length} of {requests.length}
        </div>
      </div>

      {error && (
        <div className="border-b border-danger/40 bg-danger/10 px-6 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Split: list + detail */}
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_400px]">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-bg">
              <tr className="text-left text-[10px] uppercase tracking-wider text-fg-subtle">
                <th className="border-b border-border px-6 py-3 font-medium">Requester</th>
                <th className="border-b border-border py-3 font-medium">Matched account</th>
                <th className="border-b border-border py-3 font-medium">Reason</th>
                <th className="border-b border-border py-3 font-medium">Submitted</th>
                <th className="border-b border-border px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-sm text-fg-muted">
                    No requests match these filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const meta = deletionStatusMeta[r.status];
                  const isSelected = r.id === selected?.id;
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedId(r.id)}
                      className={`cursor-pointer border-b border-border transition-colors ${
                        isSelected ? "bg-bg-elev/60" : "hover:bg-bg-elev/40"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="leading-tight">
                          <div className="font-medium text-fg">{r.email}</div>
                          {r.phone && (
                            <div className="font-mono text-[11px] text-fg-muted">{r.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 pr-6">
                        {r.userId ? (
                          <div className="leading-tight">
                            <div className="text-fg">{r.userName ?? "—"}</div>
                            <div className="font-mono text-[11px] text-fg-muted">{r.userId}</div>
                          </div>
                        ) : (
                          <span className="font-mono text-[11px] text-fg-subtle">no match</span>
                        )}
                      </td>
                      <td className="max-w-[240px] py-4 pr-6">
                        <div className="truncate text-fg-muted">{r.reason ?? "—"}</div>
                      </td>
                      <td className="py-4 pr-6 text-fg-muted">{r.createdAgo}</td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium"
                          style={{
                            color: meta.color,
                            borderColor: `color-mix(in oklab, ${meta.color} 28%, transparent)`,
                            background: `color-mix(in oklab, ${meta.color} 10%, transparent)`,
                          }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        <aside className="border-l border-border bg-bg-card">
          {selected ? (
            <DetailPanel request={selected} pending={isPending} onUpdate={update} />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-fg-muted">
              Select a request to review.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function DetailPanel({
  request,
  pending,
  onUpdate,
}: {
  request: DeletionRequest;
  pending: boolean;
  onUpdate: (id: string, status: DeletionStatus, note?: string) => void;
}) {
  const [note, setNote] = useState(request.adminNote ?? "");
  const meta = deletionStatusMeta[request.status];

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Request details</h2>
          <span
            className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium"
            style={{
              color: meta.color,
              borderColor: `color-mix(in oklab, ${meta.color} 28%, transparent)`,
              background: `color-mix(in oklab, ${meta.color} 10%, transparent)`,
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
            {meta.label}
          </span>
        </div>
        <div className="mt-1 font-mono text-[10px] text-fg-subtle">{request.id}</div>
      </header>

      <div className="flex-1 space-y-5 overflow-auto px-5 py-4">
        <Field label="Email">
          <a href={`mailto:${request.email}`} className="font-medium text-fg hover:underline">
            {request.email}
          </a>
        </Field>
        {request.phone && (
          <Field label="Phone">
            <span className="font-mono">{request.phone}</span>
          </Field>
        )}
        {request.reason && (
          <Field label="Reason">
            <span className="text-fg">{request.reason}</span>
          </Field>
        )}

        <div className="rounded-lg border border-border bg-bg-elev/50 p-3">
          <div className="text-[10px] uppercase tracking-wider text-fg-subtle">Matched account</div>
          {request.userId ? (
            <div className="mt-2 space-y-1.5 text-sm">
              <div className="font-semibold">{request.userName}</div>
              <div className="font-mono text-[11px] text-fg-muted">{request.userId}</div>
              <div className="text-[11px] text-fg-muted">
                Joined {request.userJoined} · {request.userReports ?? 0} reports
              </div>
            </div>
          ) : (
            <p className="mt-2 text-xs text-fg-muted">
              No matching user was found at submission time. Look up the email manually before
              marking this completed.
            </p>
          )}
        </div>

        <Field label="Submitted">
          {request.createdAgo} · {new Date(request.createdAt).toLocaleString()}
        </Field>
        {request.reviewedAt && (
          <Field label="Last reviewed">
            {request.reviewedByName ? `${request.reviewedByName} · ` : ""}
            {new Date(request.reviewedAt).toLocaleString()}
          </Field>
        )}

        <div>
          <label className="text-[10px] uppercase tracking-wider text-fg-subtle">Admin note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Visible to other operators only…"
            className="mt-1.5 w-full resize-none rounded-lg border border-border bg-bg-elev px-3 py-2.5 text-sm text-fg placeholder:text-fg-subtle focus:border-fg-muted focus:outline-none focus:ring-1 focus:ring-fg-muted/30"
          />
        </div>
      </div>

      <footer className="space-y-2 border-t border-border px-5 py-4">
        {request.status !== "completed" && request.status !== "rejected" && (
          <>
            <button
              onClick={() => onUpdate(request.id, "in_progress", note)}
              disabled={pending || request.status === "in_progress"}
              className="inline-flex h-9 w-full items-center justify-center rounded-md border border-border bg-bg-card text-sm font-medium hover:border-border-strong disabled:opacity-50 transition-colors"
            >
              Mark in progress
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  if (confirm(`Permanently delete the account for ${request.email}? This can't be undone.`)) {
                    onUpdate(request.id, "completed", note);
                  }
                }}
                disabled={pending}
                className="inline-flex h-9 items-center justify-center rounded-md bg-danger text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                Delete account
              </button>
              <button
                onClick={() => onUpdate(request.id, "rejected", note)}
                disabled={pending}
                className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-bg-card text-sm font-medium hover:border-border-strong disabled:opacity-50 transition-colors"
              >
                Reject
              </button>
            </div>
          </>
        )}
        {(request.status === "completed" || request.status === "rejected") && (
          <button
            onClick={() => onUpdate(request.id, "pending", note)}
            disabled={pending}
            className="inline-flex h-9 w-full items-center justify-center rounded-md border border-border bg-bg-card text-sm font-medium hover:border-border-strong disabled:opacity-50 transition-colors"
          >
            Reopen request
          </button>
        )}
      </footer>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-fg-subtle">{label}</div>
      <div className="mt-1 text-sm">{children}</div>
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
