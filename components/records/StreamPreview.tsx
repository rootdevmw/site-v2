"use client";

import { useState } from "react";
import type { Platform } from "@/app/modules/streams/types/stream.types";
import { getWebUrl, getYouTubePreview } from "@/lib/utils/editorial-records";

export function StreamPreview({ platforms, title }: { platforms: Platform[]; title: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  if (!platforms.length) return <p className="record-empty">No broadcast platforms are connected. Add one in Edit stream.</p>;
  const preview = platforms.find((platform) => platform.id === selected);
  const embed = preview ? getYouTubePreview(preview.url) : null;
  return <div className="record-stack">
    <ul className="record-platforms">{platforms.map((platform) => {
      const href = getWebUrl(platform.url);
      const available = getYouTubePreview(platform.url);
      return <li key={platform.id}><div className="min-w-0"><p className="font-semibold wrap-anywhere">{platform.name}</p><p className="record-empty">{available ? "YouTube player available" : href ? "Watch on the platform" : "A valid web link is needed"}</p></div><div className="flex flex-wrap gap-2">
        {href && <a href={href} target="_blank" rel="noopener noreferrer" className="record-button record-button-secondary">Open {platform.name}<span className="sr-only"> (new tab)</span></a>}
        {available && <button type="button" className="record-button record-button-secondary" aria-expanded={selected === platform.id} onClick={() => { setSelected(selected === platform.id ? null : platform.id); setFailed(false); }}>{selected === platform.id ? "Close preview" : "Preview " + platform.name}</button>}
      </div></li>;
    })}</ul>
    {embed && <div>{failed ? <p role="alert" className="record-empty">The player could not load. Open the platform to watch.</p> : <iframe key={embed} src={embed} title={title + " — " + preview?.name + " preview"} className="record-video-frame" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" onError={() => setFailed(true)} />}<p className="record-empty mt-3">Previewing a player does not change the stream’s live status. If playback is unavailable, open the platform.</p></div>}
  </div>;
}
