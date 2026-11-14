"use client";

import { useMemo, useState, useTransition } from "react";
import {
  type DeletionRequest,
  type DeletionStatus,
  type ScheduledDeletion,
  deletionStatusMeta,
  untilErase,
} from "../_lib/deletion-requests";
import { ConfirmDialog } from "../_components/ConfirmDialog";
import { FilterDropdown } from "../_components/FilterDropdown";
import { deactivateForRequest, eraseNow, restoreAccount, setDeletionStatus } from "./actions";
import { EmptyState, GUTTER, PageHeader, Panel, SearchField, StatGrid, StatTile, StatusPill, TD, TH, TR, btnSm } from "../_components/ui";

const statusFilterOptions = [
  { value: "open", label: "Open (pending + deactivated)" },
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "Deactivated" },
  { value: "completed", label: "Erased" },
  { value: "cancelled", label: "Restored" },
  { value: "rejected", label: "Rejected" },
];

/** What the shared confirmation dialog is asking, and what to do on yes. */
type Ask = {
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  requireText?: string;
  onYes: () => void;
};

const ERASE_MESSAGE =
  "Their 30 days to change their mind are skipped. A limited legal record is kept for 12 months; everything else is removed for good and can't be restored.";

type PanelAction =
  | { kind: "deactivate"; note: string }
  | { kind: "restore"; userId: string; note: string }
  | { kind: "erase"; userId: string }
  | { kind: "status"; status: "pending" | "rejected" | "completed"; note: string };

export function DeletionTable({
  requests,
  scheduled,
  canErase,
}: {
  requests: DeletionRequest[];
  scheduled: ScheduledDeletion[];
  /** Admins (not moderators) may erase an account before its 30 days end. */
  canErase: boolean;
}) {
  const [filter, setFilter] = useState("open");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [ask, setAsk] = useState<Ask | null>(null);

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

  function run(id: string, action: PanelAction) {
    setError(null);
    startTransition(async () => {
      const res =
        action.kind === "deactivate"
          ? await deactivateForRequest(id, action.note)
          : action.kind === "restore"
            ? await restoreAccount(action.userId, action.note, id)
            : action.kind === "erase"
              ? await eraseNow(action.userId)
              : await setDeletionStatus(id, action.status, action.note);
      if ("error" in res) setError(res.error);
    });
  }

  function eraseScheduled(s: ScheduledDeletion) {
    setAsk({
      title: `Erase ${s.name}'s account now?`,
      message: ERASE_MESSAGE,
      confirmLabel: "Erase now",
      destructive: true,
      requireText: s.email ?? s.name,
      onYes: () =>
        startTransition(async () => {
          const res = await eraseNow(s.userId);
          if ("error" in res) setError(res.error);
        }),
    });
  }

  function restoreScheduled(s: ScheduledDeletion) {
    setAsk({
      title: `Restore ${s.name}'s account?`,
      message: "They'll be able to sign in and use it again.",
      confirmLabel: "Restore",
      onYes: () =>
        startTransition(async () => {
          const res = await restoreAccount(s.userId);
          if ("error" in res) setError(res.error);
        }),
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Deletion requests"
        description={
          <>
            Sent from{" "}
            <code className="rounded-md bg-bg-elev px-1.5 py-0.5 font-mono text-xs">/account-deletion</code>{" "}
            (required for the Google Play listing). Deactivating gives the person 30 days to
            change their mind; the account is then erased automatically, keeping a limited
            legal record for 12 months.
          </>
        }
      >
        <StatGrid cols={5}>
          {(
            [
              ["pending", "Pending"],
              ["in_progress", "Deactivated"],
              ["completed", "Erased"],
              ["cancelled", "Restored"],
              ["rejected", "Rejected"],
            ] as const
          ).map(([k, label]) => (
            <StatTile
              key={k}
              label={label}
              value={requests.filter((r) => r.status === k).length}
              color={deletionStatusMeta[k].color}
              active={filter === k}
              onClick={
                statusFilterOptions.some((o) => o.value === k)
                  ? () => setFilter(filter === k ? "open" : k)
                  : undefined
              }
            />
          ))}
        </StatGrid>
      </PageHeader>

      <div className={`flex min-h-0 flex-1 flex-col gap-4 pb-6 ${GUTTER}`}>
      {error && (
        <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </div>
      )}

      {scheduled.length > 0 && (
        <ScheduledSection
          items={scheduled}
          pending={isPending}
          onRestore={restoreScheduled}
          onErase={canErase ? eraseScheduled : undefined}
        />
      )}

      {/* Split: list + detail */}
      <div className="grid min-h-[480px] flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">
        <Panel className="flex min-h-0 flex-col overflow-hidden">
          <div className="flex flex-wrap items-center gap-2.5 border-b border-border px-4 py-3">
            <SearchField value={query} onChange={setQuery} placeholder="Search email, phone, name…" />
            <FilterDropdown label="Status" value={filter} options={statusFilterOptions} onChange={setFilter} />
            <span className="ml-auto text-xs text-fg-muted">
              <span className="font-semibold text-fg">{filtered.length}</span> of {requests.length}
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className={TH}>Requester</th>
                <th className={TH}>Matched account</th>
                <th className={TH}>Reason</th>
                <th className={TH}>Submitted</th>
                <th className={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState title="No requests here" hint="Nothing matches this search and status." />
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
                      className={`cursor-pointer ${TR} ${isSelected ? "bg-bg-elev shadow-[inset_3px_0_0_var(--danger)]" : ""}`}
                    >
                      <td className={TD}>
                        <div className="leading-tight">
                          <div className="font-medium text-fg">{r.email}</div>
                          {r.phone && (
                            <div className="font-mono text-[11px] text-fg-muted">{r.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className={TD}>
                        {r.userId ? (
                          <div className="leading-tight">
                            <div className="text-fg">{r.userName ?? "—"}</div>
                            <div className="font-mono text-[11px] text-fg-muted">{r.userId}</div>
                          </div>
                        ) : (
                          <span className="font-mono text-[11px] text-fg-subtle">no match</span>
                        )}
                      </td>
                      <td className={`${TD} max-w-[240px]`}>
                        <div className="truncate text-fg-muted">{r.reason ?? "—"}</div>
                      </td>
                      <td className={`${TD} whitespace-nowrap text-fg-muted`}>{r.createdAgo}</td>
                      <td className={TD}>
                        <StatusPill color={meta.color} label={meta.label} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          </div>
        </Panel>

        {/* Detail panel */}
        <Panel as="aside" className="min-h-0 overflow-hidden">
          {selected ? (
            <DetailPanel
              request={selected}
              pending={isPending}
              onAction={run}
              onAsk={setAsk}
              canErase={canErase}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <EmptyState title="No request selected" hint="Pick a request from the list to review it." />
            </div>
          )}
        </Panel>
      </div>
      </div>

      <ConfirmDialog
        open={ask !== null}
        title={ask?.title ?? ""}
        message={ask?.message ?? ""}
        confirmLabel={ask?.confirmLabel}
        destructive={ask?.destructive}
        requireText={ask?.requireText}
        busy={isPending}
        onConfirm={() => {
          ask?.onYes();
          setAsk(null);
        }}
        onCancel={() => setAsk(null)}
      />
    </div>
  );
}

function DetailPanel({
  request,
  pending,
  onAction,
  onAsk,
  canErase,
}: {
  request: DeletionRequest;
  pending: boolean;
  onAction: (id: string, action: PanelAction) => void;
  onAsk: (ask: Ask) => void;
  canErase: boolean;
}) {
  const [note, setNote] = useState(request.adminNote ?? "");
  const meta = deletionStatusMeta[request.status];

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Request details</h2>
          <StatusPill color={meta.color} label={meta.label} />
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
              {request.erasesAt && (
                <div className="mt-2 rounded-md bg-info/10 px-2.5 py-2 text-[12px] text-fg">
                  Deactivated
                  {request.deactivatedAt
                    ? ` ${new Date(request.deactivatedAt).toLocaleDateString()}`
                    : ""}
                  . Erased {untilErase(request.erasesAt)} (
                  {new Date(request.erasesAt).toLocaleDateString()}).
                </div>
              )}
            </div>
          ) : (
            <p className="mt-2 text-xs text-fg-muted">
              {request.status === "completed"
                ? "The account has been erased."
                : "No account was linked when this was submitted. Deactivating looks the email up again; if nothing matches, close the request."}
            </p>
          )}
        </div>

        {request.status === "pending" && (
          <div className="rounded-lg border border-warn/40 bg-warn/10 p-3 text-[12px] leading-relaxed text-fg">
            <div className="font-semibold">Confirm it&rsquo;s really them first</div>
            Anyone can submit this form with any email address. Before you
            deactivate, email{" "}
            <a href={`mailto:${request.email}`} className="font-medium underline">
              {request.email}
            </a>{" "}
            and wait for a reply from that address confirming the request. Note
            the reply in the admin note below.
          </div>
        )}

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
            className="mt-1.5 w-full resize-none rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-fg placeholder:text-fg-subtle focus:border-fg-muted focus:outline-none focus:ring-1 focus:ring-fg-muted/30"
          />
        </div>
      </div>

      <footer className="space-y-2 border-t border-border px-5 py-4">
        {request.status === "pending" && (
          <>
            <button
              onClick={() =>
                onAsk({
                  title: `Deactivate ${request.email}?`,
                  message:
                    "They're signed out everywhere and stop getting alerts. They can restore it by signing in within 30 days; after that it's erased automatically, keeping a limited legal record for 12 months.",
                  confirmLabel: "Deactivate",
                  destructive: true,
                  onYes: () => onAction(request.id, { kind: "deactivate", note }),
                })
              }
              disabled={pending}
              className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-danger text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              Deactivate account
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onAction(request.id, { kind: "status", status: "rejected", note })}
                disabled={pending}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-bg-card text-sm font-medium hover:border-border-strong disabled:opacity-50 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => onAction(request.id, { kind: "status", status: "completed", note })}
                disabled={pending}
                title="For a request no account matches"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-bg-card text-sm font-medium hover:border-border-strong disabled:opacity-50 transition-colors"
              >
                Close (no account)
              </button>
            </div>
          </>
        )}
        {request.status === "in_progress" && request.userId && (
          <button
            onClick={() =>
              onAsk({
                title: `Restore ${request.email}?`,
                message: "They'll be able to sign in and use it again.",
                confirmLabel: "Restore",
                onYes: () =>
                  onAction(request.id, {
                    kind: "restore",
                    userId: request.userId!,
                    note,
                  }),
              })
            }
            disabled={pending}
            className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-border bg-bg-card text-sm font-medium hover:border-border-strong disabled:opacity-50 transition-colors"
          >
            Restore account
          </button>
        )}
        {request.status === "in_progress" && request.userId && canErase && (
          <button
            onClick={() =>
              onAsk({
                title: `Erase ${request.email} now?`,
                message: ERASE_MESSAGE,
                confirmLabel: "Erase now",
                destructive: true,
                requireText: request.email,
                onYes: () =>
                  onAction(request.id, { kind: "erase", userId: request.userId! }),
              })
            }
            disabled={pending}
            className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-danger/50 text-sm font-medium text-danger hover:bg-danger/10 disabled:opacity-50 transition-colors"
          >
            Erase now
          </button>
        )}
        {request.status === "rejected" && (
          <button
            onClick={() => onAction(request.id, { kind: "status", status: "pending", note })}
            disabled={pending}
            className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-border bg-bg-card text-sm font-medium hover:border-border-strong disabled:opacity-50 transition-colors"
          >
            Reopen request
          </button>
        )}
      </footer>
    </div>
  );
}

/** Accounts waiting out their 30 days, including deletions made in the app. */
function ScheduledSection({
  items,
  pending,
  onRestore,
  onErase,
}: {
  items: ScheduledDeletion[];
  pending: boolean;
  onRestore: (s: ScheduledDeletion) => void;
  /** Absent for moderators. */
  onErase?: (s: ScheduledDeletion) => void;
}) {
  return (
    <details className="shrink-0 rounded-2xl border border-warn/30 bg-warn/5 px-5 py-3.5" open>
      <summary className="cursor-pointer text-sm font-semibold">
        Scheduled to be erased{" "}
        <span className="ml-1 rounded-md bg-warn/15 px-1.5 py-px font-mono text-[11px] text-warn">{items.length}</span>
        <span className="ml-2 text-xs font-normal text-fg-muted">
          Includes people who deleted their account in the app
        </span>
      </summary>
      <table className="mt-3 w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
            <th className="py-2 font-medium">Account</th>
            <th className="py-2 font-medium">Deactivated</th>
            <th className="py-2 font-medium">Erased</th>
            <th className="py-2 font-medium">Source</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.userId} className="border-t border-border">
              <td className="py-2.5 pr-4">
                <div className="font-medium">{s.name}</div>
                <div className="text-[11px] text-fg-muted">{s.email ?? s.userId}</div>
              </td>
              <td className="py-2.5 pr-4 text-fg-muted">
                {new Date(s.deactivatedAt).toLocaleDateString()}
              </td>
              <td className="py-2.5 pr-4">
                {untilErase(s.erasesAt)}{" "}
                <span className="text-fg-muted">
                  ({new Date(s.erasesAt).toLocaleDateString()})
                </span>
              </td>
              <td className="py-2.5 pr-4 text-fg-muted">
                {s.hasRequest ? "Request below" : "In the app"}
              </td>
              <td className="space-x-2 py-2.5 text-right">
                <button
                  onClick={() => onRestore(s)}
                  disabled={pending}
                  className={`${btnSm.ghost} bg-bg-card`}
                >
                  Restore
                </button>
                {onErase && (
                  <button
                    onClick={() => onErase(s)}
                    disabled={pending}
                    className={btnSm.danger}
                  >
                    Erase now
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
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
