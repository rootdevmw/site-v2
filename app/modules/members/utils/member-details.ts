import type { Member, MemberFormValues } from "../types/member.types";
import { normalizeMemberPrefix } from "@/lib/utils/member-titles";
import { getRelatedMinistries, type MinistryRelationship, type RelatedRecord } from "@/lib/utils/record-details";

export type MemberDetails = Omit<Member, "status" | "prefix"> & {
  status: MemberFormValues["status"];
  prefix: MemberFormValues["prefix"];
  homecell?: (RelatedRecord & { location?: string | null }) | null;
  ministries: RelatedRecord[];
  createdAt?: string;
};

export type MemberDetailPayload = Omit<MemberDetails, "bio" | "ministries" | "prefix"> & {
  prefix: MemberFormValues["prefix"] | "ELDER";
  bio?: string | { bio: string } | null;
  baptized?: boolean;
  ministries?: (MinistryRelationship | null)[] | null;
};

export function normalizeMemberDetails(member: MemberDetailPayload): MemberDetails {
  return {
    ...member,
    prefix: normalizeMemberPrefix(member.prefix),
    bio: typeof member.bio === "string" ? member.bio : member.bio?.bio ?? "",
    isBaptized: member.baptized ?? member.isBaptized,
    ministries: getRelatedMinistries(member.ministries),
  };
}
