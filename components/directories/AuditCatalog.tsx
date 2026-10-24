"use client";

import Link from "next/link";
import { useState } from "react";
import { FiArrowUpRight, FiClock } from "react-icons/fi";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { auditEntities } from "@/config/audit-entities";
import { DirectoryError } from "./DirectoryList";

const groups = [
  { title: "Accounts & access", description: "Account changes, role assignments, and session activity.", keys: ["USER", "ROLE", "USERROLE", "SESSION", "AUDITLOG"] },
  { title: "People & pastoral care", description: "Directory profiles, groups, visitors, and prayer follow-up.", keys: ["MEMBER", "MEMBERBIO", "MEMBERMINISTRY", "MINISTRY", "HOMECELL", "VISITOR", "PRAYERREQUEST", "PRAYERWARRIOR", "ATTENTIONACTION"] },
  { title: "Gatherings & programs", description: "Events, service schedules, activities, and reusable templates.", keys: ["EVENT", "EVENTMEDIA", "EVENTMINISTRY", "EVENTTYPE", "PROGRAM", "PROGRAMITEM", "PROGRAMTYPE", "PROGRAMTEMPLATE", "PROGRAMTEMPLATEITEM"] },
  { title: "Messages & media", description: "Teaching, publications, broadcasts, and their supporting records.", keys: ["CONTENT", "CONTENTMEDIA", "CONTENTTAG", "CONTENTTYPE", "PUBLICATION", "STREAM", "STREAMPLATFORM", "PLATFORM", "MEDIA", "SCRIPTUREREF", "SERIES", "TAG"] },
];

export function AuditCatalog() {
  const actor = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(actor?.roles ?? [], ["ADMIN"]);
  const [search, setSearch] = useState("");
  const term = search.trim().replace(/[\s_-]/g, "").toLowerCase();
  const sections = groups.map((group) => ({ ...group, entries: group.keys.flatMap((key) => {
    const entry = auditEntities.find((entity) => entity.key === key);
    return entry && (!term || (entry.label + entry.key).replace(/[\s_-]/g, "").toLowerCase().includes(term)) ? [entry] : [];
  }) })).filter((group) => group.entries.length);
  return <section className="record-page directory-page" aria-labelledby="audit-catalog-title">
    <header className="directory-header"><div><p className="record-eyebrow">Church records</p><h1 id="audit-catalog-title" className="record-title">Audit history</h1><p className="record-description">Follow the story of a record: who acted, what was recorded, and how its details changed.</p></div></header>
    {!permitted ? <DirectoryError noun="history" error={{ response: { status: 403 } }} onRetry={() => {}} retrying={false} /> : <>
      <div className="access-audit-intro"><FiClock aria-hidden="true" /><p>Choose a category to browse its activity. Each record’s timeline brings its available snapshots together.</p></div>
      <div className="directory-filters"><div className="directory-filter"><label htmlFor="audit-category-search">Find a history category</label><input id="audit-category-search" type="search" className="record-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="e.g. member, program template, user role" /></div></div>
      <p role="status" className="directory-caption">{sections.reduce((count, group) => count + group.entries.length, 0)} categories{term ? " match your search" : " available"}. Categories may have no recorded history.</p>
      {sections.length ? <div className="access-audit-catalog">{sections.map((group) => <section key={group.title} aria-label={group.title} className="access-audit-group"><h2>{group.title}</h2><p>{group.description}</p><ul>{group.entries.map((entry) => <li key={entry.key}><Link href={"/dashboard/audit/" + entry.key}><span>{entry.label}</span><FiArrowUpRight aria-hidden="true" /></Link></li>)}</ul></section>)}</div> : <div className="directory-message"><h2>No matching category</h2><p>Try a different record name.</p><button type="button" onClick={() => setSearch("")} className="record-button record-button-secondary">Clear search</button></div>}
    </>}
  </section>;
}
