import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Get in touch with the Kasala team for help, feedback, or account-related questions.",
  alternates: { canonical: "/support" },
  openGraph: {
    url: "/support",
    title: "Support — Kasala",
    description:
      "Get in touch with the Kasala team for help, feedback, or account-related questions.",
  },
};

export default function SupportPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
        <header className="mb-10 border-b border-border pb-8">
          <nav className="mb-4 text-xs text-fg-muted">
            <Link href="/" className="hover:text-fg">← Back to home</Link>
          </nav>
          <h1 className="text-4xl font-semibold tracking-tight">Support</h1>
          <p className="mt-2 text-sm text-fg-muted">
            We&rsquo;re here to help. Reach out and a real person will get back to you.
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-bg-card p-6 sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
            Contact
          </h2>

          <div className="mt-5 space-y-4">
            <ContactRow label="Email">
              <a
                href="mailto:Support@kasalaalert.com"
                className="font-medium text-fg hover:underline"
              >
                Support@kasalaalert.com
              </a>
            </ContactRow>
            <ContactRow label="Company">
              <span className="text-fg">Kasala Alert</span>
            </ContactRow>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-fg-muted">
            Please include your account email and a short description of the issue. Screenshots
            help us debug app issues faster. We aim to respond within 1&ndash;2 business days.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight">What we can help with</h2>
          <ul className="mt-4 ml-5 list-disc space-y-1.5 text-[15px] leading-relaxed text-fg">
            <li>Account access, sign-in, or password issues</li>
            <li>Bug reports or unexpected app behavior</li>
            <li>Feedback and feature requests</li>
            <li>Data, privacy, or account-deletion requests</li>
            <li>Press and partnership inquiries</li>
          </ul>
        </section>

        <section className="mt-10 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          Kasala is <span className="uppercase">not </span> a substitute for emergency services. If
          there&rsquo;s an emergency, call the police or your local emergency number immediately.
        </section>

        <section className="mt-10 border-t border-border pt-6 text-sm text-fg-muted">
          See also our{" "}
          <Link href="/privacy" className="font-medium text-fg hover:underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="font-medium text-fg hover:underline">
            Terms of Use
          </Link>
          .
        </section>
      </main>
      <Footer />
    </>
  );
}

function ContactRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
      <dt className="w-24 shrink-0 text-xs uppercase tracking-wider text-fg-subtle">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
