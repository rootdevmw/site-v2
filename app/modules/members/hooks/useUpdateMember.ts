import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMember } from "../api/updateMember";
import type { MemberFormValues } from "../types/member.types";
import { refreshMemberEditor } from "@/lib/utils/member-editor-cache";
export function useUpdateMember() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: MemberFormValues }) => updateMember(id, data), retry: false, onSettled: () => refreshMemberEditor(client) });
}
