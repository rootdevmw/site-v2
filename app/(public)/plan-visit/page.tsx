"use client";

import { useState } from "react";
import { publicApi } from "@/lib/public-api/client";
import { showSuccess, showError } from "@/lib/toast";
import { useVisitor } from "@/lib/public-api/attention";

export default function PlanVisitPage() {
  const { submitVisitor, isSubmitting } = useVisitor();
  const [submitted, setSubmitted] = useState(false);

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
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.visitDate) return;

    try {
      await submitVisitor(form);
      setSubmitted(true);
      showSuccess("We'll be expecting you!");
    } catch {
      showError("Something went wrong. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="font-serif bg-[#fdf8f2]">
        <section className="relative overflow-hidden bg-[#fdf8f2]">
          <div className="relative mx-auto max-w-2xl px-6 py-12 sm:px-10 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-12 bg-[#e8c49a]/50" />
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#faebd7] text-[#c2620a]">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <div className="h-px w-12 bg-[#e8c49a]/50" />
            </div>

            <h2 className="text-2xl font-bold text-[#2b1405]">
              You're expected!
            </h2>
            <p className="mt-2 font-sans text-sm leading-6 text-[#6b4c2a]">
              Thank you for letting us know you're coming. We'll do our best to
              make you feel at home.
            </p>

            <div className="mt-5 flex justify-center gap-3">
              <a
                href="/"
                className="rounded-lg bg-[#c2620a] px-6 py-2.5 font-sans text-sm font-semibold text-white hover:bg-[#7c3d0f] transition-colors"
              >
                Back to home
              </a>
              <a
                href="/events"
                className="rounded-lg border border-[#e8c49a] bg-white px-6 py-2.5 font-sans text-sm font-semibold text-[#4a2008] hover:bg-[#fdf0e0] transition-colors"
              >
                See upcoming events
              </a>
            </div>

            <div className="mt-6 flex justify-center">
              <svg width="60" height="12" viewBox="0 0 60 12" fill="none">
                <circle cx="6" cy="6" r="2" fill="#c2620a" fillOpacity="0.35" />
                <line
                  x1="12"
                  y1="6"
                  x2="48"
                  y2="6"
                  stroke="#c2620a"
                  strokeOpacity="0.25"
                  strokeWidth="0.75"
                />
                <circle
                  cx="30"
                  cy="6"
                  r="3"
                  fill="#c2620a"
                  fillOpacity="0.55"
                />
                <line
                  x1="12"
                  y1="6"
                  x2="48"
                  y2="6"
                  stroke="#c2620a"
                  strokeOpacity="0.25"
                  strokeWidth="0.75"
                />
                <circle
                  cx="54"
                  cy="6"
                  r="2"
                  fill="#c2620a"
                  fillOpacity="0.35"
                />
              </svg>
            </div>
          </div>
        </section>
      </div>
    );
  }
  return (
    <div className="font-sans">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#2b1405] px-4 py-10 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 opacity-[0.04]">
          <svg viewBox="0 0 200 200" fill="none">
            <rect x="85" y="20" width="30" height="160" fill="white" />
            <rect x="20" y="70" width="160" height="30" fill="white" />
          </svg>
        </div>
        <div className="relative mx-auto max-w-2xl">
          <div className="mb-2 flex items-center gap-2.5">
            <div className="h-px w-6 bg-[#e8c49a]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e8c49a]">
              Plan a visit
            </p>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
            We'd love to meet you
          </h1>
          <p className="mt-2 text-sm text-[#e6c79c]">
            Let us know you're coming so we can prepare a warm welcome.
          </p>
        </div>
      </section>

      {/* ── FORM ── */}
      <section className="bg-[#fdf6ee] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal details */}
            <div className="rounded-2xl border border-[#e8c49a] bg-white p-6">
              <h2 className="font-serif text-base font-semibold text-[#4a2008] mb-5">
                About you
              </h2>
              <div className="space-y-4">
                <Field label="Your name" required>
                  <input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Full name"
                    required
                    className={inputCls}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Phone number">
                    <input
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="+265 ..."
                      type="tel"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="you@example.com"
                      type="email"
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* Visit details */}
            <div className="rounded-2xl border border-[#e8c49a] bg-white p-6">
              <h2 className="font-serif text-base font-semibold text-[#4a2008] mb-5">
                Your visit
              </h2>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Planned visit date" required>
                    <input
                      value={form.visitDate}
                      onChange={(e) => set("visitDate", e.target.value)}
                      type="date"
                      required
                      className={inputCls}
                    />
                  </Field>
                  <Field label="How many people are coming?">
                    <select
                      value={form.groupSize}
                      onChange={(e) => set("groupSize", e.target.value)}
                      className={inputCls}
                    >
                      {["1", "2", "3", "4", "5", "6–10", "10+"].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Are you a member of the Church of Christ?">
                  <div className="flex gap-4 mt-1">
                    {["Yes", "No", "Not sure"].map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-2 text-sm text-[#4a2008] cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="isChurchOfChrist"
                          value={opt}
                          checked={form.isChurchOfChrist === opt}
                          onChange={(e) =>
                            set("isChurchOfChrist", e.target.value)
                          }
                          className="accent-[#c2620a]"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </Field>

                <Field label="Preferred language for worship">
                  <select
                    value={form.language}
                    onChange={(e) => set("language", e.target.value)}
                    className={inputCls}
                  >
                    <option value="">No preference</option>
                    <option value="English">English</option>
                    <option value="Chichewa">Chichewa</option>
                    <option value="Tumbuka">Tumbuka</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>

                <Field label="Any accessibility or special needs?">
                  <div className="flex gap-4 mt-1">
                    {["Yes", "No"].map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-2 text-sm text-[#4a2008] cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="hasSpecialNeeds"
                          value={opt}
                          checked={form.hasSpecialNeeds === opt}
                          onChange={(e) =>
                            set("hasSpecialNeeds", e.target.value)
                          }
                          className="accent-[#c2620a]"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                  {form.hasSpecialNeeds === "Yes" && (
                    <textarea
                      value={form.specialNeedsDetails}
                      onChange={(e) =>
                        set("specialNeedsDetails", e.target.value)
                      }
                      placeholder="Please share any details so we can prepare..."
                      rows={3}
                      className={`${inputCls} mt-3 resize-none`}
                    />
                  )}
                </Field>

                <Field label="Anything else you'd like us to know?">
                  <textarea
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    placeholder="Questions, requests, or anything on your mind..."
                    rows={3}
                    className={`${inputCls} resize-none`}
                  />
                </Field>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !form.name || !form.visitDate}
              className="w-full rounded-lg bg-[#c2620a] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#7c3d0f] disabled:opacity-50"
            >
              {isSubmitting ? "Sending…" : "Let us know you're coming →"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-[#c2620a]">
        {label}
        {required && <span className="ml-1 text-[#c2620a]">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-[#e8c49a] bg-[#fdf6ee] px-3.5 py-2.5 text-sm text-[#4a2008] placeholder:text-[#c4a882] focus:border-[#c2620a] focus:outline-none transition";
