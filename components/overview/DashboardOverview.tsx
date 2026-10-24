"use client";

import Link from "next/link";
import { FiArrowUpRight, FiRefreshCw, FiSunrise } from "react-icons/fi";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { church, combinedService, sundayServices } from "@/config/church";
import { useDashboardSection } from "@/lib/hooks/useDashboardOverview";
import { dashboardIdentity, getDashboardActions, getDashboardIntroduction, getDashboardWorkspaces } from "@/lib/utils/dashboard-overview";
import { RecordStatus } from "@/components/records/RecordLayout";
import { OverviewPanel } from "./OverviewPanel";
import { CareSummary, PlanningSummary, PublishingSummary } from "./OverviewSummaries";

export function DashboardOverview() {
  const user = useAuthStore((state) => state.user);
  const roles = user?.roles ?? [];
  const canCare = hasRequiredRole(roles, ["DEACON"]);
  const canPublish = hasRequiredRole(roles, ["MEDIA"]);
  const care = useDashboardSection("care", user);
  const planning = useDashboardSection("planning", user);
  const publishing = useDashboardSection("publishing", user);
  const workspaces = getDashboardWorkspaces(roles);
  const refreshing = [care, planning, publishing].some((query) => query.isFetching);

  return <article className="record-page overview-page" aria-labelledby="overview-title">
    <header className="overview-welcome"><div><p className="record-eyebrow">{church.name}</p><h1 id="overview-title" className="record-title">A place to serve.</h1><p className="record-description">{getDashboardIntroduction(roles)}</p><div className="overview-identity"><RecordStatus tone="info">{dashboardIdentity(roles)}</RecordStatus>{user && <p>{user.email}</p>}</div></div><div className="overview-welcome-actions"><Link href="/" className="record-button record-button-secondary">Visit the public website<FiArrowUpRight aria-hidden="true" /></Link>{(canCare || canPublish) && <button type="button" className="record-button record-button-secondary" disabled={refreshing} onClick={() => { if (canCare) { void care.refetch(); void planning.refetch(); } if (canPublish) void publishing.refetch(); }}><FiRefreshCw aria-hidden="true" />{refreshing ? "Refreshing…" : "Refresh overview"}</button>}</div></header>
    <section className="overview-next" aria-labelledby="overview-next-title"><div className="overview-section-heading"><h2 id="overview-next-title">Where would you like to start?</h2><p>Quick paths to the work and connections available to your account.</p></div><ul className="overview-actions">{getDashboardActions(roles).map((action) => <li key={action.href}><Link href={action.href}><span className="overview-action-title">{action.label}<FiArrowUpRight aria-hidden="true" /></span><span>{action.description}</span></Link></li>)}</ul></section>
    <div className={"overview-content" + (canCare ? " overview-content-with-care" : "")}>
      {canCare && <div className="overview-main">
        <OverviewPanel title="Care & follow-up" description="Open prayer requests and visitors waiting for a welcome." query={care} generatedAt={care.data?.generatedAt}>{care.data && <CareSummary data={care.data} />}</OverviewPanel>
        <OverviewPanel title="Prepare for gatherings" description="Ongoing events, upcoming gatherings, and programs from today onward." query={planning} generatedAt={planning.data?.generatedAt}>{planning.data && <PlanningSummary data={planning.data} />}</OverviewPanel>
      </div>}
      <div className="overview-side">
        {canPublish && <OverviewPanel title="Messages & broadcasts" description="Continue preparing resources and review the website’s live selection." query={publishing} generatedAt={publishing.data?.generatedAt}>{publishing.data && <PublishingSummary data={publishing.data} />}</OverviewPanel>}
        <section className="overview-sunday" aria-labelledby="overview-sunday-title"><FiSunrise aria-hidden="true" className="overview-sunday-icon" /><p className="record-eyebrow">Together in worship</p><h2 id="overview-sunday-title">Sunday at Red Cross</h2><p>{church.address}</p><ul>{sundayServices.map((service) => <li key={service.language}><span>{service.language}</span><strong>{service.time}</strong></li>)}</ul><p className="overview-sunday-note">{combinedService.note}</p><p className="overview-sunday-note">Service times are in Malawi (CAT).</p><Link href="/plan-visit" className="record-button record-button-secondary">Visit information<FiArrowUpRight aria-hidden="true" /></Link></section>
      </div>
    </div>
    {!!workspaces.length && <section className="overview-workspaces" aria-labelledby="overview-workspaces-title"><div className="overview-section-heading"><h2 id="overview-workspaces-title">Your workspaces</h2><p>Directories, planning tools, resources, and account settings.</p></div><div className="overview-workspace-grid">{workspaces.map((group) => <section key={group.title} className="overview-workspace" aria-label={group.title}><h3>{group.title}</h3><ul>{group.links.map((link) => <li key={link.href}><Link href={link.href}>{link.href === "/dashboard/attention/manage" ? "Prayer team & follow-up" : link.label}<FiArrowUpRight aria-hidden="true" /></Link></li>)}</ul></section>)}</div></section>}
  </article>;
}
