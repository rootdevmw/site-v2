import Link from "next/link";
import { useId, type ReactNode } from "react";
import { FiArrowLeft, FiArrowUpRight, FiRefreshCw } from "react-icons/fi";
import { getRecordFailure, type RecordTone, type RelatedRecord } from "@/lib/utils/record-details";

export function RecordPage({ children }: { children: ReactNode }) {
  return <article className="record-page" aria-labelledby="record-title">{children}</article>;
}

export function RecordHeader({ backHref, backLabel, eyebrow, title, description, identity, badges, actions }: {
  backHref: string; backLabel: string; eyebrow: string; title: string;
  description?: ReactNode; identity?: ReactNode; badges?: ReactNode; actions?: ReactNode;
}) {
  return <>
    <Link href={backHref} className="record-back"><FiArrowLeft aria-hidden="true" />{backLabel}</Link>
    <header className="record-header">
      <div className="record-heading">
        {identity && <div className="record-identity">{identity}</div>}
        <div className="min-w-0 flex-1">
          <p className="record-eyebrow">{eyebrow}</p>
          <h1 id="record-title" className="record-title">{title}</h1>
          {description && <div className="record-description">{description}</div>}
          {badges && <div className="mt-4 flex flex-wrap gap-2">{badges}</div>}
        </div>
      </div>
      {actions && <div className="record-actions">{actions}</div>}
    </header>
  </>;
}

export function RecordStatus({ children, tone = "neutral" }: { children: ReactNode; tone?: RecordTone }) {
  return <span className={"record-status record-status-" + tone}><span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />{children}</span>;
}

export function RecordSection({ title, description, aside, children }: { title: string; description?: string; aside?: ReactNode; children: ReactNode }) {
  const titleId = useId();
  return <section className="record-section" aria-labelledby={titleId}>
    <div className="record-section-heading"><div className="min-w-0"><h2 id={titleId}>{title}</h2>{description && <p>{description}</p>}</div>{aside && <div className="shrink-0 text-sm text-[#6c6257]">{aside}</div>}</div>
    {children}
  </section>;
}

export function RecordFields({ children }: { children: ReactNode }) {
  return <dl className="record-fields">{children}</dl>;
}

export function RecordField({ label, children, fallback = "Not provided" }: { label: string; children?: ReactNode; fallback?: string }) {
  const empty = children === null || children === undefined || children === "";
  return <div className="record-field"><dt>{label}</dt><dd>{empty ? <span className="text-[#6c6257]">{fallback}</span> : children}</dd></div>;
}

export function RecordRelatedList({ records, baseHref, emptyMessage }: { records: RelatedRecord[]; baseHref: string; emptyMessage: string }) {
  if (!records.length) return <p className="record-empty">{emptyMessage}</p>;
  return <ul className="record-related">{records.map((record) => <li key={record.id}><Link href={baseHref + "/" + encodeURIComponent(record.id)}><span className="min-w-0 wrap-anywhere">{record.name}</span><FiArrowUpRight aria-hidden="true" className="size-4 shrink-0" /></Link></li>)}</ul>;
}

export function RecordFeedback({ kind, entity, backHref, backLabel, onRetry, retrying = false }: {
  kind: "missing" | "forbidden" | "session" | "error"; entity: string;
  backHref: string; backLabel: string; onRetry?: () => void; retrying?: boolean;
}) {
  const messages = {
    missing: { title: entity + " not found", description: "This record may have been removed or the link may be out of date." },
    forbidden: { title: "Access unavailable", description: "Your account does not have permission to view this record." },
    session: { title: "Please sign in again", description: "Your session may have expired. Sign in to continue viewing this record." },
    error: { title: "Could not load this record", description: "The server could not be reached or returned an error. Please try again." },
  };
  const message = messages[kind];
  return <div className="record-page"><section className="record-feedback" aria-labelledby="record-feedback-title"><p className="record-eyebrow">{entity}</p><h1 id="record-feedback-title" className="record-title">{message.title}</h1><p className="record-description">{message.description}</p><div className="mt-6 flex flex-wrap gap-3">
    {kind === "error" && onRetry && <button type="button" onClick={onRetry} disabled={retrying} className="record-button record-button-primary"><FiRefreshCw aria-hidden="true" />{retrying ? "Retrying…" : "Try again"}</button>}
    {kind === "session" && <Link href="/login" className="record-button record-button-primary">Sign in</Link>}
    <Link href={backHref} className="record-button record-button-secondary"><FiArrowLeft aria-hidden="true" />{backLabel}</Link>
  </div></section></div>;
}

export function RecordLoadError({ error, ...props }: Omit<Parameters<typeof RecordFeedback>[0], "kind"> & { error: unknown }) {
  return <RecordFeedback {...props} kind={getRecordFailure(error)} />;
}

export function RecordSkeleton({ label }: { label: string }) {
  return <div className="record-page" role="status" aria-label={label}>
    <span className="sr-only">{label}</span>
    <div aria-hidden="true" className="record-skeleton motion-safe:animate-pulse">
      <div className="mb-5 h-5 w-40 rounded bg-[#e7e0d5]" />
      <div className="record-header"><div className="record-heading"><div className="size-24 shrink-0 rounded-2xl bg-[#eee8df]" /><div className="w-full min-w-0 flex-1 space-y-4"><div className="h-4 w-24 rounded bg-[#eee8df]" /><div className="h-9 w-3/4 rounded bg-[#eee8df]" /><div className="h-5 w-1/2 rounded bg-[#eee8df]" /></div></div></div>
      <div className="record-columns mt-6">{[0, 1].map((index) => <div key={index} className="record-section space-y-6"><div className="h-6 w-1/2 rounded bg-[#eee8df]" /><div className="h-24 rounded bg-[#f4f0e9]" /><div className="h-16 rounded bg-[#f4f0e9]" /></div>)}</div>
    </div>
  </div>;
}
