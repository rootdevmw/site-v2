import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiHeart,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
  FiUsers,
} from "react-icons/fi";
import welcomePhoto from "@/public/images/welcome.webp";
import { ServiceTimes } from "@/components/public/ServiceTimes";
import { church, homecellGathering } from "@/config/church";

export const metadata: Metadata = {
  alternates: { canonical: "/contact" },
  title: "Contact the church",
  description:
    "Contact Church of Christ at Red Cross in Blantyre by phone, WhatsApp or email. Find directions, Sunday service times, prayer and church portal invitation help.",
};

const ways = [
  {
    title: "Your first visit",
    text: "Find out what to expect, choose a service, or introduce yourself before Sunday.",
    href: "/plan-visit",
    action: "Plan a visit",
    Icon: FiUsers,
  },
  {
    title: "Someone to pray with you",
    text: "Share what is on your heart with the church prayer team through our prayer request page.",
    href: "/prayer-request",
    action: "Request prayer",
    Icon: FiHeart,
  },
  {
    title: "A place to get involved",
    text: "Explore our ministries and talk to the church team about taking part.",
    href: "/ministries",
    action: "Explore ministries",
    Icon: FiMessageCircle,
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="public-container grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div className="min-w-0">
          <p className="public-eyebrow">Contact · {church.name}</p>
          <h1 className="public-display mt-5 text-[clamp(2.75rem,5vw,4.75rem)] leading-[1.1]">
            We&apos;d love to
            <br />
            hear from you.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[var(--public-muted)] sm:text-lg">
            Planning a first visit, looking for prayer, or hoping to get
            involved? Start a conversation with the church team. You are welcome
            to ask questions.
          </p>
          <div className="mt-7 flex flex-wrap gap-x-7 gap-y-2">
            <a href="#find-us" className="public-text-link">
              Find us &amp; Sunday times <FiArrowRight aria-hidden="true" />
            </a>
            <a href="#portal-help" className="public-text-link">
              Church portal help <FiArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="min-w-0 rounded-[1.5rem] border border-[var(--public-line)] bg-white p-6 sm:p-8">
          <h2 className="public-display text-2xl sm:text-3xl">
            Talk to the church team.
          </h2>
          <a
            href={church.whatsappUrl}
            className="public-button public-button-primary mt-6 w-full"
          >
            <FiMessageCircle aria-hidden="true" className="shrink-0" /> Message
            on WhatsApp{" "}
            <FiArrowUpRight aria-hidden="true" className="shrink-0" />
          </a>
          <dl className="mt-5 divide-y divide-[var(--public-line)]">
            <div className="py-4">
              <dt className="flex items-center gap-2 text-xs font-semibold text-[var(--public-muted)]">
                <FiPhone aria-hidden="true" /> Call us
              </dt>
              <dd>
                <a
                  href={church.phoneUrl}
                  className="public-text-link mt-1 wrap-anywhere"
                >
                  {church.phone}
                </a>
              </dd>
            </div>
            <div className="py-4">
              <dt className="flex items-center gap-2 text-xs font-semibold text-[var(--public-muted)]">
                <FiMail aria-hidden="true" /> Email us
              </dt>
              <dd className="min-w-0">
                <a
                  href={`mailto:${church.email}`}
                  className="mt-1 inline-flex min-h-11 max-w-full items-center py-2 text-sm font-semibold underline decoration-[var(--public-line)] underline-offset-4 wrap-anywhere hover:decoration-current"
                >
                  {church.email}
                </a>
              </dd>
            </div>
          </dl>
          <p className="border-t border-[var(--public-line)] pt-5 text-xs leading-6 text-[var(--public-muted)]">
            These links open WhatsApp, your phone or your email app so you can
            contact us directly.
          </p>
        </div>
      </section>

      <section
        id="find-us"
        className="scroll-mt-36 border-y border-[var(--public-line)] bg-white"
      >
        <div className="public-container public-section grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <figure className="min-w-0">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[#e7e0d5]">
              <Image
                src={welcomePhoto}
                alt="Members and families arriving outside the church building at Red Cross"
                fill
                placeholder="blur"
                sizes="(min-width: 1280px) 640px, (min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:justify-between sm:gap-6">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <FiMapPin aria-hidden="true" className="shrink-0" />{" "}
                  {church.name}
                </p>
                <address className="mt-2 text-sm not-italic leading-7 text-[var(--public-muted)]">
                  {church.address}
                </address>
              </div>
              <a
                href={church.mapsUrl}
                className="public-button public-button-secondary sm:shrink-0"
              >
                Get directions <FiArrowUpRight aria-hidden="true" />
              </a>
            </figcaption>
          </figure>
          <div className="min-w-0 max-w-xl">
            <p className="public-eyebrow">Visit us in Blantyre</p>
            <h2 className="public-display mt-4 text-4xl leading-tight sm:text-5xl">
              See you on Sunday.
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--public-muted)]">
              Join our English or Chichewa service. On the last Sunday of each
              month, we worship together in one combined service.
            </p>
            <div className="mt-7 rounded-2xl border border-[var(--public-line)] bg-[#faf8f4] p-5 sm:p-6">
              <h3 className="mb-5 text-base font-semibold">Sunday worship</h3>
              <ServiceTimes />
            </div>
            <p className="mt-6 text-sm leading-7 text-[var(--public-muted)]">
              Homecell prayers meet on {homecellGathering.day}s at{" "}
              {homecellGathering.time}, in respective homes according to each
              homecell&apos;s program.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-7 gap-y-2">
              <Link href="/plan-visit" className="public-text-link">
                What to expect <FiArrowRight aria-hidden="true" />
              </Link>
              <Link href="/homecells" className="public-text-link">
                Find a homecell <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="public-container public-section">
        <div className="max-w-2xl">
          <p className="public-eyebrow">Take the next step</p>
          <h2 className="public-display mt-4 text-4xl leading-tight sm:text-5xl">
            How can we help?
          </h2>
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-3 lg:gap-12">
          {ways.map(({ title, text, href, action, Icon }) => (
            <div
              key={href}
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
              <Link href={href} className="public-text-link mt-3">
                {action} <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
        <div
          id="portal-help"
          className="mt-12 grid scroll-mt-36 gap-6 rounded-2xl border border-[var(--public-line)] bg-white p-6 sm:p-8 lg:grid-cols-[1fr_1fr] lg:gap-12"
        >
          <div className="min-w-0">
            <p className="public-eyebrow">Church portal access</p>
            <h3 className="public-display mt-3 text-2xl sm:text-3xl">
              Need an account invitation?
            </h3>
            <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
              Church portal accounts are arranged by the church team. Call,
              email or message us using the details above, and share the email
              address you want to use.
            </p>
            <Link href="/register" className="public-text-link mt-3">
              How invitations work <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className="min-w-0 border-t border-[var(--public-line)] pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <h4 className="text-base font-semibold">
              Already have an account?
            </h4>
            <p className="mt-3 text-sm leading-7 text-[var(--public-muted)]">
              Sign in to continue. If you have forgotten your password or your
              invitation has expired, request a fresh password link.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              <Link href="/login" className="public-text-link">
                Sign in <FiArrowRight aria-hidden="true" />
              </Link>
              <Link href="/login?mode=forgot" className="public-text-link">
                Get a fresh password link <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="public-dark bg-[#29241f] text-white">
        <div className="public-container flex flex-col items-start justify-between gap-8 py-12 sm:py-16 lg:flex-row lg:items-center lg:gap-12">
          <div className="min-w-0 max-w-xl">
            <p className="public-eyebrow text-[#efd8af]!">Keep in touch</p>
            <h2 className="public-display mt-4 text-3xl leading-tight sm:text-4xl">
              Stay connected through the week.
            </h2>
            <p className="mt-4 text-sm leading-7 text-stone-300">
              Follow the church on Facebook and YouTube, or find our latest
              messages here on the website.
            </p>
          </div>
          <div className="flex min-w-0 flex-wrap gap-x-6 gap-y-3">
            <a
              href={church.facebookUrl}
              className="public-button public-button-light"
            >
              Facebook <FiArrowUpRight aria-hidden="true" />
            </a>
            <a
              href={church.youtubeUrl}
              className="public-text-link text-[#efd8af]"
            >
              YouTube <FiArrowUpRight aria-hidden="true" />
            </a>
            <Link href="/content" className="public-text-link text-[#efd8af]">
              Latest messages <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
