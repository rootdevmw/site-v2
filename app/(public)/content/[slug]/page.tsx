import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import { ShareButton } from "@/components/public/ShareButton";
import { ScripturePassages } from "@/components/public/ScripturePassages";
import { loadPublicMessage } from "@/lib/public-api/messages";
import {
  messageAttribution,
  messageDate,
  messageHref,
  messagePassages,
  messageTags,
  messagesHref,
  messagesReturnHref,
  readMessageFilters,
  type MessageSearchParams,
} from "@/lib/utils/public-messages";
import {
  prepareMessageBody,
  messageExcerpt,
} from "@/lib/utils/public-message-body";
import { formatChurchDate } from "@/lib/utils/church-date";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<MessageSearchParams>;
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await loadPublicMessage((await params).slug);
  if (result.state !== "ready")
    return {
      title:
        result.state === "missing"
          ? "Message not found"
          : "Message unavailable",
      robots: { index: false, follow: true },
    };
  const { message } = result,
    description =
      messageExcerpt(prepareMessageBody(message.body).text, 155) ||
      "A message from Church of Christ at Red Cross in Blantyre, Malawi.";
  return {
    title: message.title,
    alternates: { canonical: messageHref(message.slug) },
    description,
    openGraph: { title: message.title, description, type: "article" },
  };
}

export default async function ContentDetailsPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params,
    from = messagesReturnHref((await searchParams).from);
  const result = await loadPublicMessage(slug);
  if (result.state === "missing") notFound();
  if (result.state === "unavailable")
    return (
      <section className="public-container public-section">
        <Link href={from} className="public-text-link">
          <FiArrowLeft aria-hidden="true" /> Back to messages
        </Link>
        <h1 className="public-display mt-6 max-w-2xl text-4xl leading-tight sm:text-5xl">
          This message could not load.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-[var(--public-muted)]">
          The message service is temporarily unavailable. Try again, or return
          to the message library.
        </p>
        <form action={messageHref(slug)} method="GET" className="mt-6">
          {from !== "/content" && (
            <input type="hidden" name="from" value={from} />
          )}
          <button type="submit" className="public-button public-button-primary">
            Try again
          </button>
        </form>
      </section>
    );
  const { message } = result;
  if (message.slug !== slug) permanentRedirect(messageHref(message.slug, from));
  const prepared = prepareMessageBody(message.body),
    author = messageAttribution(message),
    date = messageDate(message),
    references = [
      ...new Map(
        [...messagePassages(message), ...prepared.scriptures].map(
          (reference) => [reference.label, reference],
        ),
      ).values(),
    ],
    tags = messageTags(message);
  return (
    <>
      <header className="public-container py-10 sm:py-14">
        <Link href={from} className="public-text-link">
          <FiArrowLeft aria-hidden="true" /> Back to messages
        </Link>
        <div className="mt-6 max-w-4xl">
          <p className="public-eyebrow wrap-anywhere">
            {message.type?.name || "Message"}
          </p>
          <h1 className="public-display mt-4 text-[clamp(2.25rem,5vw,4.25rem)] leading-[1.15] wrap-anywhere">
            {message.title}
          </h1>
          {(author || date) && (
            <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm leading-7 text-[var(--public-muted)] wrap-anywhere">
              {author && (
                <span>
                  By{" "}
                  <span className="font-semibold text-[var(--public-ink)]">
                    {author}
                  </span>
                </span>
              )}
              {date && (
                <time dateTime={new Date(date).toISOString()}>
                  {formatChurchDate(date, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              )}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-x-7 gap-y-2">
            <a href="#message-body" className="public-text-link">
              Read the message <FiArrowRight aria-hidden="true" />
            </a>
            {references.length > 0 && (
              <a href="#message-scriptures" className="public-text-link">
                Scripture references <FiArrowRight aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </header>
      <div className="border-y border-[var(--public-line)] bg-white">
        <div className="public-container grid items-start gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16">
          <article aria-label={message.title} className="min-w-0">
            {prepared.media.length > 0 && (
              <nav
                aria-label="Open message media"
                className="mb-8 flex flex-wrap gap-3"
              >
                {prepared.media.map((media, index) => (
                  <a
                    key={media.href}
                    href={media.href}
                    className="public-button public-button-secondary"
                    aria-label={
                      (media.kind === "YouTube"
                        ? "Watch on YouTube"
                        : "Open " + media.kind.toLowerCase()) +
                      (prepared.media.length > 1 ? " " + (index + 1) : "")
                    }
                  >
                    {media.kind === "YouTube"
                      ? "Watch on YouTube"
                      : "Open " + media.kind.toLowerCase()}
                    <FiArrowUpRight aria-hidden="true" className="shrink-0" />
                  </a>
                ))}
              </nav>
            )}
            <div id="message-body" className="public-message-body scroll-mt-36">
              {prepared.hasContent ? (
                <div dangerouslySetInnerHTML={{ __html: prepared.html }} />
              ) : (
                <p>
                  The message text is not available here yet. Please contact the
                  church team if you would like to learn more.
                </p>
              )}
            </div>
            <div className="mt-10 border-t border-[var(--public-line)] pt-6">
              <ShareButton
                key={message.id}
                title={message.title}
                label="Share message"
                path={messageHref(message.slug)}
              />
            </div>
          </article>
          <aside
            aria-label="About this message"
            className="min-w-0 space-y-8 border-t border-[var(--public-line)] pt-8 lg:border-t-0 lg:pt-0"
          >
            {references.length > 0 && (
              <section id="message-scriptures" className="scroll-mt-36">
                <h2 className="text-base font-semibold">
                  Scripture references
                </h2>
                <ScripturePassages references={references} />
              </section>
            )}
            {tags.length > 0 && (
              <section>
                <h2 className="text-base font-semibold">
                  Explore these topics
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <li key={tag} className="min-w-0 max-w-full">
                      <Link
                        href={messagesHref(readMessageFilters({ tags: tag }))}
                        className="inline-flex min-h-11 max-w-full items-center rounded-full border border-[var(--public-line)] px-3 py-2 text-xs leading-5 wrap-anywhere"
                      >
                        #{tag}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section className="rounded-xl border border-[var(--public-line)] p-5">
              <h2 className="public-display text-2xl">
                A question on your mind?
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--public-muted)]">
                Talk to the church team about this message or exploring faith
                with us.
              </p>
              <Link href="/contact" className="public-text-link mt-3">
                Get in touch <FiArrowRight aria-hidden="true" />
              </Link>
            </section>
          </aside>
        </div>
      </div>
      <section className="public-container flex flex-col items-start justify-between gap-6 py-12 lg:flex-row lg:items-center">
        <div className="min-w-0 max-w-xl">
          <p className="public-eyebrow">Keep exploring</p>
          <h2 className="public-display mt-3 text-3xl leading-tight sm:text-4xl">
            More teaching. More conversation.
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={from} className="public-button public-button-primary">
            Back to messages <FiArrowRight aria-hidden="true" />
          </Link>
          <Link
            href="/plan-visit"
            className="public-button public-button-secondary"
          >
            Join us on Sunday
          </Link>
        </div>
      </section>
    </>
  );
}
