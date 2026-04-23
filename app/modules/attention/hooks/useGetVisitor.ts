import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

async function fetchVisitor(id: string) {
  const res = await api.get(`/attention/visitors`);
  return res.data.data.find((v: any) => v.id === id);
}

export function useGetVisitor(id: string) {
  return useQuery({
    queryKey: ["visitor", id],
    queryFn: () => fetchVisitor(id),
    enabled: !!id,
  });
}
