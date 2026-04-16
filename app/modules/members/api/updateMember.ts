import { api } from "@/lib/api/client";
import { MemberFormValues } from "../types/member.types";

export async function updateMember(id: string, data: MemberFormValues) {
  const res = await api.patch(`/members/${id}`, data);
  return res.data;
}
