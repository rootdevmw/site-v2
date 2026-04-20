"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Ministries", href: "/ministries" },
  { label: "Sermons", href: "/sermons" },
  { label: "Events", href: "/events" },
  { label: "Programs", href: "/programs" },
  { label: "Live", href: "/live" },
  { label: "Newsletters", href: "/newsletters" },
  { label: "Contact", href: "/contact" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Thin brand bar at top */}
      <div className="w-full bg-[#18342f] px-4 py-1.5 text-center text-xs font-medium tracking-widest text-[#a8c5bb] uppercase">
        Welcome — You are loved
      </div>

      <header
        className={[
          "sticky top-0 z-40 transition-all duration-300",
          scrolled
            ? "bg-white/98 shadow-[0_1px_24px_0_rgba(24,52,47,0.10)] backdrop-blur-md"
            : "bg-[#f7f9f6]/95 backdrop-blur",
        ].join(" ")}
      >
        {/* Hairline accent */}
        <div className="h-[3px] w-full bg-gradient-to-r from-[#18342f] via-[#4a7c6f] to-[#18342f]" />

        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* LEFT — Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#18342f]/20 bg-[#18342f] transition-transform duration-200 group-hover:scale-105">
              {/* Cross icon fallback if logo hasn't loaded */}
              <span className="absolute inset-0 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 text-[#a8c5bb]"
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
              <p className="font-serif text-base font-semibold leading-tight text-[#18342f] tracking-tight">
                Church of Christ
              </p>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#5a8a7d]">
                at Red Cross
              </p>
            </div>
          </Link>

          {/* CENTER — Nav */}
          <nav className="hidden lg:flex items-center">
            {navItems.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "relative px-3.5 py-2 text-[13px] font-medium text-[#3a5450] transition-colors duration-150 hover:text-[#18342f]",
                  "after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2 after:bg-[#4a7c6f] after:transition-all after:duration-200 hover:after:w-4/5",
                  i < navItems.length - 1 ? "" : "",
                ].join(" ")}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* RIGHT — Actions */}
          <div className="flex items-center gap-3">
            {/* Live badge */}
            <Link
              href="/live"
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-red-600 transition hover:bg-red-100"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
              </span>
              Live
            </Link>

            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#18342f] bg-[#18342f] px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#285047] hover:shadow-md active:scale-[0.98]"
            >
              Member Login
            </Link>

            {/* Mobile Toggle */}
            <button
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              className="lg:hidden flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-lg border border-[#d0ddd8] bg-white transition hover:bg-[#f0f5f3]"
            >
              <span
                className={`block h-[1.5px] w-5 bg-[#18342f] transition-all duration-200 ${open ? "translate-y-[6.5px] rotate-45" : ""}`}
              />
              <span
                className={`block h-[1.5px] w-5 bg-[#18342f] transition-all duration-200 ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-[1.5px] w-5 bg-[#18342f] transition-all duration-200 ${open ? "-translate-y-[6.5px] -rotate-45" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="border-t border-[#dce8e3] bg-white px-4 pb-6 pt-4">
            <div className="mb-4 grid grid-cols-2 gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#3a5450] transition hover:bg-[#f0f5f3] hover:text-[#18342f]"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-2 border-t border-[#dce8e3] pt-4">
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
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-[#18342f] py-2.5 text-center text-sm font-semibold text-white"
              >
                Member Login
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
