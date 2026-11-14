"use client";

import { useEffect, useState } from "react";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  busy = false,
  requireText,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  /**
   * For actions that can't be undone: the confirm button stays disabled until
   * this exact text (case-insensitive) is typed.
   */
  requireText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [typed, setTyped] = useState("");
  const [wasOpen, setWasOpen] = useState(open);
  // Start empty every time the dialog opens.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setTyped("");
  }
  const matches =
    !requireText || typed.trim().toLowerCase() === requireText.trim().toLowerCase();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-card p-5 shadow-2xl shadow-black/40">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <p className="mt-1.5 whitespace-pre-line text-sm text-fg-muted">{message}</p>
        {requireText && (
          <label className="mt-4 block">
            <span className="text-xs text-fg-muted">
              Type <span className="font-semibold text-fg">{requireText}</span> to confirm
            </span>
            <input
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && matches && !busy) onConfirm();
              }}
              className="mt-1.5 h-10 w-full rounded-lg border border-border bg-bg-elev px-3 text-sm text-fg focus:border-fg-muted focus:outline-none focus:ring-1 focus:ring-fg-muted/30"
            />
          </label>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex h-9 items-center rounded-md border border-border bg-bg-card px-4 text-sm font-medium hover:border-border-strong transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy || !matches}
            className={`inline-flex h-9 items-center rounded-md px-4 text-sm font-semibold transition-colors disabled:opacity-60 ${
              destructive
                ? "bg-danger text-white hover:bg-danger/90"
                : "bg-fg text-bg hover:opacity-90"
            }`}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
