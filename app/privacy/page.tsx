import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Kasala Alert collects, uses, and protects your information when you use our application.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    url: "/privacy",
    title: "Privacy Policy — Kasala",
    description:
      "How Kasala Alert collects, uses, and protects your information.",
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
          <p className="mt-2 text-sm text-fg-muted">Last updated: May 2026</p>
        </header>

        <article className="space-y-10 text-[15px] leading-relaxed text-fg">
          <p>
            This Privacy Policy explains how Kasala Alert (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
            &ldquo;us&rdquo;) collects, uses, and protects your information when you use our
            application.
          </p>

          <Section title="1. Information We Collect">
            <p>We collect the following information:</p>
            <SubHeading>Information You Provide</SubHeading>
            <Bullets items={["Name", "Email address", "Location"]} />
            <SubHeading>Location Information</SubHeading>
            <p>
              We collect location information that you provide or allow through your device in
              order to:
            </p>
            <Bullets
              items={[
                "Display relevant neighborhood incidents",
                "Send local alerts",
                "Improve location-based functionality",
              ]}
            />
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use your information to:</p>
            <Bullets
              items={[
                "Create and manage your account",
                "Provide neighborhood alerts and incident notifications",
                "Display relevant incidents based on location",
                "Communicate with you about the Service",
                "Improve and maintain the App",
                "Detect fraud, abuse, and security issues",
                "Comply with legal obligations",
              ]}
            />
          </Section>

          <Section title="3. How We Share Information">
            <p>We do not sell your personal information.</p>
            <p>We may share information:</p>
            <Bullets
              items={[
                "With service providers who help operate the App",
                "To comply with legal obligations",
                "To protect the rights, safety, and security of users and the public",
                "In connection with a merger, acquisition, or business transfer",
              ]}
            />
            <p>
              Location-based incident information may be visible to other users as necessary to
              provide the Service.
            </p>
          </Section>

          <Section title="4. Location Data">
            <p>
              Because Kasala Alert is a community safety service, location is core to how the App
              works. This section explains exactly what we collect, when, and why.
            </p>

            <SubHeading>Types of Location We Collect</SubHeading>
            <Bullets
              items={[
                "Approximate location — derived from your device when the App is open, used to centre the map and show incidents in your general area.",
                "Precise location (GPS) — collected only when you choose to report an incident or enable proximity alerts, so the incident is tagged accurately and notifications target the right radius.",
                "Background location — collected only if you grant the “Allow all the time” permission, and used solely to keep your proximity-alert radius accurate while you move around the city.",
              ]}
            />

            <SubHeading>Foreground vs Background Use</SubHeading>
            <p>
              <strong>Foreground location</strong> (used while the App is open) powers the live map,
              the nearby-incidents feed, and the location attached to any report you submit.
            </p>
            <p>
              <strong>Background location</strong> (used when the App is closed or in the
              background) is used for a single feature: <em>proximity-based safety alerts</em>. When
              a new incident is reported, the App compares the incident&rsquo;s coordinates with your
              current location and sends a push notification only if you are within your chosen
              alert radius. Background access keeps that radius accurate as you move, so warnings
              reach you near where you actually are — not where you last opened the App.
            </p>
            <p>
              Before background access is requested, the App shows a prominent disclosure
              explaining this use and links back to this Policy. You can decline or revoke it at any
              time (see below) without losing access to the rest of the App.
            </p>

            <SubHeading>What We Do Not Do</SubHeading>
            <Bullets
              items={[
                "We do not sell location data.",
                "We do not share location data with advertisers or ad networks.",
                "We do not build location-based advertising profiles.",
                "We do not continuously stream your location to our servers — only the coordinates needed to evaluate proximity alerts and incident reports are processed.",
              ]}
            />

            <SubHeading>How to Disable or Revoke</SubHeading>
            <p>
              You can change location permissions at any time from your device settings:
            </p>
            <Bullets
              items={[
                "Android: Settings → Apps → Kasala → Permissions → Location.",
                "iOS: Settings → Kasala → Location.",
              ]}
            />
            <p>
              You can also disable proximity alerts from within the App, which stops all background
              location use even if the system permission remains granted.
            </p>

            <SubHeading>Retention</SubHeading>
            <p>
              Location attached to a published incident report is retained for as long as that
              report is part of the Service. Location used for proximity matching is processed
              transiently and is not stored as a movement history or location trail.
            </p>
          </Section>

          <Section title="5. Data Retention">
            <p>
              We retain personal information only as long as necessary to provide the Service,
              comply with legal obligations, resolve disputes, and enforce our agreements.
            </p>
          </Section>

          <Section title="6. Data Security">
            <p>
              We implement reasonable administrative, technical, and organizational measures to
              protect your information.
            </p>
            <p>
              However, no method of transmission or storage is completely secure, and we cannot
              guarantee absolute security.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>Depending on your jurisdiction, you may have rights to:</p>
            <Bullets
              items={[
                "Access your personal information",
                "Correct inaccurate information",
                "Delete your information",
                "Object to certain processing activities",
                "Request a copy of your information",
              ]}
            />
            <p>To exercise these rights, contact us at the email address below.</p>
          </Section>

          <Section title="8. Children’s Privacy">
            <p>
              The App is not intended for children under the age of 13, and we do not knowingly
              collect personal information from children.
            </p>
            <p>
              If we become aware that a child has provided personal information, we will delete it.
            </p>
          </Section>

          <Section title="9. Third-Party Services">
            <p>
              The App may use third-party providers for hosting, analytics, notifications,
              authentication, or other operational purposes. These providers may process information
              on our behalf.
            </p>
          </Section>

          <Section title="10. International Users">
            <p>
              Your information may be transferred to and processed in countries other than your
              own where our service providers operate. We take steps to ensure appropriate
              safeguards are in place wherever your data is processed.
            </p>
          </Section>

          <Section title="11. Changes to This Privacy Policy">
            <p>
              We may update this Privacy Policy periodically. The updated version will be posted
              within the App and will become effective upon posting.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>
              If you have questions about this Privacy Policy or your personal information, contact:
            </p>
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

function ContactRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2 text-sm">
      <dt className="w-20 shrink-0 text-fg-muted">{label}:</dt>
      <dd className="text-fg">{children}</dd>
    </div>
  );
}
