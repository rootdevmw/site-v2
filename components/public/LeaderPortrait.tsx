"use client";

import Image from "next/image";
import { useState } from "react";

export function LeaderPortrait({
  imageUrl,
  initials,
  variant = "landscape",
}: {
  imageUrl: string | null;
  initials: string;
  variant?: "landscape" | "portrait";
}) {
  const [failedSource, setFailedSource] = useState<string>();
  return (
    <div
      aria-hidden="true"
      className={
        "relative flex items-center justify-center overflow-hidden bg-[var(--brand-soft)] " +
        (variant === "portrait"
          ? "aspect-[4/5] max-h-[26rem]"
          : "aspect-[4/3] rounded-xl")
      }
    >
      {imageUrl && imageUrl !== failedSource ? (
        // Public uploads use different media hosts. Fetch directly without an unrestricted image proxy.
        <Image
          src={imageUrl}
          alt=""
          width={480}
          height={variant === "portrait" ? 600 : 360}
          unoptimized
          loading="lazy"
          onError={() => setFailedSource(imageUrl)}
          className={
            "h-full w-full " +
            (variant === "portrait"
              ? "object-cover object-top"
              : "object-contain")
          }
        />
      ) : (
        <>
          <span
            aria-hidden="true"
            className="absolute -right-10 -bottom-10 size-52 rounded-full border border-[var(--brand-line)]"
          />
          <span
            aria-hidden="true"
            className="absolute -top-16 -left-12 size-64 rounded-full border border-[var(--brand-line)]"
          />
          <span className="public-display relative text-6xl text-[var(--public-accent)]">
            {initials}
          </span>
        </>
      )}
    </div>
  );
}
