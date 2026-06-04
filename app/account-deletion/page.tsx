import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { RequestForm } from "./RequestForm";

export const metadata: Metadata = {
  title: "Delete your account",
  description:
    "Request that your Kasala account and personal data be permanently deleted. Required by Google Play for app developers.",
  alternates: { canonical: "/account-deletion" },
  openGraph: {
    url: "/account-deletion",
    title: "Delete your Kasala account",
    description:
      "Request permanent deletion of your Kasala account and associated data.",
  },
};

export default function AccountDeletionPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
        <header className="mb-10 border-b border-border pb-8">
          <nav className="mb-4 text-xs text-fg-muted">
            <Link href="/" className="hover:text-fg">
              ← Back to home
            </Link>
          </nav>
          <h1 className="text-4xl font-semibold tracking-tight">
            Delete your account
          </h1>
          <p className="mt-3 text-base leading-relaxed text-fg-muted">
            We respect your right to leave Kasala at any time. Submit the form
            below and we&rsquo;ll permanently delete your account and the data
            we hold about you.
          </p>
        </header>

        <section className="mb-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-bg-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-fg-muted">
              <CheckIcon />
              What gets deleted
            </h2>
            <ul className="mt-4 ml-5 list-disc space-y-1.5 text-sm leading-relaxed text-fg">
              <li>Your profile (name, email, phone number)</li>
              <li>Saved alert preferences and radius</li>
              <li>Devices linked to your account</li>
              <li>Personal identifiers tied to your reports</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-bg-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-fg-muted">
              <ArchiveIcon />
              What we may retain
            </h2>
            <ul className="mt-4 ml-5 list-disc space-y-1.5 text-sm leading-relaxed text-fg">
              <li>
                Anonymised incident records (the safety map relies on them)
              </li>
              <li>Records we&rsquo;re legally required to keep</li>
              <li>Aggregated, non-identifying analytics</li>
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-bg-card p-6 sm:p-8">
          <h2 className="text-lg font-semibold tracking-tight">Submit a request</h2>
          <p className="mt-1.5 text-sm text-fg-muted">
            Fill this in with the email you used to sign up. We&rsquo;ll confirm
            once your account is gone.
          </p>
          <div className="mt-7">
            <RequestForm />
          </div>
        </section>

        <section className="mt-10 rounded-lg border border-border bg-bg-elev/40 px-4 py-3 text-sm text-fg-muted">
          Prefer email? Write to{" "}
          <a href="mailto:Support@kasalaalert.com" className="font-medium text-fg hover:underline">
            Support@kasalaalert.com
          </a>{" "}
          from your account email and we&rsquo;ll handle it manually.
        </section>

        <section className="mt-10 border-t border-border pt-6 text-sm text-fg-muted">
          See also our{" "}
          <Link href="/privacy" className="font-medium text-fg hover:underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="font-medium text-fg hover:underline">
            Terms of Service
          </Link>
          .
        </section>
      </main>
      <Footer />
    </>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-danger" aria-hidden>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ok" aria-hidden>
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}
