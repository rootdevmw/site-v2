import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export function useMinistryMembers(ministryId: string) {
  return useQuery({
    queryKey: ["ministry-members", ministryId],
    queryFn: async () => {
      const res = await api.get(
        `/ministries/${ministryId}/members`
      );
      return res.data;
    },
    enabled: !!ministryId,
  });
}