import type { Ministry } from "../types/ministry.types";
import { normalizeGroupMembers, type GroupMember, type GroupMemberPayload } from "@/lib/utils/group-members";

export type MinistryDetails = Omit<Ministry, "members"> & { members: GroupMember[]; createdAt?: string };
export type MinistryDetailPayload = Omit<MinistryDetails, "members"> & { members?: GroupMemberPayload };

export function normalizeMinistryDetails(ministry: MinistryDetailPayload): MinistryDetails {
  return { ...ministry, members: normalizeGroupMembers(ministry.members) };
}
