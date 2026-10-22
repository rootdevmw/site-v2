"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { FiArrowUpRight, FiChevronDown, FiMenu } from "react-icons/fi";
import { church } from "@/config/church";
import { publicNavigation } from "@/config/public-navigation";
import { Dialog } from "@/components/ui/Dialog";

export function PublicHeader({ watchLink }: { watchLink: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 80rem)");
    function closeOnDesktop() {
      if (desktop.matches) setMenuOpen(false);
    }
    function closeOutside(event: PointerEvent) {
      if (!navRef.current?.contains(event.target as Node)) {
        navRef.current
          ?.querySelectorAll("details[open]")
          .forEach((item) => item.removeAttribute("open"));
      }
    }
    desktop.addEventListener("change", closeOnDesktop);
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      desktop.removeEventListener("change", closeOnDesktop);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--public-line)] bg-[#faf8f4]/95 backdrop-blur-md">
      <div className="border-b border-[var(--public-line)] bg-[#f0eadf]">
        <div className="public-container flex min-h-9 flex-wrap items-center justify-between gap-x-4 gap-y-1 py-1.5 text-[11px] font-medium text-[#594b3c]">
          <span>
            Mahatma Road, Blantyre{" "}
            <span aria-hidden="true" className="mx-1.5">
              ·
            </span>{" "}
            All are welcome
          </span>
          <Link
            href="/plan-visit#service-times"
            className="hidden underline-offset-4 hover:underline sm:inline"
          >
            Sunday service times ↗
          </Link>
        </div>
      </div>
      <div className="public-container flex min-h-20 items-center justify-between gap-3 py-3">
        <Link
          href="/"
          aria-label={church.name + " home"}
          className="flex shrink-0 items-center gap-3"
        >
          <Image
            src="/images/church-logo.webp"
            alt=""
            width={52}
            height={52}
            className="size-11 object-contain sm:size-13"
          />
          <span className="hidden min-[400px]:block">
            <span className="block text-sm font-bold tracking-tight sm:text-base">
              Church of Christ
            </span>
            <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--public-muted)]">
              at Red Cross
            </span>
          </span>
        </Link>

        <nav
          key={pathname}
          ref={navRef}
          aria-label="Main navigation"
          onBlur={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            ) {
              event.currentTarget
                .querySelectorAll("details[open]")
                .forEach((item) => item.removeAttribute("open"));
            }
          }}
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            const open = event.currentTarget.querySelector("details[open]");
            if (open) {
              open.removeAttribute("open");
              open.querySelector("summary")?.focus();
              event.preventDefault();
            }
          }}
          className="hidden items-center gap-1 xl:flex"
        >
          {publicNavigation.map((item) =>
            "children" in item ? (
              <details
                key={item.label}
                className="group relative"
                onToggle={(event) => {
                  const current = event.currentTarget;
                  if (current.open)
                    navRef.current
                      ?.querySelectorAll("details[open]")
                      .forEach((other) => {
                        if (other !== current) other.removeAttribute("open");
                      });
                }}
              >
                <summary
                  className={
                    "flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-lg px-3 text-sm font-semibold hover:bg-[#f0eadf] [&::-webkit-details-marker]:hidden " +
                    (item.children.some((child) => isActive(child.href))
                      ? "text-[var(--public-accent)]"
                      : "")
                  }
                >
                  {item.label}
                  <FiChevronDown
                    aria-hidden="true"
                    className="size-3.5 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                  />
                </summary>
                <div className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-[var(--public-line)] bg-white p-2 shadow-lg">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      aria-current={isActive(child.href) ? "page" : undefined}
                      className="block min-h-11 rounded-lg px-3 py-3 text-sm hover:bg-[#f3eee5] aria-[current=page]:bg-[#f3eee5] aria-[current=page]:font-semibold"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </details>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold hover:bg-[#f0eadf] aria-[current=page]:text-[var(--public-accent)]"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-5">
          <div className="hidden min-w-30 md:block">{watchLink}</div>
          <Link
            href="/plan-visit"
            className="public-button public-button-primary !min-h-11 !px-3 sm:!px-5"
          >
            Plan a visit
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open website navigation"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            className="flex size-11 items-center justify-center rounded-lg border border-[var(--public-line)] hover:bg-[#f0eadf] xl:hidden"
          >
            <FiMenu aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>

      <Dialog
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Explore our church"
        variant="drawer"
      >
        <nav aria-label="Mobile website navigation" className="space-y-6 p-5">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="public-text-link"
          >
            Home <FiArrowUpRight aria-hidden="true" />
          </Link>
          {publicNavigation.map((item) => (
            <div key={item.label}>
              {"children" in item ? (
                <>
                  <p className="public-eyebrow mb-2">{item.label}</p>
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={isActive(child.href) ? "page" : undefined}
                      className="flex min-h-11 items-center rounded-lg px-3 py-3 text-sm aria-[current=page]:bg-[#f3eee5] aria-[current=page]:font-semibold"
                    >
                      {child.label}
                    </Link>
                  ))}
                </>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="flex min-h-11 items-center px-3 text-sm font-semibold"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
          <div onClick={() => setMenuOpen(false)}>{watchLink}</div>
        </nav>
      </Dialog>
    </header>
  );
}
