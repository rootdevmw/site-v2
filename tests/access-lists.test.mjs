import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { sourceLoader } from "./helpers/load-source.mjs";

const load = sourceLoader();
const helpers = load("lib/utils/access-lists.ts");
const { readAccessFilters, accessHref, accessParams, accessEntry, readAuditFilters, auditHref, auditFilterError, auditTimelineHref, validateManagementPage } = helpers;
const filters = (kind, query = "") => readAccessFilters(kind, new URLSearchParams(query));
const auditFilters = (query = "") => readAuditFilters(new URLSearchParams(query));
const account = { id: "7", email: "test+<account>@example.test", roles: ["MEMBER", "ADMIN", "ADMIN"], member: { id: "12", firstName: "Test", lastName: "Member", phone: "fixture-private" }, createdAt: "2026-10-20T22:30:00Z", password: "fixture-password" };
const entry = { id: "91", entity: "UserRole", entityId: "7", action: "ROLE_CHANGED", userId: "8", user: { id: "8", email: "actor@example.test", member: { firstName: "Test", lastName: "Actor" } }, before: { role: "VISITOR", password: "fixture-secret" }, after: { role: "MEMBER" }, createdAt: account.createdAt };

test("account URLs retain relevant filters, unlinked selection and encoded search across paging", () => {
  const selected = filters("users", "search=Test+%26+Care&role=admin&linked=false&page=3");
  assert.equal(accessHref("users", selected), "/dashboard/users?search=Test+%26+Care&role=ADMIN&linked=false&page=3");
  assert.deepEqual(filters("users", accessParams("users", selected).toString()), selected);
  assert.equal(accessHref("roles", selected), "/dashboard/roles?search=Test+%26+Care&page=3");
  for (const page of ["0", "-1", "1.5", "Infinity", "9007199254740992"]) assert.equal(filters("users", "page=" + page).page, 1);
  assert.equal(filters("users", "role=unknown&linked=maybe").role, "");
  assert.equal(filters("users", "role=unknown&linked=maybe").linked, "");
});

test("audit URLs canonicalize entities and preserve action, actor and date filters; invalid ranges stay explicit", () => {
  const selected = auditFilters("search=7&action=role+changed&actorId=8&from=2026-10-20&to=2026-10-21&page=2");
  assert.equal(auditHref("USER_ROLE", selected), "/dashboard/audit/USERROLE?search=7&action=role+changed&actorId=8&from=2026-10-20&to=2026-10-21&page=2");
  assert.equal(auditFilterError(selected), "");
  for (const query of ["actorId=0", "actorId=8/9", "from=2026-02-30", "to=nonsense", "from=2026-10-22&to=2026-10-21"]) assert.ok(auditFilterError(auditFilters(query)));
  assert.equal(auditTimelineHref(entry), "/dashboard/audit/USERROLE/7");
  assert.equal(auditTimelineHref({ ...entry, entityId: null }), null);
  assert.equal(auditTimelineHref({ ...entry, entity: "Session", entityId: "fixture-session" }), null);
});

test("account projections omit unrelated private fields and reject inconsistent page envelopes", () => {
  const projected = accessEntry("users", account);
  assert.doesNotMatch(JSON.stringify(projected), /fixture-/);
  assert.deepEqual(accessEntry("roles", { id: "2", name: "ADMIN", extra: "private" }), { id: "2", name: "ADMIN" });
  for (const response of [{ data: [], meta: {} }, { success: false, data: [], meta: { total: 0, limit: 10 } }, { data: [], meta: { total: 20, limit: 10 } }, { data: [], meta: { total: 0, limit: 10, page: 3 } }]) assert.throws(() => validateManagementPage(response, 1), /page/);
  assert.deepEqual(validateManagementPage({ data: [], meta: { total: 0, limit: 10 } }, 9), { data: [], total: 0, limit: 10 });
});

test("real account and history adapters send filters, cancellation and timeouts to private endpoints", async () => {
  const calls = [];
  const actual = sourceLoader({ "@/lib/api/client": { api: { get: async (url, options) => { calls.push([url, options]); return { data: { data: url.startsWith("/audit/") ? [entry] : url === "/users" ? [account] : [{ id: "2", name: "ADMIN" }], meta: { total: 21, page: 2, limit: 10 } } }; } } } })("lib/api/access-lists.ts");
  const signal = new AbortController().signal;
  const result = await actual.getAccessList("users", filters("users", "search=Test&role=ADMIN&linked=false&page=2"), signal);
  assert.deepEqual(calls[0], ["/users", { params: { search: "Test", role: "ADMIN", linked: "false", page: 2, limit: 10 }, signal, timeout: 15000, silent: true }]);
  assert.doesNotMatch(JSON.stringify(result), /fixture-/);
  await actual.getAccessList("roles", filters("roles", "search=admin&page=2"), signal);
  assert.deepEqual(calls[1][1].params, { search: "admin", page: 2, limit: 10 });
  const history = await actual.getAuditList("USER_ROLE", auditFilters("action=changed&actorId=8&from=2026-10-20&to=2026-10-21&page=2"), signal);
  assert.equal(calls[2][0], "/audit/USERROLE");
  assert.equal(calls[2][1].params.actionSearch, "changed");
  assert.equal(calls[2][1].params.action, undefined);
  assert.equal(calls[2][1].params.actorId, "8");
  assert.equal(calls[2][1].params.to, "2026-10-21");
  assert.equal(calls[2][1].signal, signal);
  assert.equal(calls[2][1].timeout, 15000);
  assert.doesNotMatch(JSON.stringify(history), /fixture-secret/);
});

test("permission-gated queries separate family, entity and filters without placeholder rows or forbidden retries", () => {
  const hooks = sourceLoader({ "@tanstack/react-query": { useQuery: (options) => options }, "@/lib/api/access-lists": {}, "@/lib/utils/account-cache": {} })("lib/hooks/useAccessLists.ts");
  assert.equal(hooks.useAccessList("users", filters("users"), false).enabled, false);
  assert.equal(hooks.useAuditList("USER", auditFilters(), false).enabled, false);
  const role = hooks.useAccessList("roles", filters("roles"), true);
  assert.notDeepEqual(role.queryKey, hooks.useAccessList("users", filters("users"), true).queryKey);
  assert.deepEqual(hooks.useAuditList("USER_ROLE", auditFilters(), true).queryKey, hooks.useAuditList("UserRole", auditFilters(), true).queryKey);
  assert.notDeepEqual(hooks.useAuditList("USER", auditFilters(), true).queryKey, hooks.useAuditList("USER", auditFilters("actorId=7"), true).queryKey);
  assert.equal(role.placeholderData, undefined);
  for (const status of [401, 403, 404]) assert.equal(role.retry(0, { response: { status } }), false);
  assert.equal(role.retry(0, new Error("offline")), true);
  assert.equal(role.retry(1, new Error("offline")), false);
});

test("deletion uses encoded endpoints and bounded writes, then refreshes account and history caches even on uncertain failure", async () => {
  const calls = [];
  const client = new QueryClient();
  const actual = sourceLoader({ "@/lib/api/client": { api: { delete: async (...args) => { calls.push(args); return { data: { success: false } }; } } } })("lib/api/access-lists.ts");
  await assert.rejects(() => actual.deleteAccessRecord("users", "7/8"), /could not be confirmed/);
  assert.deepEqual(calls[0], ["/users/7%2F8", { timeout: 30000, silent: true }]);
  const hooks = sourceLoader({ "@tanstack/react-query": { useQueryClient: () => client, useMutation: (options) => options }, "@/lib/api/access-lists": {} })("lib/hooks/useAccessLists.ts");
  const mutation = hooks.useDeleteAccessRecord("users");
  assert.equal(mutation.retry, false);
  const keys = [["users", "management-list", filters("users")], ["user", "7"], ["audit-logs", "USER"], ["audit-timeline", "USER", "7"]];
  for (const error of [null, new Error("response lost")]) {
    keys.forEach((key) => client.setQueryData(key, {}));
    await mutation.onSettled(undefined, error, "7");
    keys.forEach((key) => assert.equal(client.getQueryState(key).isInvalidated, true));
  }
  const invalidations = [];
  const roleHooks = sourceLoader({ "@tanstack/react-query": { useQueryClient: () => client, useMutation: (options) => options }, "@/lib/api/access-lists": {}, "@/lib/utils/account-cache": { refreshRoleDefinition: (...args) => invalidations.push(args) } })("lib/hooks/useAccessLists.ts");
  await roleHooks.useDeleteAccessRecord("roles").onSettled(undefined, new Error("response lost"), "2");
  assert.deepEqual(invalidations, [[client, "2"]]);
  client.clear();
});

test("user cards expose profile links, normalized roles and self-account context without offering self-deletion", () => {
  const { AccessList } = load("components/directories/AccessList.tsx");
  const props = { kind: "users", records: [accessEntry("users", account)], onDelete: async () => {} };
  const other = renderToStaticMarkup(React.createElement(AccessList, props));
  assert.match(other, /test\+&lt;account&gt;@example.test/);
  assert.match(other, /href="\/dashboard\/members\/12"/);
  assert.match(other, /href="\/dashboard\/audit\/USER\/7"/);
  assert.match(other, /Delete.*user #7/);
  assert.doesNotMatch(other, /fixture-private|fixture-password/);
  const self = renderToStaticMarkup(React.createElement(AccessList, { ...props, actorId: "7" }));
  assert.match(self, /Your account/);
  assert.match(self, /Use another administrator account/);
  assert.doesNotMatch(self, />Delete<\/button>/);
});

test("role cards distinguish configured hierarchy positions and custom names without claiming server authorization", () => {
  const { AccessList } = load("components/directories/AccessList.tsx");
  const html = renderToStaticMarkup(React.createElement(AccessList, { kind: "roles", records: [{ id: "2", name: "ADMIN" }, { id: "9", name: "Custom <role>" }], onDelete: async () => {} }));
  for (const value of [/2 of 7/, /Configured role/, /Outside hierarchy/, /Summary unavailable/, /Custom &lt;role&gt;/, /href="\/dashboard\/roles\/9"/]) assert.match(html, value);
});

test("audit rows render actor, Malawi time and canonical timelines, without exposing snapshots or session IDs", () => {
  const { AuditList } = load("components/directories/AuditList.tsx");
  const { sanitizeAuditEntry } = load("lib/utils/audit-records.ts");
  const html = renderToStaticMarkup(React.createElement(AuditList, { entries: [sanitizeAuditEntry(entry), { ...entry, id: "92", entity: "Session", entityId: "fixture-session", userId: null, user: null, before: { id: "fixture-session" }, after: null }] }));
  assert.match(html, /Test Actor/);
  assert.match(html, /href="\/dashboard\/users\/8"/);
  assert.match(html, /href="\/dashboard\/audit\/USERROLE\/7"/);
  assert.match(html, /21 Oct 2026, 00:30:00 CAT/);
  assert.match(html, /ID protected/);
  assert.match(html, /No record timeline/);
  assert.doesNotMatch(html, /fixture-secret|fixture-session|&quot;MEMBER&quot;/);
});

function renderAccess({ kind = "users", roles = ["ADMIN"], query = "", result = {} } = {}) {
  let enabled;
  const { AccessClient } = sourceLoader({
    "next/navigation": { useSearchParams: () => new URLSearchParams(query), useRouter: () => ({ push() {} }) },
    "@/app/modules/auth/store/auth.store": { useAuthStore: (selector) => selector({ user: { id: "8", roles } }) },
    "@/lib/hooks/useAccessLists": { useAccessList: (_kind, _filters, allowed) => { enabled = allowed; return { isPending: false, isError: false, isFetching: false, ...result }; }, useDeleteAccessRecord: () => ({ mutateAsync: async () => {}, isPending: false }) },
  })("components/directories/AccessClient.tsx");
  return { html: renderToStaticMarkup(React.createElement(AccessClient, { kind })), enabled };
}

test("access list controllers enforce ADMIN and ROOT and distinguish loading, failed, empty and unavailable-page states", () => {
  assert.equal(renderAccess({ roles: ["MEDIA"] }).enabled, false);
  assert.match(renderAccess({ roles: ["MEDIA"] }).html, /Access unavailable/);
  assert.equal(renderAccess({ kind: "roles", roles: ["ADMIN"] }).enabled, false);
  assert.equal(renderAccess({ kind: "roles", roles: ["ROOT"] }).enabled, true);
  assert.match(renderAccess({ result: { isPending: true } }).html, /Loading users/);
  assert.match(renderAccess({ result: { data: { data: [], total: 0, limit: 10 } } }).html, /No users yet/);
  assert.match(renderAccess({ query: "linked=false", result: { data: { data: [], total: 0, limit: 10 } } }).html, /No matching users/);
  const expired = renderAccess({ query: "search=Test&role=ADMIN&linked=false&page=9", result: { data: { data: [], total: 11, limit: 10 } } }).html;
  assert.match(expired, /This page is no longer available/);
  assert.match(expired, /search=Test&amp;role=ADMIN&amp;linked=false&amp;page=2/);
  for (const [status, label] of [[401, "Please sign in again"], [403, "Access unavailable"], [500, "Could not load this list"]]) assert.match(renderAccess({ result: { isError: true, error: { response: { status } } } }).html, new RegExp(label));
});

function renderAudit({ roles = ["ADMIN"], query = "", entity = "USER_ROLE", result = {} } = {}) {
  let enabled;
  const { AuditClient } = sourceLoader({
    "next/navigation": { useParams: () => ({ entity }), useSearchParams: () => new URLSearchParams(query), useRouter: () => ({ push() {} }) },
    "@/app/modules/auth/store/auth.store": { useAuthStore: (selector) => selector({ user: { roles } }) },
    "@/lib/hooks/useAccessLists": { useAuditList: (_entity, _filters, allowed) => { enabled = allowed; return { isPending: false, isError: false, isFetching: false, ...result }; } },
  })("components/directories/AuditClient.tsx");
  return { html: renderToStaticMarkup(React.createElement(AuditClient)), enabled };
}

test("audit controller blocks invalid URL filters and unauthorized reads, preserves useful paging and distinguishes history failures", () => {
  assert.equal(renderAudit({ roles: ["PASTOR"] }).enabled, false);
  const invalid = renderAudit({ query: "from=2026-10-22&to=2026-10-21", result: { isPending: true } });
  assert.equal(invalid.enabled, false);
  assert.match(invalid.html, /Check your filters/);
  assert.doesNotMatch(invalid.html, /Loading history/);
  assert.match(renderAudit({ result: { isPending: true } }).html, /Loading history/);
  assert.match(renderAudit({ result: { data: { data: [], total: 0, limit: 10 } } }).html, /No recorded history yet/);
  assert.match(renderAudit({ query: "action=login", result: { data: { data: [], total: 0, limit: 10 } } }).html, /No matching history/);
  for (const [status, label] of [[401, "Please sign in again"], [403, "Access unavailable"], [500, "Could not load this history"]]) assert.match(renderAudit({ result: { isError: true, error: { response: { status } } } }).html, new RegExp(label));
  const paged = renderAudit({ query: "action=changed&actorId=8&from=2026-10-20&to=2026-10-21&page=2", result: { data: { data: [entry], total: 21, limit: 10 } } }).html;
  assert.match(paged, /Page 2 of 3/);
  assert.match(paged, /\/audit\/USERROLE\?action=changed&amp;actorId=8&amp;from=2026-10-20&amp;to=2026-10-21&amp;page=3/);
});

test("audit catalog provides every canonical category once, groups useful journeys and gates history access", () => {
  const { auditEntities } = load("config/audit-entities.ts");
  const catalog = (roles) => {
    const { AuditCatalog } = sourceLoader({ "@/app/modules/auth/store/auth.store": { useAuthStore: (selector) => selector({ user: { roles } }) } })("components/directories/AuditCatalog.tsx");
    return renderToStaticMarkup(React.createElement(AuditCatalog));
  };
  const html = catalog(["ADMIN"]);
  assert.match(html, /Accounts &amp; access/);
  assert.match(html, /Find a history category/);
  for (const entry of auditEntities) assert.equal(html.split('href="/dashboard/audit/' + entry.key + '"').length - 1, 1, entry.key);
  assert.doesNotMatch(html, /\/audit\/PROGRAM_TEMPLATE"/);
  const forbidden = catalog(["MEMBER"]);
  assert.match(forbidden, /Access unavailable/);
  assert.doesNotMatch(forbidden, /href="\/dashboard\/audit\/USER"/);
});
