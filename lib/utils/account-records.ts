import { navigation } from "@/config/navigation";
import { getHighestRole, getRoleRank, hasRequiredRole, ROLE_HIERARCHY } from "@/lib/auth/roles";
import type { Role } from "@/app/modules/roles/types/role.types";

export function getAccountRoles(roles?: readonly string[] | null) {
  return [...new Set((roles ?? []).map((role) => role.trim().toUpperCase()).filter(Boolean))]
    .sort((a, b) => getRoleRank(a) - getRoleRank(b) || a.localeCompare(b));
}

export function getRoleContext(roles: readonly string[]) {
  const known = getAccountRoles(roles).filter((role) => Number.isFinite(getRoleRank(role)));
  const highest = getHighestRole(known);
  const areas = navigation.flatMap((entry) => "children" in entry ? entry.children : [entry])
    .filter((entry) => known.length && hasRequiredRole(known, entry.roles))
    .map((entry) => ({ ...entry, label: entry.label.charAt(0).toUpperCase() + entry.label.slice(1) }));
  return { highest, rank: highest ? ROLE_HIERARCHY.indexOf(highest) + 1 : null, levels: ROLE_HIERARCHY.length, areas };
}

export function getAssignableAccountRoles(catalog: Role[], currentRoles: string[]) {
  const assigned = new Set(getAccountRoles(currentRoles));
  return catalog.filter((role) => Number.isFinite(getRoleRank(role.name)) && !assigned.has(role.name.trim().toUpperCase()))
    .sort((a, b) => getRoleRank(a.name) - getRoleRank(b.name));
}
