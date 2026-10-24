import type { QueryClient } from "@tanstack/react-query";
export function refreshMemberEditor(client: QueryClient) {
  return Promise.all(["members", "member", "homecells", "homecell", "homecell-members", "ministries", "ministry", "ministry-members", "users", "user", "prayer-team", "program", "program-template", "audit-logs", "audit-timeline"].map((key) => client.invalidateQueries({ queryKey: [key] })));
}
