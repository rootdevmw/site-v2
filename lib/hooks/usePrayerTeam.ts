"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addPrayerTeamAccount, getEligiblePrayerAccounts, getPrayerTeam, removePrayerTeamAccount } from "@/lib/api/prayer-team";
import { getAccountRoles } from "@/lib/utils/account-records";
import { prayerTeamFilterError, type PrayerTeamFilters } from "@/lib/utils/prayer-team";
import { hasRequiredRole } from "@/lib/auth/roles";
import { retryRecordRequest } from "@/lib/utils/record-details";
type Actor = { id: string; roles: string[] } | null;
function queryOptions(view: string, filters: PrayerTeamFilters, actor: Actor) {
  const roles = getAccountRoles(actor?.roles);
  return { queryKey: ["prayer-team", view, actor?.id, roles, filters], enabled: !!actor?.id && hasRequiredRole(roles, ["DEACON"]) && !prayerTeamFilterError(filters), staleTime: 30000, refetchOnMount: "always" as const, retry: retryRecordRequest };
}
export function usePrayerTeam(filters: PrayerTeamFilters, actor: Actor) {
  return useQuery({ ...queryOptions("roster", filters, actor), queryFn: ({ signal }) => getPrayerTeam(filters, signal) });
}
export function useEligiblePrayerAccounts(filters: PrayerTeamFilters, actor: Actor) {
  return useQuery({ ...queryOptions("eligible", filters, actor), queryFn: ({ signal }) => getEligiblePrayerAccounts(filters, signal) });
}
export function usePrayerTeamActions() {
  const client = useQueryClient();
  const refresh = () => Promise.all([["prayer-team"], ["audit-logs"], ["audit-timeline"]].map((queryKey) => client.invalidateQueries({ queryKey })));
  return { add: useMutation({ mutationFn: addPrayerTeamAccount, retry: false, onSettled: refresh }), remove: useMutation({ mutationFn: removePrayerTeamAccount, retry: false, onSettled: refresh }) };
}
