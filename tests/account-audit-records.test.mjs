import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { sourceLoader } from "./helpers/load-source.mjs";

const load = sourceLoader();
const { getAccountRoles, getRoleContext, getAssignableAccountRoles } = load("lib/utils/account-records.ts");
const { getAuditEntity, getAuditRecordHref } = load("config/audit-entities.ts");
const { getAuditDifferences, formatAuditValue, getAuditActor, orderAuditEntries, sanitizeAuditEntry } = load("lib/utils/audit-records.ts");
const account = { id: "7", email: "fixture@example.test", roles: ["MEDIA", "DEACON"], member: { id: "3", firstName: "Test", lastName: "Person" }, createdAt: "2026-10-20T22:30:00Z" };
const entry = { id: "8", action: "USER_UPDATED", entity: "USER", entityId: "7", userId: "2", user: { id: "2", email: "actor@example.test", member: { firstName: "Test", lastName: "Actor" } }, before: { email: "old@example.test" }, after: { email: "new@example.test" }, createdAt: "2026-10-20T22:30:00Z" };

test("account context uses all recorded roles and derives navigation from the configured hierarchy", () => {
  assert.deepEqual(getAccountRoles(["media", " DEACON ", "MEDIA", "Custom"]), ["DEACON", "MEDIA", "CUSTOM"]);
  const context = getRoleContext(account.roles);
  assert.equal(context.highest, "DEACON");
  assert.ok(context.areas.some((area) => area.href === "/dashboard/members"));
  assert.ok(context.areas.some((area) => area.href === "/dashboard/content"));
  assert.ok(!context.areas.some((area) => area.href === "/dashboard/users"));
  assert.ok(!getRoleContext(["ADMIN"]).areas.some((area) => area.href === "/dashboard/roles"));
  assert.ok(getRoleContext(["ROOT"]).areas.some((area) => area.href === "/dashboard/roles"));
  assert.deepEqual(getRoleContext(["Custom"]).areas, []);
  assert.equal(getRoleContext([]).highest, null);
  assert.deepEqual(getAssignableAccountRoles([{ id: "1", name: "ROOT" }, { id: "2", name: "MEDIA" }, { id: "3", name: "Custom" }], ["media"]), [{ id: "1", name: "ROOT" }]);
});

test("user, role, profile, role transition, and reset requests retain their actual API contracts", async () => {
  const calls = [];
  const api = Object.fromEntries(["get", "post", "delete"].map((method) => [method, async (...args) => { calls.push({ method, args }); return { data: { data: account } }; }]));
  const apiLoad = sourceLoader({ "@/lib/api/client": { api } });
  const users = apiLoad("app/modules/users/api/users.ts");
  const roles = apiLoad("app/modules/roles/api/roles.ts");
  const signal = new AbortController().signal;
  await users.getUser("7", signal);
  await roles.getRole("1", signal);
  assert.deepEqual(calls.slice(0, 2).map((call) => call.args), [["/users/7", { signal, timeout: 15000, silent: true }], ["/roles/1", { signal, timeout: 15000, silent: true }]]);
  await users.linkUserToMember("7", "3");
  await users.unlinkUserFromMember("7");
  await roles.setUserRole({ userId: "7", roleId: "1" });
  await roles.removeUserRole({ userId: "7" });
  await apiLoad("lib/api/account-records.ts").requestAccountPasswordReset("fixture@example.test");
  assert.deepEqual(calls.slice(2).map((call) => [call.method, call.args[0]]), [["post", "/users/7/member"], ["delete", "/users/7/member"], ["post", "/auth/users/7/role/1"], ["delete", "/auth/users/7/role"], ["post", "/auth/request-password-reset"]]);
  assert.deepEqual(calls[2].args[1], { memberId: "3" });
  assert.deepEqual(calls.at(-1).args[1], { email: "fixture@example.test" });
  calls.slice(2).forEach((call) => assert.deepEqual(call.args[call.method === "delete" ? 1 : 2], { timeout: 30000, silent: true }));
  const options = apiLoad("lib/api/account-records.ts");
  await options.getAccountMemberPage({ page: 6, search: "Person" }, signal);
  assert.deepEqual(calls.at(-1).args, ["/members", { params: { page: 6, search: "Person", limit: 20 }, signal, timeout: 15000, silent: true }]);
});

test("the ROOT role catalog includes later pages and rejects incomplete or cancelled reads", async () => {
  const pages = [];
  const catalogLoad = sourceLoader({ "@/app/modules/roles/api/roles": { getRoles: async ({ page }) => {
    pages.push(page);
    return { data: Array.from({ length: page === 1 ? 100 : 1 }, (_, index) => ({ id: String((page - 1) * 100 + index + 1), name: "Role " + index })), meta: { total: 101, limit: 100 } };
  } }, "@/lib/api/client": { api: {} } });
  const roles = await catalogLoad("lib/api/account-records.ts").getAccountRoleCatalog();
  assert.deepEqual(pages, [1, 2]);
  assert.equal(roles.at(-1).id, "101");
  const badLoad = sourceLoader({ "@/app/modules/roles/api/roles": { getRoles: async () => ({ data: [{ id: "1", name: "ROOT" }], meta: { total: 2, limit: 1 } }) }, "@/lib/api/client": { api: {} } });
  await assert.rejects(() => badLoad("lib/api/account-records.ts").getAccountRoleCatalog(), /complete role catalog/);
  const abort = new AbortController();
  abort.abort();
  await assert.rejects(() => catalogLoad("lib/api/account-records.ts").getAccountRoleCatalog(abort.signal), { name: "AbortError" });
});

test("profile linking refreshes the old and new profiles, account, lists, and history on both outcomes", async () => {
  const client = new QueryClient();
  const keys = [["user", "7"], ["users"], ["members", "account-link", "Person", 2], ["member", "old"], ["member", "new"], ["audit-timeline", "USER", "7"], ["audit-logs"]];
  const hookLoad = sourceLoader({ "@tanstack/react-query": { useQueryClient: () => client, useMutation: (options) => options }, "@/lib/api/client": { api: {} } });
  const hooks = hookLoad("app/modules/users/hooks/useUserActions.ts");
  for (const [options, variables] of [[hooks.useLinkUserToMember(), { userId: "7", memberId: "new", previousMemberId: "old" }], [hooks.useUnlinkUserFromMember(), { userId: "7", memberId: "old" }]]) {
    for (const error of [null, new Error("Response lost")]) {
      keys.forEach((key) => client.setQueryData(key, { fixture: true }));
      assert.equal(options.retry, false);
      await options.onSettled(undefined, error, variables);
      const expected = variables.previousMemberId ? keys : keys.filter((key) => key[0] !== "member" || key[1] !== "new");
      expected.forEach((key) => assert.equal(client.getQueryState(key).isInvalidated, true));
    }
  }
  client.clear();
});

test("self role changes refresh session identity before refreshing cached account and history data", async () => {
  const client = new QueryClient();
  let current = { id: "7", email: account.email, roles: ["ROOT"] };
  let sessionReads = 0;
  const auth = { getState: () => ({ user: current, setUser: (value) => { current = value; } }) };
  const hookLoad = sourceLoader({ "@tanstack/react-query": { useQueryClient: () => client, useMutation: (options) => options }, "@/app/modules/auth/store/auth.store": { useAuthStore: auth }, "@/lib/api/account-records": { getSessionIdentity: async () => { sessionReads++; return { ...current, roles: ["VISITOR"] }; } }, "@/lib/api/client": { api: {} } });
  const actions = hookLoad("app/modules/roles/hooks/useRoleActions.ts");
  const keys = [["user", "7"], ["users"], ["audit-timeline"], ["audit-logs"]];
  for (const options of [actions.useSetRole(), actions.useRemoveRole()]) {
    keys.forEach((key) => client.setQueryData(key, { fixture: true }));
    assert.equal(options.retry, false);
    await options.onSettled(undefined, null, { userId: "7", roleId: "2" });
    assert.deepEqual(current.roles, ["VISITOR"]);
    keys.forEach((key) => assert.equal(client.getQueryState(key).isInvalidated, true));
  }
  const beforeReads = sessionReads;
  await actions.useSetRole().onSettled(undefined, new Error("Response lost"), { userId: "other", roleId: "2" });
  assert.equal(sessionReads, beforeReads);
  client.clear();
});

test("session recovery clears an unconfirmed self identity and cannot overwrite another signed-in account", async () => {
  let current = { id: "7", email: account.email, roles: ["ROOT"] };
  const auth = { getState: () => ({ user: current, setUser: (value) => { current = value; } }) };
  const failed = sourceLoader({ "@/app/modules/auth/store/auth.store": { useAuthStore: auth }, "@/lib/api/account-records": { getSessionIdentity: async () => { throw new Error("Session unavailable"); } } });
  await failed("lib/utils/account-cache.ts").refreshSelfAccount("7");
  assert.equal(current, null);
  current = { id: "7", email: account.email, roles: ["ROOT"] };
  let finish;
  const delayed = sourceLoader({ "@/app/modules/auth/store/auth.store": { useAuthStore: auth }, "@/lib/api/account-records": { getSessionIdentity: () => new Promise((resolve) => { finish = resolve; }) } });
  const pending = delayed("lib/utils/account-cache.ts").refreshSelfAccount("7");
  current = { id: "other", email: "other@example.test", roles: ["ADMIN"] };
  finish({ id: "7", email: account.email, roles: ["VISITOR"] });
  await pending;
  assert.equal(current.id, "other");
});

test("role definition changes refresh the signed-in identity, account labels, and history after uncertain writes", async () => {
  const client = new QueryClient();
  let current = { id: "2", email: "actor@example.test", roles: ["ROOT"] };
  let reads = 0;
  const keys = [["role", "1"], ["roles"], ["user", "7"], ["users"], ["audit-timeline"], ["audit-logs"]];
  const hookLoad = sourceLoader({ "@tanstack/react-query": { useQueryClient: () => client, useMutation: (value) => value }, "@/app/modules/auth/store/auth.store": { useAuthStore: { getState: () => ({ user: current, setUser: (value) => { current = value; } }) } }, "@/lib/api/account-records": { getSessionIdentity: async () => { reads++; return current; } }, "@/lib/api/client": { api: {} } });
  const hooks = hookLoad("app/modules/roles/hooks/useRoleActions.ts");
  for (const [options, variables] of [[hooks.useUpdateRole(), { id: "1", data: { name: "MEDIA" } }], [hooks.useDeleteRole(), "1"]]) {
    keys.forEach((key) => client.setQueryData(key, { fixture: true }));
    assert.equal(options.retry, false);
    await options.onSettled(undefined, new Error("Response lost"), variables);
    keys.forEach((key) => assert.equal(client.getQueryState(key).isInvalidated, true));
  }
  assert.equal(reads, 2);
  client.clear();
});

test("role controls describe the actual Visitor reset and never load the catalog for ADMIN-only viewers", () => {
  const enabled = [];
  const roleLoad = sourceLoader({ "@tanstack/react-query": { useQuery: (options) => { enabled.push(options.enabled); return { data: [{ id: "1", name: "ROOT" }, { id: "2", name: "VISITOR" }], isPending: false, isError: false }; } }, "@/app/modules/roles/hooks/useRoleActions": { useSetRole: () => ({ isPending: false }), useRemoveRole: () => ({ isPending: false }) }, "@/lib/api/account-records": { getAccountRoleCatalog: () => { throw new Error("No real catalog request in markup tests"); } } });
  const { UserRolesPanel } = roleLoad("components/records/UserRolesPanel.tsx");
  const adminHtml = renderToStaticMarkup(React.createElement(UserRolesPanel, { user: account, canManage: false, refreshing: false }));
  assert.equal(enabled.at(-1), false);
  assert.match(adminHtml, /managed by a ROOT administrator/);
  assert.doesNotMatch(adminHtml, /<select|Reset to Visitor/);
  const rootHtml = renderToStaticMarkup(React.createElement(UserRolesPanel, { user: account, canManage: true, refreshing: false }));
  assert.equal(enabled.at(-1), true);
  assert.match(rootHtml, /Reset to Visitor/);
  assert.match(rootHtml, /replaced with VISITOR access/);
  assert.doesNotMatch(rootHtml, /Remove Role/);
});

test("audit entity aliases resolve to the names written by the backend and use real private record routes", () => {
  for (const value of ["ProgramTemplate", "PROGRAM_TEMPLATE", "program-template", "PROGRAMTEMPLATE"]) assert.equal(getAuditEntity(value).key, "PROGRAMTEMPLATE");
  assert.equal(getAuditEntity("PrayerRequest").key, "PRAYERREQUEST");
  assert.equal(getAuditEntity("UserRole").key, "USERROLE");
  assert.equal(getAuditRecordHref("UserRole", "7"), "/dashboard/users/7");
  assert.equal(getAuditRecordHref("PrayerRequest", "7"), "/dashboard/attention/7/prayers");
  assert.equal(getAuditRecordHref("Visitor", "7"), "/dashboard/attention/7/visitors");
  assert.equal(getAuditRecordHref("ContentType", "7"), null);
});

test("audit requests retain pagination, use canonical entity names, and omit credential data before caching", async () => {
  const calls = [];
  const unsafe = { ...entry, entity: "PROGRAMTEMPLATE", user: { ...entry.user, password: "fixture-actor-credential" }, before: { password: "fixture-old-credential", title: "Before" }, after: { password: "fixture-new-credential", title: "After" } };
  const apiLoad = sourceLoader({ "@/lib/api/client": { api: { get: async (...args) => { calls.push(args); return { data: { data: [unsafe], meta: { page: 2, limit: 10, total: 12 } } }; } } } });
  const api = apiLoad("app/modules/audit/api/audit.api.ts");
  const signal = new AbortController().signal;
  const timeline = await api.getAuditTimeline({ entity: "ProgramTemplate", id: "7" }, signal);
  assert.deepEqual(calls[0], ["/audit/PROGRAMTEMPLATE/7", { signal, timeout: 15000, silent: true }]);
  assert.doesNotMatch(JSON.stringify(timeline), /fixture-.*credential/);
  assert.equal(timeline[0].protectedFields, true);
  const logs = await api.getAuditLogs({ entity: "PROGRAM_TEMPLATE", page: 2, limit: 10, action: "PROGRAM_TEMPLATE_UPDATED", search: "7" }, signal);
  assert.equal(calls[1][0], "/audit/PROGRAMTEMPLATE");
  assert.deepEqual(logs.meta, { page: 2, limit: 10, total: 12 });
  assert.equal(calls[1][1].params.action, "PROGRAM_TEMPLATE_UPDATED");
  assert.equal(calls[1][1].signal, signal);
});

test("audit comparisons preserve structured values, distinguish missing from null, and compare object keys stably", () => {
  const diff = getAuditDifferences({ enabled: false, count: 0, nullable: null, roles: [{ name: "ROOT", id: "1" }], nested: { name: "Before" } }, { enabled: true, count: 0, roles: [{ id: "1", name: "ROOT" }], nested: { name: "After" }, extra: "" });
  assert.deepEqual(diff.changed.map((field) => field.key), ["enabled", "extra", "nested.name", "nullable"]);
  assert.ok(diff.unchanged.some((field) => field.key === "roles"));
  const nullable = diff.changed.find((field) => field.key === "nullable");
  assert.equal(formatAuditValue(nullable.before, nullable.beforeIncluded), "Null");
  assert.equal(formatAuditValue(nullable.after, nullable.afterIncluded), "Not included");
  assert.equal(formatAuditValue(false, true), "No");
  assert.equal(formatAuditValue(0, true), "0");
  assert.equal(formatAuditValue("", true), "Empty text");
  assert.match(formatAuditValue([{ name: "ROOT" }], true), /"name": "ROOT"/);
  assert.equal(getAuditDifferences(null, null).changed.length, 0);
});

test("credential redaction reaches nested snapshots and arrays, including session identifiers", () => {
  const before = { passwordHash: "fixture-password", nested: { reset_token: "fixture-token", name: "Allowed" }, sessions: [{ id: "fixture-session" }], roles: [{ name: "ROOT", apiKey: "fixture-key" }] };
  const diff = getAuditDifferences(before, { nested: { name: "Changed" }, roles: [{ name: "ADMIN", apiKey: "fixture-key-two" }] }, "User");
  assert.equal(diff.protectedFields, true);
  assert.doesNotMatch(JSON.stringify(diff), /fixture-/);
  assert.match(JSON.stringify(diff), /Allowed|Changed/);
  const safe = sanitizeAuditEntry({ ...entry, entity: "Session", before: { id: "fixture-session-identifier", userId: "7" }, after: null });
  assert.doesNotMatch(JSON.stringify(safe), /fixture-session-identifier/);
  assert.equal(safe.before.userId, "7");
  assert.deepEqual(orderAuditEntries([{ ...entry, id: "old", createdAt: "2026-10-19T00:00:00Z" }, { ...entry, id: "new" }]).map((item) => item.id), ["new", "old"]);
  assert.equal(getAuditActor({ ...entry, user: null, userId: null }), "Actor not recorded");
});

test("record views render all roles, correct links, and readable escaped audit values without invented account status", () => {
  const viewLoad = sourceLoader({ "@/app/modules/auth/store/auth.store": { useAuthStore: (selector) => selector({ user: { id: "2", roles: ["ROOT"] } }) } });
  const { UserRecordView } = viewLoad("components/records/UserRecordView.tsx");
  const accountHtml = renderToStaticMarkup(React.createElement(UserRecordView, { user: account, rolesPanel: null, memberPanel: null, passwordAction: null, currentAccount: true }));
  assert.match(accountHtml, /DEACON/);
  assert.match(accountHtml, /MEDIA/);
  assert.match(accountHtml, /Your account/);
  assert.match(accountHtml, /21 October 2026/);
  assert.match(accountHtml, /href="\/dashboard\/members\/3"/);
  assert.match(accountHtml, /href="\/dashboard\/audit\/UserRole\/7"/);
  const { RoleRecordView } = viewLoad("components/records/RoleRecordView.tsx");
  const roleHtml = renderToStaticMarkup(React.createElement(RoleRecordView, { role: { id: "1", name: "MEDIA" } }));
  assert.match(roleHtml, /href="\/dashboard\/roles\/1\/edit"/);
  assert.match(roleHtml, /Individual actions also depend on server permission checks/);
  const customHtml = renderToStaticMarkup(React.createElement(RoleRecordView, { role: { id: "2", name: "Custom" } }));
  assert.match(customHtml, /Outside configured hierarchy/);
  const { AuditLog } = viewLoad("app/(dashboard)/dashboard/audit/[entity]/[id]/AuditLog.tsx");
  const auditHtml = renderToStaticMarkup(React.createElement(AuditLog, { entries: [{ ...entry, before: { name: "<script>fixture</script>", items: [{ title: "Before" }], password: "fixture-hidden" }, after: { name: "After", items: [{ title: "After" }] } }] }));
  assert.match(auditHtml, /&lt;script&gt;fixture&lt;\/script&gt;/);
  assert.match(auditHtml, /Before/);
  assert.match(auditHtml, /After/);
  assert.match(auditHtml, /21 October 2026/);
  assert.match(auditHtml, /href="\/dashboard\/users\/2"/);
  assert.doesNotMatch(auditHtml, /\[object Object\]|fixture-hidden|<script>/);
  const { AuditRecordView } = viewLoad("components/records/AuditRecordView.tsx");
  const emptyHtml = renderToStaticMarkup(React.createElement(AuditRecordView, { entity: "Role", id: "1", entries: [], canOpenRecord: false }));
  assert.match(emptyHtml, /No history has been recorded/);
  assert.doesNotMatch(emptyHtml, /Open related record/);
});

test("account and audit queries disable unauthorized reads and keep access failures distinct from network retry", () => {
  const queryLoad = sourceLoader({ "@tanstack/react-query": { useQuery: (options) => options }, "@/lib/api/client": { api: {} } });
  const options = [queryLoad("app/modules/users/hooks/useUserActions.ts").useUser("7", false), queryLoad("app/modules/roles/hooks/useRoleActions.ts").useRole("1", false), queryLoad("app/modules/audit/hooks/useAuditTimeline.ts").useAuditTimeline({ entity: "User", id: "7" }, false)];
  for (const query of options) {
    assert.equal(query.enabled, false);
    for (const status of [401, 403, 404]) assert.equal(query.retry(0, { response: { status } }), false);
    assert.equal(query.retry(0, new Error("Network failure")), true);
    assert.equal(query.retry(1, new Error("Network failure")), false);
  }
  assert.deepEqual(queryLoad("app/modules/audit/hooks/useAuditTimeline.ts").useAuditTimeline({ entity: "ProgramTemplate", id: "7" }).queryKey, ["audit-timeline", "PROGRAMTEMPLATE", "7"]);
  const mutationLoad = sourceLoader({ "@tanstack/react-query": { useMutation: (value) => value }, "@/lib/api/account-records": { requestAccountPasswordReset: () => {} } });
  assert.equal(mutationLoad("lib/hooks/useAccountPasswordReset.ts").useAccountPasswordReset().retry, false);
});

test("detail controllers match ADMIN and ROOT read permissions and show explicit recovery states", () => {
  let actor = { id: "2", roles: ["MEMBER"] };
  let result = { isPending: true };
  const enabled = [];
  const useRecord = (_id, allowed) => { enabled.push(allowed); return result; };
  const controllerLoad = sourceLoader({
    "next/navigation": { useParams: () => ({ id: "7", entity: "User" }), useRouter: () => ({ push: () => {} }) },
    "@/app/modules/auth/store/auth.store": { useAuthStore: (selector) => selector({ user: actor }) },
    "@/app/modules/users/hooks/useUserActions": { useUser: useRecord, useDeleteUser: () => ({}) },
    "@/app/modules/roles/hooks/useRoleActions": { useRole: useRecord, useDeleteRole: () => ({}) },
    "@/app/modules/audit/hooks/useAuditTimeline": { useAuditTimeline: useRecord },
    "@/lib/hooks/useAccountPasswordReset": { useAccountPasswordReset: () => ({}) },
  });
  for (const [file, role] of [["users/[id]/page.tsx", "ADMIN"], ["roles/[id]/page.tsx", "ROOT"], ["audit/[entity]/[id]/page.tsx", "ADMIN"]]) {
    const component = controllerLoad("app/(dashboard)/dashboard/" + file).default;
    actor = { id: "2", roles: [role === "ROOT" ? "ADMIN" : "MEMBER"] };
    assert.match(renderToStaticMarkup(React.createElement(component)), /Access unavailable/);
    assert.equal(enabled.at(-1), false);
    actor = { id: "2", roles: [role] };
    result = { isPending: true };
    assert.match(renderToStaticMarkup(React.createElement(component)), /role="status"/);
    assert.equal(enabled.at(-1), true);
    result = { isPending: false, isError: true, error: { response: { status: 401 } } };
    assert.match(renderToStaticMarkup(React.createElement(component)), /Please sign in again/);
    result = { isPending: false, isError: true, error: new Error("Network failure"), refetch: () => {} };
    assert.match(renderToStaticMarkup(React.createElement(component)), /Try again/);
  }
});
