import Link from "next/link";

const details = [
  {
    label: "Sunday worship",
    value: "9:00 AM & 11:00 AM",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    label: "Location",
    value: "Redcross Church of Christ",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    label: "Phone",
    value: "+265 (0) 000 000 000",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
    ),
  },
  {
    label: "Email",
    value: "hello@redcrosschurch.org",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

const ways = [
  {
    title: "Plan a visit",
    text: "First time? We'll help you know what to expect and feel right at home.",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5M12 12a4 4 0 100-8 4 4 0 000 8z"
        />
      </svg>
    ),
  },
  {
    title: "Prayer request",
    text: "Share what's on your heart. Our team prays together faithfully.",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
  },
  {
    title: "Join a ministry",
    text: "Ready to serve? We'd love to find a place that fits your gifts.",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
        />
      </svg>
    ),
  },
];

export default function ContactPage() {
  return (
    <div className="font-sans">
      {/* ── PAGE HEADER ───────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#18342f] px-4 py-10 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 opacity-[0.04]">
          <svg viewBox="0 0 200 200" fill="none">
            <rect x="85" y="20" width="30" height="160" fill="white" />
            <rect x="20" y="70" width="160" height="30" fill="white" />
          </svg>
        </div>
        <div className="relative mx-auto max-w-screen-2xl">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2.5">
                <div className="h-px w-6 bg-[#9ecfbf]" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9ecfbf]">
                  Get in touch
                </p>
              </div>
              <h1 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
                We would love to meet you
              </h1>
              <p className="mt-1.5 text-sm text-[#9ab8b0]">
                Planning a first visit, looking for prayer, or hoping to join a
                ministry — reach out and we'll help you take the next step.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WAYS TO CONNECT ───────────────────────────────────── */}
      <section className="bg-[#f4f8f5] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a7c6f]">
              How can we help?
            </p>
            <h2 className="font-serif mt-2 text-2xl font-semibold text-[#18342f] sm:text-3xl">
              We're here for you
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {ways.map((way, i) => (
              <div
                key={way.title}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#d8e2dc] bg-white transition hover:border-[#18342f]/20 hover:shadow-lg"
              >
                <div className="h-1 w-full bg-gradient-to-r from-[#18342f] to-[#4a7c6f]" />
                <div className="relative flex flex-1 flex-col p-6">
                  <span className="font-serif pointer-events-none absolute right-5 top-3 select-none text-6xl font-bold text-[#18342f]/[0.04]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#eef5f1] text-[#18342f]">
                    {way.icon}
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-[#18342f]">
                    {way.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#52645d]">
                    {way.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT DETAILS ───────────────────────────────────── */}
      <section className="bg-[#18342f] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* Details */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9ecfbf]">
                Find us
              </p>
              <h2 className="font-serif mt-2 text-2xl font-semibold text-white sm:text-3xl">
                Church details
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#9ab8b0]">
                We meet every Sunday and would love to see you. You can also
                reach us online any time.
              </p>

              <div className="mt-7 space-y-3">
                {details.map((d) => (
                  <div
                    key={d.label}
                    className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4 transition hover:bg-white/10"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#9ecfbf]/10 text-[#9ecfbf]">
                      {d.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#6b9e90]">
                        {d.label}
                      </p>
                      <p className="mt-0.5 font-semibold text-white">
                        {d.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/live"
                  className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Watch live →
                </Link>
                <Link
                  href="/ministries"
                  className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Explore ministries →
                </Link>
              </div>
            </div>

            {/* Image */}
            <div className="relative hidden lg:block">
              <img
                src="IMGL7896.jpg"
                alt="Church community gathered"
                className="h-[420px] w-full rounded-2xl object-cover ring-1 ring-white/10"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-[#0f2420]/70 via-transparent" />
              <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-sm">
                <p className="font-serif text-base font-semibold text-white">
                  You're always welcome here.
                </p>
                <p className="mt-1 text-sm text-[#c5dcd5]">
                  No expectations — just a warm community waiting to meet you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ───────────────────────────────────────── */}
      <section className="border-t border-[#d8e2dc] bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a7c6f]">
              Ready to connect?
            </p>
            <p className="mt-1 text-[15px] font-medium text-[#18342f]">
              Whether it's your first Sunday or you're ready to get more involved.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/about"
              className="rounded-lg bg-[#18342f] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#285047]"
            >
              Learn about us
            </Link>
            <Link
              href="/sermons"
              className="rounded-lg border border-[#c5d8d0] bg-white px-5 py-2.5 text-sm font-semibold text-[#18342f] transition hover:border-[#18342f]/30 hover:shadow-sm"
            >
              Read a sermon
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
