import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export function useHomecells() {
  return useQuery({
    queryKey: ["homecells"],
    queryFn: async () => {
      const res = await api.get("/homecells");
      return res.data;
    },
  });
}
