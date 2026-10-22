import Link from "next/link";
import { FiArrowRight, FiHeadphones, FiPlay } from "react-icons/fi";
import type {
  PublicMessage,
  MessageFilters,
} from "@/lib/utils/public-messages";
import {
  messageAttribution,
  messageDate,
  messageHref,
  messageTags,
  messagesHref,
} from "@/lib/utils/public-messages";
import {
  prepareMessageBody,
  messageExcerpt,
} from "@/lib/utils/public-message-body";
import { formatChurchDate } from "@/lib/utils/church-date";

export function MessageCard({
  message,
  filters,
}: {
  message: PublicMessage;
  filters: MessageFilters;
}) {
  const prepared = prepareMessageBody(message.body),
    author = messageAttribution(message),
    date = messageDate(message);
  const href = messageHref(message.slug, messagesHref(filters));
  const hasVideo = prepared.media.some((item) => item.kind !== "Audio"),
    hasAudio = prepared.media.some((item) => item.kind === "Audio");
  return (
    <li className="flex min-w-0 flex-col rounded-2xl border border-[var(--public-line)] bg-white p-5 sm:p-7">
      <p className="public-eyebrow wrap-anywhere">
        {message.type?.name || "Message"}
      </p>
      <h2 className="public-display mt-4 text-2xl leading-snug wrap-anywhere sm:text-3xl">
        <Link href={href} className="hover:text-[var(--public-accent)]">
          {message.title}
        </Link>
      </h2>
      {(author || date) && (
        <p className="mt-4 text-xs leading-6 text-[var(--public-muted)] wrap-anywhere">
          {author && <span className="block font-semibold">{author}</span>}
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
      {prepared.text && (
        <p className="mt-4 text-sm leading-7 text-[var(--public-muted)] wrap-anywhere">
          {messageExcerpt(prepared.text)}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-[var(--public-muted)]">
        {hasVideo && (
          <span className="inline-flex items-center gap-1.5">
            <FiPlay aria-hidden="true" /> Video included
          </span>
        )}
        {hasAudio && (
          <span className="inline-flex items-center gap-1.5">
            <FiHeadphones aria-hidden="true" /> Audio included
          </span>
        )}
      </div>
      {messageTags(message).length > 0 && (
        <ul aria-label="Message topics" className="mt-4 flex flex-wrap gap-2">
          {messageTags(message).map((tag) => (
            <li key={tag} className="min-w-0 max-w-full">
              <Link
                href={messagesHref(filters, { page: 1, tags: tag })}
                className="inline-flex min-h-11 max-w-full items-center rounded-full border border-[var(--public-line)] px-3 py-2 text-xs leading-5 wrap-anywhere hover:bg-[#f3eee5]"
              >
                #{tag}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link
        href={href}
        className="public-text-link mt-6 justify-between border-t border-[var(--public-line)] pt-5"
        aria-label={`Open message: ${message.title}`}
      >
        Open message <FiArrowRight aria-hidden="true" className="shrink-0" />
      </Link>
    </li>
  );
}
