"use client";

import { useEffect, useState } from "react";
import { registerToastHandler, type ToastLevel } from "./toast";

type ToastItem = { id: number; msg: string; level: ToastLevel };

let _id = 0;

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    registerToastHandler((msg, level) => {
      const id = ++_id;
      setItems((prev) => [...prev, { id, msg, level }]);
      setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4000);
    });
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
          className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-xl shadow-black/30 backdrop-blur transition-all ${
            t.level === "error"
              ? "border-danger/30 bg-danger/10 text-danger"
              : t.level === "success"
              ? "border-ok/30 bg-ok/10 text-ok"
              : "border-info/30 bg-info/10 text-info"
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0" aria-hidden>
            {t.level === "error" ? (
              <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
            ) : t.level === "success" ? (
              <><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></>
            ) : (
              <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
            )}
          </svg>
          <span className="max-w-xs leading-snug">{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
