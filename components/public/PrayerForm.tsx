"use client";
import Link from "next/link";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { usePrayerRequest } from "@/lib/public-api/attention";
import {
  initialPrayerForm,
  prayerFormSchema,
  type PrayerSubmission,
} from "@/lib/utils/public-prayer";
import { InlineLoader } from "@/components/ui/InlineLoader";
export function PrayerForm() {
  const { submitPrayerRequest, isSubmitting } = usePrayerRequest(),
    busy = useRef(false),
    confirmation = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<PrayerSubmission>({ ...initialPrayerForm }),
    [state, setState] = useState<"editing" | "sent" | "private">("editing"),
    [error, setError] = useState("");
  function set<K extends keyof PrayerSubmission>(
    key: K,
    value: PrayerSubmission[K],
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    setError("");
    if (form.shareWithElders === "No") {
      setState("private");
      requestAnimationFrame(() => confirmation.current?.focus());
      return;
    }
    const result = prayerFormSchema.safeParse({
      ...form,
      email: form.email.trim(),
    });
    if (!result.success) {
      setError(result.error.issues[0]?.message || "Review your entries.");
      return;
    }
    busy.current = true;
    try {
      await submitPrayerRequest(result.data);
      setForm({ ...initialPrayerForm });
      setState("sent");
      requestAnimationFrame(() => confirmation.current?.focus());
      window.dispatchEvent(
        new CustomEvent("church:journey", {
          detail: { event: "prayer_submitted", path: "/prayer-request" },
        }),
      );
    } catch {
      setError(
        "Your submission could not be confirmed. Your request may have arrived. Please contact the church before trying again; your words are kept here.",
      );
    } finally {
      busy.current = false;
    }
  }
  if (state !== "editing")
    return (
      <div
        ref={confirmation}
        tabIndex={-1}
        role="status"
        className="rounded-2xl border border-[var(--public-line)] bg-white p-6 sm:p-9"
      >
        <FiCheckCircle
          aria-hidden="true"
          className="size-9 text-[var(--public-accent)]"
        />
        <h2 className="public-display mt-5 text-3xl leading-tight">
          {state === "sent"
            ? "Your request has been received."
            : "A moment for personal prayer."}
        </h2>
        <p className="mt-5 text-base leading-8 text-[var(--public-muted)]">
          {state === "sent"
            ? "Thank you for sharing with us. Your request has been sent to the church for prayer."
            : "Your prayer was not sent to the church. It remains only on this page and has not been saved to the church’s system."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {state === "private" && (
            <button
              type="button"
              onClick={() => setState("editing")}
              className="public-button public-button-secondary"
            >
              Return to my prayer
            </button>
          )}
          <Link href="/" className="public-button public-button-primary">
            Back to home
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  return (
    <form
      onSubmit={submit}
      method="post"
      aria-label="Prayer request"
      aria-busy={isSubmitting}
      className="rounded-2xl border border-[var(--public-line)] bg-white p-5 sm:p-8"
    >
      <h2 className="public-display text-3xl">Share what is on your heart.</h2>
      <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
        Your name and contact details are optional. Share only what you are
        comfortable providing.
      </p>
      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-900"
        >
          {error}
        </p>
      )}
      <fieldset
        disabled={isSubmitting}
        className="mt-6 min-w-0 space-y-6 disabled:opacity-70"
      >
        <legend className="sr-only">Your prayer request</legend>
        <fieldset>
          <legend className="text-sm font-semibold">
            How would you like to pray?
          </legend>
          <div className="mt-2 space-y-2">
            {[
              {
                value: "Yes" as const,
                label: "Share with the church prayer team",
              },
              { value: "No" as const, label: "Keep this as a personal prayer" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm leading-6"
              >
                <input
                  type="radio"
                  name="shareWithElders"
                  checked={form.shareWithElders === option.value}
                  value={option.value}
                  onChange={() => set("shareWithElders", option.value)}
                  className="size-4 accent-[var(--brand-link)]"
                />
                {option.label}
              </label>
            ))}
          </div>
          <p className="mt-3 text-xs leading-6 text-[var(--public-muted)]">
            {form.shareWithElders === "No"
              ? "Your words will stay on this page and will not be sent to the church."
              : "Submitting shares this request with authorised church staff and the prayer team. Requests are not published on this website."}
          </p>
        </fieldset>
        {form.shareWithElders === "Yes" && (
          <>
            <Field id="prayer-name" label="Your name (optional)">
              <input
                id="prayer-name"
                name="name"
                autoComplete="name"
                maxLength={191}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="public-input"
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="prayer-phone" label="Phone (optional)">
                <input
                  id="prayer-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={191}
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className="public-input"
                />
              </Field>
              <Field id="prayer-email" label="Email (optional)">
                <input
                  id="prayer-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={191}
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className="public-input"
                />
              </Field>
            </div>
          </>
        )}
        <Field id="prayer-for" label="Who is this prayer for?">
          <select
            id="prayer-for"
            name="prayerFor"
            value={form.prayerFor}
            onChange={(e) => set("prayerFor", e.target.value)}
            className="public-input"
          >
            {[
              "Myself",
              "A family member",
              "A friend",
              "Someone else",
              "Our church",
            ].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </Field>
        <Field id="prayer-category" label="Category (optional)">
          <select
            id="prayer-category"
            name="requestType"
            value={form.requestType}
            onChange={(e) => set("requestType", e.target.value)}
            className="public-input"
          >
            <option value="">Choose a category</option>
            {[
              "Health & healing",
              "Family & relationships",
              "Finances & provision",
              "Spiritual growth",
              "Grief & loss",
              "Work & career",
              "Salvation",
              "Other",
            ].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </Field>
        <Field id="prayer-words" label="What would you like to pray for?">
          <textarea
            id="prayer-words"
            name="request"
            required
            rows={7}
            maxLength={16000}
            value={form.request}
            onChange={(e) => set("request", e.target.value)}
            className="public-input resize-y"
          />
        </Field>
        {form.shareWithElders === "Yes" && (
          <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-7">
            <input
              type="checkbox"
              name="isUrgent"
              checked={form.isUrgent}
              onChange={(e) => set("isUrgent", e.target.checked)}
              className="mt-1.5 size-4 shrink-0 accent-[var(--brand-link)]"
            />
            Please prioritise this request.
          </label>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !form.request.trim()}
          className="public-button public-button-primary w-full"
        >
          {isSubmitting ? (
            <InlineLoader message="Sending your request…" />
          ) : form.shareWithElders === "No" ? (
            "Continue with personal prayer"
          ) : (
            <>
              Send prayer request
              <FiArrowRight aria-hidden="true" />
            </>
          )}
        </button>
      </fieldset>
    </form>
  );
}
function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}
