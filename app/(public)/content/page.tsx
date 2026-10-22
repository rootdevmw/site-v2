import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import {
  MessageBrowse,
  MessageListLoading,
} from "@/components/public/MessageBrowse";
import {
  messagesHref,
  readMessageFilters,
  type MessageSearchParams,
} from "@/lib/utils/public-messages";

export const metadata: Metadata = {
  title: "Messages and teaching",
  description:
    "Explore published messages, Bible teaching and reflections from Church of Christ at Red Cross in Blantyre. Search by words, message type and topic.",
};

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<MessageSearchParams>;
}) {
  const filters = readMessageFilters(await searchParams);
  return (
    <>
      <section className="public-container py-12 sm:py-16">
        <div className="flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-end lg:gap-12">
          <div className="min-w-0 max-w-3xl">
            <p className="public-eyebrow">Teaching &amp; reflection</p>
            <h1 className="public-display mt-5 text-[clamp(2.75rem,5vw,4.75rem)] leading-[1.1]">
              Messages for
              <br />
              the journey.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--public-muted)] sm:text-lg">
              Return to Scripture, explore a question, or find encouragement for
              the week. Browse teaching, articles and reflections shared by our
              church.
            </p>
          </div>
          <Link href="/live" className="public-button public-button-secondary">
            Join us online <FiArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </section>
      <section
        aria-label="Message library"
        className="public-container pb-14 sm:pb-20"
      >
        <Suspense key={messagesHref(filters)} fallback={<MessageListLoading />}>
          <MessageBrowse filters={filters} />
        </Suspense>
      </section>
      <section className="border-t border-[var(--public-line)] bg-[#f3eee5]">
        <div className="public-container flex flex-col items-start justify-between gap-7 py-12 lg:flex-row lg:items-center">
          <div className="min-w-0 max-w-2xl">
            <p className="public-eyebrow">Faith grows in community</p>
            <h2 className="public-display mt-3 text-3xl leading-tight sm:text-4xl">
              Keep the conversation going.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
              You are welcome to explore these questions with us, at a Sunday
              service or in a homecell.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/plan-visit"
              className="public-button public-button-primary"
            >
              Plan a visit <FiArrowRight aria-hidden="true" />
            </Link>
            <Link
              href="/homecells"
              className="public-button public-button-secondary"
            >
              Explore homecells
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
