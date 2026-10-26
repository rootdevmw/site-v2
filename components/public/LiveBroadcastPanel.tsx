"use client";

import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { useLiveBroadcast } from "@/lib/hooks/use-live-broadcast";
import type { LiveSnapshot } from "@/lib/public-api/live";
import { BroadcastPlayer } from "./BroadcastPlayer";
import { ChannelLinks } from "./ChannelLinks";

export function LiveBroadcastPanel({
  initialSnapshot,
}: {
  initialSnapshot: LiveSnapshot;
}) {
  const snapshot = useLiveBroadcast(initialSnapshot);
  const live = snapshot.state === "live" && snapshot.broadcast;
  return (
    <div>
      <p
        role="status"
        className={
          "mb-4 flex items-center gap-2 text-sm font-semibold " +
          (live ? "text-red-800" : "text-stone-500")
        }
      >
        <span
          aria-hidden="true"
          className={
            "size-2 shrink-0 rounded-full " +
            (live ? "bg-red-700" : "bg-stone-400")
          }
        />
        {live
          ? "Live now"
          : snapshot.state === "unavailable"
            ? "Live status unavailable"
            : "Off air"}
      </p>
      {live ? (
        <>
          <h2 className="public-display mb-6 text-3xl leading-tight wrap-anywhere sm:text-4xl">
            {live.title}
          </h2>
          <BroadcastPlayer key={live.id} stream={live} />
        </>
      ) : (
        <div className="rounded-2xl border border-[var(--public-line)] bg-[#f0eeeb] p-5 sm:p-6">
          <h2 className="public-display text-3xl leading-tight sm:text-4xl">
            {snapshot.state === "unavailable"
              ? "We cannot confirm a live broadcast right now."
              : "We are not broadcasting right now."}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--public-muted)]">
            {snapshot.state === "unavailable"
              ? "We will check again shortly. You can still explore recordings or visit our church channels."
              : "Explore upcoming broadcasts and earlier recordings, or read a message while you wait."}
          </p>
          <ChannelLinks />
        </div>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/broadcasts"
          className="public-button public-button-secondary"
        >
          Broadcast library
          <FiArrowRight aria-hidden="true" />
        </Link>
        <Link href="/broadcasts?period=past" className="public-text-link">
          Past broadcasts
          <FiArrowRight aria-hidden="true" />
        </Link>
        <Link href="/content" className="public-text-link">
          Read a message
          <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
