"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Ministries", href: "/ministries" },
  { label: "Homecells", href: "/homecells" },
  { label: "Sermons", href: "/sermons" },
  { label: "Events", href: "/events" },
  { label: "Programs", href: "/programs" },
  { label: "Live", href: "/live" },
  { label: "Newsletters", href: "/newsletters" },
  { label: "Contact", href: "/contact" },
];

const marqueeVerses = [
  "Welcome — You are loved",
  '"Come to me, all who are weary, and I will give you rest" — Matthew 11:28',
  '"For God so loved the world that he gave his one and only Son" — John 3:16',
  '"The Lord bless you and keep you" — Numbers 6:24',
  '"I can do all things through Christ who strengthens me" — Philippians 4:13',
  '"Your word is a lamp to my feet and a light to my path" — Psalm 119:105',
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [verseIndex, setVerseIndex] = useState(0);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVerseIndex((i) => (i + 1) % marqueeVerses.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header
        className={[
          "sticky top-0 z-40 transition-all duration-300",
          scrolled
            ? "bg-[#fdf8f2]/98 shadow-[0_1px_24px_0_rgba(124,61,15,0.12)] backdrop-blur-md"
            : "bg-[#fdf6ee]/95 backdrop-blur",
        ].join(" ")}
      >
        {/* ── Rotating Verse Bar ─────────────────────────── */}
        <div className="relative w-full overflow-hidden bg-linear-to-r from-[#7c3d0f] via-[#c2620a] to-[#7c3d0f]">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-linear-to-r from-[#7c3d0f] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-linear-to-l from-[#7c3d0f] to-transparent" />
          <div className="relative flex min-h-8 items-center justify-center py-1.5">
            <AnimatePresence mode="wait">
              <motion.p
                key={verseIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="px-8 text-center text-xs font-medium uppercase tracking-widest text-[#fde5c0] sm:whitespace-nowrap"
              >
                {marqueeVerses[verseIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Sunset gradient hairline */}
        <div className="h-[3px] w-full bg-gradient-to-r from-[#7c3d0f] via-[#e8820c] to-[#c2a23a]" />

        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* LEFT — Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#c2620a]/30 bg-gradient-to-br from-[#c2620a] to-[#7c3d0f] transition-transform duration-200 group-hover:scale-105">
              <span className="absolute inset-0 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 text-[#fde5c0]"
                  fill="currentColor"
                >
                  <path d="M11 2h2v8h8v2h-8v10h-2V12H3v-2h8z" />
                </svg>
              </span>
              <Image
                src="/logos/full-logo.png"
                alt=""
                fill
                className="relative z-10 rounded-full object-cover opacity-0 transition-opacity duration-300 [&[src]]:opacity-100"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <p className="font-serif text-base font-semibold leading-tight tracking-tight text-[#4a2008]">
                Church of Christ
              </p>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#c2620a]">
                at Red Cross
              </p>
            </div>
          </Link>

          {/* CENTER — Nav */}
          <nav className="hidden items-center lg:flex">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "relative px-3.5 py-2 text-[13px] font-medium transition-colors duration-150",
                    "after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:-translate-x-1/2 after:bg-gradient-to-r after:from-[#c2620a] after:to-[#c2a23a] after:transition-all after:duration-200",
                    active
                      ? "text-[#7c3d0f] after:w-4/5"
                      : "text-[#6b3d20] hover:text-[#7c3d0f] after:w-0 hover:after:w-4/5",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT — Actions */}
          <div className="flex items-center gap-3">
            {/* Live badge */}
            <Link
              href="/live"
              className="hidden items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-red-600 transition hover:bg-red-100 sm:flex"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
              </span>
              Live
            </Link>

            {/* Mobile Toggle */}
            <button
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-lg border border-[#e8c49a] bg-[#fdf6ee] transition hover:bg-[#faebd7] lg:hidden"
            >
              <span
                className={`block h-[1.5px] w-5 bg-[#7c3d0f] transition-all duration-200 ${open ? "translate-y-[6.5px] rotate-45" : ""}`}
              />
              <span
                className={`block h-[1.5px] w-5 bg-[#7c3d0f] transition-all duration-200 ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-[1.5px] w-5 bg-[#7c3d0f] transition-all duration-200 ${open ? "-translate-y-[6.5px] -rotate-45" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out lg:hidden ${open ? "max-h-[640px] opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="border-t border-[#e8c49a] bg-[#fdf6ee] px-4 pb-6 pt-4">
            <div className="mb-4 grid grid-cols-2 gap-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={[
                      "rounded-lg px-3 py-2.5 text-sm font-medium transition",
                      active
                        ? "bg-gradient-to-br from-[#c2620a] to-[#7c3d0f] text-white shadow-sm"
                        : "text-[#6b3d20] hover:bg-[#faebd7] hover:text-[#7c3d0f]",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 border-t border-[#e8c49a] pt-4">
              <Link
                href="/live"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                Watch Live
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
