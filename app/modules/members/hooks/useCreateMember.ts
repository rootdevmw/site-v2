import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMember } from "../api/createMember";
import { refreshMemberEditor } from "@/lib/utils/member-editor-cache";
export function useCreateMember() {
  const client = useQueryClient();
  return useMutation({ mutationFn: createMember, retry: false, onSettled: () => refreshMemberEditor(client) });
}
