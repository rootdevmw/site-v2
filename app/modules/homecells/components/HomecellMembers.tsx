"use client";

import { GroupMembersPanel } from "@/components/records/GroupMembersPanel";
import type { GroupMember } from "@/lib/utils/group-members";

export function HomecellMembers({ homecellId, groupName = "this homecell", members, refreshing = false }: {
  homecellId: string; groupName?: string; members: GroupMember[]; refreshing?: boolean;
}) {
  return <GroupMembersPanel kind="homecell" groupId={homecellId} groupName={groupName} members={members} refreshing={refreshing} />;
}
