"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "../_components/ConfirmDialog";
import { ProBadge } from "../_components/ProBadge";
import { toast } from "../_components/toast";
import { HIDE_AFTER_REPORTS, relTime, type ModComment } from "../_lib/moderation";
import { setUserStatus } from "../users/actions";
import { deleteComment, dismissReports } from "./actions";
import { btnSm } from "../_components/ui";

type Pending = "delete" | "keep" | "suspend" | null;

/**
 * One comment with its moderation actions. Used on the Moderation page and
 * under each incident.
 */
export function CommentCard({
  comment: c,
  showIncident = true,
}: {
  comment: ModComment;
  showIncident?: boolean;
}) {
  const router = useRouter();
  const [ask, setAsk] = useState<Pending>(null);
  const [busy, setBusy] = useState(false);
  const hidden = c.reports >= HIDE_AFTER_REPORTS;

  async function run() {
    setBusy(true);
    const res =
      ask === "delete"
        ? await deleteComment(c.id, c.incidentId)
        : ask === "keep"
          ? await dismissReports(c.id, c.incidentId)
          : await setUserStatus(c.author!.id, "suspended");
    setBusy(false);
    const done = ask;
    setAsk(null);
    if ("error" in res) {
      toast(res.error, "error");
      return;
    }
    toast(
      done === "delete"
        ? "Comment deleted."
        : done === "keep"
          ? "Reports cleared. The comment is visible again."
          : `${c.author?.name} suspended and signed out.`,
      "success",
    );
    router.refresh();
  }

  const dialog =
    ask === "delete"
      ? {
          title: "Delete this comment?",
          message: "It's removed for everyone. This can't be undone.",
          confirmLabel: "Delete",
          destructive: true,
        }
      : ask === "keep"
        ? {
            title: "Keep this comment?",
            message:
              "Its reports are cleared, so it's visible to everyone again, including the people who reported it.",
            confirmLabel: "Keep comment",
            destructive: false,
          }
        : {
            title: `Suspend ${c.author?.name ?? "this person"}?`,
            message:
              "They're signed out everywhere, stop getting alerts, and can't sign in again until you reinstate them (Users). The app tells them to contact support. Their comments stay until you delete them.",
            confirmLabel: "Suspend",
            destructive: true,
          };

  return (
    <li className="rounded-2xl border border-border bg-bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-elev text-xs font-semibold text-fg-muted"
          aria-hidden
        >
          {(c.author?.name ?? "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold">
            {c.author?.name ?? "Former member"}
            {c.author?.pro && <ProBadge />}
            {c.author?.suspended && (
              <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-danger">
                Suspended
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-fg-muted">
            {c.author?.email ?? ""}
            {c.author?.email ? " · " : ""}
            {relTime(c.createdAt)}
            {showIncident && (
              <>
                {" · on "}
                <Link href={`/admin/incidents/${c.incidentId}`} className="text-fg hover:underline">
                  {c.incidentTitle ?? c.incidentId}
                </Link>
              </>
            )}
          </div>
        </div>
        {c.reports > 0 && (
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
              hidden
                ? "border-danger/40 bg-danger/10 text-danger"
                : "border-warn/40 bg-warn/10 text-warn"
            }`}
          >
            {c.reports} {c.reports === 1 ? "report" : "reports"}
            {hidden ? " · hidden from everyone" : ""}
          </span>
        )}
      </div>

      <p className="mt-4 whitespace-pre-wrap rounded-xl border border-border bg-bg-elev/50 px-4 py-3 text-sm leading-relaxed text-fg">{c.body}</p>

      {c.reporterNames.length > 0 && (
        <p className="mt-2.5 text-xs text-fg-muted">
          Reported by {c.reporterNames.join(", ")}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setAsk("delete")}
          className={btnSm.danger}
        >
          Delete comment
        </button>
        {c.reports > 0 && (
          <button
            onClick={() => setAsk("keep")}
            className={btnSm.ghost}
          >
            Keep (clear reports)
          </button>
        )}
        {c.author && !c.author.suspended && (
          <button
            onClick={() => setAsk("suspend")}
            className={`${btnSm.ghost} ml-auto text-fg-muted`}
          >
            Suspend author
          </button>
        )}
      </div>

      <ConfirmDialog
        open={ask !== null}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        destructive={dialog.destructive}
        busy={busy}
        onConfirm={run}
        onCancel={() => setAsk(null)}
      />
    </li>
  );
}
