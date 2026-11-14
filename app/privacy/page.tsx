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

const SUPPORT = "support@kasalaalert.com";

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
          <p className="mt-2 text-sm text-fg-muted">
            Last updated: 14 November 2026 · Effective immediately for new users, and from 14
            December 2026 for existing users
          </p>
        </header>

        <article className="space-y-10 text-[15px] leading-relaxed text-fg">
          <p>
            This Privacy Policy explains how Kasala Alert (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
            &ldquo;us&rdquo;) collects, uses, shares, and protects your personal information when
            you use the Kasala Alert mobile application, this website and related services
            (collectively, the &ldquo;App&rdquo; or &ldquo;Service&rdquo;). It should be read with
            our <Link href="/terms" className="underline hover:text-fg-muted">Terms of Use</Link>.
          </p>

          <div className="rounded-lg border border-border bg-bg-card px-4 py-4 text-sm">
            <p className="font-semibold">In short</p>
            <Bullets items={[
              "We use your location to show and send you alerts about what's happening nearby",
              "Reports you file show your display name and photo, unless you signed up as an anonymous reporter. Your phone number and email are never shown to other users",
              "We never sell your data, and advertisers never receive it",
              "Payments go through Apple or Google. We never see your card details",
              "You can download your data or delete your account in the App at any time",
            ]} />
          </div>

          <Section title="1. Who We Are and How to Contact Us">
            <p>
              Kasala Alert is a community safety platform that lets people report dangers and
              receive alerts about incidents near them. We are the data controller for personal
              information collected through the App.
            </p>
            <InfoTable
              rows={[
                { label: "Company", value: "Kasala Alert" },
                { label: "Email", value: <Mail /> },
                { label: "Primary Jurisdiction", value: "Nigeria" },
                { label: "Account Deletion", value: <Link href="/account-deletion" className="hover:underline">kasalaalert.com/account-deletion</Link> },
              ]}
            />
          </Section>

          <Section title="2. Information We Collect">
            <SubHeading>2.1 Your account</SubHeading>
            <Bullets items={[
              "Display name, or an anonymous reporter name if you choose one",
              "Email address and password (the password is stored only in hashed form by our authentication provider)",
              "Phone number",
              "Profile photo, if you add one",
              "Your referral code, and who referred you, if anyone",
            ]} />

            <SubHeading>2.2 What you submit</SubHeading>
            <Bullets items={[
              "Incident reports: type, location, address, time, photo, note (Kasala Pro), and the confirmation you give that the incident is real",
              "Confirmations, likes, comments, and the comments you report",
              "Missing-person requests, including the person's name, age, sex, description, photo, last-seen place, and your contact number (which you can keep private)",
              "Sightings you report, and your location with them if you choose to include it",
              "Ad requests: business name, logo or banner, ad text, link, and the business's contact phone and email",
              "Messages you send to support",
            ]} />

            <SubHeading>2.3 Location</SubHeading>
            <p>With your permission, we collect:</p>
            <Bullets items={[
              "Precise location while you use the App, and in the background if you allow it, so alerts keep working when the App is closed",
              "Your country, worked out from your location or device settings, to show broadcasts meant for your country",
              "Saved places you add (such as home or work) and the alert radius around them",
              "If you join a family group and turn sharing on, your latest location, shared with that group",
            ]} />
            <p>
              You can withdraw location permission at any time in your device settings; the App
              will then do less.
            </p>

            <SubHeading>2.4 Your devices and settings</SubHeading>
            <Bullets items={[
              "Device name, platform (iOS or Android), an app-generated device identifier, and which device is your location device",
              "Push notification token",
              "Your alert settings: radius, muted incident types, minimum severity, sound, quiet hours, hidden-details mode, weekly digest, language, distance unit and time zone",
              "Crash and diagnostic information from your device's operating system, where you allow it",
            ]} />

            <SubHeading>2.5 Purchases, coins and payouts</SubHeading>
            <Bullets items={[
              "Kasala Pro: your plan, whether you're in a free trial, and when it renews or ends",
              "Coin purchases: the product, store and transaction reference. Apple or Google handle payment; we never receive your card details",
              "Your coin balances and history: purchases, gifts sent and received, withdrawals and refunds",
              "For withdrawals: your bank name, account number and account name, the payouts we make, and any identity documents you send us to verify that the account is yours",
            ]} />
          </Section>

          <Section title="3. How We Use Your Information">
            <Bullets items={[
              "Create and run your account, and keep it secure (including the two-device limit)",
              "Show incidents near you, on the map, in Alerts and in the digest, and send push alerts and the weekly digest",
              "Verify reports, prevent false reports, and switch off instant verification where reports turn out to be false",
              "Run community features: comments, likes, gifts, family sharing, saved places and missing-person broadcasts",
              "Process Kasala Pro, coin purchases, gifts and withdrawals, and prevent payment fraud and money laundering",
              "Review ad requests, contact advertisers, and show ads to users without Pro. Ads are chosen by your country only, never by your profile or behaviour",
              "Moderate content, investigate reports of abuse, and suspend accounts that break our Terms",
              "Answer support requests and tell you about important changes",
              "Understand how the App is used so we can improve it",
              "Meet legal obligations, including tax and financial record-keeping, and respond to lawful requests",
            ]} />

            <SubHeading>Legal bases (EU/UK users)</SubHeading>
            <Bullets items={[
              "Contract — to provide the App, Pro, coins and payouts you ask for",
              "Consent — precise and background location, push notifications, and family location sharing. You can withdraw it at any time",
              "Legitimate interests — keeping the App safe and reliable, preventing fraud and abuse, and showing non-personalised ads",
              "Legal obligation — financial records, identity checks for payouts, and lawful requests",
            ]} />
          </Section>

          <Section title="4. How We Share Your Information">
            <p className="font-medium">We do not sell your personal information.</p>

            <SubHeading>4.1 With other users</SubHeading>
            <Bullets items={[
              "Incident reports are visible to everyone in the App, with their location, address, photo and time. Your display name and profile photo appear on reports and comments you post; if you signed up as an anonymous reporter, only your reporter name is shown",
              "Your phone number, email and exact location are never shown on your reports",
              "When you gift coins, the person receiving them is not told who sent them",
              "Family members see your location only while you share it with them",
              "Approved missing-person broadcasts are public in the App. Sightings and private contact numbers are seen only by our team",
            ]} />

            <SubHeading>4.2 With service providers</SubHeading>
            <p>
              We use providers who process data on our behalf, under contracts that stop them using
              it for their own purposes:
            </p>
            <InfoTable
              rows={[
                { label: "Supabase", value: "Database, sign-in, file storage and server functions" },
                { label: "Google Firebase", value: "Delivering push notifications" },
                { label: "Google Maps Platform", value: "Maps and place search" },
                { label: "RevenueCat", value: "Managing Kasala Pro subscriptions and coin purchases" },
                { label: "Apple and Google", value: "App distribution, payments, and turning locations into street names on your device" },
                { label: "Banks / payment partners", value: "Making coin withdrawals" },
              ]}
            />

            <SubHeading>4.3 Advertisers</SubHeading>
            <p>
              Advertisers do not receive any information about you. If you advertise with us, your
              business details are used to review and run your ad; your contact details are never
              shown in the ad.
            </p>

            <SubHeading>4.4 For legal reasons and safety</SubHeading>
            <p>
              We may disclose information to the police, regulators or courts where the law
              requires it, or where we believe it is needed to protect someone&rsquo;s life,
              safety or rights — for example, to help find a missing person.
            </p>

            <SubHeading>4.5 Business transfers</SubHeading>
            <p>
              If we are involved in a merger, acquisition or sale of assets, your information may
              be transferred. We will tell you before it becomes subject to a different privacy
              policy.
            </p>
          </Section>

          <Section title="5. Data Retention">
            <Bullets items={[
              "Account data: while your account is open",
              "Deleting your account: it is deactivated straight away (signed out everywhere, alerts stopped, location sharing ended) and permanently erased after 30 days, unless you restore it by signing back in",
              "After erasure: your profile, photo, devices, family links, saved places, comments, likes and confirmations are deleted. Incident reports you filed stay on the map without your name or phone number",
              "We keep a limited record of an erased account (name, email, phone and account dates) for 12 months, to deal with fraud, disputes and lawful requests, then delete it",
              "Coin, purchase and payout records are kept, unlinked from your profile, for as long as tax and anti-money-laundering law requires",
              "Location: we keep only your latest position for alerts and family sharing, not a history",
              "Push tokens are removed when you sign out or remove a device",
              "Data under a legal hold may be kept longer",
            ]} />
          </Section>

          <Section title="6. Your Rights and Choices">
            <SubHeading>6.1 In the App</SubHeading>
            <Bullets items={[
              "Download a copy of your data (Settings → Download my data)",
              "Edit your name, phone number and photo",
              "Turn off notifications, the weekly digest, sounds, or hide alert details",
              "Stop sharing your location with family, or remove a device",
              "Block other users",
              "Delete your account (Settings → Delete account)",
            ]} />

            <SubHeading>6.2 Nigeria (NDPA 2023)</SubHeading>
            <p>
              Under the Nigeria Data Protection Act 2023, you have the right to be informed, to
              access, correct and delete your data, to restrict or object to processing, to data
              portability, and to withdraw consent. You may complain to the Nigeria Data Protection
              Commission.
            </p>

            <SubHeading>6.3 EU and UK (GDPR / UK GDPR)</SubHeading>
            <Bullets items={[
              "Access, rectification, erasure, restriction and data portability",
              "Object to processing based on legitimate interests",
              "Withdraw consent at any time, without affecting earlier processing",
              "Complain to your data protection authority (for example, the ICO in the UK)",
            ]} />

            <SubHeading>6.4 California (CCPA/CPRA)</SubHeading>
            <Bullets items={[
              "Know what personal information we collect, use and disclose",
              "Delete and correct your personal information",
              "Opt out of sale or sharing — we do not sell or share personal information for advertising",
              "Not be discriminated against for using these rights",
            ]} />

            <SubHeading>6.5 How to ask</SubHeading>
            <p>
              Email <Mail />. We acknowledge requests within 72 hours and respond within 30 days
              (or as the law requires). We may ask you to confirm your identity first.
            </p>
          </Section>

          <Section title="7. Location Data — Special Notice">
            <Bullets items={[
              "Precise location is only collected with your permission, and you can turn it off at any time",
              "Only your location device shares your location; a second signed-in device does not",
              "Location is never sold, and never shared with advertisers",
              "A report is pinned where you are when you send it, and that spot is visible to everyone — keep this in mind before reporting from your home",
              "Family location sharing is off until you turn it on, and you can stop at any time",
            ]} />
          </Section>

          <Section title="8. Data Security">
            <Bullets items={[
              "Encryption in transit (TLS/HTTPS) and at rest",
              "Row-level access rules so each account can read only what it's allowed to",
              "Staff access limited to what their role needs, with suspended staff locked out",
              "Bank details and private contact numbers kept in tables only our payout and moderation teams can read",
            ]} />
            <p>
              No system is completely secure. If a breach puts your rights at risk, we will tell
              you and the relevant authorities as the law requires (within 72 hours where GDPR,
              UK GDPR or the NDPA apply).
            </p>
          </Section>

          <Section title="9. International Transfers">
            <p>
              We are based in Nigeria, and our service providers may process data in other
              countries, including the United States and the EU. Where the law requires it, we use
              safeguards such as standard contractual clauses for these transfers.
            </p>
          </Section>

          <Section title="10. Children's Privacy">
            <p>
              The App is not intended for anyone under 18. We do not knowingly collect personal
              information from children. Missing-person broadcasts may include details of a missing
              child, submitted by a parent or guardian for the child&rsquo;s safety; these are
              reviewed by our moderators and taken off the public feed once the case is closed. If you believe a child
              has given us their information, contact <Mail />.
            </p>
          </Section>

          <Section title="11. Cookies and This Website">
            <p>
              The App uses local storage on your device to keep you signed in and remember your
              settings. This website uses only the cookies it needs to work (such as keeping staff
              signed in to the admin area), and does not use advertising cookies.
            </p>
          </Section>

          <Section title="12. Third-Party Links">
            <p>
              Ads and some content link to other websites. Their owners have their own privacy
              policies, and we are not responsible for them.
            </p>
          </Section>

          <Section title="13. Changes to This Privacy Policy">
            <p>
              We may update this Privacy Policy as the law, our practices or the App change. For
              material changes, we will give at least 30 days&rsquo; notice in the App and/or by
              email before they take effect.
            </p>
          </Section>

          <Section title="14. Contact Us">
            <p>
              If you have questions, requests, or concerns about this Privacy Policy or how we
              handle your personal data, contact:
            </p>
            <InfoTable
              rows={[
                { label: "Company", value: "Kasala Alert" },
                { label: "Email", value: <Mail /> },
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

function Mail() {
  return (
    <a href={`mailto:${SUPPORT}`} className="hover:underline">
      {SUPPORT}
    </a>
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
