"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { useVisitor } from "@/lib/public-api/attention";
import { getChurchDateInputValue } from "@/lib/utils/church-date";
import { InlineLoader } from "@/components/ui/InlineLoader";

export function VisitForm({
  earliestVisitDate,
}: {
  earliestVisitDate: string;
}) {
  const { submitVisitor, isSubmitting } = useVisitor();
  const submitting = useRef(false);
  const confirmationRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    visitDate: "",
    groupSize: "1",
    isChurchOfChrist: "",
    language: "",
    hasSpecialNeeds: "",
    specialNeedsDetails: "",
    message: "",
  });

  function set(key: keyof typeof form, value: string) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
      ...(key === "hasSpecialNeeds" && value !== "Yes"
        ? { specialNeedsDetails: "" }
        : {}),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    setError("");
    if (!form.name.trim()) {
      setError("Please enter your name so we know who to welcome.");
      event.currentTarget
        .querySelector<HTMLInputElement>("#visit-name")
        ?.focus();
      return;
    }
    if (!form.visitDate || form.visitDate < getChurchDateInputValue()) {
      setError("Please choose today or a future date for your visit.");
      event.currentTarget
        .querySelector<HTMLInputElement>("#visit-date")
        ?.focus();
      return;
    }
    submitting.current = true;
    try {
      await submitVisitor({
        ...form,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
      });
      setSubmitted(true);
      window.dispatchEvent(
        new CustomEvent("church:journey", {
          detail: { event: "visit_submitted", path: "/plan-visit" },
        }),
      );
      // Focus the confirmation after React replaces the form.
      requestAnimationFrame(() => confirmationRef.current?.focus());
    } catch {
      setError(
        "Your visit details could not be sent. Please try again. You are still welcome to come without registering.",
      );
    } finally {
      submitting.current = false;
    }
  }

  if (submitted)
    return (
      <div
        ref={confirmationRef}
        tabIndex={-1}
        className="rounded-2xl border border-[#d7dfce] bg-[#f4f7ef] p-6 sm:p-8"
      >
        <FiCheckCircle aria-hidden="true" className="size-8 text-[#405c2c]" />
        <h3 className="public-display mt-5 text-3xl">
          We look forward to meeting you.
        </h3>
        <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
          Thank you for letting us know you are coming. Your visit details have
          been received.
        </p>
        <Link href="/events" className="public-text-link mt-4">
          Explore upcoming gatherings <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    );

  return (
    <form
      method="post"
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[var(--public-line)] bg-white p-5 sm:p-8"
      aria-label="Let us know you are visiting"
      aria-busy={isSubmitting}
    >
      <p className="mb-6 text-sm leading-7 text-[var(--public-muted)]">
        Only your name and visit date are required. Contact details are
        optional.
      </p>
      {error && (
        <p
          id="visit-error"
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900"
        >
          {error}
        </p>
      )}
      <fieldset
        disabled={isSubmitting}
        className="min-w-0 space-y-5 disabled:opacity-70"
      >
        <legend className="sr-only">Your visit details</legend>
        <Field label="Your name" id="visit-name" required>
          <input
            id="visit-name"
            name="name"
            autoComplete="name"
            required
            value={form.name}
            onChange={(event) => set("name", event.target.value)}
            className="public-input"
          />
        </Field>
        <Field label="When would you like to visit?" id="visit-date" required>
          <input
            id="visit-date"
            name="visitDate"
            type="date"
            min={earliestVisitDate}
            required
            value={form.visitDate}
            onChange={(event) => set("visitDate", event.target.value)}
            className="public-input"
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Phone number" id="visit-phone">
            <input
              id="visit-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(event) => set("phone", event.target.value)}
              className="public-input"
            />
          </Field>
          <Field label="Email address" id="visit-email">
            <input
              id="visit-email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => set("email", event.target.value)}
              className="public-input"
            />
          </Field>
        </div>
        <details className="rounded-xl border border-[var(--public-line)]">
          <summary className="min-h-12 cursor-pointer px-4 py-4 text-sm font-semibold">
            Share a little more{" "}
            <span className="font-normal text-[var(--public-muted)]">
              (optional)
            </span>
          </summary>
          <div className="space-y-5 border-t border-[var(--public-line)] p-4 sm:p-5">
            <Field label="How many people are coming?" id="visit-group">
              <select
                id="visit-group"
                name="groupSize"
                value={form.groupSize}
                onChange={(event) => set("groupSize", event.target.value)}
                className="public-input"
              >
                {["1", "2", "3", "4", "5", "6–10", "10+"].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </Field>
            <fieldset>
              <legend className="text-sm font-semibold">
                Are you a member of the Church of Christ?
              </legend>
              <div className="mt-1 flex flex-wrap gap-x-4">
                {["Yes", "No", "Not sure"].map((option) => (
                  <label
                    key={option}
                    className="flex min-h-11 cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      type="radio"
                      name="isChurchOfChrist"
                      value={option}
                      checked={form.isChurchOfChrist === option}
                      onChange={(event) =>
                        set("isChurchOfChrist", event.target.value)
                      }
                      className="size-4 accent-[var(--brand-link)]"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
            <Field label="Preferred language for worship" id="visit-language">
              <select
                id="visit-language"
                name="language"
                value={form.language}
                onChange={(event) => set("language", event.target.value)}
                className="public-input"
              >
                <option value="">No preference</option>
                {["English", "Chichewa", "Tumbuka", "Other"].map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </Field>
            <fieldset>
              <legend className="text-sm font-semibold">
                Any accessibility or special needs?
              </legend>
              <div className="mt-1 flex flex-wrap gap-x-4">
                {["Yes", "No"].map((option) => (
                  <label
                    key={option}
                    className="flex min-h-11 cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      type="radio"
                      name="hasSpecialNeeds"
                      value={option}
                      checked={form.hasSpecialNeeds === option}
                      onChange={(event) =>
                        set("hasSpecialNeeds", event.target.value)
                      }
                      className="size-4 accent-[var(--brand-link)]"
                    />
                    {option}
                  </label>
                ))}
              </div>
              {form.hasSpecialNeeds === "Yes" && (
                <div className="mt-2">
                  <Field
                    label="What would help with your visit?"
                    id="visit-needs"
                  >
                    <textarea
                      id="visit-needs"
                      name="specialNeedsDetails"
                      rows={3}
                      value={form.specialNeedsDetails}
                      onChange={(event) =>
                        set("specialNeedsDetails", event.target.value)
                      }
                      className="public-input resize-y"
                    />
                  </Field>
                </div>
              )}
            </fieldset>
            <Field
              label="Questions or anything else to share?"
              id="visit-message"
            >
              <textarea
                id="visit-message"
                name="message"
                rows={3}
                value={form.message}
                onChange={(event) => set("message", event.target.value)}
                className="public-input resize-y"
              />
            </Field>
          </div>
        </details>
        <p className="text-xs leading-6 text-[var(--public-muted)]">
          These details are sent to the church to help with your visit. Please
          share only what you are comfortable providing.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="public-button public-button-primary w-full"
        >
          {isSubmitting ? (
            <InlineLoader message="Sending your details…" />
          ) : (
            <>
              Let us know you are coming <FiArrowRight aria-hidden="true" />
            </>
          )}
        </button>
      </fieldset>
    </form>
  );
}

function Field({
  label,
  id,
  required,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
        {required && (
          <span className="ml-1 text-[var(--public-accent)]" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
