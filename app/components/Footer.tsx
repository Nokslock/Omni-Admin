export function Footer() {
  return (
    <footer className="py-12">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <LogoMark />
              <span>Omni</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-fg-muted">
              A real-time, community-driven emergency notification system. Built for Nigerian
              cities — owned by the people who live in them.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm md:grid-cols-3">
            <a href="#privacy" className="text-fg-muted hover:text-fg">Privacy</a>
            <a href="#terms" className="text-fg-muted hover:text-fg">Terms</a>
            <a href="#support" className="text-fg-muted hover:text-fg">Support</a>
            <a href="#status" className="text-fg-muted hover:text-fg">Status</a>
            <a href="#contact" className="text-fg-muted hover:text-fg">Contact</a>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 md:flex-row md:items-center">
          <div className="font-mono text-[10px] uppercase tracking-wider text-fg-subtle">
            <span className="text-ok">●</span> SYS.STAT: NOMINAL
            <span className="mx-2 text-fg-subtle">·</span>
            NET.UP: 99.998%
            <span className="mx-2 text-fg-subtle">·</span>
            NODES: 14,289
          </div>
          <div className="text-[11px] text-fg-subtle">
            © {new Date().getFullYear()} Omni. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

function LogoMark() {
  return (
    <span className="relative inline-flex h-5 w-5 items-center justify-center">
      <span className="absolute inset-0 rounded-full border border-fg" />
      <span className="h-1.5 w-1.5 rounded-full bg-fg" />
    </span>
  );
}
