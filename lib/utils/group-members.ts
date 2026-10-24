export type GroupKind = "ministry" | "homecell";

export type GroupMember = {
  id: string;
  firstName: string;
  lastName: string;
  prefix?: string | null;
  status?: string | null;
  location?: string | null;
  phone?: string | null;
  imageUrl?: string | null;
  homecellId?: string | null;
  homecell?: { id: string; name: string } | null;
  deletedAt?: string | null;
};

export type GroupMemberRow = GroupMember | { member: GroupMember | null } | null;
export type GroupMemberPayload = GroupMemberRow[] | { members?: GroupMemberRow[] } | null | undefined;

export function normalizeGroupMembers(payload: GroupMemberPayload): GroupMember[] {
  const rows = Array.isArray(payload) ? payload : payload?.members ?? [];
  const members = new Map<string, GroupMember>();
  for (const row of rows) {
    const member = row && ("member" in row ? row.member : row);
    if (member?.id && !member.deletedAt) members.set(member.id, member);
  }
  return [...members.values()];
}

export function memberName(member: Pick<GroupMember, "firstName" | "lastName">) {
  return [member.firstName, member.lastName].filter(Boolean).join(" ").trim() || "Unnamed person";
}

export function getHomecellMove(member: GroupMember, homecellId: string) {
  const currentId = member.homecell?.id ?? member.homecellId;
  return currentId && currentId !== homecellId ? { fromId: currentId, fromName: member.homecell?.name || "their current homecell" } : null;
}

export type DirectoryPage = { data: GroupMember[]; meta?: { page?: number; limit?: number; total?: number; totalPages?: number } };

// CSV matching needs the complete directory, not just the first 100 people.
// Fail visibly if pagination is inconsistent rather than matching a partial list.
export async function collectMemberDirectory(loadPage: (page: number) => Promise<DirectoryPage>, signal?: AbortSignal) {
  const directory = new Map<string, GroupMember>();
  let page = 1;
  let totalPages = 1;
  let expectedTotal = 0;
  do {
    signal?.throwIfAborted();
    const response = await loadPage(page);
    signal?.throwIfAborted();
    const limit = response.meta?.limit ?? 100;
    if (!Number.isInteger(limit) || limit < 1) throw new Error("The member directory returned invalid pagination.");
    totalPages = Math.max(1, response.meta?.totalPages ?? Math.ceil((response.meta?.total ?? response.data.length) / limit));
    if (!Number.isFinite(totalPages)) throw new Error("The member directory returned invalid pagination.");
    expectedTotal = response.meta?.total ?? expectedTotal;
    const sizeBefore = directory.size;
    response.data.forEach((member) => directory.set(member.id, member));
    if (page > 1 && response.data.length && directory.size === sizeBefore) throw new Error("The complete member directory could not be loaded.");
    if (!response.data.length && page <= totalPages && response.meta?.total) throw new Error("The complete member directory could not be loaded.");
    page++;
  } while (page <= totalPages);
  if (directory.size < expectedTotal) throw new Error("The complete member directory could not be loaded.");
  return normalizeGroupMembers([...directory.values()]);
}
