import type { Member } from "@/app/modules/members/types/member.types";
import type { Ministry } from "@/app/modules/ministries/types/ministry.types";
import type { Homecell } from "@/app/modules/homecells/types/homecell.types";
import { normalizeGroupMembers, type GroupMemberPayload } from "./group-members";

export type DirectoryKind = "members" | "ministries" | "homecells";
export const directoryInfo = {
  members: { title: "Members", singular: "member", description: "People, connections, and life in our church community.", searchLabel: "First or last name" },
  ministries: { title: "Ministries", singular: "ministry", description: "Find a ministry, explore its purpose, and connect with its leaders.", searchLabel: "Ministry name" },
  homecells: { title: "Homecells", singular: "homecell", description: "Local communities, their meeting locations, and the people who lead them.", searchLabel: "Name or location" },
} as const;
export const memberStatuses = ["MEMBER", "VISITOR"];
export const memberPrefixes = ["PASTOR", "ELDER", "DEACON", "SISTER", "BROTHER"];
export type DirectoryFilters = { page: number; search: string; status: string; prefix: string; leaderId: string; overseerId: string };
export const DIRECTORY_LIMIT = 10;

export function readDirectoryFilters(kind: DirectoryKind, params: Pick<URLSearchParams, "get">): DirectoryFilters {
  const page = Number(params.get("page"));
  const id = (key: string) => /^\d+$/.test(params.get(key) ?? "") ? params.get(key)! : "";
  return {
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    search: params.get("search")?.trim() ?? "",
    status: kind === "members" && memberStatuses.includes(params.get("status") ?? "") ? params.get("status")! : "",
    prefix: kind === "members" && memberPrefixes.includes(params.get("prefix") ?? "") ? params.get("prefix")! : "",
    leaderId: kind === "ministries" ? id("leaderId") : "",
    overseerId: kind === "ministries" ? id("overseerId") : "",
  };
}

export function directoryParams(kind: DirectoryKind, filters: DirectoryFilters, paged = true) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  for (const key of kind === "members" ? ["status", "prefix"] as const : kind === "ministries" ? ["leaderId", "overseerId"] as const : []) {
    if (filters[key]) params.set(key, filters[key]);
  }
  if (paged && filters.page > 1) params.set("page", String(filters.page));
  return params;
}

export function directoryHref(kind: DirectoryKind, filters: DirectoryFilters) {
  const query = directoryParams(kind, filters).toString();
  return "/dashboard/" + kind + (query ? "?" + query : "");
}

export type DirectoryPerson = { id: string; firstName: string; lastName: string };
export type DirectoryEntry = {
  id: string; name: string; purpose?: string; location?: string; phone?: string; status?: string; prefix?: string;
  leader?: DirectoryPerson | null; overseer?: DirectoryPerson | null; memberCount?: number;
};
export type DirectoryPage = { data: DirectoryEntry[]; total: number; limit: number };
export type DirectoryHomecell = Homecell & { members?: GroupMemberPayload; deletedAt?: string | null };

export function memberDirectoryEntry(member: Member): DirectoryEntry {
  return { id: member.id, name: [member.firstName, member.lastName].filter(Boolean).join(" ") || "Unnamed person", phone: member.phone, status: member.status, prefix: member.prefix, location: member.location };
}

export function groupDirectoryEntry(group: Ministry | DirectoryHomecell): DirectoryEntry {
  const person = (value: DirectoryPerson | null | undefined) => value ? { id: value.id, firstName: value.firstName, lastName: value.lastName } : null;
  return {
    id: group.id, name: group.name, leader: person(group.leader), overseer: person(group.overseer),
    purpose: "purpose" in group ? group.purpose : undefined,
    location: "location" in group ? group.location : undefined,
    memberCount: group.members === undefined ? undefined : normalizeGroupMembers(group.members).length,
  };
}

export function paginateHomecells(records: DirectoryEntry[], filters: DirectoryFilters): DirectoryPage {
  const search = filters.search.toLocaleLowerCase();
  const matches = records.filter((entry) => !search || [entry.name, entry.location].some((value) => value?.toLocaleLowerCase().includes(search)));
  const start = (filters.page - 1) * DIRECTORY_LIMIT;
  return { data: matches.slice(start, start + DIRECTORY_LIMIT), total: matches.length, limit: DIRECTORY_LIMIT };
}

export function directoryPageState(page: number, total: number, limit: number) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const outOfRange = page > totalPages;
  return { totalPages, outOfRange, start: total && !outOfRange ? (page - 1) * limit + 1 : 0, end: outOfRange ? 0 : Math.min(page * limit, total) };
}
