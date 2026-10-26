export const memberPrefixes = [
  "PASTOR",
  "DEACON",
  "SISTER",
  "BROTHER",
] as const;
export type MemberPrefix = (typeof memberPrefixes)[number];

export function normalizeMemberPrefix(
  prefix: MemberPrefix | "ELDER",
): MemberPrefix;
export function normalizeMemberPrefix(prefix: string): string;
export function normalizeMemberPrefix(prefix: string) {
  // Existing records and imports may still use the synonymous church title.
  return prefix === "ELDER" ? "PASTOR" : prefix;
}
