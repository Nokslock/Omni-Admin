import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms and conditions that govern your use of the Kasala Alert application.",
  alternates: { canonical: "/terms" },
  openGraph: {
    url: "/terms",
    title: "Terms of Use — Kasala",
    description:
      "The terms and conditions that govern your use of the Kasala Alert application.",
  },
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
          <p className="mt-2 text-sm text-fg-muted">Effective Date: June 2026 · Last Updated: June 2026</p>
        </header>

        <article className="space-y-10 text-[15px] leading-relaxed text-fg">
          <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-danger">
            ⚠ Emergency Warning: Do not use this App as a substitute for emergency services. If
            there is an emergency involving risk to life or property, call your local police or
            emergency number (e.g., 112 in the EU/UK, 911 in the USA, 199 in Nigeria) immediately.
          </div>

          <p>
            Welcome to Kasala Alert, a community safety application operated by Kasala Alert
            (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By
            accessing or using the Kasala Alert mobile application or any related services
            (collectively, the &ldquo;App&rdquo; or &ldquo;Service&rdquo;), you agree to be legally
            bound by these Terms of Use (&ldquo;Terms&rdquo;).
          </p>
          <p>If you do not agree to these Terms, you must not use the App.</p>

          <Section title="1. Description of Service">
            <p>
              Kasala Alert is a community-powered safety platform that allows users to:
            </p>
            <Bullets items={[
              "Report neighbourhood dangers, incidents, and hazards",
              "Receive real-time safety alerts relevant to their location",
              "View and engage with community-submitted safety information",
            ]} />
            <p>
              All incident reports are user-generated and may not always be accurate, complete, or
              current. We do not independently verify every report. The App is intended to
              supplement — not replace — official safety services, emergency responders, or law
              enforcement.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>
              You must be at least 18 years old to create an account and use the App. By using the
              App, you confirm that:
            </p>
            <Bullets items={[
              "You are at least 18 years of age",
              "You have the legal capacity to enter into a binding agreement",
              "You are not prohibited from using the App under the laws of your jurisdiction",
            ]} />
            <p>
              The App is not directed at persons under 18. If you are aware of a minor using the
              App, please notify us at{" "}
              <a href="mailto:support@kasalaalert.com" className="hover:underline">support@kasalaalert.com</a>.
            </p>
            <p className="text-fg-muted text-sm">
              EU/UK users: in some EU member states the minimum age for digital consent is 16.
              These Terms set a minimum age of 18 for all users regardless of jurisdiction.
            </p>
          </Section>

          <Section title="3. User Accounts">
            <p>
              To access certain features, you must register for an account. During registration you
              will be asked to provide:
            </p>
            <Bullets items={[
              "Your name",
              "Email address",
              "Location information (as needed to operate the Service)",
            ]} />
            <p>You are responsible for:</p>
            <Bullets items={[
              "Providing accurate and current registration information",
              "Maintaining the confidentiality of your account credentials",
              "All activities that occur under your account",
              "Notifying us immediately at support@kasalaalert.com if you suspect unauthorised access to your account",
            ]} />
            <p>
              We reserve the right to suspend or delete accounts where we have reason to believe
              information provided is inaccurate, false, or in violation of these Terms.
            </p>
          </Section>

          <Section title="4. User Content">
            <SubHeading>4.1 Your Content</SubHeading>
            <p>
              You may submit incident reports, photographs, comments, alerts, and other content
              through the App (&ldquo;User Content&rdquo;). You retain ownership of your User
              Content.
            </p>
            <p>
              By submitting User Content, you grant Kasala Alert a worldwide, non-exclusive,
              royalty-free, sublicensable licence to use, display, reproduce, distribute, and adapt
              your User Content solely for the purpose of operating, providing, and improving the
              Service. This licence ends when you delete your User Content or your account, except
              where your content has been shared with others and they have not deleted it.
            </p>

            <SubHeading>4.2 Your Responsibilities</SubHeading>
            <p>
              You are solely responsible for the accuracy and legality of your User Content. You
              warrant that:
            </p>
            <Bullets items={[
              "You own or have the necessary rights to submit your User Content",
              "Your User Content is accurate to the best of your knowledge",
              "Submitting and using your User Content does not violate any law or the rights of any third party",
            ]} />

            <SubHeading>4.3 Content Moderation</SubHeading>
            <p>
              We reserve the right (but have no obligation) to review, remove, or restrict access
              to User Content that we believe violates these Terms, applicable law, or poses a risk
              to users or third parties. Removal of content does not imply we have reviewed all
              content on the App.
            </p>
          </Section>

          <Section title="5. Prohibited Conduct">
            <p>You agree not to use the App to:</p>
            <Bullets items={[
              "Submit false, misleading, fabricated, or fraudulent incident reports",
              "Harass, threaten, stalk, intimidate, or harm any person",
              "Post content that is unlawful, defamatory, hateful, abusive, obscene, or discriminatory",
              "Share personal information about other individuals without their consent (including names, addresses, or photographs)",
              "Impersonate any person or entity or misrepresent your affiliation with any person or entity",
              "Attempt to gain unauthorised access to, interfere with, or disrupt the App or its servers",
              "Use automated tools, bots, or scrapers to extract data from the App",
              "Use the App for any commercial purpose without our prior written consent",
              "Violate any applicable local, national, or international law or regulation",
              "Encourage or assist any third party to engage in any of the above",
            ]} />
            <p>
              Violation of these prohibitions may result in immediate content removal, account
              suspension or termination, and where required, referral to law enforcement.
            </p>
          </Section>

          <Section title="6. Incident Reports and Alerts">
            <p>
              The App aggregates safety information submitted by users. We do not guarantee the
              accuracy, timeliness, reliability, or completeness of any incident report, alert, or
              notification.
            </p>
            <p>You should:</p>
            <Bullets items={[
              "Exercise independent judgement when acting on information from the App",
              "Verify reports with official sources where possible",
              "Contact appropriate emergency services in any genuine emergency",
            ]} />
            <div className="mt-2 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-danger">
              Do not use the App as a substitute for emergency services. If there is an emergency,
              call the police or your local emergency number.
            </div>
          </Section>

          <Section title="7. Location Information">
            <p>
              The App uses location data to display relevant local incidents and deliver safety
              alerts. We collect location information only where you have granted permission through
              your device settings.
            </p>
            <p>
              You may withdraw location permission at any time via your device settings. Disabling
              location services will limit the App&rsquo;s functionality but will not affect your
              other rights under these Terms.
            </p>
            <p>
              Location data is handled in accordance with our{" "}
              <Link href="/privacy" className="underline hover:text-fg-muted">Privacy Policy</Link>,
              which forms part of these Terms.
            </p>
          </Section>

          <Section title="8. Intellectual Property">
            <p>
              All intellectual property rights in the App, including its software, design,
              interface, logos, trademarks, and Company-created content, are owned by Kasala Alert
              and are protected under applicable intellectual property laws.
            </p>
            <p>
              These Terms do not grant you any rights to our intellectual property except the
              limited right to use the App as set out herein. You must not:
            </p>
            <Bullets items={[
              "Copy, reproduce, modify, or create derivative works from our materials",
              "Reverse engineer, decompile, or disassemble the App",
              "Remove or alter any proprietary notices or labels on the App",
              "Use our trademarks or branding without our prior written consent",
            ]} />
          </Section>

          <Section title="9. Privacy and Data Protection">
            <p>
              Your use of the App is governed by our{" "}
              <Link href="/privacy" className="underline hover:text-fg-muted">Privacy Policy</Link>,
              which is incorporated into these Terms by reference. The Privacy Policy explains how
              we collect, use, share, and protect your personal data, and sets out your rights
              under GDPR (EU), UK GDPR, CCPA (California), and the Nigeria NDPR.
            </p>
            <p>
              By using the App, you acknowledge that you have read and understood our Privacy
              Policy.
            </p>
          </Section>

          <Section title="10. Disclaimer of Warranties">
            <p className="uppercase">
              The App is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis
              without warranty of any kind.
            </p>
            <p className="uppercase">
              To the maximum extent permitted by applicable law, we disclaim all warranties,
              express or implied, including but not limited to:
            </p>
            <Bullets items={[
              "Warranties of merchantability or fitness for a particular purpose",
              "Warranties that the App will be uninterrupted, error-free, or secure",
              "Warranties as to the accuracy, reliability, or completeness of user-generated content",
              "Warranties that defects will be corrected",
            ]} />
          </Section>

          <Section title="11. Limitation of Liability">
            <SubHeading>11.1 General Limitation</SubHeading>
            <p className="uppercase">
              To the maximum extent permitted by applicable law, Kasala Alert, affiliates,
              directors, employees, and agents shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages arising out of or related to your use of
              or inability to use the App, including damages resulting from reliance on
              user-generated content.
            </p>

            <SubHeading>11.2 Liability Cap</SubHeading>
            <p className="uppercase">
              To the maximum extent permitted by applicable law, our total aggregate liability to
              you for any claims arising under these Terms shall not exceed the greater of: (a) the
              amount you paid us in the 12 months preceding the claim (if any), or (b) ₦1,000.
            </p>
          </Section>

          <Section title="12. Termination">
            <SubHeading>12.1 Termination by Us</SubHeading>
            <p>
              We may suspend or terminate your access to the App at any time, with or without
              notice, if:
            </p>
            <Bullets items={[
              "You violate these Terms",
              "We reasonably believe your actions pose a risk to other users, third parties, or the Service",
              "Required by law or a competent authority",
            ]} />
            <p>
              Where feasible and not prohibited by law, we will provide you with notice and an
              explanation of the reason for termination.
            </p>

            <SubHeading>12.2 Termination by You</SubHeading>
            <p>
              You may close your account and stop using the App at any time.
            </p>
          </Section>

          <Section title="13. Changes to These Terms">
            <p>
              We may update these Terms from time to time. For material changes, we will provide at
              least 30 days&rsquo; advance notice via a prominent notice in the App and/or by
              email.
            </p>
            <p>
              Your continued use of the App after the effective date of any revised Terms
              constitutes your acceptance of the changes. If you do not agree to the updated Terms,
              you must stop using the App before the changes take effect.
            </p>
          </Section>

          <Section title="14. Contact Information">
            <p>
              For questions about these Terms, to report violations, or to exercise any rights,
              please contact:
            </p>
            <dl className="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border">
              {[
                { label: "Company", value: "Kasala Alert" },
                {
                  label: "Email",
                  value: (
                    <a href="mailto:support@kasalaalert.com" className="hover:underline">
                      support@kasalaalert.com
                    </a>
                  ),
                },
                {
                  label: "Illegal Content Reports",
                  value: (
                    <>
                      <a href="mailto:support@kasalaalert.com" className="hover:underline">
                        support@kasalaalert.com
                      </a>{" "}
                      — Subject: &ldquo;Illegal Content Report&rdquo;
                    </>
                  ),
                },
                { label: "Response Time", value: "Within 30 days (72 hours to acknowledge)" },
              ].map((r) => (
                <div key={r.label} className="flex gap-4 px-4 py-2.5 text-sm">
                  <dt className="w-44 shrink-0 font-medium text-fg-muted">{r.label}</dt>
                  <dd className="text-fg">{r.value}</dd>
                </div>
              ))}
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

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-4 text-sm font-semibold uppercase tracking-wider text-fg-muted">
      {children}
    </h3>
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
