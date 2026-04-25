"use client";

import { useState } from "react";

interface AuditEntry {
  id: string;
  userId: string | null;
  user?: {
    id: string;
    email?: string | null;
    roles?: Array<{
      role?: {
        id?: string;
        name?: string | null;
      } | null;
    }>;
    member?: {
      id?: string;
      prefix?: string | null;
      firstName?: string | null;
      lastName?: string | null;
    } | null;
  } | null;
  action: string;
  entity: string;
  entityId: string | null;
  description: string | null;
  before: Record<string, any> | null;
  after: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface AuditLogProps {
  entries: AuditEntry[];
}

function formatAction(action: string) {
  return action
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function formatEntity(entity: string) {
  return entity.charAt(0) + entity.slice(1).toLowerCase();
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function actionColor(action: string) {
  if (action.includes("CREAT") || action.includes("ADD")) {
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }
  if (action.includes("DELET") || action.includes("REMOV")) {
    return "bg-red-500/10 text-red-400 border-red-500/20";
  }
  if (action.includes("UPDAT") || action.includes("EDIT")) {
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }
  return "bg-[var(--hover-soft)] text-[var(--text-secondary)] border-[var(--border-soft)]";
}

function flattenObject(
  obj: Record<string, any>,
  prefix = "",
): Record<string, any> {
  return Object.entries(obj).reduce(
    (acc, [key, val]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      if (
        val !== null &&
        typeof val === "object" &&
        !Array.isArray(val) &&
        !(val instanceof Date)
      ) {
        Object.assign(acc, flattenObject(val, path));
      } else {
        acc[path] = val;
      }
      return acc;
    },
    {} as Record<string, any>,
  );
}

function computeDiff(
  before: Record<string, any> | null,
  after: Record<string, any> | null,
) {
  const flatBefore = before ? flattenObject(before) : {};
  const flatAfter = after ? flattenObject(after) : {};
  const allKeys = new Set([
    ...Object.keys(flatBefore),
    ...Object.keys(flatAfter),
  ]);

  const changed: { key: string; before: any; after: any }[] = [];
  const unchanged: { key: string; value: any }[] = [];

  allKeys.forEach((key) => {
    const b = flatBefore[key];
    const a = flatAfter[key];
    const bStr = JSON.stringify(b);
    const aStr = JSON.stringify(a);

    if (before && after) {
      if (bStr !== aStr) changed.push({ key, before: b, after: a });
      else unchanged.push({ key, value: a });
    } else if (after) {
      changed.push({ key, before: undefined, after: a });
    } else if (before) {
      changed.push({ key, before: b, after: undefined });
    }
  });

  return { changed, unchanged };
}

function renderValue(val: any): string {
  if (val === null || val === undefined) return "-";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "string" && val === "") return "(empty)";
  return String(val);
}

function formatKey(key: string) {
  return key
    .split(".")
    .map((part) =>
      part
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase())
        .trim(),
    )
    .join(" > ");
}

function getActorName(entry: AuditEntry) {
  const firstName = entry.user?.member?.firstName?.trim();
  const lastName = entry.user?.member?.lastName?.trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  if (fullName) return fullName;
  if (entry.user?.email) return entry.user.email;
  if (entry.userId) return `User #${entry.userId}`;
  return "Unknown user";
}

function getActorRole(entry: AuditEntry) {
  return entry.user?.roles
    ?.map((item) => item.role?.name)
    .filter(Boolean)
    .join(", ");
}

function DiffPanel({
  before,
  after,
}: {
  before: Record<string, any> | null;
  after: Record<string, any> | null;
}) {
  const [showUnchanged, setShowUnchanged] = useState(false);
  const { changed, unchanged } = computeDiff(before, after);

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--card-elevated)] text-xs">
      {changed.length > 0 ? (
        <div>
          <p className="border-b border-[var(--border-soft)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)]">
            {changed.length} field{changed.length !== 1 ? "s" : ""} changed
          </p>
          <div className="divide-y divide-[var(--border-soft)]">
            {changed.map(({ key, before: b, after: a }) => (
              <div
                key={key}
                className="grid grid-cols-[1fr_auto_1fr] items-start gap-2 px-4 py-2.5"
              >
                <div>
                  <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    {formatKey(key)}
                  </p>
                  <p
                    className={`break-all ${
                      b !== undefined
                        ? "text-red-400 line-through"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    {renderValue(b)}
                  </p>
                </div>
                <div className="pt-4 text-[var(--text-secondary)]">{"->"}</div>
                <div className="pt-4">
                  <p
                    className={`break-all ${
                      a !== undefined
                        ? "font-medium text-emerald-400"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    {renderValue(a)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="px-4 py-3 text-[var(--text-secondary)]">
          No field changes detected.
        </p>
      )}

      {unchanged.length > 0 && (
        <div className="border-t border-[var(--border-soft)]">
          <button
            onClick={() => setShowUnchanged((v) => !v)}
            className="w-full px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            {showUnchanged ? "v" : ">"} {unchanged.length} unchanged field
            {unchanged.length !== 1 ? "s" : ""}
          </button>
          {showUnchanged && (
            <div className="divide-y divide-[var(--border-soft)]">
              {unchanged.map(({ key, value }) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-4 px-4 py-2 opacity-40"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    {formatKey(key)}
                  </p>
                  <p className="break-all text-right text-[var(--text-primary)]">
                    {renderValue(value)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AuditRow({ entry }: { entry: AuditEntry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="last:border-0 border-b border-[var(--border-soft)]">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-[var(--hover-soft)]"
      >
        <div className="w-10 shrink-0 pt-0.5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            {formatDate(entry.createdAt).split(" ")[1]}
          </p>
          <p className="text-lg font-bold leading-none text-[var(--text-primary)]">
            {new Date(entry.createdAt).getDate()}
          </p>
          <p className="mt-0.5 text-[10px] text-[var(--text-secondary)]">
            {formatTime(entry.createdAt)}
          </p>
        </div>

        <div className="mt-1 h-8 w-px shrink-0 bg-[var(--border-soft)]" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${actionColor(entry.action)}`}
            >
              {formatAction(entry.action)}
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              on{" "}
              <span className="font-semibold text-[var(--text-primary)]">
                {formatEntity(entry.entity)}
              </span>
              {entry.entityId && (
                <span className="opacity-50 text-[var(--text-secondary)]">
                  {" "}
                  #{entry.entityId}
                </span>
              )}
            </span>
          </div>

          {(entry.user || entry.userId) && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-[var(--hover-soft)] px-2.5 py-1 font-medium text-[var(--text-primary)]">
                {getActorName(entry)}
              </span>
              {entry.user?.email && (
                <span className="text-[var(--text-secondary)]">
                  {entry.user.email}
                </span>
              )}
              {getActorRole(entry) && (
                <span className="rounded-full border border-[var(--border-soft)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                  {getActorRole(entry)}
                </span>
              )}
            </div>
          )}

          {entry.description && (
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {entry.description}
            </p>
          )}

          {entry.before &&
            entry.after &&
            (() => {
              const { changed } = computeDiff(entry.before, entry.after);
              if (changed.length === 0) return null;
              return (
                <p className="mt-1 truncate text-[11px] text-[var(--text-secondary)]">
                  Changed: {changed.map((c) => formatKey(c.key)).join(", ")}
                </p>
              );
            })()}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="text-xs text-[var(--text-secondary)]">
            {expanded ? "v" : ">"}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5">
          <DiffPanel before={entry.before} after={entry.after} />

          {(entry.ipAddress || entry.userAgent || entry.userId || entry.user) && (
            <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-[var(--text-secondary)] opacity-50">
              {(entry.user || entry.userId) && (
                <span>Actor: {getActorName(entry)}</span>
              )}
              {entry.userId && <span>User ID: {entry.userId}</span>}
              {entry.ipAddress && <span>IP: {entry.ipAddress}</span>}
              {entry.userAgent && (
                <span className="max-w-xs truncate">UA: {entry.userAgent}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AuditLog({ entries }: AuditLogProps) {
  if (entries.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-[var(--text-secondary)]">
        No audit entries found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--card-bg)]">
      <div className="flex items-center justify-between border-b border-[var(--border-soft)] bg-[var(--card-elevated)] px-5 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            Audit trail
          </p>
          <h2 className="mt-0.5 text-base font-semibold text-[var(--text-primary)]">
            Activity log
          </h2>
        </div>
        <span className="text-xs text-[var(--text-secondary)]">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      <div>
        {entries.map((entry) => (
          <AuditRow key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
