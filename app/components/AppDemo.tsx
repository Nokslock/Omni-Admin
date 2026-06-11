"use client";

import { useState } from "react";

/**
 * Tabbed "how to use the app" walkthrough.
 *
 * Each screen renders a polished CSS mockup that looks good immediately. To
 * swap in a REAL screenshot, drop a PNG/JPG into `public/screens/` using the
 * filename in `SCREENS[].image` (e.g. public/screens/report.png) and it will
 * automatically overlay the CSS mockup. If the file is missing the <img>
 * silently hides itself and the CSS mockup shows through — so the page never
 * breaks while you're still gathering screenshots.
 */

type ScreenKey = "report" | "map" | "alerts" | "settings";

type Screen = {
  key: ScreenKey;
  step: string;
  title: string;
  blurb: string;
  icon: React.ReactNode;
  image: string; // path under /public — drop a file here to use a real screenshot
  render: () => React.ReactNode;
};

export function AppDemo() {
  const [active, setActive] = useState<ScreenKey>("report");

  const screens: Screen[] = [
    {
      key: "report",
      step: "01",
      title: "Report in one tap",
      blurb: "Pick what's happening — your GPS attaches automatically. No typing, no forms.",
      icon: <PlusIcon />,
      image: "/screens/report.png",
      render: () => <ReportScreen />,
    },
    {
      key: "map",
      step: "02",
      title: "Watch your area live",
      blurb: "A real-time map of verified incidents around you, anywhere in the world.",
      icon: <MapIcon />,
      image: "/screens/map.png",
      render: () => <MapScreen />,
    },
    {
      key: "alerts",
      step: "03",
      title: "Get alerted instantly",
      blurb: "Push notifications the moment a verified incident lands inside your radius.",
      icon: <BellIcon />,
      image: "/screens/alerts.png",
      render: () => <AlertsScreen />,
    },
    {
      key: "settings",
      step: "04",
      title: "Tune it to you",
      blurb: "Set your alert radius, sounds, and permissions. You're always in control.",
      icon: <SlidersIcon />,
      image: "/screens/settings.png",
      render: () => <SettingsScreen />,
    },
  ];

  const current = screens.find((s) => s.key === active) ?? screens[0];

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      {/* Step selector — the "how to use" list */}
      <div className="order-2 lg:order-1">
        <ol className="space-y-2.5">
          {screens.map((s) => {
            const isActive = s.key === active;
            return (
              <li key={s.key}>
                <button
                  onClick={() => setActive(s.key)}
                  aria-pressed={isActive}
                  className={`group flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                    isActive
                      ? "border-border-strong bg-bg-card"
                      : "border-border bg-transparent hover:border-border-strong hover:bg-bg-card/50"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                      isActive
                        ? "border-danger/40 bg-danger/10 text-danger"
                        : "border-border bg-bg-elev text-fg-muted group-hover:text-fg"
                    }`}
                  >
                    {s.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] tracking-wider text-fg-subtle">
                        {s.step}
                      </span>
                      <h3 className={`text-sm font-semibold tracking-tight ${isActive ? "text-fg" : "text-fg"}`}>
                        {s.title}
                      </h3>
                    </div>
                    <p
                      className={`mt-1 text-sm leading-relaxed transition-colors ${
                        isActive ? "text-fg-muted" : "text-fg-subtle group-hover:text-fg-muted"
                      }`}
                    >
                      {s.blurb}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Phone preview */}
      <div className="order-1 flex justify-center lg:order-2">
        <PhoneFrame>
          <ScreenSlot image={current.image} alt={current.title}>
            {current.render()}
          </ScreenSlot>
        </PhoneFrame>
      </div>
    </div>
  );
}

/**
 * Wraps a CSS mockup and overlays a real screenshot if one exists at `image`.
 * On a 404 the <img> hides itself, revealing the CSS mockup underneath.
 */
function ScreenSlot({
  image,
  alt,
  children,
}: {
  image: string;
  alt: string;
  children: React.ReactNode;
}) {
  const [showImage, setShowImage] = useState(true);
  return (
    <div className="relative h-full w-full">
      {children}
      {showImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setShowImage(false)}
        />
      )}
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-float">
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
        <div className="ml-0.5 flex h-2.5 w-5 items-center rounded-[3px] border border-current">
          <div className="m-[1px] h-1.5 w-3 rounded-[1px] bg-current" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Screen 1 · Report ─────────────────────────── */

function ReportScreen() {
  const categories = [
    { label: "Fire", color: "#ef4444", icon: <FireIcon /> },
    { label: "Crash", color: "#f59e0b", icon: <CrashIcon /> },
    { label: "Armed", color: "#dc2626", icon: <ShieldAlertIcon /> },
    { label: "Medical", color: "#22c55e", icon: <MedicalIcon /> },
    { label: "Flood", color: "#3b82f6", icon: <DropIcon /> },
    { label: "Other", color: "#a3a3a3", icon: <DotsIcon /> },
  ];
  return (
    <div className="flex h-full flex-col text-white">
      <StatusBar />
      <div className="flex items-center justify-between px-5 pt-4">
        <span className="text-sm font-semibold">Report incident</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-ok/15 px-2 py-0.5 text-[9px] font-semibold text-ok">
          <span className="h-1.5 w-1.5 rounded-full bg-ok" /> GPS LOCKED
        </span>
      </div>

      <div className="mx-5 mt-4 overflow-hidden rounded-2xl border border-white/10">
        <div className="relative h-24 bg-[#11151b]">
          <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <span className="absolute -inset-3 rounded-full bg-info/40 blur-md animate-pulse-dot" />
              <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-info" />
            </div>
          </div>
          <div className="absolute bottom-2 left-2.5 font-mono text-[9px] text-white/60">
            location auto-attached · ±4m
          </div>
        </div>
      </div>

      <div className="mt-5 px-5">
        <div className="font-mono text-[9px] uppercase tracking-wider text-white/40">What&apos;s happening?</div>
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {categories.map((c, i) => (
            <div
              key={c.label}
              className={`flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border ${
                i === 0 ? "border-danger bg-danger/12" : "border-white/8 bg-white/[0.03]"
              }`}
            >
              <span style={{ color: c.color }}>{c.icon}</span>
              <span className="text-[10px] font-medium text-white/85">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto px-5 pb-7">
        <div className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-danger text-sm font-semibold text-white shadow-lg shadow-danger/30">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-white animate-ping-slow" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          Send alert
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Screen 2 · Live Map ───────────────────────── */

function MapScreen() {
  const pins = [
    { x: "26%", y: "30%", c: "#ef4444" },
    { x: "62%", y: "24%", c: "#f59e0b" },
    { x: "44%", y: "52%", c: "#3b82f6" },
    { x: "72%", y: "62%", c: "#22c55e" },
    { x: "20%", y: "68%", c: "#eab308" },
  ];
  return (
    <div className="relative flex h-full flex-col text-white">
      <div className="absolute inset-0 bg-[#0b0e13]" aria-hidden />
      <div className="absolute inset-0 bg-grid opacity-30" aria-hidden />

      {/* radius rings centered on user */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden>
        <div className="h-56 w-56 rounded-full border border-danger/15" />
        <div className="absolute inset-0 m-auto h-36 w-36 rounded-full border border-danger/25" />
        <div className="absolute inset-0 m-auto h-20 w-20 rounded-full border border-danger/40" />
      </div>

      {/* incident pins */}
      {pins.map((p, i) => (
        <span
          key={i}
          className="absolute"
          style={{ left: p.x, top: p.y }}
          aria-hidden
        >
          <span className="absolute -inset-1.5 rounded-full blur-[3px]" style={{ background: `${p.c}55` }} />
          <span className="relative block h-2.5 w-2.5 rounded-full border border-white/70" style={{ background: p.c }} />
        </span>
      ))}

      {/* user dot */}
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden>
        <span className="absolute -inset-2 rounded-full bg-info/40 blur-sm animate-pulse-dot" />
        <span className="relative block h-3 w-3 rounded-full border-2 border-white bg-info" />
      </span>

      <div className="relative z-10">
        <StatusBar />
        <div className="flex items-center justify-between px-5 pt-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            Kasala
            <span className="inline-flex items-center gap-1 rounded-md border border-danger/40 bg-danger/15 px-1.5 py-0.5 text-[9px] font-semibold text-danger">
              <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse-dot" /> LIVE
            </span>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5">
            <SlidersIcon />
          </span>
        </div>
      </div>

      {/* bottom incident card */}
      <div className="relative z-10 mt-auto px-4 pb-5">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-3 py-3 backdrop-blur">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-danger/20 text-danger">
            <FireIcon />
          </span>
          <div className="flex-1 leading-tight">
            <div className="text-[11px] font-semibold">Fire reported · 320m away</div>
            <div className="text-[10px] text-white/55">Verified · 12s ago</div>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40" aria-hidden>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Screen 3 · Alerts ─────────────────────────── */

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
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5">
          <SlidersIcon />
        </span>
      </div>

      <div className="relative mx-4 mt-4 h-[58px]">
        <div className="absolute inset-0 animate-incoming">
          <div className="flex h-full items-center gap-3 rounded-xl border border-danger/40 bg-danger/15 px-3 backdrop-blur">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-danger/25 text-danger">
              <FireIcon />
              <span className="absolute -inset-1 rounded-lg border border-danger/40 animate-pulse-dot" />
            </span>
            <div className="flex-1 leading-tight">
              <div className="text-[11px] font-semibold">Fire reported · 320m</div>
              <div className="text-[10px] text-white/60">Near you · 12s ago</div>
            </div>
            <span className="font-mono text-[9px] text-danger">NEW</span>
          </div>
        </div>
      </div>

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

/* ─────────────────────────── Screen 4 · Settings ───────────────────────── */

function SettingsScreen() {
  return (
    <div className="flex h-full flex-col text-white">
      <StatusBar />
      <div className="px-5 pt-4 text-sm font-semibold">Settings</div>

      <div className="mt-4 px-4">
        <div className="font-mono text-[9px] uppercase tracking-wider text-white/40">Preferences</div>
        <div className="mt-2 overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02]">
          <SettingRow icon={<TargetIcon />} tint="#6366f1" label="Alert radius" value="5.0 km" chevron />
          <SettingRow icon={<BellIcon />} tint="#ef4444" label="Critical alerts" value="Wake screen" toggle />
          <SettingRow icon={<SpeakerIcon />} tint="#eab308" label="Alert sound" value="On new alerts" toggle />
          <SettingRow icon={<PaletteIcon />} tint="#a855f7" label="Appearance" value="Dark" chevron last />
        </div>
      </div>

      <div className="mt-5 px-4">
        <div className="font-mono text-[9px] uppercase tracking-wider text-white/40">Permissions</div>
        <div className="mt-2 overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02]">
          <SettingRow icon={<PinIcon />} tint="#3b82f6" label="Location" value="Allowed" dot="#22c55e" />
          <SettingRow icon={<TargetIcon />} tint="#22c55e" label="Background location" value="Always" dot="#22c55e" />
          <SettingRow icon={<BellIcon />} tint="#ef4444" label="Notifications" value="Allowed" dot="#22c55e" last />
        </div>
      </div>
    </div>
  );
}

function SettingRow({
  icon,
  tint,
  label,
  value,
  toggle = false,
  chevron = false,
  dot,
  last = false,
}: {
  icon: React.ReactNode;
  tint: string;
  label: string;
  value: string;
  toggle?: boolean;
  chevron?: boolean;
  dot?: string;
  last?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 ${last ? "" : "border-b border-white/6"}`}>
      <span
        className="flex h-7 w-7 items-center justify-center rounded-lg"
        style={{ background: `color-mix(in oklab, ${tint} 22%, transparent)`, color: tint }}
      >
        {icon}
      </span>
      <div className="flex-1 leading-tight">
        <div className="text-[11px] font-medium">{label}</div>
        <div className="text-[9px] text-white/45">{value}</div>
      </div>
      {toggle && (
        <span className="flex h-4 w-7 items-center rounded-full bg-danger px-0.5">
          <span className="ml-auto h-3 w-3 rounded-full bg-white" />
        </span>
      )}
      {dot && <span className="h-2 w-2 rounded-full" style={{ background: dot }} />}
      {chevron && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30" aria-hidden>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </div>
  );
}

/* ─────────────────────────── shared bits ───────────────────────────────── */

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
function SlidersIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>; }
function TargetIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>; }
function SpeakerIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>; }
function PaletteIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1 0 1.8-.8 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H16c3.3 0 6-2.7 6-6 0-4.4-4.5-8-10-8z"/></svg>; }
function PinIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
