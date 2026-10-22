"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardSection } from "@/lib/api/dashboard-overview";
import { hasRequiredRole } from "@/lib/auth/roles";
import { dashboardRequirements, type DashboardSection } from "@/lib/utils/dashboard-overview";
import { getAccountRoles } from "@/lib/utils/account-records";
import { getRecordFailure, retryRecordRequest } from "@/lib/utils/record-details";

export function useDashboardSection<K extends DashboardSection>(section: K, user: { id: string; roles: string[] } | null) {
  const roles = getAccountRoles(user?.roles);
  return useQuery({
    queryKey: ["dashboard-overview", section, user?.id, roles],
    queryFn: ({ signal }) => getDashboardSection(section, signal),
    enabled: !!user?.id && hasRequiredRole(roles, [dashboardRequirements[section]]),
    staleTime: 30000, refetchOnMount: "always",
    refetchOnWindowFocus: (query) => ["session", "forbidden"].includes(getRecordFailure(query.state.error)) ? false : "always",
    refetchInterval: (query) => ["session", "forbidden"].includes(getRecordFailure(query.state.error)) ? false : 60000,
    retry: retryRecordRequest,
  });
}
