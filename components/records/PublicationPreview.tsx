"use client";

import { useState } from "react";
import { getPublicationFile } from "@/lib/utils/editorial-records";

export function PublicationPreview({ fileUrl, title }: { fileUrl: string; title: string }) {
  const file = getPublicationFile(fileUrl);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!file.href) return <p className="record-empty">No usable document is attached. Add a file in Edit publication.</p>;
  return <div className="record-stack">
    <div className="record-preview-intro">
      <span className="record-file-icon" aria-hidden="true">{file.format}</span>
      <div className="min-w-0"><p className="font-semibold wrap-anywhere">{title}</p><p className="record-empty">{file.canPreview ? "PDF document · Preview available" : "Open the file in its supported application."}</p></div>
    </div>
    <div className="flex flex-wrap gap-3">
      <a href={file.href} target="_blank" rel="noopener noreferrer" className="record-button record-button-primary">Open file<span className="sr-only"> (new tab)</span></a>
      {file.canPreview && <button type="button" className="record-button record-button-secondary" aria-expanded={loaded} onClick={() => { setLoaded(!loaded); setFailed(false); }}>{loaded ? "Close preview" : "Load PDF preview"}</button>}
    </div>
    {file.canPreview && loaded && <div>
      <p className="record-empty mb-3">If your device cannot display this preview, choose Open file.</p>
      {failed ? <p role="alert" className="record-empty">The preview could not load. You can open the file separately.</p> : <iframe src={file.href} title={title + " — PDF preview"} className="record-document-frame" loading="lazy" onError={() => setFailed(true)} />}
    </div>}
  </div>;
}
