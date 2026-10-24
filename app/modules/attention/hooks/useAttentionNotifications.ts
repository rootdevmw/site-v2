import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { AttentionOverviewResponse } from "../types/attention.types";

type NotificationResponse = {
  data: AttentionOverviewResponse;
  meta?: { counts?: { prayers: number; visitors: number } };
};

export function useAttentionNotifications(enabled = true) {
  const query = useQuery({
    queryKey: ["attention", "notifications"],
    queryFn: async ({ signal }) => {
      const response = await api.get<NotificationResponse>("/attention/manage", { signal, silent: true });
      return response.data;
    },
    enabled,
    refetchInterval: 15_000,
  });

  const prayers = query.data?.data.prayers ?? [];
  const visitors = query.data?.data.visitors ?? [];
  const counts = query.data?.meta?.counts ?? { prayers: prayers.length, visitors: visitors.length };
  const notifications = [
    ...prayers.map((entry) => ({ ...entry, type: "prayer" as const })),
    ...visitors.map((entry) => ({ ...entry, type: "visitor" as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return { prayers, visitors, counts, notifications, isLoading: query.isLoading, isError: query.isError };
}
