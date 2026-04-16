import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export function useMinistries() {
  return useQuery({
    queryKey: ["ministries"],
    queryFn: async () => {
      const res = await api.get("/ministries");
      return res.data;
    },
  });
}
