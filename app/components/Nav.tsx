import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "#how", label: "How it works" },
  { href: "#app", label: "The app" },
  { href: "#coverage", label: "Coverage" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <a href="#" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <LogoMark />
          <span>Kasala</span>
        </a>
        <nav className="hidden items-center gap-7 text-sm text-fg-muted md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-fg transition-colors">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="/admin/login"
            className="inline-flex h-9 items-center rounded-md bg-fg px-3.5 text-sm font-medium text-bg hover:opacity-90 transition-opacity"
          >
            Sign In
          </a>
        </div>
      </div>
    </header>
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
