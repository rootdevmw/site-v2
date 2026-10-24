import type { QueryClient } from "@tanstack/react-query";
import type { GroupKind } from "./group-members";

export function refreshGroupMembership(client: QueryClient, kind: GroupKind, id: string, memberIds: string[]) {
  const keys = kind === "homecell"
    // Adding to a homecell can move the person out of a different homecell.
    ? [["homecell"], ["homecell-members"], ["homecells"]]
    : [["ministry", id], ["ministry-members", id], ["ministries"]];
  return Promise.all([
    ...keys.map((queryKey) => client.invalidateQueries({ queryKey })),
    client.invalidateQueries({ queryKey: ["members"] }),
    ...memberIds.map((memberId) => client.invalidateQueries({ queryKey: ["member", memberId] })),
  ]);
}
