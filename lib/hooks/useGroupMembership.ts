import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { GroupKind } from "@/lib/utils/group-members";
import { refreshGroupMembership } from "@/lib/utils/group-membership-cache";

export function useGroupMembership(kind: GroupKind, id: string) {
  const client = useQueryClient();
  const path = "/" + (kind === "ministry" ? "ministries" : "homecells") + "/" + encodeURIComponent(id) + "/members";
  const refresh = (_data: unknown, _error: unknown, memberId: string) => refreshGroupMembership(client, kind, id, [memberId]);
  const add = useMutation({
    mutationFn: (memberId: string) => api.post(path, { memberId }, { silent: true, timeout: 30000 }),
    onSettled: refresh,
  });
  const remove = useMutation({
    mutationFn: (memberId: string) => api.delete(path + "/" + encodeURIComponent(memberId), { silent: true, timeout: 30000 }),
    onSettled: refresh,
  });
  return { add, remove };
}
