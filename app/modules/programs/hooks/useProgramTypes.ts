// hooks/useProgramTypes.ts
import { api } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";

export function useProgramTypes() {
  return useQuery({
    queryKey: ["program-types"],
    queryFn: async () => {
      const res = await api.get("programs/types");
      return res.data;
    },
  });
}
