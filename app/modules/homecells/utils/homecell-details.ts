import type { Homecell } from "../types/homecell.types";
import { normalizeGroupMembers, type GroupMember, type GroupMemberPayload } from "@/lib/utils/group-members";

export type HomecellDetails = Omit<Homecell, "programs"> & { members: GroupMember[]; createdAt?: string };
export type HomecellDetailPayload = Omit<HomecellDetails, "members"> & { members?: GroupMemberPayload };

export function normalizeHomecellDetails(homecell: HomecellDetailPayload): HomecellDetails {
  return { ...homecell, members: normalizeGroupMembers(homecell.members) };
}
