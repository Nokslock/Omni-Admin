import { Reveal } from "./Reveal";

export function AppShowcase() {
  return (
    <section className="relative overflow-hidden border-b border-border py-28">
      <div className="absolute inset-0 bg-grid opacity-30" aria-hidden />
      <div
        className="absolute inset-x-0 top-1/3 mx-auto h-[420px] w-[80%] max-w-3xl rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(ellipse, color-mix(in oklab, var(--danger) 22%, transparent), transparent 60%)" }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-muted">The Omni App</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
              One tap to report. One push to know.
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 text-pretty text-base text-fg-muted">
              Designed to be fast under pressure. Big targets, no menus, no logins to bury the moment.
            </p>
          </Reveal>
        </div>

        <div className="mt-20 grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <Reveal className="flex justify-center lg:justify-end">
            <PhoneFrame rotate="-3deg" floatClass="animate-float">
              <ReportScreen />
            </PhoneFrame>
          </Reveal>
          <Reveal delay={120} className="flex justify-center lg:justify-start">
            <PhoneFrame rotate="3deg" floatClass="animate-float-delayed">
              <AlertsScreen />
            </PhoneFrame>
          </Reveal>
        </div>

        <Reveal delay={200} className="mt-20 grid gap-6 sm:grid-cols-3">
          {[
            { k: "Auto-GPS", v: "Location attaches itself. No typing required." },
            { k: "Offline-safe", v: "Reports queue if signal drops and send when you reconnect." },
            { k: "Anonymous", v: "Your identity is never shared with other reporters." },
          ].map((b) => (
            <div key={b.k} className="rounded-lg border border-border bg-bg-card p-5">
              <div className="font-mono text-[10px] uppercase tracking-wider text-fg-subtle">{b.k}</div>
              <div className="mt-2 text-sm leading-relaxed text-fg-muted">{b.v}</div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function PhoneFrame({
  children,
  rotate,
  floatClass,
}: {
  children: React.ReactNode;
  rotate: string;
  floatClass: string;
}) {
  return (
    <div className={floatClass} style={{ transform: `rotate(${rotate})` }}>
      <div className="relative h-[600px] w-[290px] rounded-[44px] border border-border-strong bg-[#0a0a0c] p-2 shadow-2xl shadow-black/60">
        <div className="absolute left-1/2 top-2.5 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-black" aria-hidden />
        <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-[#0f1117]">
          {children}
        </div>
      </div>
    </div>
  );
}

function StatusBar({ tint = "text-white" }: { tint?: string }) {
  return (
    <div className={`flex items-center justify-between px-7 pt-3.5 text-[10px] font-semibold ${tint}`}>
      <span className="font-mono">9:41</span>
      <div className="flex items-center gap-1">
        <svg width="14" height="9" viewBox="0 0 14 9" fill="currentColor" aria-hidden>
          <rect x="0" y="5" width="2" height="4" rx="0.5" />
          <rect x="4" y="3" width="2" height="6" rx="0.5" />
          <rect x="8" y="1" width="2" height="8" rx="0.5" />
          <rect x="12" y="0" width="2" height="9" rx="0.5" />
        </svg>
        <svg width="11" height="7" viewBox="0 0 11 7" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
          <path d="M1 3.5C2.5 2 4 1.5 5.5 1.5S8.5 2 10 3.5" />
          <path d="M3 5C3.7 4.3 4.5 4 5.5 4S7.3 4.3 8 5" />
          <circle cx="5.5" cy="6" r="0.5" fill="currentColor" />
        </svg>
        <div className="ml-0.5 flex h-2.5 w-5 items-center rounded-[3px] border border-current">
          <div className="m-[1px] h-1.5 w-3 rounded-[1px] bg-current" />
        </div>
      </div>
    </div>
  );
}

function ReportScreen() {
  const categories = [
    { label: "Fire", color: "#ef4444", icon: <FireIcon /> },
    { label: "Crash", color: "#f59e0b", icon: <CrashIcon /> },
    { label: "Bandits", color: "#dc2626", icon: <ShieldAlertIcon /> },
    { label: "Medical", color: "#22c55e", icon: <MedicalIcon /> },
    { label: "Flood", color: "#3b82f6", icon: <DropIcon /> },
    { label: "Other", color: "#a3a3a3", icon: <DotsIcon /> },
  ];
  return (
    <div className="flex h-full flex-col text-white">
      <StatusBar />
      <div className="flex items-center justify-between px-5 pt-4">
        <button aria-label="Back" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="text-sm font-semibold">Report incident</span>
        <span className="w-8" />
      </div>

      <div className="mx-5 mt-4 overflow-hidden rounded-2xl border border-white/10">
        <div className="relative h-28 bg-[#11151b]">
          <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <span className="absolute -inset-3 rounded-full bg-info/40 blur-md animate-pulse-dot" />
              <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-info" />
            </div>
          </div>
          <div className="absolute bottom-2 left-2.5 font-mono text-[9px] text-white/60">
            6.4541°N · 3.3947°E · ±4m
          </div>
        </div>
      </div>

      <div className="mt-5 px-5">
        <div className="font-mono text-[9px] uppercase tracking-wider text-white/40">What&apos;s happening?</div>
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {categories.map((c, i) => (
            <button
              key={c.label}
              className={`flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border ${
                i === 0 ? "border-danger bg-danger/12" : "border-white/8 bg-white/[0.03]"
              }`}
            >
              <span style={{ color: c.color }}>{c.icon}</span>
              <span className="text-[10px] font-medium text-white/85">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto px-5 pb-7">
        <div className="mb-3 flex items-center gap-2 text-[10px] text-white/50">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Sending instantly — no review delay</span>
        </div>
        <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-danger text-sm font-semibold text-white shadow-lg shadow-danger/30">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-white animate-ping-slow" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          Send alert
        </button>
      </div>
    </div>
  );
}

const incomingAlerts = [
  { type: "Fire", color: "#ef4444", dist: "320m", icon: <FireIcon /> },
  { type: "Crash", color: "#f59e0b", dist: "1.2km", icon: <CrashIcon /> },
  { type: "Medical", color: "#22c55e", dist: "640m", icon: <MedicalIcon /> },
  { type: "Flood", color: "#3b82f6", dist: "2.1km", icon: <DropIcon /> },
];

function AlertsScreen() {
  return (
    <div className="flex h-full flex-col text-white">
      <StatusBar />
      <div className="flex items-center justify-between px-5 pt-4">
        <div>
          <div className="text-sm font-semibold">Alerts near you</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/50">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-ok animate-ping-slow" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ok" />
            </span>
            Live · radius 1.5km
          </div>
        </div>
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5" aria-label="Settings">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Incoming alert banner */}
      <div className="relative mx-4 mt-4 h-[58px]">
        <div className="absolute inset-0 animate-incoming">
          <div className="flex h-full items-center gap-3 rounded-xl border border-danger/40 bg-danger/15 px-3 backdrop-blur">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-danger/25 text-danger">
              <FireIcon />
              <span className="absolute -inset-1 rounded-lg border border-danger/40 animate-pulse-dot" />
            </span>
            <div className="flex-1 leading-tight">
              <div className="text-[11px] font-semibold">Fire reported · 320m</div>
              <div className="text-[10px] text-white/60">Lagos Island · 12s ago</div>
            </div>
            <span className="font-mono text-[9px] text-danger">NEW</span>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="mt-4 flex-1 overflow-hidden px-4">
        <div className="font-mono text-[9px] uppercase tracking-wider text-white/40">Active · 4 nearby</div>
        <div className="mt-3 space-y-2.5">
          {incomingAlerts.map((a, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ background: `color-mix(in oklab, ${a.color} 18%, transparent)`, color: a.color }}
              >
                {a.icon}
              </span>
              <div className="flex-1 leading-tight">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                  {a.type}
                  <VerifiedBadge />
                </div>
                <div className="text-[10px] text-white/55">{a.dist} away · {i + 1}m ago</div>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30" aria-hidden>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom tab bar */}
      <div className="border-t border-white/8 px-5 py-3">
        <div className="flex justify-around text-[9px] text-white/40">
          <Tab label="Map" icon={<MapIcon />} />
          <Tab label="Alerts" icon={<BellIcon />} active />
          <Tab label="Report" icon={<PlusIcon />} />
        </div>
      </div>
    </div>
  );
}

function Tab({ label, icon, active = false }: { label: string; icon: React.ReactNode; active?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${active ? "text-white" : ""}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-sm bg-ok/15 px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-ok">
      <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <polyline points="20 6 9 17 4 12" />
      </svg>
      verified
    </span>
  );
}

/* icons */
function FireIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.4 0 2.5-1.1 2.5-2.5 0-1.4-2.5-3-2.5-3s-2.5 1.6-2.5 3z"/><path d="M19.5 14.5c0 4.1-3.4 7.5-7.5 7.5S4.5 18.6 4.5 14.5c0-1.6.5-3.1 1.4-4.4 1.7-2.6 5.6-3.6 6.1-7.1.5 1.5 1.5 2.5 3.5 3.5 2.4 1.2 4 3.6 4 7.5z"/></svg>; }
function CrashIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 17h14"/><path d="M5 17l2-5h10l2 5"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/><path d="M12 3l-1 4M16 3l-2 4M8 3l1 4"/></svg>; }
function ShieldAlertIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function MedicalIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 5v14M5 12h14"/></svg>; }
function DropIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 2.5s6 7 6 11.5a6 6 0 0 1-12 0c0-4.5 6-11.5 6-11.5z"/></svg>; }
function DotsIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>; }
function MapIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>; }
function BellIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>; }
function PlusIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
