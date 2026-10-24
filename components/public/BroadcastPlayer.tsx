"use client";
import { useState } from "react";
import { FiPlay, FiArrowUpRight } from "react-icons/fi";
import {
  broadcastLinks,
  broadcastPlayer,
  type PublicBroadcast,
} from "@/lib/utils/public-library";
export function BroadcastPlayer({ stream }: { stream: PublicBroadcast }) {
  const [playing, setPlaying] = useState(false),
    player = broadcastPlayer(stream),
    links = broadcastLinks(stream);
  return (
    <section
      aria-label="Watch the broadcast"
      className="min-w-0 rounded-2xl border border-[var(--public-line)] bg-white p-4 sm:p-6"
    >
      {player ? (
        <>
          <div className="relative aspect-video min-h-[200px] overflow-hidden rounded-xl bg-[var(--brand-dark)] text-white">
            {playing ? (
              <iframe
                src={player.embed}
                title={stream.title + " — YouTube player"}
                className="absolute inset-0 h-full w-full"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-5 p-6 text-center">
                <p className="max-w-lg text-sm leading-7 text-stone-200">
                  Watch {stream.title} on YouTube.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPlaying(true);
                    window.dispatchEvent(
                      new CustomEvent("church:journey", {
                        detail: {
                          event: "broadcast_play",
                          path: window.location.pathname,
                        },
                      }),
                    );
                  }}
                  className="public-button public-button-light"
                >
                  <FiPlay aria-hidden="true" />
                  Play video here
                </button>
              </div>
            )}
          </div>
          <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
            If the player is blocked or the video does not play, open it
            directly on YouTube below.
          </p>
        </>
      ) : (
        <div className="rounded-xl bg-[var(--brand-soft)] p-6">
          <h2 className="public-display text-2xl">
            Watch with the broadcaster.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
            {links.length
              ? "Use a link below to open the broadcast on its provider’s website."
              : "A viewing link has not been added yet. Please check again or contact the church team."}
          </p>
        </div>
      )}
      {links.length > 0 && (
        <ul
          aria-label="Broadcast providers"
          className="mt-5 flex flex-wrap gap-3"
        >
          {links.map((link) => (
            <li key={link.id} className="min-w-0 max-w-full">
              <a
                href={link.url}
                data-journey="broadcast_provider_open"
                target="_blank"
                rel="noopener noreferrer"
                className="public-button public-button-secondary max-w-full"
              >
                <span className="min-w-0 wrap-anywhere">
                  Open {link.name || "broadcast"}
                </span>
                <FiArrowUpRight aria-hidden="true" className="shrink-0" />
                <span className="sr-only"> in a new tab</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
