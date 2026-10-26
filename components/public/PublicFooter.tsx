import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import { church, homecellGathering } from "@/config/church";
import { churchContent } from "@/config/church-content";
import { ServiceTimes } from "./ServiceTimes";

export function PublicFooter() {
  return (
    <footer className="public-dark bg-[var(--brand-dark)] text-[var(--brand-surface)]">
      <div className="public-container">
        <div className="flex flex-col items-start justify-between gap-6 border-b border-white/15 py-12 sm:py-16 lg:flex-row lg:items-center">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-gold)]">Your next Sunday</p>
            <h2 className="public-display max-w-xl text-3xl leading-tight sm:text-4xl">There is a place for you here.</h2>
          </div>
          <Link href="/plan-visit" className="public-button public-button-light">Come worship with us <FiArrowRight aria-hidden="true" /></Link>
        </div>

        <div className="grid gap-12 py-12 sm:grid-cols-2 lg:grid-cols-[1.15fr_1fr_0.65fr_1.15fr] lg:gap-10 lg:py-16">
          <div>
            <Link href="/" className="inline-flex items-center gap-3" aria-label={church.name + " home"}>
              <Image src="/logos/full-logo.png" alt="" width={64} height={64} className="size-14 rounded-full bg-[var(--brand-surface)] object-cover p-1" />
              <span className="text-sm font-semibold leading-6">Church of Christ<br /><span className="font-normal text-stone-300">at Red Cross</span></span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-7 text-stone-300">{churchContent.footerSummary}</p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
              <a href={church.facebookUrl} target="_blank" rel="noopener noreferrer" className="public-text-link text-stone-200">Facebook <FiArrowUpRight aria-hidden="true" /></a>
              <a href={church.youtubeUrl} target="_blank" rel="noopener noreferrer" className="public-text-link text-stone-200">YouTube <FiArrowUpRight aria-hidden="true" /></a>
              <a href={church.tiktokUrl} target="_blank" rel="noopener noreferrer" className="public-text-link text-stone-200">TikTok <FiArrowUpRight aria-hidden="true" /></a>
            </div>
          </div>
          <div>
            <h3 className="mb-6 text-sm font-semibold">Join us on Sunday</h3>
            <ServiceTimes dark />
            <p className="mt-5 border-t border-white/15 pt-4 text-sm leading-6 text-stone-300">Homecell prayers · {homecellGathering.day}, {homecellGathering.time}<br /><span className="text-xs">{homecellGathering.note}</span></p>
          </div>
          <nav aria-label="Footer navigation">
            <h3 className="mb-4 text-sm font-semibold">Explore</h3>
            {[
              ["Our story", "/about#our-story"], ["Faith and practice", "/about#our-beliefs"], ["Messages", "/content"], ["Ministries", "/ministries"],
              ["Homecells", "/homecells"], ["Events", "/events"], ["Prayer", "/prayer-request"],
            ].map(([label, href]) => <Link key={href} href={href} className="flex min-h-11 items-center text-sm text-stone-300 hover:text-white">{label}</Link>)}
          </nav>
          <div>
            <h3 className="mb-4 text-sm font-semibold">Find us & get in touch</h3>
            <a href={church.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex gap-2 text-sm leading-7 text-stone-300 hover:text-white">{church.address}<FiArrowUpRight aria-hidden="true" className="mt-1.5 shrink-0" /></a>
            <a href={church.phoneUrl} className="mt-4 flex min-h-11 items-center text-sm text-stone-300 hover:text-white">{church.phone}</a>
            <a href={"mailto:" + church.email} className="flex min-h-11 items-center text-sm text-stone-300 wrap-anywhere hover:text-white">{church.email}</a>
            <Link href="/contact" className="public-text-link mt-3 text-[var(--brand-gold)]">Contact the church <FiArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
        <div className="flex flex-col gap-4 border-t border-white/15 py-6 text-xs text-stone-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {church.name}. All rights reserved.</p>
          <Link href="/login" className="inline-flex min-h-11 items-center gap-2 text-stone-300 hover:text-white">Member & staff login <FiArrowUpRight aria-hidden="true" /></Link>
        </div>
      </div>
    </footer>
  );
}
