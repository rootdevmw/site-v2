// PrayerRequestPage.tsx
"use client";

import { useState } from "react";
import { publicApi } from "@/lib/public-api/client";
import { showSuccess, showError } from "@/lib/toast";
import { usePrayerRequest } from "@/lib/public-api/attention";

export default function PrayerRequestPage() {
  const { submitPrayerRequest, isSubmitting } = usePrayerRequest();
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    requestType: "",
    prayerFor: "Myself",
    request: "",
    isUrgent: false,
    shareWithElders: "Yes",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.request) return;

    try {
      await submitPrayerRequest(form);
      setSubmitted(true);
      showSuccess("Your request has been received.");
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
              We're praying with you
            </h2>
            <p className="mt-2 font-sans text-sm leading-6 text-[#6b4c2a]">
              Your request has been received and will be lifted in prayer. You
              are not alone.
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
              Prayer request
            </p>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
            Bring it before God together
          </h1>
          <p className="mt-2 text-sm text-[#e6c79c]">
            Share what's on your heart. Your request is handled with care and
            confidentiality.
          </p>
        </div>
      </section>

      {/* ── FORM ── */}
      <section className="bg-[#fdf6ee] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Confidentiality notice */}
          <div className="flex gap-3 rounded-xl border border-[#e8c49a] bg-[#fff9f0] px-5 py-4">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-[#c2620a]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <p className="text-xs leading-5 text-[#6b4c2a]">
              <span className="font-semibold text-[#4a2008]">
                Your privacy matters.
              </span>{" "}
              Prayer requests are treated with complete confidentiality. Your
              name and details will never be shared publicly. Only designated
              church elders or prayer leaders will see your request, and only if
              you choose below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact — optional */}
            <div className="rounded-2xl border border-[#e8c49a] bg-white p-6">
              <div className="mb-1 flex items-center justify-between">
                <h2 className="font-serif text-base font-semibold text-[#4a2008]">
                  Your details
                </h2>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#c4a882]">
                  Optional
                </span>
              </div>
              <p className="mb-5 text-xs text-[#8c6d3f]">
                You may submit anonymously. Providing your name helps us pray
                more personally for you.
              </p>
              <div className="space-y-4">
                <Field label="Name — kept strictly confidential">
                  <input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Your name (optional)"
                    className={inputCls}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Phone">
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

            {/* Prayer request */}
            <div className="rounded-2xl border border-[#e8c49a] bg-white p-6">
              <h2 className="font-serif text-base font-semibold text-[#4a2008] mb-5">
                Your prayer request
              </h2>
              <div className="space-y-4">
                <Field label="Who is this prayer for?">
                  <div className="flex flex-wrap gap-3 mt-1">
                    {[
                      "Myself",
                      "A family member",
                      "A friend",
                      "Someone else",
                      "Our church",
                    ].map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-2 text-sm text-[#4a2008] cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="prayerFor"
                          value={opt}
                          checked={form.prayerFor === opt}
                          onChange={(e) => set("prayerFor", e.target.value)}
                          className="accent-[#c2620a]"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </Field>

                <Field label="Category">
                  <select
                    value={form.requestType}
                    onChange={(e) => set("requestType", e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Select a category (optional)</option>
                    <option value="Health & healing">Health & healing</option>
                    <option value="Family & relationships">
                      Family & relationships
                    </option>
                    <option value="Finances & provision">
                      Finances & provision
                    </option>
                    <option value="Spiritual growth">Spiritual growth</option>
                    <option value="Grief & loss">Grief & loss</option>
                    <option value="Work & career">Work & career</option>
                    <option value="Salvation">Salvation</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>

                <Field label="What would you like us to pray for?" required>
                  <textarea
                    value={form.request}
                    onChange={(e) => set("request", e.target.value)}
                    placeholder="Share as much or as little as you're comfortable with..."
                    rows={5}
                    required
                    className={`${inputCls} resize-none`}
                  />
                </Field>

                <div className="flex items-start gap-3">
                  <input
                    id="urgent"
                    type="checkbox"
                    checked={form.isUrgent}
                    onChange={(e) => set("isUrgent", e.target.checked)}
                    className="mt-0.5 accent-[#c2620a]"
                  />
                  <label
                    htmlFor="urgent"
                    className="text-sm text-[#4a2008] cursor-pointer leading-5"
                  >
                    This is urgent — please prioritise this request
                  </label>
                </div>

                <Field label="Who may see this request?">
                  <div className="flex flex-wrap gap-3 mt-1">
                    {[
                      { value: "Yes", label: "Church elders & prayer team" },
                      { value: "No", label: "Keep it between me and God" },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-2 text-sm text-[#4a2008] cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="shareWithElders"
                          value={opt.value}
                          checked={form.shareWithElders === opt.value}
                          onChange={(e) =>
                            set("shareWithElders", e.target.value)
                          }
                          className="accent-[#c2620a]"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </Field>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !form.request}
              className="w-full rounded-lg bg-[#c2620a] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#7c3d0f] disabled:opacity-50"
            >
              {isSubmitting ? "Submitting…" : "Submit prayer request →"}
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
