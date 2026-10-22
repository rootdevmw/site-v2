import { api } from "@/lib/api/client";
import { validateManagementPage, type ManagementPage } from "@/lib/utils/access-lists";
import { prayerTeamAccountSchema, prayerTeamMemberSchema, prayerTeamFilterError, type PrayerTeamFilters, type PrayerTeamAccount, type PrayerTeamMember } from "@/lib/utils/prayer-team";

async function readTeamPage<T extends PrayerTeamAccount>(path: string, filters: PrayerTeamFilters, parse: (entry: unknown) => T, signal?: AbortSignal): Promise<ManagementPage<T>> {
  const failure = prayerTeamFilterError(filters);
  if (failure) throw new Error(failure);
  const response = await api.get(path, { params: { page: filters.page, limit: 10, ...(filters.search && { search: filters.search }) }, signal, timeout: 15000, silent: true });
  const page = validateManagementPage<unknown>(response.data, filters.page);
  const data = page.data.map(parse);
  const ids = data.map((entry) => entry.userId);
  if (new Set(ids).size !== ids.length) throw new Error("The prayer team returned repeated accounts.");
  return { ...page, data };
}
export const getPrayerTeam = (filters: PrayerTeamFilters, signal?: AbortSignal) => readTeamPage<PrayerTeamMember>("/attention/prayer-team", filters, (entry) => prayerTeamMemberSchema.parse(entry), signal);
export const getEligiblePrayerAccounts = (filters: PrayerTeamFilters, signal?: AbortSignal) => readTeamPage<PrayerTeamAccount>("/attention/prayer-team/eligible", filters, (entry) => {
  const account = prayerTeamAccountSchema.parse(entry);
  if (!account.member || !account.email.trim()) throw new Error("The account returned is not eligible for the prayer team.");
  return account;
}, signal);
export async function addPrayerTeamAccount(userId: string) {
  const response = await api.post("/attention/prayer-warriors", { userId }, { timeout: 30000, silent: true });
  if (response.data?.success !== true || response.data.data?.userId !== userId) throw new Error("The addition could not be confirmed.");
  return response.data;
}
export async function removePrayerTeamAccount(userId: string) {
  const response = await api.delete("/attention/prayer-warriors/" + encodeURIComponent(userId), { timeout: 30000, silent: true });
  if (response.data?.success !== true || response.data.data?.userId !== userId || typeof response.data.data.removed !== "boolean") throw new Error("The removal could not be confirmed.");
  return response.data;
}
