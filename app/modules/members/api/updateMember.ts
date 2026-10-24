import { api } from "@/lib/api/client";
import { MemberFormValues } from "../types/member.types";
import { confirmedMemberWrite } from "@/lib/api/member-editor";

export async function updateMember(id: string, data: MemberFormValues) {
  const res = await api.patch(`/members/${encodeURIComponent(id)}`, data, { timeout: 30000, silent: true });
  return confirmedMemberWrite(res.data, id);
}
