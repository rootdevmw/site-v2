import { api } from "@/lib/api/client";

export async function getVisitor(id: string) {
  const res = await api.get("/attention/visitors");
  return res.data.data.find((v: any) => v.id === id);
}
