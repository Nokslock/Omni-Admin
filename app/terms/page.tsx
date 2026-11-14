import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms that govern your use of Kasala Alert, including Kasala Pro, Kasala Coins, advertising and community features.",
  alternates: { canonical: "/terms" },
  openGraph: {
    url: "/terms",
    title: "Terms of Use — Kasala",
    description:
      "The terms that govern your use of Kasala Alert, including Kasala Pro, Kasala Coins, advertising and community features.",
  },
};

const SUPPORT = "support@kasalaalert.com";

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
          <p className="mt-2 text-sm text-fg-muted">
            Last updated: 14 November 2026 · Effective immediately for new users, and from 14
            December 2026 for existing users
          </p>
        </header>

        <article className="space-y-10 text-[15px] leading-relaxed text-fg">
          <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-danger">
            ⚠ Emergency Warning: Do not use this App as a substitute for emergency services. If
            there is an emergency involving risk to life or property, call your local police or
            emergency number (e.g., 112 in the EU/UK, 911 in the USA, 112 or 199 in Nigeria)
            immediately.
          </div>

          <div className="rounded-lg border border-border bg-bg-card px-4 py-4 text-sm">
            <p className="font-semibold">What&rsquo;s new in this version</p>
            <Bullets items={[
              "Kasala Pro, a paid subscription (section 8)",
              "Kasala Coins: buying, gifting and withdrawing (section 9)",
              "The confirmation you give on every report, and instant verification for Pro members (sections 7.3–7.4)",
              "Comments, likes and reporting comments (section 5)",
              "Missing-person broadcasts and sightings (section 10)",
              "Family location sharing, saved places and devices (section 11)",
              "Sponsored ads, and the rules for businesses that advertise (section 12)",
              "Account suspension and the 30-day deletion period (section 16)",
            ]} />
          </div>

          <p>
            Welcome to Kasala Alert, a community safety application operated by Kasala Alert
            (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By
            accessing or using the Kasala Alert mobile application, this website or any related
            services (collectively, the &ldquo;App&rdquo; or &ldquo;Service&rdquo;), you agree to
            be legally bound by these Terms of Use (&ldquo;Terms&rdquo;) and our{" "}
            <Link href="/privacy" className="underline hover:text-fg-muted">Privacy Policy</Link>.
          </p>
          <p>If you do not agree to these Terms, you must not use the App.</p>

          <Section title="1. Description of Service">
            <p>Kasala Alert is a community-powered safety platform that lets you:</p>
            <Bullets items={[
              "Report incidents and dangers around you, with an optional photo (and a note, with Kasala Pro)",
              "Receive push alerts about incidents inside your alert radius, and a weekly summary of your area",
              "See incidents on a live map and in the Alerts feed, and confirm, like or comment on them",
              "Request and follow missing-person broadcasts, and report sightings",
              "Share your location with family members you invite, and follow saved places",
              "Subscribe to Kasala Pro, and buy, gift and withdraw Kasala Coins",
              "Advertise a business in the Alerts feed",
            ]} />
            <p>
              Incident reports are user-generated and may not always be accurate, complete, or
              current. Reports are marked verified when enough people nearby confirm them, or
              straight away when a Kasala Pro member files them (section 7.4). We
              do not independently check every report. The App supplements — it does not
              replace — official safety services, emergency responders, or law enforcement.
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
              App, please notify us at <Mail />.
            </p>
            <p className="text-fg-muted text-sm">
              EU/UK users: in some EU member states the minimum age for digital consent is 16.
              These Terms set a minimum age of 18 for all users regardless of jurisdiction.
            </p>
          </Section>

          <Section title="3. Your Account">
            <p>To create an account you give us:</p>
            <Bullets items={[
              "A display name, or you can sign up as an anonymous reporter (shown as \"Reporter #\" and a code)",
              "Your email address, which you confirm with a one-time code",
              "Your phone number",
              "Your location, when you allow it on your device",
            ]} />
            <p>You are responsible for:</p>
            <Bullets items={[
              "Giving accurate, current information and keeping it up to date",
              "Keeping your password and devices secure",
              "Everything that happens under your account",
              `Telling us straight away at ${SUPPORT} if you think someone else has accessed your account`,
            ]} />
            <p>
              An account can be signed in on up to two devices at a time. Only one of them (the
              &ldquo;location device&rdquo;) shares your location for alerts and with family. You
              can see and remove your devices in Settings.
            </p>
            <p>
              Each person may hold one account. Creating extra accounts to get around a
              suspension, to confirm your own reports, to earn referrals, or to move Kasala Coins
              between accounts is not allowed.
            </p>
          </Section>

          <Section title="4. User Content">
            <SubHeading>4.1 Your content</SubHeading>
            <p>
              You may submit incident reports, photographs, notes, comments, missing-person
              requests, sightings, ad requests and other content through the App (&ldquo;User
              Content&rdquo;). You keep ownership of your User Content.
            </p>
            <p>
              By submitting User Content, you grant Kasala Alert a worldwide, non-exclusive,
              royalty-free, sublicensable licence to use, display, reproduce, distribute, and adapt
              it solely to operate, provide, and improve the Service. This licence ends when you
              delete your User Content or your account, except for incident reports, which stay
              available without your name to keep the safety record of an area complete (see
              section 16.2), and except where the law requires us to keep it.
            </p>

            <SubHeading>4.2 Your responsibilities</SubHeading>
            <p>You are solely responsible for your User Content. You promise that:</p>
            <Bullets items={[
              "You own it or have the right to submit it",
              "It is true to the best of your knowledge",
              "Submitting it doesn't break any law or anyone else's rights, including their privacy",
            ]} />

            <SubHeading>4.3 Moderation</SubHeading>
            <p>
              We may review, remove, hide or restrict any User Content we believe breaks these
              Terms or the law, or puts people at risk. We aim to review flagged content within 24
              hours. Removing content does not mean we have reviewed everything else on the App.
            </p>
          </Section>

          <Section title="5. Comments, Likes and Reporting">
            <p>
              You can like and comment on incidents. Your display name (or anonymous reporter
              name) and profile photo appear next to your comments, and anyone using the App can
              read them.
            </p>
            <Bullets items={[
              "Keep comments relevant to the incident and respectful",
              "Never post anyone's personal details, or anything that could put a person in danger",
              "You can report a comment. It's hidden for you straight away, and for everyone once three people have reported it, until our moderators decide",
              "You can block another user so you no longer see their reports or comments",
            ]} />
          </Section>

          <Section title="6. Prohibited Conduct">
            <p>You agree not to use the App to:</p>
            <Bullets items={[
              "Submit false, misleading, fabricated, or exaggerated incident reports, confirmations, sightings or missing-person requests",
              "Harass, threaten, stalk, intimidate, or harm any person",
              "Post content that is unlawful, defamatory, hateful, abusive, obscene, or discriminatory",
              "Share personal information about others without their consent (including names, addresses, phone numbers or photographs)",
              "Impersonate any person or organisation, or misrepresent your connection to them",
              "Use Kasala Coins, gifts or referrals for fraud, money laundering, or to move value between accounts you control",
              "Advertise anything unlawful, misleading, or listed as not allowed in section 12",
              "Track or monitor another person through family location sharing without their knowledge and agreement",
              "Attempt to gain unauthorised access to, interfere with, or disrupt the App or its servers",
              "Use bots, scrapers or other automated tools to access the App or extract its data",
              "Break any applicable law, or help anyone else do any of the above",
            ]} />
            <p>
              Breaking these rules can lead to content removal, loss of features (such as instant
              verification), withholding of Kasala Coins (section 9.5), account suspension or
              termination, and, where appropriate, referral to law enforcement.
            </p>
          </Section>

          <Section title="7. Incident Reports and Alerts">
            <SubHeading>7.1 No guarantee</SubHeading>
            <p>
              We do not guarantee the accuracy, timeliness, reliability, or completeness of any
              incident report, alert, digest or notification. Alerts depend on your device,
              network, notification settings and location permissions, and may be delayed or not
              arrive.
            </p>
            <p>You should:</p>
            <Bullets items={[
              "Use your own judgement when acting on information from the App",
              "Check reports with official sources where you can",
              "Contact emergency services in any genuine emergency",
            ]} />

            <SubHeading>7.2 Verification</SubHeading>
            <p>
              A new report shows as unverified until enough people nearby confirm it (currently
              three). Reports that stay unverified may be closed automatically, and reports found
              to be wrong are marked as false alarms. Verified does not mean we have checked the
              report ourselves.
            </p>

            <SubHeading>7.3 Your confirmation on every report</SubHeading>
            <p>
              Before you send a report, the App asks you to confirm that the incident is real and
              happening in your area right now. By ticking that box you take responsibility for
              that statement, and we keep a record that you gave it. Photos you add must be taken
              by you at the scene.
            </p>

            <SubHeading>7.4 Instant verification (Kasala Pro)</SubHeading>
            <p>
              Kasala Pro members&rsquo; reports are verified straight away, without waiting for
              others to confirm them, because of the confirmation in section 7.3. If three of your
              instantly verified
              reports are marked as false alarms, instant verification is switched off for your
              account until our team restores it. Knowingly false reports may also lead to
              suspension and any other action the law allows.
            </p>

            <div className="mt-2 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-danger">
              Do not use the App as a substitute for emergency services. If there is an emergency,
              call the police or your local emergency number.
            </div>
          </Section>

          <Section title="8. Kasala Pro">
            <SubHeading>8.1 What Pro includes</SubHeading>
            <p>
              Kasala Pro is an optional paid subscription. It currently includes a wider alert
              radius than the free 20 km, saved places, family location sharing, notes on your
              reports, instant verification, a gold Pro badge and no ads. We may change
              what Pro includes; if we take away something important, we will tell you in advance
              and you may cancel.
            </p>

            <SubHeading>8.2 Billing, trials and renewal</SubHeading>
            <Bullets items={[
              "Pro is sold monthly or yearly through the Apple App Store or Google Play, which take the payment. The price is shown before you buy",
              "A new subscriber may get a free trial (currently 7 days). Unless you cancel at least 24 hours before the trial ends, it turns into a paid subscription",
              "Subscriptions renew automatically at the end of each period until you cancel",
              "You cancel in your App Store or Google Play account settings, not by deleting the App. You keep Pro until the end of the period you've paid for",
              "Refunds are handled by Apple or Google under their rules. Where the law gives you a right to a refund, nothing in these Terms takes it away",
            ]} />

            <SubHeading>8.3 Pro given by Kasala</SubHeading>
            <p>
              We may give Pro for a set number of days, for example as a thank-you. Gifted Pro
              ends on its own, never charges you, and has no cash value.
            </p>
          </Section>

          <Section title="9. Kasala Coins">
            <SubHeading>9.1 What coins are</SubHeading>
            <p>
              Kasala Coins let you thank people for verified reports. Coins are a licence to use
              a feature of the App. They are not money, a bank deposit, e-money or an investment,
              and they have no value outside the App except as set out in section 9.4.
            </p>

            <SubHeading>9.2 Buying coins</SubHeading>
            <Bullets items={[
              "You buy coin packs through the Apple App Store or Google Play",
              "Bought coins can only be gifted inside the App. They cannot be withdrawn or exchanged for cash",
              "Purchases are final except where Apple, Google or the law give you a refund. If a purchase is refunded, we take those coins back, even if your balance goes below zero",
            ]} />

            <SubHeading>9.3 Gifting coins</SubHeading>
            <Bullets items={[
              "You can gift coins to the person who filed a verified report. The person who receives them is told they got a gift, but not who sent it",
              "When you gift, your bought coins are used first, then coins you received",
              "A gift can't be undone once it's sent",
              "You can't gift coins to your own reports, or to or from accounts you control",
            ]} />

            <SubHeading>9.4 Withdrawing coins you received</SubHeading>
            <p>
              Coins other people gift you can be withdrawn to a bank account in your own name,
              subject to these conditions:
            </p>
            <Bullets items={[
              "Coins must be held for a waiting period (currently 14 days) before they can be withdrawn",
              "There is a minimum withdrawal (currently 20 coins)",
              "We pay out at the coin value we set, in the currency we set (currently Nigerian naira). While a value is marked as an estimate in the App, the amount you receive may differ; you'll see the final amount before we pay",
              "Before your first payout, we check that the bank account name matches you, and we may ask for proof of identity",
              "Payouts are made by hand and may take several working days. We may turn down or delay a withdrawal we reasonably suspect is fraudulent or unlawful; if we turn it down, the coins go back to your balance unless section 9.5 applies",
              "You are responsible for any tax due on what you receive",
            ]} />

            <SubHeading>9.5 When we can withhold or remove coins</SubHeading>
            <p>
              We may freeze, reverse or remove coins that were obtained through fraud, chargebacks,
              mistakes, multiple accounts or other breaches of these Terms, and coins in an account
              we close for a serious breach. If we close your account for any other reason, we will
              give you a reasonable chance to withdraw coins you received.
            </p>

            <SubHeading>9.6 Coins given by Kasala</SubHeading>
            <p>
              Coins we give you (for example, as a thank-you for referring people) work like
              bought coins: they can be gifted but not withdrawn.
            </p>

            <SubHeading>9.7 Changes</SubHeading>
            <p>
              We may change the coin value, waiting period, minimum withdrawal or other coin
              rules. We will tell you in the App at least 30 days before a change that reduces
              what your existing coins are worth.
            </p>
          </Section>

          <Section title="10. Missing Persons and Sightings">
            <Bullets items={[
              "You may only request a missing-person broadcast if you are a family member, guardian or someone acting with their agreement, and you believe the person is genuinely missing. Contact the police as well",
              "Every request is reviewed by our moderators before it goes out, and we may decline, edit or end any broadcast",
              "An approved broadcast, including the photo and details you give, is shown to people using the App. You can ask for your phone number to be hidden; it is then seen only by our team",
              "Sightings you report go to our moderators, not to the public. If you choose to include your location, it goes with the sighting",
              "False or malicious requests or sightings will lead to removal and may be reported to the police",
            ]} />
          </Section>

          <Section title="11. Family, Places and Location">
            <SubHeading>11.1 Location</SubHeading>
            <p>
              The App uses your location to show nearby incidents, send alerts and pin the reports
              you file. We only collect it when you allow it on your device, and you can withdraw
              that permission at any time, although the App will then do less. Location is handled
              under our{" "}
              <Link href="/privacy" className="underline hover:text-fg-muted">Privacy Policy</Link>.
            </p>

            <SubHeading>11.2 Family location sharing</SubHeading>
            <p>
              You can invite people to a family group and share your location with them. Only
              invite people who know about and agree to it. Anyone in the group can stop sharing
              or leave at any time. Shared locations can be out of date and must not be relied on
              in an emergency.
            </p>

            <SubHeading>11.3 Saved places</SubHeading>
            <p>
              You can save places such as home or work and get alerts for them. A place&rsquo;s
              alerts and digest cover the radius you set around it.
            </p>
          </Section>

          <Section title="12. Advertising">
            <SubHeading>12.1 Ads in the App</SubHeading>
            <p>
              The App shows sponsored cards and banners in the Alerts feed to users without
              Kasala Pro. Ads are always labelled &ldquo;Sponsored.&rdquo; We are not responsible
              for advertisers&rsquo; products, services or websites; tapping an ad takes you to a
              third party with its own terms.
            </p>

            <SubHeading>12.2 Advertising your business</SubHeading>
            <p>If you ask to advertise through the App, you also agree that:</p>
            <Bullets items={[
              "Your ad and everything it links to is accurate, lawful and yours to use, and you have the rights to any logo, image, name or trademark in it",
              "Your request is reviewed by our team. We may approve, reject, pause or remove any ad at any time, including after it has started running",
              "Dates, pricing and payment are agreed with our team before your ad goes live. Approval of a request is not a promise to run it",
              "We don't promise any number of views or taps, or any result from your ad",
              "You are responsible for complying with advertising, consumer protection and other laws that apply to you, and you will compensate us for claims caused by your ad",
            ]} />
            <p>Ads may not promote:</p>
            <Bullets items={[
              "Anything illegal, or weapons, drugs, gambling, adult content, or get-rich-quick or financial schemes",
              "Anything that looks like a safety alert, an emergency warning or a Kasala message",
              "Hate, discrimination, political campaigning, or content that exploits fear of crime or disaster",
              "Pages that collect personal information or payment details without making clear who is collecting them and why",
            ]} />
          </Section>

          <Section title="13. Referrals, Notifications and Digest">
            <Bullets items={[
              "You can share a referral code. We may offer rewards for referrals and change or end any referral offer at any time. Referrals from fake or duplicate accounts don't count",
              "Push notifications, alert sounds, quiet hours and the weekly digest can be switched off in Settings or in your device settings",
              "The digest and its counts are a summary of reports and may be incomplete",
            ]} />
          </Section>

          <Section title="14. Intellectual Property">
            <p>
              All intellectual property rights in the App, including its software, design,
              interface, logos, trademarks, and Company-created content, are owned by Kasala Alert
              and are protected by law. These Terms only give you a limited, personal,
              non-transferable right to use the App. You must not:
            </p>
            <Bullets items={[
              "Copy, reproduce, modify, or create derivative works from our materials",
              "Reverse engineer, decompile, or disassemble the App",
              "Remove or alter any proprietary notices or labels on the App",
              "Use our trademarks or branding without our prior written consent",
            ]} />
          </Section>

          <Section title="15. Privacy and Data Protection">
            <p>
              Your use of the App is governed by our{" "}
              <Link href="/privacy" className="underline hover:text-fg-muted">Privacy Policy</Link>,
              which is part of these Terms. It explains how we collect, use, share, and protect
              your personal data, and your rights under the Nigeria Data Protection Act 2023, GDPR
              (EU), UK GDPR and CCPA (California).
            </p>
          </Section>

          <Section title="16. Suspension, Termination and Deletion">
            <SubHeading>16.1 Suspension or termination by us</SubHeading>
            <p>We may suspend or close your account, with or without notice, if:</p>
            <Bullets items={[
              "You break these Terms",
              "We reasonably believe your actions put other users, third parties, or the Service at risk",
              "The law or a competent authority requires it",
            ]} />
            <p>
              A suspended account cannot sign in and stops receiving alerts. The App will tell you
              your account is suspended and how to contact us. Where it is possible and lawful, we
              will explain why.
            </p>

            <SubHeading>16.2 Deleting your account</SubHeading>
            <p>
              You can delete your account in the App (Settings → Delete account) or at{" "}
              <Link href="/account-deletion" className="underline hover:text-fg-muted">
                kasalaalert.com/account-deletion
              </Link>
              . Your account is deactivated straight away and permanently erased 30 days later;
              signing back in before then lets you restore it. Before deleting, withdraw any coins
              you can — coins left in an erased account are lost, and any Pro subscription must be
              cancelled separately with Apple or Google. What we keep after deletion is described
              in our Privacy Policy.
            </p>
          </Section>

          <Section title="17. Disclaimer of Warranties">
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
              "Warranties that the App, alerts or payouts will be uninterrupted, timely, error-free, or secure",
              "Warranties as to the accuracy, reliability, or completeness of user-generated content or advertising",
              "Warranties that defects will be corrected",
            ]} />
          </Section>

          <Section title="18. Limitation of Liability">
            <SubHeading>18.1 General limitation</SubHeading>
            <p className="uppercase">
              To the maximum extent permitted by applicable law, Kasala Alert and its affiliates,
              directors, employees, and agents shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages arising out of or related to your use of
              or inability to use the App, including damages resulting from reliance on
              user-generated content, alerts that are late or don&rsquo;t arrive, or advertising.
            </p>

            <SubHeading>18.2 Liability cap</SubHeading>
            <p className="uppercase">
              To the maximum extent permitted by applicable law, our total liability to you for
              all claims arising under these Terms shall not exceed the greater of: (a) the amount
              you paid us in the 12 months before the claim, plus the value of any withdrawable
              coins in your account, or (b) ₦1,000.
            </p>
            <p>
              Nothing in these Terms limits liability that cannot be limited by law, such as for
              death or personal injury caused by negligence, or for fraud.
            </p>
          </Section>

          <Section title="19. Apple and Google">
            <p>
              If you downloaded the App from the Apple App Store or Google Play, these Terms are
              between you and us, not Apple or Google. Apple and Google are not responsible for the
              App, its content, maintenance or support, or any claims about it. Apple and its
              subsidiaries are third-party beneficiaries of these Terms and may enforce them
              against you. Your use of the App must also comply with the store&rsquo;s own terms.
            </p>
          </Section>

          <Section title="20. Governing Law and Disputes">
            <p>
              These Terms are governed by the laws of the Federal Republic of Nigeria. Please
              contact us first so we can try to resolve any dispute informally. If we can&rsquo;t,
              the courts of Nigeria have jurisdiction, but if you live in the EU, UK or another
              country whose law gives you the right to bring a claim where you live, you keep
              that right.
            </p>
          </Section>

          <Section title="21. Changes to These Terms">
            <p>
              We may update these Terms from time to time. For material changes, we will give at
              least 30 days&rsquo; notice in the App and/or by email, and may ask you to accept
              the new Terms before you continue using the App.
            </p>
            <p>
              If you keep using the App after the new Terms take effect, you accept them. If you
              don&rsquo;t agree, stop using the App and, if you wish, delete your account before
              the changes take effect.
            </p>
          </Section>

          <Section title="22. Contact Information">
            <p>
              For questions about these Terms, to report violations, or to exercise any rights,
              please contact:
            </p>
            <dl className="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border">
              {[
                { label: "Company", value: "Kasala Alert" },
                { label: "Email", value: <Mail /> },
                {
                  label: "Illegal Content Reports",
                  value: (
                    <>
                      <Mail /> — Subject: &ldquo;Illegal Content Report&rdquo;
                    </>
                  ),
                },
                {
                  label: "Advertising",
                  value: (
                    <>
                      <Mail /> — Subject: &ldquo;Advertising&rdquo;
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
