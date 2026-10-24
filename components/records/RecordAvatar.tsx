"use client";

import Image from "next/image";
import { useState } from "react";

export function RecordAvatar({ name, initials, imageUrl }: { name: string; initials: string; imageUrl?: string | null }) {
  const [failedSource, setFailedSource] = useState<string>();
  if (imageUrl && imageUrl !== failedSource) {
    // Member uploads may require credentials and use different media hosts.
    // Load the supplied asset directly rather than proxying it through Next.
    return <Image src={imageUrl} alt={name + " portrait"} width={96} height={96} unoptimized onError={() => setFailedSource(imageUrl)} className="size-24 rounded-2xl object-cover" />;
  }
  return <div aria-label={name + " initials"} className="flex size-24 items-center justify-center rounded-2xl border border-[var(--brand-line)] bg-[var(--brand-soft)] text-3xl font-semibold tracking-tight text-[var(--brand-link)]">{initials || "?"}</div>;
}
