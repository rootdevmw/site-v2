import type { GroupMember } from "./group-members";

export type MemberCsvRow = { firstName: string; lastName: string };
export type MemberCsvMatch = MemberCsvRow & { member?: GroupMember; state: "ready" | "assigned" | "duplicate" | "ambiguous" | "missing" };

export function parseMemberCsv(text: string): MemberCsvRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  const input = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  for (let index = 0; index < input.length; index++) {
    const char = input[index];
    if (char === '"') {
      if (quoted && input[index + 1] === '"') { value += '"'; index++; }
      else quoted = !quoted;
    } else if (!quoted && (char === "," || char === "\n")) {
      row.push(value.trim()); value = "";
      if (char === "\n") { if (row.some(Boolean)) rows.push(row); row = []; }
    } else value += char;
  }
  if (quoted) throw new Error("The CSV has an unclosed quote. Check the file and try again.");
  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);
  if (!rows.length) return [];
  const headers = rows[0].map((column) => column.toLowerCase().replace(/[\s_]/g, ""));
  const firstIndex = headers.indexOf("firstname");
  const lastIndex = headers.indexOf("lastname");
  const hasHeader = firstIndex >= 0 || lastIndex >= 0;
  if (hasHeader && (firstIndex < 0 || lastIndex < 0)) throw new Error("Include both firstName and lastName column headers.");
  return (hasHeader ? rows.slice(1) : rows).map((columns) => {
    let firstName = columns[hasHeader ? firstIndex : 0] || "";
    let lastName = columns[hasHeader ? lastIndex : 1] || "";
    if (!hasHeader && firstName && !lastName && firstName.includes(" ")) {
      const [first, ...rest] = firstName.split(/\s+/);
      firstName = first; lastName = rest.join(" ");
    }
    return { firstName, lastName };
  }).filter((item) => item.firstName || item.lastName);
}

export function matchMemberCsv(rows: MemberCsvRow[], directory: GroupMember[], assignedIds: Set<string>): MemberCsvMatch[] {
  const key = (row: MemberCsvRow) => [row.firstName, row.lastName].map((part) => part.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase()).join("\u0000");
  const byName = new Map<string, GroupMember[]>();
  directory.filter((member) => !member.deletedAt).forEach((member) => byName.set(key(member), [...(byName.get(key(member)) ?? []), member]));
  const seen = new Set<string>();
  return rows.map((row) => {
    const candidates = byName.get(key(row)) ?? [];
    if (!candidates.length) return { ...row, state: "missing" };
    if (candidates.length > 1) return { ...row, state: "ambiguous" };
    const member = candidates[0];
    const state = assignedIds.has(member.id) ? "assigned" : seen.has(member.id) ? "duplicate" : "ready";
    seen.add(member.id);
    return { ...row, member, state };
  });
}

export async function assignImportedMembers(memberIds: string[], assign: (id: string) => Promise<unknown>) {
  const assignedIds: string[] = [];
  const failedIds: string[] = [];
  // Await every request so partial progress is known before enabling a retry.
  for (const id of new Set(memberIds)) {
    try { await assign(id); assignedIds.push(id); }
    catch { failedIds.push(id); }
  }
  return { assignedIds, failedIds };
}
