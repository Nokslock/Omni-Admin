import { Reveal } from "./Reveal";

const items = [
  {
    title: "Weekly digest",
    body: "What happened around you this week or month: how many reports, what kinds, which days and which streets. A quiet summary lands every Monday morning.",
    accent: "#38bdf8",
    icon: <ChartIcon />,
  },
  {
    title: "Family & places",
    body: "Share your location with the family you invite, and watch places that matter — home, work, school — each with its own radius.",
    accent: "#16a34a",
    icon: <HomeIcon />,
    pro: true,
  },
  {
    title: "Missing persons",
    body: "Ask for a missing-person broadcast, checked by our moderators before it goes out. Anyone who has seen them can tell us privately.",
    accent: "#ef4444",
    icon: <PersonIcon />,
  },
  {
    title: "Comments & likes",
    body: "Add what you know, back up a report, and flag comments that cross the line — they're hidden while our team takes a look.",
    accent: "#f59e0b",
    icon: <ChatIcon />,
  },
  {
    title: "Kasala Coins",
    body: "Thank the people whose reports kept you safe with a gift, from a 🌺 Flower to a 👑 Crown, bought with Kasala Coins. Gifts you receive add earnings, which Kasala Pro members can withdraw to their bank account.",
    accent: "#e0a526",
    icon: <CoinIcon />,
  },
  {
    title: "You're in control",
    body: "Quiet hours, muted incident types, hidden alert details, blocking, and one tap to download your data or delete your account.",
    accent: "#a855f7",
    icon: <SlidersIcon />,
  },
];

export function MoreFeatures() {
  return (
    <section id="features" className="relative overflow-hidden border-b border-border py-24">
      <div className="absolute inset-0 glow-soft opacity-50" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-muted">More than alerts</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            Everything your community needs to look out for each other.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f, i) => (
            <Reveal
              key={f.title}
              as="article"
              delay={(i % 3) * 90}
              className="group relative overflow-hidden rounded-2xl border border-border bg-bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-border-strong"
            >
              <div
                className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full opacity-25 blur-2xl transition-opacity group-hover:opacity-50"
                style={{ background: f.accent }}
                aria-hidden
              />
              <div className="relative flex items-center justify-between">
                <span
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ color: f.accent, background: `color-mix(in oklab, ${f.accent} 14%, transparent)` }}
                >
                  {f.icon}
                </span>
                {f.pro && (
                  <span className="rounded-full border border-[#e0a526]/40 bg-[#e0a526]/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#e0a526]">
                    Pro
                  </span>
                )}
              </div>
              <h3 className="relative mt-5 text-base font-semibold tracking-tight">{f.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-fg-muted">{f.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const svg = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function ChartIcon() {
  return (
    <svg {...svg}>
      <path d="M3 3v18h18" />
      <path d="M7 15l4-4 3 3 5-6" />
    </svg>
  );
}
function HomeIcon() {
  return (
    <svg {...svg}>
      <path d="M3 10.5 12 3l9 7.5V21H3z" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg {...svg}>
      <circle cx="12" cy="7" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg {...svg}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function CoinIcon() {
  return (
    <svg {...svg}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5h3.25a1.75 1.75 0 0 1 0 3.5H10.5h2.75a1.75 1.75 0 0 1 0 3.5H9.5M11 8v1.5M11 16.5V18" />
    </svg>
  );
}
function SlidersIcon() {
  return (
    <svg {...svg}>
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
    </svg>
  );
}
