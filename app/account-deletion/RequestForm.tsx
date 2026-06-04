"use client";

import { useState } from "react";
import { submitDeletionRequest } from "./actions";

const reasonOptions = [
  { value: "not_using", label: "I don't use Kasala anymore" },
  { value: "privacy", label: "Privacy concerns" },
  { value: "new_phone", label: "Switching phones or accounts" },
  { value: "duplicate", label: "I created a duplicate account" },
  { value: "other", label: "Other" },
];

export function RequestForm() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [reasonOther, setReasonOther] = useState("");
  const [acknowledge, setAcknowledge] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await submitDeletionRequest({
      email,
      phone,
      reason,
      reasonOther,
      acknowledge,
    });
    setSubmitting(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-ok/40 bg-ok/10 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-ok/20 text-ok">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <div>
            <h2 className="text-base font-semibold">Request received</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
              We&rsquo;ve logged your account deletion request for{" "}
              <span className="font-medium text-fg">{email}</span>. Our team will
              process it within <strong>7 business days</strong> and email you to
              confirm once it&rsquo;s done.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">
              If you didn&rsquo;t mean to submit this, reply to the confirmation
              email or contact us at{" "}
              <a href="mailto:Support@kasalaalert.com" className="font-medium text-fg hover:underline">
                Support@kasalaalert.com
              </a>{" "}
              and we&rsquo;ll cancel the request.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email address <span className="text-danger">*</span>
        </label>
        <p className="mt-1 text-xs text-fg-muted">
          Use the same email you signed up with so we can match the account.
        </p>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-2 h-11 w-full rounded-lg border border-border bg-bg-card px-3 text-sm text-fg placeholder:text-fg-subtle focus:border-fg-muted focus:outline-none focus:ring-1 focus:ring-fg-muted/30"
        />
      </div>

      <div>
        <label htmlFor="phone" className="text-sm font-medium">
          Phone number <span className="text-fg-muted">(optional)</span>
        </label>
        <p className="mt-1 text-xs text-fg-muted">
          Helps us find your account if your email has changed.
        </p>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+234 803 000 0000"
          className="mt-2 h-11 w-full rounded-lg border border-border bg-bg-card px-3 text-sm text-fg placeholder:text-fg-subtle focus:border-fg-muted focus:outline-none focus:ring-1 focus:ring-fg-muted/30"
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium">
          Why are you deleting your account? <span className="text-fg-muted">(optional)</span>
        </legend>
        <p className="mt-1 text-xs text-fg-muted">
          Helps us improve Kasala. We won&rsquo;t share this.
        </p>
        <div className="mt-3 space-y-2">
          {reasonOptions.map((o) => (
            <label
              key={o.value}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-bg-card px-3 py-2.5 text-sm transition-colors hover:border-border-strong"
            >
              <input
                type="radio"
                name="reason"
                value={o.value}
                checked={reason === o.value}
                onChange={(e) => setReason(e.target.value)}
                className="h-4 w-4 accent-fg"
              />
              {o.label}
            </label>
          ))}
        </div>
        {reason === "other" && (
          <textarea
            value={reasonOther}
            onChange={(e) => setReasonOther(e.target.value)}
            rows={3}
            placeholder="Tell us a bit more (optional)"
            className="mt-3 w-full resize-none rounded-lg border border-border bg-bg-card px-3 py-2.5 text-sm text-fg placeholder:text-fg-subtle focus:border-fg-muted focus:outline-none focus:ring-1 focus:ring-fg-muted/30"
          />
        )}
      </fieldset>

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-bg-card px-4 py-3 text-sm">
        <input
          type="checkbox"
          checked={acknowledge}
          onChange={(e) => setAcknowledge(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-fg"
        />
        <span className="leading-relaxed">
          I understand that deleting my account is{" "}
          <span className="font-semibold">permanent</span> and that my reports,
          activity, and saved preferences will be removed.
        </span>
      </label>

      {error && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-fg text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Request account deletion"}
      </button>

      <p className="text-xs text-fg-muted">
        We typically process requests within 7 business days. You&rsquo;ll get a
        confirmation email once it&rsquo;s done.
      </p>
    </form>
  );
}
