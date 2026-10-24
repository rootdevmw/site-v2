import { z } from "zod";
import { navigation, type NavigationLink } from "@/config/navigation";
import { getHighestRole, hasRequiredRole } from "@/lib/auth/roles";

const count = z.number().int().nonnegative();
const date = z.string().refine((value) => Number.isFinite(Date.parse(value)), "A valid date is required.");
const id = z.string().regex(/^[1-9]\d*$/);
const event = z.object({ id, title: z.string(), startTime: date, endTime: date, location: z.string().nullable() });
const program = z.object({ id, date, location: z.string().nullable(), type: z.object({ name: z.string() }), homecell: z.object({ name: z.string() }).nullable() });
const stream = z.object({ id, title: z.string() });
export const dashboardSchemas = {
  care: z.object({ generatedAt: date, prayers: count, urgentPrayers: count, visitors: count }).refine((value) => value.urgentPrayers <= value.prayers),
  planning: z.object({ generatedAt: date, today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), events: z.object({ total: count, items: z.array(event).max(3) }), programs: z.object({ total: count, items: z.array(program).max(3) }) }).refine((value) => value.events.items.length <= value.events.total && value.programs.items.length <= value.programs.total),
  publishing: z.object({ generatedAt: date, messageDrafts: count, publicationDrafts: count, selectedLive: z.object({ total: count, items: z.array(stream).max(3) }) }).refine((value) => value.selectedLive.items.length <= value.selectedLive.total),
};
export type DashboardSection = keyof typeof dashboardSchemas;
export type DashboardData = { [K in DashboardSection]: z.infer<(typeof dashboardSchemas)[K]> };
export const dashboardRequirements = { care: "DEACON", planning: "DEACON", publishing: "MEDIA" } as const;
export type DashboardAction = { label: string; href: string; description: string };

export function getDashboardActions(roles: string[]): DashboardAction[] {
  if (hasRequiredRole(roles, ["DEACON"])) return [
    { label: "Review prayer requests", href: "/dashboard/attention/prayers", description: "Open requests and pastoral follow-up." },
    { label: "Prepare a program", href: "/dashboard/programs/new", description: "Plan a gathering and its activities." },
    { label: "Browse templates", href: "/dashboard/program-templates", description: "Start from a reusable service plan." },
    ...(hasRequiredRole(roles, ["ADMIN"]) ? [{ label: "Manage accounts", href: "/dashboard/users", description: "Review accounts, roles, and linked profiles." }] : []),
  ];
  if (hasRequiredRole(roles, ["MEDIA"])) return [
    { label: "Prepare a message", href: "/dashboard/content/new", description: "Add teaching or a resource for the congregation." },
    { label: "Review drafts", href: "/dashboard/content?status=Draft", description: "Continue preparing unpublished messages." },
    { label: "Manage broadcasts", href: "/dashboard/streams", description: "Review schedules and the selected live stream." },
  ];
  return [
    { label: "Explore church life", href: "/", description: "Service times, teaching, and community connections." },
    { label: "Watch online", href: "/live", description: "Find the congregation’s online broadcasts." },
    { label: "Manage your password", href: "/dashboard/settings/change-password", description: "Keep your account details up to date." },
  ];
}

export function getDashboardIntroduction(roles: string[]) {
  if (hasRequiredRole(roles, ["DEACON"])) return "Care for people, prepare for gatherings, and keep church life moving.";
  if (hasRequiredRole(roles, ["MEDIA"])) return "Prepare messages and resources, and help the congregation connect online.";
  return "Stay connected with the congregation and look after your account.";
}

const workspaceGroups = [
  { title: "People & care", paths: ["members", "ministries", "homecells", "attention/prayers", "attention/visitors", "attention/manage"] },
  { title: "Gatherings & programs", paths: ["events", "programs", "program-templates", "program-types"] },
  { title: "Messages & media", paths: ["content", "content-types", "publications", "streams"] },
  { title: "Accounts & history", paths: ["users", "roles", "audit", "settings/change-password"] },
];
export function getDashboardWorkspaces(roles: string[]) {
  const links: NavigationLink[] = navigation.flatMap((entry) => "children" in entry ? entry.children : [entry]);
  links.push({ label: "Content types", href: "/dashboard/content-types", roles: ["MEDIA"] });
  return workspaceGroups.map((group) => ({ title: group.title, links: group.paths.flatMap((path) => {
    const link = links.find((entry) => entry.href === "/dashboard/" + path);
    return link && hasRequiredRole(roles, link.roles) ? [{ ...link, label: link.label.charAt(0).toUpperCase() + link.label.slice(1) }] : [];
  }) })).filter((group) => group.links.length);
}
export function dashboardIdentity(roles: string[]) { return getHighestRole(roles) || "Account"; }
