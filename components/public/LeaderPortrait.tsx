"use client";

import Image from "next/image";
import { useState } from "react";

export function LeaderPortrait({
  imageUrl,
  initials,
}: {
  imageUrl: string | null;
  initials: string;
}) {
  const [failedSource, setFailedSource] = useState<string>();
  return (
    <div
      aria-hidden="true"
      className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-[#f0eadf]"
    >
      {imageUrl && imageUrl !== failedSource ? (
        // Public uploads use different media hosts. Fetch directly without an unrestricted image proxy.
        <Image
          src={imageUrl}
          alt=""
          width={480}
          height={360}
          unoptimized
          loading="lazy"
          onError={() => setFailedSource(imageUrl)}
          className="h-full w-full object-contain"
        />
      ) : (
        <span className="public-display text-5xl text-[var(--public-accent)]">
          {initials}
        </span>
      )}
    </div>
  );
}
