import type { AuditEntry, AuditSnapshot } from "@/app/modules/audit/types/audit.types";
import { getAuditEntity } from "@/config/audit-entities";

export function formatAuditLabel(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_.-]/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()).replace(/\bId\b/g, "ID");
}

export function getAuditActor(entry: AuditEntry) {
  return [entry.user?.member?.firstName, entry.user?.member?.lastName].filter(Boolean).join(" ").trim()
    || entry.user?.email || (entry.userId ? "User #" + entry.userId : "Actor not recorded");
}

function protectSnapshot(snapshot: AuditSnapshot, entity: string) {
  let protectedFields = false;
  const session = getAuditEntity(entity).key === "SESSION";
  function visit(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(visit);
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).flatMap(([key, child]) => {
      const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (/password|token|secret|authorization|cookie|credential|privatekey|apikey|sessionid|^sessions$|^salt$/.test(normalized) || (session && normalized === "id")) {
        protectedFields = true;
        return [];
      }
      return [[key, visit(child)]];
    }));
    return value;
  }
  return { value: visit(snapshot) as AuditSnapshot, protectedFields };
}

function stableValue(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(stableValue).join(",") + "]";
  if (value && typeof value === "object") return "{" + Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => JSON.stringify(key) + ":" + stableValue(child)).join(",") + "}";
  return JSON.stringify(value) ?? "undefined";
}

function flatten(snapshot: AuditSnapshot) {
  const fields = new Map<string, unknown>();
  function walk(value: unknown, path: string) {
    if (value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length) {
      Object.entries(value).forEach(([key, child]) => walk(child, path ? path + "." + key : key));
    } else fields.set(path, value);
  }
  if (snapshot) Object.entries(snapshot).forEach(([key, value]) => walk(value, key));
  return fields;
}

export type AuditDifference = { key: string; before: unknown; after: unknown; beforeIncluded: boolean; afterIncluded: boolean };

export function getAuditDifferences(before: AuditSnapshot, after: AuditSnapshot, entity = "") {
  const safeBefore = protectSnapshot(before, entity);
  const safeAfter = protectSnapshot(after, entity);
  const first = flatten(safeBefore.value);
  const second = flatten(safeAfter.value);
  const changed: AuditDifference[] = [];
  const unchanged: AuditDifference[] = [];
  for (const key of [...new Set([...first.keys(), ...second.keys()])].sort()) {
    const difference = { key, before: first.get(key), after: second.get(key), beforeIncluded: first.has(key), afterIncluded: second.has(key) };
    const same = difference.beforeIncluded === difference.afterIncluded && stableValue(difference.before) === stableValue(difference.after);
    (same ? unchanged : changed).push(difference);
  }
  return { changed, unchanged, protectedFields: safeBefore.protectedFields || safeAfter.protectedFields };
}

export function formatAuditValue(value: unknown, included: boolean) {
  if (!included) return "Not included";
  if (value === null) return "Null";
  if (value === "") return "Empty text";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

export function orderAuditEntries(entries: readonly AuditEntry[]) {
  const time = (entry: AuditEntry) => Number.isFinite(Date.parse(entry.createdAt)) ? Date.parse(entry.createdAt) : -Infinity;
  return [...entries].sort((a, b) => time(b) - time(a));
}

export function sanitizeAuditEntry(entry: AuditEntry): AuditEntry {
  const before = protectSnapshot(entry.before, entry.entity);
  const after = protectSnapshot(entry.after, entry.entity);
  const session = getAuditEntity(entry.entity).key === "SESSION";
  return {
    id: entry.id, action: entry.action, entity: entry.entity, entityId: session ? null : entry.entityId,
    userId: entry.userId, description: entry.description, createdAt: entry.createdAt,
    ipAddress: entry.ipAddress, userAgent: entry.userAgent,
    before: before.value, after: after.value,
    user: entry.user ? { id: entry.user.id, email: entry.user.email, member: entry.user.member ? { firstName: entry.user.member.firstName, lastName: entry.user.member.lastName } : null } : null,
    protectedFields: !!entry.protectedFields || before.protectedFields || after.protectedFields || (session && !!entry.entityId),
  };
}
