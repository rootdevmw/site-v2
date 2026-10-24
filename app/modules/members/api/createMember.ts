import { api } from "@/lib/api/client";
import { MemberFormValues } from "../types/member.types";
import { confirmedMemberWrite } from "@/lib/api/member-editor";

export async function createMember(data: MemberFormValues) {
  const res = await api.post("/members", data, { timeout: 30000, silent: true });
  return confirmedMemberWrite(res.data);
}
