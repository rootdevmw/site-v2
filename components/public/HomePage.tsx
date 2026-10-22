import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { FiArrowRight, FiArrowUpRight, FiClock, FiMapPin } from "react-icons/fi";
import worshipPhoto from "@/public/images/worship.webp";
import welcomePhoto from "@/public/images/welcome.webp";
import communityPhoto from "@/public/images/community.webp";
import { church, combinedService, sundayServices } from "@/config/church";
import { getPublishedContent } from "@/lib/public-api/content";
import { getPublicEvents } from "@/lib/public-api/events";
import { getPublicMinistries } from "@/lib/public-api/ministries";
import { formatChurchDate } from "@/lib/utils/church-date";
import { loadHomeFeed } from "@/lib/utils/optional-feed";

export function HomePage() {
  return (
    <>
      <section className="public-container grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:py-16">
        <div className="min-w-0">
          <p className="public-eyebrow">A church family in Blantyre, Malawi</p>
          <h1 className="public-display mt-5 max-w-xl text-[clamp(2.75rem,5.1vw,4.8rem)] leading-[1.08]">Rooted in Christ.<br />Growing together.</h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-[var(--public-muted)] sm:text-lg">A place to worship, explore Scripture, and share life. Wherever you are on your journey of faith, you are welcome at Red Cross.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/plan-visit" className="public-button public-button-primary">Plan your first visit <FiArrowUpRight aria-hidden="true" /></Link>
            <Link href="/live" className="public-button public-button-secondary">Watch online <FiArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="mt-9 border-t border-[var(--public-line)] pt-6">
            <p className="text-sm font-semibold">Join us this Sunday</p>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[var(--public-muted)]">
              {sundayServices.map((service) => <span key={service.language}>{service.time} <span aria-hidden="true">·</span> {service.language}</span>)}
            </div>
            <p className="mt-3 max-w-md text-xs leading-6 text-[var(--public-muted)]">{combinedService.note}</p>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[#e7e0d5] lg:aspect-auto lg:min-h-[35rem]">
          <Image src={worshipPhoto} alt="The congregation gathered for worship at Church of Christ at Red Cross" fill preload placeholder="blur" sizes="(min-width: 1280px) 640px, (min-width: 1024px) 50vw, 100vw" className="object-cover object-[60%_65%]" />
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent px-6 pb-6 pt-20 text-white sm:px-8 sm:pb-8">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/85">Church of Christ at Red Cross</p>
            <p className="public-display mt-2 text-2xl sm:text-3xl">Worship. Fellowship. Belonging.</p>
          </div>
        </div>
      </section>

      <section aria-label="Sunday essentials" className="border-y border-[var(--public-line)] bg-white">
        <div className="public-container grid gap-7 py-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          <div className="flex items-start gap-4"><FiClock aria-hidden="true" className="mt-1 size-5 shrink-0 text-[var(--public-accent)]" /><div><h2 className="text-sm font-semibold">Two languages. One church family.</h2><p className="mt-2 text-sm leading-6 text-[var(--public-muted)]">English at {sundayServices[0].time}<br />Chichewa at {sundayServices[1].time}</p><Link href="/plan-visit#service-times" className="public-text-link">Full service details <FiArrowRight aria-hidden="true" /></Link></div></div>
          <div className="flex items-start gap-4"><FiMapPin aria-hidden="true" className="mt-1 size-5 shrink-0 text-[var(--public-accent)]" /><div><h2 className="text-sm font-semibold">Come and find us</h2><p className="mt-2 text-sm leading-6 text-[var(--public-muted)]">{church.address}</p><a href={church.mapsUrl} className="public-text-link">Get directions <FiArrowUpRight aria-hidden="true" /></a></div></div>
          <div className="sm:col-span-2 lg:col-span-1"><h2 className="text-sm font-semibold">Your first Sunday starts here</h2><p className="mt-2 text-sm leading-6 text-[var(--public-muted)]">Find the times, the place, and a little about the community you will meet.</p><Link href="/plan-visit" className="public-text-link">Get to know us <FiArrowRight aria-hidden="true" /></Link></div>
        </div>
      </section>

      <section className="public-container public-section grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[#e7e0d5]">
          <Image src={communityPhoto} alt="Members of the Red Cross church family smiling together with their Bibles" fill placeholder="blur" sizes="(min-width: 1280px) 600px, (min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="max-w-xl">
          <p className="public-eyebrow">Faith is a shared journey</p>
          <h2 className="public-display mt-4 text-4xl leading-tight sm:text-5xl">Faith grows<br className="hidden sm:block" /> in community.</h2>
          <p className="mt-6 text-base leading-8 text-[var(--public-muted)]">We are a church family seeking to follow Jesus and live out the teaching of the New Testament. We gather to worship, learn from Scripture, encourage one another, and serve.</p>
          <p className="mt-4 text-base leading-8 text-[var(--public-muted)]">Come with your questions, your hopes, and your everyday life. There is room to grow together.</p>
          <Link href="/about" className="public-text-link mt-5">Meet our church <FiArrowUpRight aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="public-dark bg-[#25221f] text-white">
        <div className="public-container public-section">
          <p className="public-eyebrow !text-[#efd8af]">From Scripture to everyday life</p>
          <Suspense fallback={<FeedLoading label="Loading recent messages…" />}><FeaturedMessages /></Suspense>
        </div>
      </section>

      <section className="public-container public-section">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><p className="public-eyebrow">Make a connection</p><h2 className="public-display mt-4 text-4xl leading-tight sm:text-5xl">Find your community.</h2></div>
          <Link href="/ministries" className="public-text-link">Explore ministries <FiArrowUpRight aria-hidden="true" /></Link>
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <Link href="/homecells" className="group block min-w-0 rounded-2xl">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#e7e0d5]"><Image src={welcomePhoto} alt="Families and members arriving at the church building" fill placeholder="blur" sizes="(min-width: 1280px) 620px, (min-width: 1024px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none" /></div>
            <p className="public-eyebrow mt-6">Homecells · small groups</p><h3 className="public-display mt-2 text-3xl leading-tight">A smaller circle.<br />A deeper connection.</h3><p className="mt-3 max-w-lg text-sm leading-7 text-[var(--public-muted)]">Share Scripture, prayer, and encouragement in a homecell near you.</p><span className="public-text-link mt-2">Find a homecell <FiArrowUpRight aria-hidden="true" /></span>
          </Link>
          <Suspense fallback={<FeedLoading label="Loading ways to connect…" />}><MinistryHighlights /></Suspense>
        </div>
      </section>

      <section className="bg-[#f0eadf]">
        <div className="public-container public-section">
          <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="public-eyebrow">Life together</p><h2 className="public-display mt-4 text-4xl leading-tight sm:text-5xl">Gather with us.</h2></div><Link href="/events" className="public-text-link">All upcoming gatherings <FiArrowUpRight aria-hidden="true" /></Link></div>
          <Suspense fallback={<FeedLoading label="Loading upcoming gatherings…" />}><UpcomingEvents /></Suspense>
        </div>
      </section>

      <section className="public-container public-section flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div className="max-w-2xl"><p className="public-eyebrow">You do not have to carry it alone</p><h2 className="public-display mt-4 text-4xl leading-tight sm:text-5xl">How can we pray with you?</h2><p className="mt-5 text-base leading-8 text-[var(--public-muted)]">Whatever this season holds, we would be glad to join you in prayer.</p></div>
        <div className="flex flex-wrap gap-3"><Link href="/prayer-request" className="public-button public-button-primary">Request prayer <FiArrowUpRight aria-hidden="true" /></Link><Link href="/contact" className="public-button public-button-secondary">Talk to us</Link></div>
      </section>
    </>
  );
}

async function FeaturedMessages() {
  const result = await loadHomeFeed((options) => getPublishedContent({ limit: 3 }, options));
  const [featured, ...more] = result.data ?? [];
  return (
    <div className="mt-6 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
      <div className="min-w-0"><h2 className="public-display text-4xl leading-tight wrap-break-word sm:text-5xl">{featured?.title || "A word for the week. Faith for everyday life."}</h2>
        {featured ? <><p className="mt-5 text-sm leading-7 text-stone-300">{[featured.author && [featured.author.firstName, featured.author.lastName].filter(Boolean).join(" "), featured.createdAt && formatChurchDate(featured.createdAt, { month: "long", day: "numeric", year: "numeric" })].filter(Boolean).join(" · ")}</p><Link href={"/content/" + (featured.slug || featured.id)} className="public-button public-button-light mt-7">Read message <FiArrowUpRight aria-hidden="true" /></Link></> : <><blockquote className="mt-6 max-w-xl text-lg leading-8 text-stone-200">“Your word is a lamp to my feet and a light to my path.”</blockquote><p className="mt-3 text-xs uppercase tracking-widest text-stone-400">Psalm 119:105</p></>}
      </div>
      <div className="min-w-0 lg:border-l lg:border-white/15 lg:pl-10"><h3 className="text-xs font-semibold uppercase tracking-widest text-stone-300">Explore the message library</h3>
        {more.map((item) => <Link key={item.id} href={"/content/" + (item.slug || item.id)} className="flex min-h-20 items-center justify-between gap-4 border-b border-white/15 py-5 text-lg leading-7 hover:text-[#efd8af]"><span className="min-w-0 wrap-break-word">{item.title}</span><FiArrowUpRight aria-hidden="true" className="size-5 shrink-0" /></Link>)}
        <p className="mt-5 text-sm leading-7 text-stone-300">{result.unavailable ? "Recent messages could not be loaded. You can try the message library again shortly." : "Teachings, articles, and reflections to help us follow Christ throughout the week."}</p><Link href="/content" className="public-text-link mt-4 text-[#efd8af]">Browse all messages <FiArrowRight aria-hidden="true" /></Link>
      </div>
    </div>
  );
}

async function MinistryHighlights() {
  const result = await loadHomeFeed((options) => getPublicMinistries({ limit: 3 }, options));
  const ministries = result.data ?? [];
  return <div className="min-w-0"><p className="public-eyebrow">Put faith into practice</p><h3 className="public-display mt-3 text-3xl">A place to take part.</h3>
    {ministries.length ? <div className="mt-5">{ministries.map((ministry) => <Link key={ministry.id} href={"/ministries/" + (ministry.slug || ministry.id)} className="group flex items-start justify-between gap-5 border-t border-[var(--public-line)] py-6"><div className="min-w-0"><h4 className="text-lg font-semibold wrap-break-word group-hover:text-[var(--public-accent)]">{ministry.name}</h4>{ministry.purpose && <p className="mt-2 line-clamp-2 text-sm leading-7 text-[var(--public-muted)]">{ministry.purpose}</p>}</div><FiArrowUpRight aria-hidden="true" className="mt-1 size-5 shrink-0" /></Link>)}</div> : <><p className="mt-5 text-base leading-8 text-[var(--public-muted)]">Ministries bring people together to serve, encourage, and grow. Explore the ways to take part in our church community.</p>{result.unavailable && <p className="mt-3 text-sm leading-7 text-[var(--public-muted)]">The ministry list is temporarily unavailable. Please try again shortly or contact the church.</p>}<Link href="/ministries" className="public-text-link mt-5">Find a way to serve <FiArrowRight aria-hidden="true" /></Link></>}
  </div>;
}

async function UpcomingEvents() {
  const result = await loadHomeFeed((options) => getPublicEvents({ limit: 3, period: "upcoming" }, options));
  const events = result.data ?? [];
  if (!events.length) return <div className="mt-10 border-t border-[#d9d0c3] pt-8"><p className="max-w-xl text-base leading-8 text-[var(--public-muted)]">{result.unavailable ? "Upcoming gatherings could not be loaded right now. Our regular Sunday service information is available on the visit page." : "There are no upcoming events listed at the moment. You are welcome to join us for our regular Sunday worship."}</p><Link href="/plan-visit" className="public-text-link mt-3">Join us on Sunday <FiArrowRight aria-hidden="true" /></Link></div>;
  return <div className="mt-10 border-t border-[#d9d0c3]">{events.map((event) => <Link key={event.id} href={"/events/" + (event.slug || event.id)} className="group grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-4 border-b border-[#d9d0c3] py-6 sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:gap-8 sm:py-8"><div className="text-center"><span className="block text-xs font-semibold uppercase tracking-widest">{formatChurchDate(event.startTime, { month: "short" })}</span><span className="public-display mt-1 block text-4xl sm:text-5xl">{formatChurchDate(event.startTime, { day: "numeric" })}</span></div><div className="min-w-0"><h3 className="text-lg font-semibold wrap-break-word group-hover:text-[var(--public-accent)] sm:text-xl">{event.title}</h3><p className="mt-2 text-sm leading-6 text-[var(--public-muted)]">{formatChurchDate(event.startTime, { weekday: "long", hour: "numeric", minute: "2-digit" })} CAT{event.location && <span className="mt-1 block sm:ml-3 sm:mt-0 sm:inline">{event.location}</span>}</p></div><FiArrowUpRight aria-hidden="true" className="size-5 shrink-0" /></Link>)}</div>;
}

function FeedLoading({ label }: { label: string }) {
  return <div role="status" className="flex min-h-56 items-center text-sm opacity-75">{label}</div>;
}
