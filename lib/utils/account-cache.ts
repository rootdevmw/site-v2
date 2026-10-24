import type { QueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { getSessionIdentity } from "@/lib/api/account-records";

export async function refreshSelfAccount(id: string) {
  if (useAuthStore.getState().user?.id !== id) return;
  try {
    const user = await getSessionIdentity();
    if (useAuthStore.getState().user?.id === id) useAuthStore.getState().setUser(user.id === id ? user : null);
  } catch {
    // A self-role change must not leave the old privileged identity in the UI.
    if (useAuthStore.getState().user?.id === id) useAuthStore.getState().setUser(null);
  }
}

export function refreshAccountRecord(client: QueryClient, id: string, memberIds: (string | undefined)[] = []) {
  const keys = [["user", id], ["users"], ["audit-timeline"], ["audit-logs"]];
  if (memberIds.length) keys.push(["members"], ...memberIds.filter((value): value is string => !!value).map((value) => ["member", value]));
  return Promise.all(keys.map((queryKey) => client.invalidateQueries({ queryKey })));
}

export async function refreshRoleDefinition(client: QueryClient, id: string) {
  const actorId = useAuthStore.getState().user?.id;
  if (actorId) await refreshSelfAccount(actorId);
  await Promise.all([["role", id], ["roles"], ["user"], ["users"], ["audit-timeline"], ["audit-logs"]].map((queryKey) => client.invalidateQueries({ queryKey })));
}
