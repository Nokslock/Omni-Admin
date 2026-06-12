import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Kasala Alert collects, uses, shares, and protects your personal information when you use our application.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    url: "/privacy",
    title: "Privacy Policy — Kasala",
    description:
      "How Kasala Alert collects, uses, shares, and protects your personal information.",
  },
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
        <header className="mb-10 border-b border-border pb-8">
          <nav className="mb-4 text-xs text-fg-muted">
            <Link href="/" className="hover:text-fg">← Back to home</Link>
          </nav>
          <h1 className="text-4xl font-semibold tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-sm text-fg-muted">Effective Date: June 2026 · Last Updated: June 2026</p>
        </header>

        <article className="space-y-10 text-[15px] leading-relaxed text-fg">
          <p>
            This Privacy Policy explains how Kasala Alert (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
            &ldquo;us&rdquo;) collects, uses, shares, and protects your personal information when
            you use the Kasala Alert mobile application and related services (collectively, the
            &ldquo;App&rdquo; or &ldquo;Service&rdquo;).
          </p>
          <p>
            By using the App, you acknowledge that you have read and understood this Privacy Policy.
            If you do not agree, please discontinue use of the App.
          </p>

          <Section title="1. Who We Are and How to Contact Us">
            <p>
              Kasala Alert is a community safety platform that enables users to report dangers and
              receive alerts about incidents in their neighbourhood. We are the data controller for
              personal information collected through the App.
            </p>
            <InfoTable
              rows={[
                { label: "Company", value: "Kasala Alert" },
                { label: "Email", value: <a href="mailto:support@kasalaalert.com" className="hover:underline">support@kasalaalert.com</a> },
                { label: "Primary Jurisdiction", value: "Nigeria" },
              ]}
            />
          </Section>

          <Section title="2. Information We Collect">
            <SubHeading>2.1 Information You Provide</SubHeading>
            <Bullets items={[
              "Full name",
              "Email address",
              "Incident reports, descriptions, photos, or other content you submit",
            ]} />

            <SubHeading>2.2 Location Information</SubHeading>
            <p>With your permission, we collect:</p>
            <Bullets items={[
              "Precise GPS location (while using the App or, if you consent, in the background)",
              "Approximate location",
            ]} />
            <p>Location data is used to:</p>
            <Bullets items={[
              "Display neighbourhood incidents relevant to your area",
              "Send localised safety alerts",
              "Improve the accuracy of incident mapping",
            ]} />
            <p>
              You may withdraw location permission at any time via your device settings. Withdrawal
              may limit App functionality.
            </p>

            <SubHeading>2.3 Automatically Collected Information</SubHeading>
            <Bullets items={[
              "Device identifiers (device type, operating system, unique device ID)",
              "App usage data (features used, pages viewed, timestamps)",
              "Crash reports and diagnostic data",
            ]} />

            <SubHeading>2.4 Information from Third Parties</SubHeading>
            <p>
              If you sign in via a third-party service (e.g., Google, Apple), we receive basic
              profile information such as name and email address as permitted by that service and
              your privacy settings.
            </p>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use personal information to:</p>
            <Bullets items={[
              "Create and manage your account",
              "Provide and improve the App, including incident reporting and safety alerts",
              "Display and share incidents relevant to your location with the community",
              "Send you push notifications and alerts (you can opt out in settings)",
              "Communicate with you about the Service, including support and updates",
              "Detect, investigate, and prevent fraud, abuse, and security incidents",
              "Analyse usage trends to improve performance and features",
              "Comply with applicable laws and legal processes",
              "Enforce our Terms of Use and other agreements",
            ]} />
          </Section>

          <Section title="4. How We Share Your Information">
            <p>We do not sell your personal information to third parties.</p>
            <p>We may share information in the following circumstances:</p>

            <SubHeading>4.1 With Other Users</SubHeading>
            <p>
              Incident reports, including associated location data, may be visible to other App
              users as necessary to provide the community alert service. We recommend you do not
              include personal details about yourself or others in incident reports beyond what is
              necessary.
            </p>

            <SubHeading>4.2 With Service Providers</SubHeading>
            <p>
              We share data with third-party vendors who assist with hosting, cloud infrastructure,
              push notifications, analytics, authentication, and customer support. These providers
              process data on our behalf under data processing agreements and are not permitted to
              use it for their own purposes.
            </p>

            <SubHeading>4.3 For Legal Compliance and Safety</SubHeading>
            <p>
              We may disclose information to law enforcement, regulators, or other authorities
              where required by law, court order, or to protect the safety, rights, or property of
              users or the public.
            </p>

            <SubHeading>4.4 Business Transfers</SubHeading>
            <p>
              In the event of a merger, acquisition, asset sale, or restructuring, your information
              may be transferred. We will provide notice before your personal data becomes subject
              to a different privacy policy.
            </p>

            <SubHeading>4.5 With Your Consent</SubHeading>
            <p>
              We may share your information for other purposes with your explicit consent.
            </p>
          </Section>

          <Section title="5. Your Privacy Rights">
            <SubHeading>5.1 Rights Under GDPR and UK GDPR (EU and UK Users)</SubHeading>
            <p>If you are located in the EU or UK, you have the following rights:</p>
            <Bullets items={[
              "Right of access — obtain a copy of your personal data",
              "Right to rectification — correct inaccurate or incomplete data",
              "Right to erasure ('right to be forgotten') — request deletion of your data in certain circumstances",
              "Right to restriction — ask us to limit how we process your data",
              "Right to data portability — receive your data in a structured, machine-readable format",
              "Right to object — object to processing based on legitimate interests or for direct marketing",
              "Right to withdraw consent — where processing is based on consent, you may withdraw it at any time without affecting prior processing",
              "Right to lodge a complaint — you have the right to complain to your local supervisory authority (e.g., the ICO in the UK, or your national data protection authority in the EU)",
            ]} />

            <SubHeading>5.2 Rights Under CCPA/CPRA (California Users)</SubHeading>
            <p>If you are a California resident, you have the right to:</p>
            <Bullets items={[
              "Know what personal information we collect, use, disclose, and sell",
              "Delete your personal information (subject to certain exceptions)",
              "Correct inaccurate personal information",
              "Opt out of the sale or sharing of personal information — we do not sell your data",
              "Non-discrimination for exercising your privacy rights",
            ]} />
            <p>
              To submit a CCPA request, contact us at{" "}
              <a href="mailto:support@kasalaalert.com" className="hover:underline">support@kasalaalert.com</a>.
              {" "}We will respond within 72 hours.
            </p>

            <SubHeading>5.3 Rights Under the Nigeria NDPR</SubHeading>
            <p>
              Under the Nigeria Data Protection Regulation (NDPR), you have the right to access,
              and request deletion of your personal data. You may also object to the processing of
              your data where it is not necessary for legitimate purposes.
            </p>

            <SubHeading>5.4 How to Exercise Your Rights</SubHeading>
            <p>
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:support@kasalaalert.com" className="hover:underline">support@kasalaalert.com</a>.
              {" "}We will acknowledge your request within 72 hours and respond substantively within
              30 days (or as required by applicable law). We may ask you to verify your identity
              before processing your request.
            </p>
          </Section>

          <Section title="6. Location Data — Special Notice">
            <p>
              Because Kasala Alert is fundamentally a location-based service, location data is
              central to how the App works. We treat location data with particular care:
            </p>
            <Bullets items={[
              "Precise location is only collected with your explicit permission",
              "You can revoke location access at any time via your device settings",
              "Location data is not sold or shared with advertisers",
              "Incident location is shared with other users to power community alerts, but your identity is not automatically disclosed alongside it",
              "EU/UK users: collection of precise location data is based on your consent. You may withdraw consent at any time.",
            ]} />
          </Section>

          <Section title="7. Data Retention">
            <p>
              We retain your personal data for as long as your account is active or as necessary to
              provide the Service. Specifically:
            </p>
            <Bullets items={[
              "Account data: retained for the duration of your account.",
              "Incident reports: retained as long as they remain relevant to community safety, and reviewed periodically for deletion.",
              "Location data: processed in near-real-time and not retained beyond what is necessary for alert delivery.",
              "Legal holds: data subject to litigation, regulatory investigation, or legal obligation may be retained longer.",
            ]} />
            <p>
              You may request deletion of your account and associated data at any time (see
              Section 5).
            </p>
          </Section>

          <Section title="8. Data Security">
            <p>
              We implement industry-standard technical and organisational measures to protect your
              personal data, including:
            </p>
            <Bullets items={[
              "Encryption of data in transit (TLS/HTTPS)",
              "Encryption of sensitive data at rest",
              "Access controls limiting staff access to personal data on a need-to-know basis",
              "Regular security assessments and monitoring",
            ]} />
            <p>
              Despite these measures, no method of electronic transmission or storage is completely
              secure. We cannot guarantee absolute security. In the event of a data breach that
              poses a risk to your rights, we will notify you and relevant authorities as required
              by applicable law (including within 72 hours under GDPR/UK GDPR).
            </p>
          </Section>

          <Section title="9. International Users">
            <p>
              Kasala Alert is based in Nigeria. If you access the App from the EU, UK, US, or
              other jurisdictions, your data may be transferred to and processed in Nigeria where
              our service providers operate.
            </p>
          </Section>

          <Section title="10. Children's Privacy">
            <p>
              The App is not intended for children under the age of 18 (or 16 in the EU/UK where
              required by applicable law). We do not knowingly collect personal information from
              children.
            </p>
            <p>
              If we learn that we have collected personal information from a child below the
              applicable age threshold without verified parental consent, we will promptly delete
              it. If you believe a child has provided us with personal information, please contact
              us at{" "}
              <a href="mailto:support@kasalaalert.com" className="hover:underline">support@kasalaalert.com</a>.
            </p>
          </Section>

          <Section title="11. Cookies and Tracking Technologies">
            <p>
              The App may use cookies, local storage, and similar technologies to maintain
              sessions, remember preferences, and collect usage analytics.
            </p>
            <p>
              EU/UK users have the right to refuse non-essential cookies. Where required by law
              (e.g., the EU ePrivacy Directive / UK PECR), we will obtain your consent before
              placing non-essential tracking technologies.
            </p>
          </Section>

          <Section title="12. Third-Party Services">
            <p>
              The App may integrate with third-party services for hosting, analytics,
              notifications, maps, and authentication. These third parties have their own privacy
              policies and we encourage you to review them. We are not responsible for the privacy
              practices of third-party services.
            </p>
          </Section>

          <Section title="13. Changes to This Privacy Policy">
            <p>
              We may update this Privacy Policy from time to time to reflect changes in the law,
              our practices, or the features of the App. Where changes are material, we will
              provide prominent notice within the App and/or by email at least 30 days before the
              changes take effect.
            </p>
            <p>
              Continued use of the App after the effective date of any changes constitutes
              acceptance of the updated Policy.
            </p>
          </Section>

          <Section title="14. Complaints and Supervisory Authorities">
            <p>
              If you have concerns about how we handle your personal data that we have not resolved
              to your satisfaction, you have the right to lodge a complaint with the appropriate
              authorities.
            </p>
            <p>
              We encourage you to contact us first at{" "}
              <a href="mailto:support@kasalaalert.com" className="hover:underline">support@kasalaalert.com</a>
              {" "}so we can attempt to resolve your concern directly.
            </p>
          </Section>

          <Section title="15. Contact Us">
            <p>
              If you have questions, requests, or concerns about this Privacy Policy or the
              handling of your personal data, please contact:
            </p>
            <InfoTable
              rows={[
                { label: "Company", value: "Kasala Alert" },
                { label: "Email", value: <a href="mailto:support@kasalaalert.com" className="hover:underline">support@kasalaalert.com</a> },
                { label: "Response time", value: "Within 30 days (72 hours to acknowledge)" },
              ]}
            />
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

function InfoTable({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border">
      {rows.map((r) => (
        <div key={r.label} className="flex gap-4 px-4 py-2.5 text-sm">
          <dt className="w-36 shrink-0 font-medium text-fg-muted">{r.label}</dt>
          <dd className="text-fg">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
