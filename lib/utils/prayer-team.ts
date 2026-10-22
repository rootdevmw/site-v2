import { z } from "zod";
export type PrayerTeamFilters = { page: number; search: string };
const identifier = z.string().regex(/^[1-9]\d*$/);
const date = z.string().refine((value) => Number.isFinite(Date.parse(value)));
const member = z.object({ id: identifier, firstName: z.string(), lastName: z.string() });
export const prayerTeamAccountSchema = z.object({ userId: identifier, email: z.string(), member: member.nullable() });
export const prayerTeamMemberSchema = prayerTeamAccountSchema.extend({ createdAt: date, eligibility: z.enum(["eligible", "account-unavailable", "profile-unavailable", "email-missing"]) });
export type PrayerTeamAccount = z.infer<typeof prayerTeamAccountSchema>;
export type PrayerTeamMember = z.infer<typeof prayerTeamMemberSchema>;
export function prayerTeamName(account: PrayerTeamAccount) { return [account.member?.firstName, account.member?.lastName].filter(Boolean).join(" ").trim() || account.email || "Account #" + account.userId; }
export function readPrayerTeamFilters(params: Pick<URLSearchParams, "get">): PrayerTeamFilters {
  const page = Number(params.get("page"));
  return { page: Number.isSafeInteger(page) && page > 0 ? page : 1, search: params.get("search")?.trim() || "" };
}
export function prayerTeamHref(filters: PrayerTeamFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.page > 1) params.set("page", String(filters.page));
  return "/dashboard/attention/manage" + (params.size ? "?" + params : "");
}
export function prayerTeamFilterError(filters: PrayerTeamFilters) {
  return filters.search.length > 200 ? "Keep search terms within 200 characters." : !Number.isSafeInteger(filters.page) || filters.page < 1 ? "Choose a valid page." : "";
}
export function prayerTeamWriteError(error: unknown, operation: "add" | "remove") {
  const response = error && typeof error === "object" && "response" in error ? error.response : null;
  const status = response && typeof response === "object" && "status" in response ? response.status : null;
  if (status === 401) return "Your session may have expired. Sign in again before changing the team.";
  if (status === 403) return "Your account no longer has permission to manage the prayer team.";
  if (status === 409) return "This account is already on the prayer team. The roster and available accounts have been refreshed.";
  if (status === 400 || status === 404) return operation === "add" ? "This account is no longer eligible. An active linked directory profile and email are required. Choose another account or ask an administrator to review it." : "This team entry is no longer available. Check the refreshed roster.";
  return `Could not confirm ${operation === "add" ? "the addition" : "the removal"}. Check the refreshed roster before trying again.`;
}
