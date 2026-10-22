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
import { churchContent } from "@/config/church-content";
import { aboutSections } from "@/config/public-navigation";
import {
  ChurchBeliefs,
  ChurchHistory,
  ChurchPurpose,
  WorshipPractices,
} from "@/components/public/ChurchStory";

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
  title: "Our faith, purpose and story",
  description:
    "Discover the beliefs, mission, worship and history of Church of Christ at Red Cross, from a 1962 home gathering in Zingwangwa to the congregation in Blantyre today.",
};

const pillars = [
  {
    title: "Worship",
    text: "We gather on the first day of the week to remember Christ in the Lord’s Supper, sing a cappella, pray, learn from Scripture and give.",
    Icon: FiHeart,
  },
  {
    title: "Discipleship",
    text: "We teach the gospel and help believers mature in Christ, continuing in His teaching, fellowship, the breaking of bread and prayer.",
    Icon: FiBookOpen,
  },
  {
    title: "Service",
    text: "We care for the poor and afflicted, seeking to offer relief and equip people and congregations to support themselves and serve the Lord.",
    Icon: FiUsers,
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="public-container grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div className="min-w-0">
          <p className="public-eyebrow">About our church · Blantyre, Malawi</p>
          <h1 className="public-display mt-5 text-[clamp(2.75rem,5vw,4.75rem)] leading-[1.1]">
            Following Christ.
            <br />
            Sharing His gospel.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[var(--public-muted)] sm:text-lg">
            We are {church.name}, a congregation seeking to follow Jesus and the
            teaching of the New Testament. We share His gospel and help people
            grow as disciples, following His command in Matthew 28:19–20.
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

      <nav
        aria-label="On this page"
        className="public-container flex flex-wrap gap-2 pb-10"
      >
        {aboutSections.map(({ label, href }) => (
          <a
            key={href}
            href={href.slice(href.indexOf("#"))}
            className="inline-flex min-h-11 items-center rounded-full border border-[var(--public-line)] bg-white px-4 py-2 text-xs font-semibold text-[var(--public-muted)] transition-colors hover:border-[var(--brand-border)] hover:text-[var(--public-accent)] motion-reduce:transition-none"
          >
            {label}
          </a>
        ))}
      </nav>

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
              <p>{churchContent.identity}</p>
              <p>
                Jesus Christ is our only Saviour. We seek to make His gospel
                known, help His disciples grow in faith, and care for our
                neighbours in Blantyre and beyond.
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

      <ChurchPurpose />
      <ChurchHistory />
      <ChurchBeliefs />
      <WorshipPractices />

      <section
        id="church-leadership"
        tabIndex={-1}
        className="scroll-mt-36 border-y border-[var(--public-line)] bg-[var(--brand-soft)]"
      >
        <div className="public-container public-section">
          <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <div className="min-w-0">
              <p className="public-eyebrow">Church leadership</p>
              <h2 className="public-display mt-4 text-4xl leading-tight sm:text-5xl">
                Leading through prayer,
                <br />
                teaching and care.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-8 text-[var(--public-muted)]">
              Meet the people who teach, encourage and care for our church
              family. Explore their stories and get to know the people behind
              the names.
            </p>
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
              id={`our-${role.toLowerCase()}s`}
              tabIndex={-1}
              aria-labelledby={`about-${role.toLowerCase()}s`}
              className="mt-14 scroll-mt-36 border-t border-[#d9d0c3] pt-8 sm:mt-16"
            >
              <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="public-eyebrow mb-3">
                    People, faith &amp; service
                  </p>
                  <h3
                    id={`about-${role.toLowerCase()}s`}
                    className="public-display text-3xl sm:text-4xl"
                  >
                    {role === "Pastor" ? "Our pastors" : "Our elders"}
                  </h3>
                </div>
                <p className="max-w-sm text-sm leading-7 text-[var(--public-muted)]">
                  {role === "Pastor"
                    ? "Get to know our pastors and the stories they share with our congregation."
                    : "Meet the elders who serve and guide our church family."}
                </p>
              </div>
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

      <section className="public-dark bg-[var(--brand-ink)] text-white">
        <div className="public-container public-section grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div className="min-w-0 max-w-xl">
            <p className="public-eyebrow text-[var(--brand-gold)]!">Come as you are</p>
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
              <Link href="/contact" className="public-text-link text-[var(--brand-gold)]">
                Talk to the church team <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="min-w-0 border-t border-white/20 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
            <h3 className="mb-5 text-lg font-semibold">Join us on Sunday</h3>
            <ServiceTimes dark />
            <a
              href={church.mapsUrl}
              className="public-text-link mt-5 text-[var(--brand-gold)]"
            >
              Find us in Blantyre <FiArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
