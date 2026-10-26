import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
  FiArrowLeft,
  FiArrowRight,
  FiArrowUpRight,
  FiMapPin,
  FiMessageCircle,
} from "react-icons/fi";
import { loadPublicProgram } from "@/lib/public-api/program-details";
import {
  programDateLabel,
  programEnquiryHref,
  programHref,
  programLabel,
  programsHref,
  programsReturnHref,
} from "@/lib/utils/public-programs";
import { getProgramDayState } from "@/lib/utils/program-records";
import { ShareButton } from "@/components/public/ShareButton";
import { ProgramAgenda } from "./ProgramAgenda";

export async function programMetadata(address: string): Promise<Metadata> {
  const result = await loadPublicProgram(address);
  if (result.state !== "ready")
    return {
      title: "Program unavailable",
      robots: { index: false, follow: true },
    };
  const title = `${programLabel(result.program)} — ${programDateLabel(result.program)}`;
  const description = `Read the planned activities for ${programLabel(result.program)} on ${programDateLabel(result.program)} at Church of Christ at Red Cross.`;
  return {
    title,
    alternates: { canonical: programHref(result.program.slug) },
    description,
    openGraph: { title, description, type: "website" },
  };
}
export async function ProgramDetails({
  address,
  from: source,
}: {
  address: string;
  from?: unknown;
}) {
  const result = await loadPublicProgram(address),
    from = programsReturnHref(source);
  if (result.state === "missing") notFound();
  if (result.state === "unavailable")
    return (
      <section className="public-container public-section">
        <Link href={from} className="public-text-link">
          <FiArrowLeft aria-hidden="true" />
          Back to programs
        </Link>
        <h1 className="public-display mt-6 max-w-2xl text-4xl leading-tight sm:text-5xl">
          This program could not load.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-[var(--public-muted)]">
          Please try again, or ask the church team about the planned service.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <form action={programHref(address)} method="GET">
            <input type="hidden" name="from" value={from} />
            <button
              type="submit"
              className="public-button public-button-primary"
            >
              Try again
            </button>
          </form>
          <Link
            href="/contact"
            className="public-button public-button-secondary"
          >
            Contact the church
          </Link>
        </div>
      </section>
    );
  const { program } = result;
  if (program.slug !== address)
    permanentRedirect(programHref(program.slug, from));
  const state = getProgramDayState(program.date, new Date(result.checkedAt));
  return (
    <>
      <section className="public-container public-section-tight">
        <Link href={from} className="public-text-link">
          <FiArrowLeft aria-hidden="true" />
          Back to programs
        </Link>
        <div className="public-detail-grid">
          <header className="public-detail-intro min-w-0">
            <p className="public-eyebrow">Program · {state.label}</p>
            <h1 className="public-display mt-4 text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.1] wrap-anywhere">
              {programLabel(program)}
            </h1>
            <p className="mt-5 text-lg font-semibold leading-8">
              <time dateTime={program.date}>{programDateLabel(program)}</time>
            </p>
            <p className="mt-5 max-w-xl text-base leading-8 text-[var(--public-muted)]">
              {state.label === "Past program"
                ? "This program is from a past date. You can read its planned order here, or explore programs for today and the days ahead."
                : "Follow the planned order of activities and see who is helping lead this gathering."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#program-order"
                className="public-button public-button-primary"
              >
                Read the schedule
                <FiArrowRight aria-hidden="true" />
              </a>
              <ShareButton
                title={`${programLabel(program)} — ${programDateLabel(program)}`}
                path={programHref(program.slug)}
                label="Share this program"
              />
            </div>
          </header>
          <section
            aria-label="Program information"
            className="public-detail-facts min-w-0 rounded-2xl border border-[var(--public-line)] bg-white p-5 sm:p-6"
          >
            <h2 className="public-display text-2xl">At a glance</h2>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-[var(--public-muted)]">
                  Program date
                </dt>
                <dd className="mt-1 text-base leading-7">
                  <time dateTime={program.date}>
                    {programDateLabel(program)}
                  </time>
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--public-muted)]">
                  <FiMapPin aria-hidden="true" />
                  Venue
                </dt>
                <dd className="mt-1 text-base leading-7 wrap-anywhere">
                  {program.location?.trim() ||
                    "The venue has not been added. Please confirm it with the church team before visiting."}
                </dd>
              </div>
              {program.homecell && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-[var(--public-muted)]">
                    Homecell
                  </dt>
                  <dd className="mt-2">
                    <Link
                      href={
                        "/homecells/" +
                        encodeURIComponent(program.homecell.slug)
                      }
                      className="public-text-link max-w-full"
                    >
                      <span className="min-w-0 wrap-anywhere">
                        {program.homecell.name}
                      </span>
                      <FiArrowUpRight aria-hidden="true" className="shrink-0" />
                    </Link>
                  </dd>
                </div>
              )}
              <div className="border-t border-[var(--public-line)] pt-4">
                <dt className="text-xs font-semibold uppercase tracking-widest text-[var(--public-muted)]">
                  Planned activities
                </dt>
                <dd className="mt-1 text-base font-semibold">
                  {program.items.length
                    ? program.items.length
                    : "Still to come"}
                </dd>
              </div>
            </dl>
            <p className="mt-5 text-xs leading-5 text-[var(--public-muted)]">
              Program dates and clock times are local to Malawi. Please confirm
              the venue and current arrangements before visiting.
            </p>
          </section>
          <section
            id="program-order"
            aria-label="Program schedule"
            className="public-detail-body border-t border-[var(--public-line)] pt-6 min-w-0 scroll-mt-32"
          >
            <p className="public-eyebrow">The planned order</p>
            <h2 className="public-display mt-4 text-3xl leading-tight sm:text-4xl">
              Worship, one moment at a time.
            </h2>
            <p className="mt-5 text-sm leading-7 text-[var(--public-muted)]">
              Activities appear in their planned sequence. Clock times are local
              to Malawi.
            </p>
            <ProgramAgenda program={program} />
          </section>
          <aside className="public-detail-support min-w-0">
            <section className="rounded-2xl bg-[var(--brand-soft)] p-6">
              <h2 className="public-display text-2xl">
                Need a little guidance?
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
                Ask the church team about this program, the meeting place or
                taking part.
              </p>
              <a
                href={programEnquiryHref(program)}
                className="public-button public-button-primary mt-5 w-full"
              >
                <FiMessageCircle aria-hidden="true" className="shrink-0" />
                Ask on WhatsApp
                <FiArrowUpRight aria-hidden="true" className="shrink-0" />
              </a>
              <Link href="/contact" className="public-text-link mt-4">
                Other ways to contact us
                <FiArrowRight aria-hidden="true" />
              </Link>
            </section>
            {program.homecell && (
              <section className="mt-8">
                <h2 className="public-display text-2xl">
                  Life in your homecell
                </h2>
                <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
                  Explore this group and its other programs.
                </p>
                <Link
                  href={programsHref({
                    page: 1,
                    q: "",
                    typeId: "",
                    homecellId: program.homecell.id,
                    period: "upcoming",
                  })}
                  className="public-text-link mt-3"
                >
                  More homecell programs
                  <FiArrowRight aria-hidden="true" />
                </Link>
              </section>
            )}
          </aside>
        </div>
      </section>
      <section className="public-container flex flex-col items-start justify-between gap-7 public-section-tight lg:flex-row lg:items-center">
        <div className="min-w-0 max-w-xl">
          <p className="public-eyebrow">Come and share in it</p>
          <h2 className="public-display mt-3 text-3xl leading-tight sm:text-4xl">
            There is a place for you.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
            Plan your Sunday visit or explore more church programs.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/plan-visit"
            className="public-button public-button-primary"
          >
            Plan a visit
            <FiArrowRight aria-hidden="true" />
          </Link>
          <Link
            href="/programs"
            className="public-button public-button-secondary"
          >
            Today &amp; upcoming programs
          </Link>
        </div>
      </section>
    </>
  );
}
