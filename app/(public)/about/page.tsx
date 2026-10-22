import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiBookOpen,
  FiHeart,
  FiUsers,
} from "react-icons/fi";
import worshipPhoto from "@/public/images/worship.webp";
import { LeadershipProfiles } from "@/components/public/LeadershipProfiles";
import { ServiceTimes } from "@/components/public/ServiceTimes";
import { church } from "@/config/church";

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
  title: "About our church",
  description:
    "Meet Church of Christ at Red Cross in Blantyre, Malawi. Discover our faith, worship, discipleship, service and church leadership, and plan your first visit.",
};

const pillars = [
  {
    title: "Worship",
    text: "We gather around the goodness of God and the hope of the gospel, lifting our voices and hearts in response to his grace.",
    Icon: FiHeart,
  },
  {
    title: "Discipleship",
    text: "We grow through Scripture, prayer, fellowship, and faithful practice, shaping one another into the likeness of Christ.",
    Icon: FiBookOpen,
  },
  {
    title: "Service",
    text: "We use our gifts to love the church and bless the wider community, serving as Christ served, with humility and joy.",
    Icon: FiUsers,
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
    label: "The Lord’s Supper",
    detail: "We share communion weekly as a memorial to Christ’s sacrifice.",
  },
  {
    label: "Community",
    detail: "We are one body, diverse, united, and called to love one another.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="public-container grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div className="min-w-0">
          <p className="public-eyebrow">About our church · Blantyre, Malawi</p>
          <h1 className="public-display mt-5 text-[clamp(2.75rem,5vw,4.75rem)] leading-[1.1]">
            A shared faith.
            <br />A place to belong.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[var(--public-muted)] sm:text-lg">
            We are {church.name}, a Christ-centered church devoted to the Bible,
            prayer, discipleship, and the mission of making disciples of all
            nations, as commanded in Matthew 28:19–20.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/plan-visit"
              className="public-button public-button-primary"
            >
              Plan your first visit <FiArrowRight aria-hidden="true" />
            </Link>
            <a
              href="#our-beliefs"
              className="public-button public-button-secondary"
            >
              Explore our beliefs
            </a>
          </div>
        </div>
        <figure className="min-w-0">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[#e7e0d5]">
            <Image
              src={worshipPhoto}
              alt="The congregation gathered for worship at Red Cross"
              fill
              preload
              placeholder="blur"
              sizes="(min-width: 1280px) 640px, (min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-4 flex flex-wrap justify-between gap-x-5 gap-y-1 text-xs leading-6 text-[var(--public-muted)]">
            <span>Rooted in Christ. Growing together.</span>
            <span>{church.address}</span>
          </figcaption>
        </figure>
      </section>

      <section className="border-y border-[var(--public-line)] bg-white">
        <div className="public-container public-section">
          <div className="grid gap-7 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div className="min-w-0">
              <p className="public-eyebrow">Who we are</p>
              <h2 className="public-display mt-4 max-w-lg text-4xl leading-tight sm:text-5xl">
                A New Testament church.
                <br />A welcoming family.
              </h2>
            </div>
            <div className="min-w-0 max-w-2xl space-y-4 text-base leading-8 text-[var(--public-muted)]">
              <p>
                Red Cross Church of Christ is a worshipping community shaped by
                the Bible and the life of Christ. We seek to restore the pattern
                of the New Testament church in doctrine, worship, fellowship,
                and mission, while making room for every person to come in faith
                and belong with us.
              </p>
              <p>
                We are overseen by the elders of the Church of Christ at
                Redcross, {church.address}, and we are committed to teaching the
                Bible and the gospel truth of God&apos;s Word as the foundation
                of all we do.
              </p>
            </div>
          </div>
          <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-3 lg:gap-12">
            {pillars.map(({ title, text, Icon }) => (
              <div
                key={title}
                className="min-w-0 border-t border-[var(--public-line)] pt-6"
              >
                <Icon
                  aria-hidden="true"
                  className="size-6 text-[var(--public-accent)]"
                />
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--public-muted)]">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="our-beliefs"
        className="public-container public-section grid scroll-mt-36 gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20"
      >
        <div className="min-w-0 max-w-lg">
          <p className="public-eyebrow">Our beliefs</p>
          <h2 className="public-display mt-4 text-4xl leading-tight sm:text-5xl">
            Scripture at the heart of our life together.
          </h2>
          <p className="mt-5 text-base leading-8 text-[var(--public-muted)]">
            As a Church of Christ, we return to Scripture as our sole authority,
            teaching the Bible and the gospel truth of God&apos;s Word, speaking
            where the Bible speaks, and remaining silent where it is silent.
          </p>
          <Link href="/content" className="public-text-link mt-5">
            Explore our messages <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
        <dl className="grid gap-x-8 sm:grid-cols-2">
          {beliefs.map((belief, index) => (
            <div
              key={belief.label}
              className="min-w-0 border-t border-[var(--public-line)] py-7"
            >
              <dt>
                <span
                  aria-hidden="true"
                  className="text-xs font-semibold tabular-nums text-[var(--public-accent)]"
                >
                  0{index + 1}
                </span>
                <span className="public-display mt-3 block text-2xl leading-snug">
                  {belief.label}
                </span>
              </dt>
              <dd className="mt-3 text-sm leading-7 text-[var(--public-muted)]">
                {belief.detail}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-y border-[var(--public-line)] bg-[#f3eee5]">
        <div className="public-container public-section">
          <div className="max-w-2xl">
            <p className="public-eyebrow">Church leadership</p>
            <h2 className="public-display mt-4 text-4xl leading-tight sm:text-5xl">
              Leading through prayer,
              <br />
              teaching and care.
            </h2>
          </div>
          <div className="mt-9 grid gap-8 lg:grid-cols-2 lg:gap-16">
            <div className="min-w-0 border-t border-[#d9d0c3] pt-6">
              <h3 className="text-lg font-semibold">Elders</h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--public-muted)]">
                Elders provide spiritual oversight, prayerful guidance, and
                pastoral care for the congregation. The church continues to
                recognize and appoint elders in line with the pattern of the New
                Testament church.
              </p>
            </div>
            <div className="min-w-0 border-t border-[#d9d0c3] pt-6">
              <h3 className="text-lg font-semibold">Deacons</h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--public-muted)]">
                Deacons serve the church through practical care, ministry
                support, and service to the wider community. Their work reflects
                the spirit of Christ-centered service and active fellowship.
              </p>
            </div>
          </div>
          {(["Pastor", "Elder"] as const).map((role) => (
            <section
              key={role}
              aria-labelledby={`about-${role.toLowerCase()}s`}
              className="mt-12"
            >
              <h3
                id={`about-${role.toLowerCase()}s`}
                className="public-display mb-6 text-3xl"
              >
                {role === "Pastor" ? "Our pastors" : "Our elders"}
              </h3>
              <Suspense
                fallback={
                  <p
                    role="status"
                    className="rounded-xl border border-[var(--public-line)] bg-white p-5 text-sm text-[var(--public-muted)]"
                  >
                    Loading {role.toLowerCase()} profiles…
                  </p>
                }
              >
                <LeadershipProfiles role={role} />
              </Suspense>
            </section>
          ))}
        </div>
      </section>

      <section className="public-dark bg-[#29241f] text-white">
        <div className="public-container public-section grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div className="min-w-0 max-w-xl">
            <p className="public-eyebrow text-[#efd8af]!">Come as you are</p>
            <h2 className="public-display mt-4 text-4xl leading-tight sm:text-5xl">
              You are welcome here.
            </h2>
            <p className="mt-5 text-base leading-8 text-stone-300">
              Whether you are new to faith or looking for a church home, join us
              for worship, prayer and time together.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/plan-visit"
                className="public-button public-button-light"
              >
                Plan a visit <FiArrowRight aria-hidden="true" />
              </Link>
              <Link href="/contact" className="public-text-link text-[#efd8af]">
                Talk to the church team <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="min-w-0 border-t border-white/20 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
            <h3 className="mb-5 text-lg font-semibold">Join us on Sunday</h3>
            <ServiceTimes dark />
            <a
              href={church.mapsUrl}
              className="public-text-link mt-5 text-[#efd8af]"
            >
              Find us in Blantyre <FiArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
