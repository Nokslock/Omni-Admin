"use client";

import { useState } from "react";

type Note = { id: string; author: string; initials: string; color: string; body: string; time: string };

const seed: Note[] = [
  {
    id: "n1",
    author: "A. Bello",
    initials: "AB",
    color: "#3b82f6",
    body: "LASTMA notified, ETA 6 min. Witnesses asked to remain on-line.",
    time: "4m ago",
  },
  {
    id: "n2",
    author: "O. Yusuf",
    initials: "OY",
    color: "#a855f7",
    body: "Cross-referenced with two nearby reports — same vehicle description (red Bajaj, 3 occupants).",
    time: "2m ago",
  },
];

export function NotesPanel() {
  const [notes, setNotes] = useState<Note[]>(seed);
  const [draft, setDraft] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setNotes((n) => [
      ...n,
      {
        id: `n${n.length + 1}`,
        author: "A. Bello",
        initials: "AB",
        color: "#3b82f6",
        body: draft.trim(),
        time: "just now",
      },
    ]);
    setDraft("");
  }

  return (
    <section className="rounded-xl border border-border bg-bg-card">
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold tracking-tight">Internal notes</h2>
        <span className="font-mono text-[10px] uppercase tracking-wider text-fg-subtle">
          {notes.length} note{notes.length === 1 ? "" : "s"}
        </span>
      </header>

      <ul className="divide-y divide-border">
        {notes.map((n) => (
          <li key={n.id} className="flex gap-3 px-5 py-4">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
              style={{ background: n.color }}
            >
              {n.initials}
            </span>
            <div className="min-w-0 flex-1 leading-snug">
              <div className="flex items-baseline gap-2 text-xs">
                <span className="font-semibold text-fg">{n.author}</span>
                <span className="text-fg-subtle">{n.time}</span>
              </div>
              <p className="mt-1 text-sm text-fg-muted">{n.body}</p>
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="border-t border-border px-5 py-4">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          placeholder="Add a note — visible to operators only…"
          className="w-full resize-none rounded-lg border border-border bg-bg-elev px-3 py-2.5 text-sm text-fg placeholder:text-fg-subtle focus:border-fg-muted focus:outline-none focus:ring-1 focus:ring-fg-muted/30"
        />
        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-fg-muted">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Confidential · audit-logged
          </div>
          <button
            type="submit"
            disabled={!draft.trim()}
            className="inline-flex h-8 items-center rounded-md bg-fg px-3 text-xs font-medium text-bg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Add note
          </button>
        </div>
      </form>
    </section>
  );
}
