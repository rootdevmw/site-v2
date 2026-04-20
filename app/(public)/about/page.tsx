import Link from "next/link";

const pillars = [
  {
    title: "Worship",
    text: "We gather around the goodness of God and the hope of the gospel, lifting our voices and hearts in response to his grace.",
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
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
        />
      </svg>
    ),
  },
  {
    title: "Discipleship",
    text: "We grow through Scripture, prayer, fellowship, and faithful practice — shaping one another into the likeness of Christ.",
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
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    title: "Service",
    text: "We use our gifts to love the church and bless the wider community — serving as Christ served, with humility and joy.",
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
];

const beliefs = [
  {
    label: "Scripture",
    detail: "The Bible is the inspired Word of God and our ultimate authority.",
  },
  {
    label: "Baptism",
    detail: "We practice immersion baptism for the forgiveness of sins.",
  },
  {
    label: "The Lord's Supper",
    detail: "We share communion weekly as a memorial to Christ's sacrifice.",
  },
  {
    label: "Community",
    detail:
      "We are one body — diverse, united, and called to love one another.",
  },
];

export default function AboutPage() {
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
                  About us
                </p>
              </div>
              <h1 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
                A church family centered on Christ
              </h1>
              <p className="mt-1.5 text-sm text-[#9ab8b0]">
                We gather to worship, grow through Scripture, care for one
                another, and serve our neighbors with humility and joy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── OUR STORY ─────────────────────────────────────────── */}
      <section className="bg-[#f4f8f5] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a7c6f]">
                Who we are
              </p>
              <h2 className="font-serif mt-2 text-2xl font-semibold text-[#18342f] sm:text-3xl">
                Rooted in faith, open to all
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-[#52645d]">
                Red Cross Church of Christ has been a worshipping community
                since 1982. We are a congregation shaped by the New Testament —
                seeking to follow Jesus faithfully while remaining a warm,
                welcoming home for people at every stage of their journey.
              </p>
              <p className="mt-4 text-[15px] leading-7 text-[#52645d]">
                We believe the church is not a building but a people — and every
                person who walks through our doors is a full part of that family.
              </p>
            </div>
            <div className="relative">
              <img
                src="IMGL8976.jpg"
                alt="Church community"
                className="h-72 w-full rounded-2xl object-cover ring-1 ring-[#d8e2dc] lg:h-80"
              />
              <div className="absolute -bottom-4 -right-4 hidden rounded-xl border border-[#d8e2dc] bg-white px-5 py-4 shadow-md sm:block">
                <p className="font-serif text-3xl font-bold text-[#18342f]">
                  Est.
                </p>
                <p className="font-serif text-3xl font-bold text-[#4a7c6f]">
                  1982
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-widest text-[#6b8c80]">
                  Serving the community
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THREE PILLARS ─────────────────────────────────────── */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a7c6f]">
              What drives us
            </p>
            <h2 className="font-serif mt-2 text-2xl font-semibold text-[#18342f] sm:text-3xl">
              Three pillars of our life together
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {pillars.map((item, i) => (
              <div
                key={item.title}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#d8e2dc] bg-white transition hover:border-[#18342f]/20 hover:shadow-lg"
              >
                <div className="h-1 w-full bg-gradient-to-r from-[#18342f] to-[#4a7c6f]" />
                <div className="relative flex flex-1 flex-col p-6">
                  <span className="font-serif pointer-events-none absolute right-5 top-3 select-none text-6xl font-bold text-[#18342f]/[0.04]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#eef5f1] text-[#18342f]">
                    {item.icon}
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-[#18342f]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#52645d]">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT WE BELIEVE ───────────────────────────────────── */}
      <section className="bg-[#18342f] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9ecfbf]">
                Our beliefs
              </p>
              <h2 className="font-serif mt-2 text-2xl font-semibold text-white sm:text-3xl">
                What we hold to be true
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#9ab8b0]">
                As a Church of Christ, we return to Scripture as our sole
                authority — seeking to speak where the Bible speaks and remain
                silent where it is silent.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {beliefs.map((b) => (
                <div
                  key={b.label}
                  className="rounded-xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
                >
                  <p className="font-semibold text-white">{b.label}</p>
                  <p className="mt-2 text-sm leading-6 text-[#9ab8b0]">
                    {b.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ───────────────────────────────────────── */}
      <section className="border-t border-[#d8e2dc] bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a7c6f]">
              Come as you are
            </p>
            <p className="mt-1 text-[15px] font-medium text-[#18342f]">
              Whether new to faith or looking for a church home — you're welcome here.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-lg bg-[#18342f] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#285047]"
            >
              Plan a visit
            </Link>
            <Link
              href="/sermons"
              className="rounded-lg border border-[#c5d8d0] bg-white px-5 py-2.5 text-sm font-semibold text-[#18342f] transition hover:border-[#18342f]/30 hover:shadow-sm"
            >
              Watch a sermon
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
