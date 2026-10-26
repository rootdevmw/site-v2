"use client";

import Link from "next/link";
import { useState } from "react";
import { FiArrowRight, FiBookOpen } from "react-icons/fi";
import { Dialog } from "@/components/ui/Dialog";
import type { PublicLeader } from "@/lib/utils/public-leadership";
import { LeaderPortrait } from "./LeaderPortrait";

export function LeadershipProfileCard({
  person,
  role,
  featured = false,
}: {
  person: PublicLeader;
  role: "Pastor";
  featured?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const biography = person.bio?.replace(/\s+/g, " ").trim();
  const preview =
    biography && biography.length > 180
      ? biography.slice(0, 180).replace(/\s+\S*$/, "") + "…"
      : biography;
  return (
    <>
      <article
        className={
          "group h-full overflow-hidden rounded-2xl border border-[var(--public-line)] bg-white shadow-[0_4px_24px_-12px_#29241f25] transition-shadow hover:shadow-[0_12px_36px_-16px_#29241f40] motion-reduce:transition-none " +
          (featured ? "grid md:grid-cols-[0.85fr_1.15fr]" : "flex flex-col")
        }
      >
        <div className="relative min-w-0 overflow-hidden">
          <LeaderPortrait
            imageUrl={person.imageUrl}
            initials={person.initials}
            variant="portrait"
          />
          <span className="absolute bottom-4 left-4 rounded-full border border-white/60 bg-white/95 px-3.5 py-2 text-[10px] font-bold tracking-[0.16em] text-[var(--public-accent)] uppercase backdrop-blur-sm">
            {role}
          </span>
        </div>
        <div
          className={
            "flex min-w-0 flex-1 flex-col p-6 sm:p-7 " +
            (featured ? "md:justify-center md:p-10" : "")
          }
        >
          <p className="public-eyebrow">Meet our {role.toLowerCase()}</p>
          <h4 className="public-display mt-3 text-3xl leading-tight wrap-anywhere sm:text-[2.1rem]">
            {person.name}
          </h4>
          <p className="mt-4 mb-6 line-clamp-3 text-sm leading-7 text-[var(--public-muted)] wrap-anywhere">
            {preview ||
              "You are welcome to get in touch with the church team to learn more."}
          </p>
          <div
            className={
              "border-t border-[var(--public-line)] pt-4 " +
              (featured ? "mt-6" : "mt-auto")
            }
          >
            {person.bio ? (
              <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-label={`Read biography of ${person.name}`}
                onClick={() => setOpen(true)}
                className="public-text-link w-full justify-between gap-4 text-[var(--public-accent)]"
              >
                Read biography{" "}
                <FiArrowRight aria-hidden="true" className="shrink-0" />
              </button>
            ) : (
              <>
                <p className="mb-2 text-xs leading-6 text-[var(--public-muted)]">
                  Biography not yet published.
                </p>
                <Link
                  href="/contact"
                  className="public-text-link w-full justify-between gap-4 text-[var(--public-accent)]"
                >
                  Contact the church team{" "}
                  <FiArrowRight aria-hidden="true" className="shrink-0" />
                </Link>
              </>
            )}
          </div>
        </div>
      </article>
      {person.bio && (
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          title={person.name}
          description={`${role} · Church leadership`}
          size="wide"
          titleClassName="public-display text-3xl leading-tight wrap-anywhere sm:text-4xl"
        >
          {open && (
            <div className="grid items-start gap-6 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8">
              <div className="hidden overflow-hidden rounded-xl sm:block">
                <LeaderPortrait
                  imageUrl={person.imageUrl}
                  initials={person.initials}
                  variant="portrait"
                />
              </div>
              <div className="min-w-0">
                <p className="public-eyebrow mb-4 inline-flex max-w-full items-center gap-2">
                  <FiBookOpen aria-hidden="true" className="shrink-0" />
                  <span className="min-w-0 wrap-anywhere">
                    Get to know {person.name}
                  </span>
                </p>
                <div
                  role="region"
                  tabIndex={0}
                  aria-label={`Biography of ${person.name}`}
                  className="whitespace-pre-line text-base leading-8 text-[var(--public-muted)] wrap-anywhere"
                >
                  {person.bio}
                </div>
                <div className="mt-7 border-t border-[var(--public-line)] pt-4">
                  <Link
                    href="/contact"
                    className="public-text-link text-[var(--public-accent)]"
                  >
                    Connect with the church team{" "}
                    <FiArrowRight aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </Dialog>
      )}
    </>
  );
}
