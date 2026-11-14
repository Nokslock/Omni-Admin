"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "../../_components/ConfirmDialog";
import { toast } from "../../_components/toast";
import { removeIncidentPhoto, restoreInstantVerification } from "../actions";

/** The report's photo, with a way to take it down. */
export function ReportPhoto({ incidentId, url }: { incidentId: string; url: string }) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    const res = await removeIncidentPhoto(incidentId);
    setBusy(false);
    setAsking(false);
    if ("error" in res) toast(res.error, "error");
    else {
      toast("Photo removed.", "success");
      router.refresh();
    }
  }

  return (
    <div>
      <a href={url} target="_blank" rel="noreferrer" className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Photo taken with the report"
          className="max-h-80 w-full rounded-lg border border-border object-cover"
        />
      </a>
      <div className="mt-2 flex items-center justify-between text-xs text-fg-muted">
        <span>Public: everyone who opens this report sees it.</span>
        <button
          onClick={() => setAsking(true)}
          className="inline-flex h-8 items-center rounded-md border border-danger/50 px-3 font-medium text-danger hover:bg-danger/10"
        >
          Remove photo
        </button>
      </div>
      <ConfirmDialog
        open={asking}
        title="Remove this photo?"
        message="It's taken off the report for everyone and the file is deleted. The report itself stays."
        confirmLabel="Remove photo"
        destructive
        busy={busy}
        onConfirm={remove}
        onCancel={() => setAsking(false)}
      />
    </div>
  );
}

/** Turns a Pro reporter's instant verification back on. */
export function RestoreInstantButton({
  userId,
  incidentId,
}: {
  userId: string;
  incidentId: string;
}) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);

  async function restore() {
    setBusy(true);
    const res = await restoreInstantVerification(userId, incidentId);
    setBusy(false);
    setAsking(false);
    if ("error" in res) toast(res.error, "error");
    else {
      toast("Instant verification restored.", "success");
      router.refresh();
    }
  }

  return (
    <>
      <button
        onClick={() => setAsking(true)}
        className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-md border border-border bg-bg-card text-xs font-medium hover:border-border-strong"
      >
        Restore instant verification
      </button>
      <ConfirmDialog
        open={asking}
        title="Restore instant verification?"
        message="Their reports will be verified on arrival again when they vouch for them. Their false-alarm count starts again from zero."
        confirmLabel="Restore"
        busy={busy}
        onConfirm={restore}
        onCancel={() => setAsking(false)}
      />
    </>
  );
}
