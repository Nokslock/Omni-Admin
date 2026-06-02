import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";

export const metadata: Metadata = {
  title: "Terms of Use — Kasala",
  description:
    "The terms and conditions that govern your use of the Kasala Alert application.",
};

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
        <header className="mb-10 border-b border-border pb-8">
          <nav className="mb-4 text-xs text-fg-muted">
            <Link href="/" className="hover:text-fg">← Back to home</Link>
          </nav>
          <h1 className="text-4xl font-semibold tracking-tight">Terms of Use</h1>
          <p className="mt-2 text-sm text-fg-muted">Last updated: May 2026</p>
        </header>

        <article className="space-y-10 text-[15px] leading-relaxed text-fg">
          <p>
            Welcome to Kasala Alert (&ldquo;App,&rdquo; &ldquo;Service,&rdquo; &ldquo;we,&rdquo;
            &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By accessing or using the App, you agree to be
            bound by these Terms of Use (&ldquo;Terms&rdquo;). If you do not agree to these Terms,
            do not use the App.
          </p>

          <Section title="1. Description of Service">
            <p>
              The App allows users to report neighborhood incidents, receive alerts, and share
              community safety information with other users.
            </p>
            <p>
              The information provided through the App is user-generated and may not always be
              accurate, complete, or current.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>
              You must be at least 13 years old to use the App. By using the App, you represent
              that you meet these requirements.
            </p>
          </Section>

          <Section title="3. User Accounts">
            <p>
              To use certain features of the App, you may be required to create an account and
              provide:
            </p>
            <Bullets items={["Name", "Email address", "Location information"]} />
            <p>
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account.
            </p>
          </Section>

          <Section title="4. User Content">
            <p>
              Users may submit reports, comments, alerts, photographs, or other content
              (&ldquo;User Content&rdquo;).
            </p>
            <p>
              You retain ownership of your User Content. By submitting User Content, you grant us a
              worldwide, non-exclusive, royalty-free license to use, display, reproduce, and
              distribute such content solely for operating and improving the Service.
            </p>
          </Section>

          <Section title="5. Prohibited Conduct">
            <p>You agree not to:</p>
            <Bullets
              items={[
                "Submit false, misleading, or fraudulent reports.",
                "Harass, threaten, or intimidate others.",
                "Post unlawful, defamatory, hateful, or abusive content.",
                "Share personal information about others without their consent.",
                "Attempt to interfere with the security or operation of the App.",
                "Use the App for any unlawful purpose.",
              ]}
            />
            <p>
              We reserve the right to remove content or suspend accounts that violate these Terms.
            </p>
          </Section>

          <Section title="6. Incident Reports and Alerts">
            <p>
              The App provides information reported by users and does not independently verify all
              reports.
            </p>
            <p>
              We do not guarantee the accuracy, reliability, or completeness of any incident
              report, alert, or notification.
            </p>
            <p>
              Users should exercise independent judgment and contact appropriate authorities in
              emergencies.
            </p>
            <div className="mt-2 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-danger">
              Do not use the App as a substitute for emergency services. If there is an emergency,
              call the police or your local emergency number.
            </div>
          </Section>

          <Section title="7. Location Information">
            <p>
              The App uses location information to provide relevant alerts and incident reports in
              your area.
            </p>
            <p>
              You may control certain location permissions through your device settings, although
              disabling location services may limit functionality.
            </p>
          </Section>

          <Section title="8. Intellectual Property">
            <p>
              The App, including its software, design, logos, and content provided by us, is
              protected by intellectual property laws.
            </p>
            <p>
              You may not copy, modify, distribute, or create derivative works from our materials
              without our written permission.
            </p>
          </Section>

          <Section title="9. Disclaimer of Warranties">
            <p className="uppercase">
              The App is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo;
            </p>
            <p className="uppercase">
              To the maximum extent permitted by law, we disclaim all warranties, express or
              implied, including warranties of merchantability, fitness for a particular purpose,
              and non-infringement.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p className="uppercase">
              To the maximum extent permitted by law, we shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages arising out of or related to
              your use of the App.
            </p>
            <p className="uppercase">Our total liability shall not exceed ₦5,000.</p>
          </Section>

          <Section title="11. Termination">
            <p>
              We may suspend or terminate access to the App at any time if you violate these Terms
              or if we determine such action is necessary to protect the Service or its users.
            </p>
          </Section>

          <Section title="12. Changes to These Terms">
            <p>
              We may update these Terms from time to time. Continued use of the App after changes
              become effective constitutes acceptance of the updated Terms.
            </p>
          </Section>

          <Section title="13. Contact Information">
            <p>If you have questions regarding these Terms, contact us at:</p>
            <dl className="mt-3 space-y-1 text-fg">
              <ContactRow label="Email">
                <a href="mailto:Support@kasalaalert.com" className="hover:underline">
                  Support@kasalaalert.com
                </a>
              </ContactRow>
              <ContactRow label="Company">Kasala Alert</ContactRow>
            </dl>
          </Section>
        </article>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold tracking-tight text-fg">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="ml-5 list-disc space-y-1 text-fg">
      {items.map((it) => (
        <li key={it}>{it}</li>
      ))}
    </ul>
  );
}

function ContactRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2 text-sm">
      <dt className="w-20 shrink-0 text-fg-muted">{label}:</dt>
      <dd className="text-fg">{children}</dd>
    </div>
  );
}
