type AuditEntity = { key: string; label: string; recordPath?: string; roles?: string[] };

// The writer uppercases entity names without inserting CamelCase separators.
export const auditEntities: readonly AuditEntity[] = [
  { key: "USER", label: "User", recordPath: "/dashboard/users", roles: ["ADMIN"] },
  { key: "ROLE", label: "Role", recordPath: "/dashboard/roles", roles: ["ROOT"] },
  { key: "USERROLE", label: "User role", recordPath: "/dashboard/users", roles: ["ADMIN"] },
  { key: "MEMBER", label: "Member", recordPath: "/dashboard/members", roles: ["DEACON"] },
  { key: "MINISTRY", label: "Ministry", recordPath: "/dashboard/ministries", roles: ["DEACON"] },
  { key: "HOMECELL", label: "Homecell", recordPath: "/dashboard/homecells", roles: ["DEACON"] },
  { key: "EVENT", label: "Event", recordPath: "/dashboard/events", roles: ["DEACON"] },
  { key: "CONTENT", label: "Content", recordPath: "/dashboard/content", roles: ["MEDIA"] },
  { key: "PUBLICATION", label: "Publication", recordPath: "/dashboard/publications", roles: ["MEDIA"] },
  { key: "STREAM", label: "Stream", recordPath: "/dashboard/streams", roles: ["MEDIA"] },
  { key: "PROGRAM", label: "Program", recordPath: "/dashboard/programs", roles: ["DEACON"] },
  { key: "PROGRAMTEMPLATE", label: "Program template", recordPath: "/dashboard/program-templates", roles: ["DEACON"] },
  { key: "PRAYERREQUEST", label: "Prayer request", recordPath: "/dashboard/attention", roles: ["DEACON"] },
  { key: "VISITOR", label: "Visitor", recordPath: "/dashboard/attention", roles: ["DEACON"] },
  ...["Session", "AuditLog", "MemberBio", "MemberMinistry", "ContentMedia", "ContentTag", "ContentType", "EventMedia", "EventMinistry", "EventType", "ProgramItem", "ProgramTemplateItem", "ProgramType", "StreamPlatform", "Platform", "Media", "ScriptureRef", "Series", "AttentionAction", "PrayerWarrior", "Tag"].map((name) => ({ key: name.toUpperCase(), label: name.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase().replace(/^./, (letter) => letter.toUpperCase()) })),
];

export function getAuditEntity(value: string): AuditEntity {
  const compact = value.trim().replace(/[_\-\s]/g, "").toUpperCase();
  return auditEntities.find((entity) => entity.key === compact) ?? { key: value.trim().toUpperCase().replace(/-/g, "_"), label: value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ").trim() || "Record" };
}

export function getAuditRecordHref(entity: string, id: string) {
  const context = getAuditEntity(entity);
  if (!context.recordPath) return null;
  if (context.key === "PRAYERREQUEST") return "/dashboard/attention/" + encodeURIComponent(id) + "/prayers";
  if (context.key === "VISITOR") return "/dashboard/attention/" + encodeURIComponent(id) + "/visitors";
  return context.recordPath + "/" + encodeURIComponent(id);
}
