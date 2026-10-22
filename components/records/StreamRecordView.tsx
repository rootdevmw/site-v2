import Link from "next/link";
import type { ReactNode } from "react";
import type { Stream } from "@/app/modules/streams/types/stream.types";
import { formatChurchDate } from "@/lib/utils/church-date";
import { getStreamState } from "@/lib/utils/editorial-records";
import { RecordField, RecordFields, RecordHeader, RecordPage, RecordSection, RecordStatus } from "./RecordLayout";
import { RecordHistoryLink } from "./RecordHistoryLink";
import { StreamPreview } from "./StreamPreview";

export function StreamRecordView({ stream, broadcastAction }: { stream: Stream; broadcastAction?: ReactNode }) {
  const state = getStreamState(stream);
  const date = (value: string) => formatChurchDate(value, { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" });
  return <RecordPage>
    <RecordHeader backHref="/dashboard/streams" backLabel="Back to streams" eyebrow="Church broadcast" title={stream.title}
      description={stream.startsAt ? "Starts " + date(stream.startsAt) + " · Malawi time" : "A start time has not been set."} badges={<RecordStatus tone={state.tone}>{state.label}</RecordStatus>}
      actions={<>{broadcastAction}<Link href={"/dashboard/streams/" + stream.id + "/edit"} className="record-button record-button-secondary">Edit stream</Link></>}
    />
    <div className="record-columns mt-6">
      <div className="record-stack"><RecordSection title="Broadcast platforms" description="Check the connected destinations and preview supported players before sharing."><StreamPreview key={stream.id} platforms={stream.platforms ?? []} title={stream.title} /></RecordSection></div>
      <aside className="record-stack record-aside" aria-label="Broadcast state and schedule">
        <RecordSection title="Broadcast state"><p className="record-empty">{stream.isLive ? "This stream is selected as the church’s live broadcast. Use Edit stream to change its live status." : "This stream is not selected as the live broadcast. Setting it live replaces any other stream currently selected."}</p>{stream.slug && <Link href={"/streams/" + encodeURIComponent(stream.slug)} className="record-back !mb-0 mt-4">View public stream page</Link>}{stream.isLive && <Link href="/live" className="record-back !mb-0 mt-2">Open Watch online</Link>}</RecordSection>
        <RecordSection title="Schedule" description="All times are shown in Malawi time."><RecordFields>
          <RecordField label="Starts">{stream.startsAt ? date(stream.startsAt) : "Not scheduled"}</RecordField>
          <RecordField label="Ends">{stream.endsAt ? date(stream.endsAt) : "No end time recorded"}</RecordField>
          <RecordField label="Connected platforms">{String(stream.platforms?.length ?? 0)}</RecordField>
        </RecordFields></RecordSection>
        <RecordSection title="Record details"><RecordFields><RecordField label="Created">{formatChurchDate(stream.createdAt, { day: "numeric", month: "long", year: "numeric" })}</RecordField><RecordField label="Stream ID">{stream.id}</RecordField></RecordFields><RecordHistoryLink entity="Stream" id={stream.id} /></RecordSection>
      </aside>
    </div>
  </RecordPage>;
}
