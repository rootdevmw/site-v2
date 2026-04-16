import { api } from "@/lib/api/client";
import { MemberFormValues } from "../types/member.types";

export async function createMember(data: MemberFormValues) {
  const res = await api.post("/members", data);
  return res.data;
}
