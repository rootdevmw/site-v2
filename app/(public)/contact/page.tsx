import Link from "next/link";

const details = [
  {
    label: "Sunday worship",
    value: "7:00 - 9:00 AM & 9:30 -11:30 AM",
    href: "/programs",
    external: false,
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
    href: "https://www.google.com/maps/search/?api=1&query=52X9%2BHGP+Blantyre+Malawi",
    external: true,
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
    value: "+265 (0) 888 565 565",
    href: "https://wa.me/265888565565",
    external: true,
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
    value: "churchofchristatredcross@gmail.com",
    href: "mailto:churchofchristatredcross@gmail.com",
    external: false,
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
    url: "/plan-visit",
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
    url: "/prayer-request",
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
    url: "/ministries",
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
      <section className="relative overflow-hidden bg-[#2b1405] px-4 py-10 sm:px-6 lg:px-8">
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
                <div className="h-px w-6 bg-[#e8c49a]" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e8c49a]">
                  Get in touch
                </p>
              </div>
              <h1 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
                We would love to meet you
              </h1>
              <p className="mt-1.5 text-sm text-[#e6c79c]">
                Planning a first visit, looking for prayer, or hoping to join a
                ministry — reach out and we'll help you take the next step.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WAYS TO CONNECT ───────────────────────────────────── */}
      <section className="bg-[#fdf6ee] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c2620a]">
              How can we help?
            </p>
            <h2 className="font-serif mt-2 text-2xl font-semibold text-[#4a2008] sm:text-3xl">
              We're here for you
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {ways.map((way, i) => (
              <Link
                key={way.title}
                href={way.url}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#e8c49a] bg-white transition hover:border-[#7c3d0f]/20 hover:shadow-lg"
              >
                <div className="h-1 w-full bg-gradient-to-r from-[#7c3d0f] to-[#c2a23a]" />
                <div className="relative flex flex-1 flex-col p-6">
                  <span className="font-serif pointer-events-none absolute right-5 top-3 select-none text-6xl font-bold text-[#4a2008]/[0.04]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#faebd7] text-[#4a2008]">
                    {way.icon}
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-[#4a2008]">
                    {way.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#6b4c2a]">
                    {way.text}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT DETAILS ───────────────────────────────────── */}
      <section className="bg-[#2b1405] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* Details */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8c49a]">
                Find us
              </p>
              <h2 className="font-serif mt-2 text-2xl font-semibold text-white sm:text-3xl">
                Church details
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#e6c79c]">
                We meet every Sunday and would love to see you. You can also
                reach us online any time.
              </p>

              <div className="mt-7 space-y-3">
                {details.map((d) => (
                  <Link
                    key={d.label}
                    href={d.href}
                    target={d.external ? "_blank" : undefined}
                    rel={d.external ? "noopener noreferrer" : undefined}
                    className="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4 transition hover:bg-white/10 hover:border-white/20"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8c49a]/10 text-[#e8c49a] transition group-hover:bg-[#e8c49a]/20">
                      {d.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#c2a23a]">
                        {d.label}
                      </p>
                      <p className="mt-0.5 font-semibold text-white break-words">
                        {d.value}
                      </p>
                    </div>
                    {/* Arrow indicator */}
                    <svg
                      className="mt-1 h-4 w-4 shrink-0 text-white/30 transition group-hover:text-white/60 group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                ))}
              </div>

              {/* Social media */}
              <div className="mt-7">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c2a23a]">
                  Follow us
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <a
                    href="https://www.facebook.com/share/18ioYhR8RB/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-[#1877F2]/40 hover:bg-[#1877F2]/10"
                  >
                    {/* Facebook wordmark icon */}
                    <svg
                      className="h-5 w-5 shrink-0 text-[#1877F2]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                    </svg>
                    <span className="text-sm font-semibold text-white">
                      Facebook
                    </span>
                    <svg
                      className="h-3.5 w-3.5 text-white/30 transition group-hover:text-white/60 group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>

                  <a
                    href="https://www.youtube.com/@churchofchristatredcross"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-[#FF0000]/40 hover:bg-[#FF0000]/10"
                  >
                    {/* YouTube icon */}
                    <svg
                      className="h-5 w-5 shrink-0 text-[#FF0000]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    <span className="text-sm font-semibold text-white">
                      YouTube
                    </span>
                    <svg
                      className="h-3.5 w-3.5 text-white/30 transition group-hover:text-white/60 group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                </div>
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
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-[#1a0a02]/70 via-transparent" />
              <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-sm">
                <p className="font-serif text-base font-semibold text-white">
                  You're always welcome here.
                </p>
                <p className="mt-1 text-sm text-[#fde5c0]">
                  No expectations — just a warm community waiting to meet you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ───────────────────────────────────────── */}
      <section className="border-t border-[#e8c49a] bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c2620a]">
              Ready to connect?
            </p>
            <p className="mt-1 text-[15px] font-medium text-[#4a2008]">
              Whether it's your first Sunday or you're ready to get more
              involved.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/about"
              className="rounded-lg bg-[#c2620a] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7c3d0f]"
            >
              Learn about us
            </Link>
            <Link
              href="/content"
              className="rounded-lg border border-[#e8c49a] bg-white px-5 py-2.5 text-sm font-semibold text-[#4a2008] transition hover:border-[#7c3d0f]/30 hover:shadow-sm"
            >
              Read a sermon
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
