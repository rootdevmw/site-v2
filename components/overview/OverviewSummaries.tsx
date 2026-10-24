import Link from "next/link";
import { FiCalendar, FiHeart, FiRadio } from "react-icons/fi";
import { RecordStatus } from "@/components/records/RecordLayout";
import { formatChurchDate } from "@/lib/utils/church-date";
import { getEventPhase } from "@/lib/utils/record-details";
import type { DashboardData } from "@/lib/utils/dashboard-overview";

function Metric({ label, value, href, context }: { label: string; value: number; href: string; context: string }) {
  return <Link href={href} className="overview-metric"><span className="overview-metric-label">{label}</span><strong>{new Intl.NumberFormat("en-MW").format(value)}</strong><span>{context}</span></Link>;
}
export function CareSummary({ data }: { data: DashboardData["care"] }) {
  return <><div className="overview-metrics">
    <Metric label="Awaiting prayer" value={data.prayers} href="/dashboard/attention/prayers" context="Pending and reviewed requests" />
    <Metric label="Urgent requests" value={data.urgentPrayers} href="/dashboard/attention/prayers" context="Within the open prayer requests" />
    <Metric label="Visitors to welcome" value={data.visitors} href="/dashboard/attention/visitors" context="Visits awaiting acknowledgement" />
  </div><div className="overview-note"><FiHeart aria-hidden="true" /><p>{data.prayers || data.visitors ? "Open a queue to read the details and decide the next step in care." : "No open prayer requests or visits awaiting acknowledgement were recorded at this check."}</p></div><div className="overview-links"><Link href="/dashboard/attention/prayers">Prayer requests</Link><Link href="/dashboard/attention/visitors">Visitor follow-up</Link><Link href="/dashboard/attention/manage">Prayer team</Link></div></>;
}
export function PlanningSummary({ data }: { data: DashboardData["planning"] }) {
  return <div className="overview-planning">
    <div><div className="overview-list-heading"><h3><FiCalendar aria-hidden="true" />Gatherings ahead</h3><span>{data.events.total} ongoing or upcoming</span></div>
      {data.events.items.length ? <ul className="overview-records">{data.events.items.map((event) => {
        const phase = getEventPhase(event.startTime, event.endTime, Date.parse(data.generatedAt));
        return <li key={event.id}><Link href={"/dashboard/events/" + encodeURIComponent(event.id)}><span className="overview-record-title">{event.title || "Untitled event"}</span><span className="overview-record-date"><time dateTime={event.startTime}>{formatChurchDate(event.startTime, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })} CAT</time></span><span>{event.location || "Location not recorded"}</span><RecordStatus tone={phase.tone}>{phase.label}</RecordStatus></Link></li>;
      })}</ul> : <p className="overview-empty">No ongoing or upcoming events are recorded.</p>}
      <Link href="/dashboard/events" className="directory-text-link">View all events</Link>
    </div>
    <div><div className="overview-list-heading"><h3>Program planning</h3><span>{data.programs.total} from {formatChurchDate(data.today + "T12:00:00+02:00", { day: "numeric", month: "short" })}</span></div>
      {data.programs.items.length ? <ul className="overview-records">{data.programs.items.map((program) => <li key={program.id}><Link href={"/dashboard/programs/" + encodeURIComponent(program.id)}><span className="overview-record-title">{program.type.name || "Program"}</span><span className="overview-record-date"><time dateTime={program.date}>{formatChurchDate(program.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</time></span><span>{program.homecell?.name || "Church program"}{program.location ? " · " + program.location : ""}</span><span className="overview-record-id">Program #{program.id}</span></Link></li>)}</ul> : <p className="overview-empty">No programs are recorded from today onward.</p>}
      <Link href={"/dashboard/programs?fromDate=" + data.today} className="directory-text-link">Programs from today onward</Link>
    </div>
    <p className="overview-list-note">Showing up to three records in each list. Dates and times are in Malawi (CAT); program dates do not indicate an overall start time.</p>
  </div>;
}
export function PublishingSummary({ data }: { data: DashboardData["publishing"] }) {
  return <><div className="overview-metrics overview-publishing-metrics"><Metric label="Message drafts" value={data.messageDrafts} href="/dashboard/content?status=Draft" context="Prepare teaching and resources" /><Metric label="Publication drafts" value={data.publicationDrafts} href="/dashboard/publications?status=Draft" context="Review files before sharing" /></div>
    <div className="overview-broadcast"><div className="overview-list-heading"><h3><FiRadio aria-hidden="true" />Selected broadcast</h3><RecordStatus tone={data.selectedLive.total === 1 ? "positive" : data.selectedLive.total > 1 ? "warning" : "neutral"}>{data.selectedLive.total === 1 ? "1 selected live" : `${data.selectedLive.total} selected live`}</RecordStatus></div>
      {data.selectedLive.items.length ? <ul className="overview-records">{data.selectedLive.items.map((stream) => <li key={stream.id}><Link href={"/dashboard/streams/" + encodeURIComponent(stream.id)}><span className="overview-record-title">{stream.title || "Untitled stream"}</span><span>Review broadcast #{stream.id}</span></Link></li>)}</ul> : <p className="overview-empty">No stream is selected live on the website.</p>}
      {data.selectedLive.total > 1 && <p className="overview-empty">More than one stream is selected. Review the selection in Streams.</p>}{data.selectedLive.total > 3 && <p className="overview-empty">Showing three of {data.selectedLive.total} selected streams.</p>}
      <p className="overview-empty">The website’s live selection does not confirm whether the streaming platform is broadcasting.</p><Link href="/dashboard/streams?isLive=true" className="directory-text-link">Review live selection</Link>
    </div></>;
}
