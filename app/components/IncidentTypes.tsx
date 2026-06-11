import { Reveal } from "./Reveal";

const types = [
  { label: "Fire", color: "#ef4444", icon: <FireIcon /> },
  { label: "Car Crash", color: "#f59e0b", icon: <CrashIcon /> },
  { label: "Medical", color: "#22c55e", icon: <MedicalIcon /> },
  { label: "Flood", color: "#3b82f6", icon: <DropIcon /> },
  { label: "Armed", color: "#dc2626", icon: <ShieldAlertIcon /> },
  { label: "Robbery", color: "#e11d48", icon: <MaskIcon /> },
  { label: "Bandits", color: "#f43f5e", icon: <CrosshairIcon /> },
  { label: "Kidnapping", color: "#8b5cf6", icon: <UserOffIcon /> },
  { label: "Hoodlums", color: "#fb923c", icon: <UsersIcon /> },
  { label: "Cultists", color: "#06b6d4", icon: <SkullIcon /> },
  { label: "Protest", color: "#eab308", icon: <MegaphoneIcon /> },
  { label: "Collapse", color: "#3b82f6", icon: <BuildingIcon /> },
  { label: "Traffic", color: "#fb923c", icon: <ConeIcon /> },
  { label: "Power", color: "#eab308", icon: <BoltIcon /> },
  { label: "Boat", color: "#2563eb", icon: <BoatIcon /> },
  { label: "Other", color: "#a3a3a3", icon: <DotsIcon /> },
];

export function IncidentTypes() {
  return (
    <section className="relative overflow-hidden border-b border-border py-24">
      <div className="absolute inset-0 bg-grid opacity-30" aria-hidden />
      <div className="absolute inset-0 glow-ambient opacity-50" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-5">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-muted">Coverage</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              One app. Every kind of emergency.
            </h2>
            <p className="mt-5 max-w-md text-pretty text-base text-fg-muted">
              From house fires to highway pile-ups to armed threats — Kasala covers the full spectrum
              of what your community needs to know about, the moment it happens.
            </p>
            <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3">
              <MiniStat value="16+" label="Incident types" />
              <MiniStat value="24/7" label="Always monitoring" />
              <MiniStat value="<12s" label="Report to alert" />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {types.map((t) => (
                <div
                  key={t.label}
                  className="group relative flex flex-col items-center gap-2.5 overflow-hidden rounded-xl border border-border bg-bg-card px-2 py-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong"
                >
                  <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110"
                    style={{
                      color: t.color,
                      background: `color-mix(in oklab, ${t.color} 14%, transparent)`,
                    }}
                  >
                    {t.icon}
                  </span>
                  <span className="text-[11px] font-medium text-fg-muted">{t.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-mono text-2xl font-semibold tracking-tight text-fg">{value}</div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wider text-fg-subtle">{label}</div>
    </div>
  );
}

/* icons */
function FireIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.4 0 2.5-1.1 2.5-2.5 0-1.4-2.5-3-2.5-3s-2.5 1.6-2.5 3z"/><path d="M19.5 14.5c0 4.1-3.4 7.5-7.5 7.5S4.5 18.6 4.5 14.5c0-1.6.5-3.1 1.4-4.4 1.7-2.6 5.6-3.6 6.1-7.1.5 1.5 1.5 2.5 3.5 3.5 2.4 1.2 4 3.6 4 7.5z"/></svg>; }
function CrashIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 17h14"/><path d="M5 17l2-5h10l2 5"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/><path d="M12 3l-1 4M16 3l-2 4M8 3l1 4"/></svg>; }
function MedicalIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 5v14M5 12h14"/></svg>; }
function DropIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 2.5s6 7 6 11.5a6 6 0 0 1-12 0c0-4.5 6-11.5 6-11.5z"/></svg>; }
function ShieldAlertIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function MaskIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 8c0-1 1-2 3-2 2.5 0 3.5 1.5 6 1.5S18.5 6 21 6c2 0 3 1 3 2v3c0 4-4 7-9 7s-9-3-9-7z" transform="translate(-1.5 1)"/><circle cx="8.5" cy="11" r="1.2"/><circle cx="15.5" cy="11" r="1.2"/></svg>; }
function CrosshairIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="8"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>; }
function UserOffIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><line x1="17" y1="8" x2="23" y2="8"/></svg>; }
function UsersIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function SkullIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="9" cy="11" r="1"/><circle cx="15" cy="11" r="1"/><path d="M8 20v-2a2 2 0 0 0-1-1.73A7 7 0 1 1 17 16.27 2 2 0 0 0 16 18v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1z"/></svg>; }
function MegaphoneIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 11l15-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>; }
function BuildingIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 21h18M6 21V7l6-4 6 4v14"/><path d="M9 9h.01M9 13h.01M15 9h.01M15 13h.01"/></svg>; }
function ConeIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9.3 9.5L12 3l2.7 6.5M7.5 14l-2 6h13l-2-6M6 20h12"/><path d="M8.2 14h7.6"/></svg>; }
function BoltIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>; }
function BoatIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 15l1.8 5.2a1 1 0 0 0 .95.8h12.5a1 1 0 0 0 .95-.8L21 15"/><path d="M4 15l8-3 8 3"/><path d="M12 12V5l5 4"/><path d="M12 5L7 8"/></svg>; }
function DotsIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>; }
