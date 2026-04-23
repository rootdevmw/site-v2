// hooks/useProgramTypes.ts
import { api } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";

export function useProgramTypes(params?: { page?: number }) {
  return useQuery({
    queryKey: ["program-types", params],
    queryFn: async () => {
      const res = await api.get("programs/types", { params });
      return res.data;
    },
  });
}
