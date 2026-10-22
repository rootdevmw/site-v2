import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { sourceLoader } from "./helpers/load-source.mjs";
const helpers = sourceLoader()("lib/utils/group-editor.ts");
const values = { name: "Care & fellowship", purpose: "Serve together", description: "<p>A <story></p>", location: "Area", leaderId: "101", overseerId: "102" };
const person = { id: "101", name: "A <person>", prefix: "DEACON", location: "Area" };
const page = (data = [], total = data.length) => ({ data, total, limit: 20 });

test("group schemas allow unassigned leadership and optional homecell location while validating names, purpose, IDs and distinct homecell leaders", () => {
  for (const kind of ["ministry", "homecell"]) {
    assert.equal(helpers.groupEditorSchema(kind).safeParse({ ...values, leaderId: "", overseerId: "", location: "" }).success, true);
    for (const invalid of [{ name: "   " }, { name: "x".repeat(192) }, { leaderId: "not-an-id" }, { overseerId: "9223372036854775808" }, { description: "é".repeat(32768) }]) assert.equal(helpers.groupEditorSchema(kind).safeParse({ ...values, ...invalid }).success, false);
  }
  assert.equal(helpers.groupEditorSchema("ministry").safeParse({ ...values, purpose: " " }).success, false);
  assert.equal(helpers.groupEditorSchema("homecell").safeParse({ ...values, leaderId: "101", overseerId: "101" }).success, false);
  assert.equal(helpers.groupEditorSchema("ministry").safeParse({ ...values, leaderId: "101", overseerId: "101" }).success, true);
  assert.deepEqual(helpers.groupEditorDefaults({}), { name: "", purpose: "", description: "", location: "", leaderId: "", overseerId: "" });
});

test("group payloads preserve unchanged leaders, clear only explicit choices and omit fields belonging to another group family", () => {
  const ministry = helpers.groupEditorPayload("ministry", values, {});
  assert.equal(ministry.leaderId, undefined); assert.equal(ministry.overseerId, undefined); assert.equal(ministry.location, undefined);
  const cleared = helpers.groupEditorPayload("homecell", { ...values, leaderId: "" }, { leader: true });
  assert.equal(cleared.leaderId, ""); assert.equal(cleared.overseerId, undefined); assert.equal(cleared.description, undefined); assert.equal(cleared.purpose, undefined);
  assert.match(helpers.groupEditorFailure(new Error("response lost"), true), /may already have been created/);
  for (const [status, label] of [[401, /Sign in again/], [403, /permission/], [404, /no longer available/], [409, /web address/]]) assert.match(helpers.groupEditorFailure({ response: { status } }, false), label);
});

test("leadership adapter requests later server pages with bounded cancellation-aware reads and caches only relevant profile identity", async () => {
  const calls = [];
  const api = { get: async (...args) => { calls.push(args); return { data: { data: [{ id: "101", firstName: "A", lastName: "Person", prefix: "DEACON", location: "Area", phone: "private-phone", bio: "private-bio" }], meta: { page: 6, limit: 20, total: 101 } } }; } };
  const actual = sourceLoader({ "@/lib/api/client": { api } })("lib/api/group-editor.ts");
  const signal = new AbortController().signal;
  const result = await actual.getGroupLeadershipPage({ page: 6, search: "Person" }, signal);
  assert.deepEqual(result.data, [{ id: "101", name: "A Person", prefix: "DEACON", location: "Area" }]);
  assert.doesNotMatch(JSON.stringify(result), /private-/);
  assert.deepEqual(calls, [["/members/leadership-options", { params: { page: 6, limit: 20, search: "Person" }, signal, timeout: 15000, silent: true }]]);
  for (const response of [{ data: [], meta: { total: 1, limit: 20 } }, { data: [{ id: "1" }], meta: { total: 1, limit: 20 } }, { success: false, data: [], meta: { total: 0, limit: 20 } }]) { api.get = async () => ({ data: response }); await assert.rejects(() => actual.getGroupLeadershipPage({ page: 1, search: "" })); }
  await assert.rejects(() => actual.getGroupLeadershipPage({ page: 1, search: "x".repeat(201) }));
});

test("group transport covers all create/update routes with bounded writes and rejects mismatched or unconfirmed responses", async () => {
  const calls = [];
  const api = Object.fromEntries(["post", "patch"].map((method) => [method, async (...args) => { calls.push([method, ...args]); return { data: { success: true, data: { id: "7" } } }; }]));
  const { saveGroupEditor } = sourceLoader({ "@/lib/api/client": { api } })("lib/api/group-editor.ts");
  for (const kind of ["ministry", "homecell"]) { await saveGroupEditor(kind, values); await saveGroupEditor(kind, values, "7"); }
  assert.deepEqual(calls, ["ministries", "homecells"].flatMap((kind) => [["post", "/" + kind, values, { timeout: 30000, silent: true }], ["patch", "/" + kind + "/7", values, { timeout: 30000, silent: true }]]));
  api.patch = async () => ({ data: { success: true, data: { id: "other" } } });
  await assert.rejects(() => saveGroupEditor("homecell", values, "7"));
  api.post = async () => ({ data: { success: false } });
  await assert.rejects(() => saveGroupEditor("ministry", values));
});

test("leadership queries isolate actors, roles and pages, stop unauthorized reads and do not reuse old placeholder rows", () => {
  const hooks = sourceLoader({ "@tanstack/react-query": { useQuery: (options) => options }, "@/lib/api/group-editor": {} })("lib/hooks/useGroupEditor.ts");
  const filters = { page: 1, search: "" }, actor = { id: "1", roles: ["DEACON"] };
  const query = hooks.useGroupLeadership(filters, actor);
  assert.equal(query.enabled, true);
  assert.equal(query.placeholderData, undefined);
  assert.equal(query.refetchOnMount, "always");
  assert.equal(hooks.useGroupLeadership(filters, null).enabled, false);
  assert.equal(hooks.useGroupLeadership(filters, { ...actor, roles: ["MEDIA"] }).enabled, false);
  assert.notDeepEqual(query.queryKey, hooks.useGroupLeadership({ ...filters, page: 6 }, actor).queryKey);
  assert.notDeepEqual(query.queryKey, hooks.useGroupLeadership(filters, { ...actor, id: "2" }).queryKey);
  for (const status of [401, 403, 404]) assert.equal(query.retry(0, { response: { status } }), false);
});

test("group saves refresh affected group/member/schedule/history caches on both outcomes without automatic retries", async () => {
  const client = new QueryClient();
  const hooks = sourceLoader({ "@tanstack/react-query": { useQueryClient: () => client, useMutation: (options) => options }, "@/lib/api/group-editor": {} })("lib/hooks/useGroupEditor.ts");
  const keys = [["ministry", "7"], ["ministries", "member-editor-options"], ["homecell", "7"], ["homecells", "directory"], ["member", "101"], ["members", "group-leadership-options"], ["program", "4"], ["event", "3"], ["audit-timeline"], ["dashboard-overview", "planning"]];
  for (const kind of ["ministry", "homecell"]) {
    const mutation = hooks.useSaveGroupEditor(kind);
    assert.equal(mutation.retry, false);
    for (const error of [null, new Error("response lost")]) { keys.forEach((key) => client.setQueryData(key, {})); await mutation.onSettled(undefined, error); keys.forEach((key) => assert.equal(client.getQueryState(key).isInvalidated, true)); }
  }
  client.clear();
});

function renderEditor({ kind = "ministry", roles = ["DEACON"], dirty = {}, mutate = async () => ({ data: { id: "7" } }) } = {}) {
  let submit; const pushes = [];
  const { ChurchGroupEditor } = sourceLoader({
    "react-hook-form": { useForm: () => ({ control: {}, formState: { errors: {}, dirtyFields: dirty, isDirty: !!Object.keys(dirty).length, isSubmitting: false }, register: (name) => ({ name }), handleSubmit: (callback) => { submit = callback; return () => {}; }, setValue() {}, reset() {} }), useWatch: () => ["101", "102", values.description] },
    "next/navigation": { useRouter: () => ({ push: (href) => pushes.push(href) }) },
    "@/app/modules/auth/store/auth.store": { useAuthStore: (selector) => selector({ user: { id: "1", roles } }) },
    "@/lib/hooks/useGroupEditor": { useSaveGroupEditor: () => ({ isPending: false, mutateAsync: mutate }) },
    "@/components/ui/RichTextEditor": { RichTextEditor: ({ id, label, value }) => React.createElement("textarea", { id, "aria-label": label, defaultValue: value }) },
  })("components/directories/ChurchGroupEditor.tsx");
  const html = renderToStaticMarkup(React.createElement(ChurchGroupEditor, { kind, mode: "edit", initialData: { id: "7", ...values }, initialPeople: { leader: person } }));
  return { html, submit: (data = values) => submit(data), pushes };
}

test("group editors show meaningful sections, labelled leadership controls, current profiles and family-specific fields", () => {
  const ministry = renderEditor().html;
  for (const pattern of [/About this ministry/, /Leadership/, /Ministry story/, /for="group-name"/, /for="group-purpose"/, /A &lt;person&gt;/, /Current profile #102/, /Clear leader/, /keeps the existing public web address/, /Save changes/]) assert.match(ministry, pattern);
  const homecell = renderEditor({ kind: "homecell" }).html;
  assert.match(homecell, /for="group-location"/); assert.match(homecell, /different directory profiles/); assert.doesNotMatch(homecell, /Ministry story/);
  assert.match(renderEditor({ roles: ["MEMBER"] }).html, /Access unavailable/);
});

test("one pending group submission preserves unchanged leadership and returns only to the confirmed saved record", async () => {
  let done; const pending = new Promise((resolve) => { done = resolve; }); const writes = [];
  const editor = renderEditor({ mutate: (data) => { writes.push(data); return pending; } });
  const first = editor.submit(); await editor.submit(); assert.equal(writes.length, 1); assert.equal(writes[0].data.leaderId, undefined); assert.equal(writes[0].data.overseerId, undefined);
  done({ data: { id: "7" } }); await first; assert.deepEqual(editor.pushes, ["/dashboard/ministries/7"]);
  const changed = []; const explicit = renderEditor({ kind: "homecell", dirty: { leaderId: true }, mutate: async (data) => { changed.push(data); return { data: { id: "7" } }; } }); await explicit.submit({ ...values, leaderId: "" }); assert.equal(changed[0].data.leaderId, ""); assert.equal(changed[0].data.overseerId, undefined);
});

test("leadership picker distinguishes loading/failure/empty states and exposes paging beyond the first hundred profiles", () => {
  const render = (result) => {
    const { LeadershipSearch } = sourceLoader({ "@/lib/hooks/useGroupEditor": { useGroupLeadership: () => ({ isPending: false, isError: false, isFetching: false, ...result }) } })("components/directories/GroupLeadershipPicker.tsx");
    return renderToStaticMarkup(React.createElement(LeadershipSearch, { actor: { id: "1", roles: ["DEACON"] }, label: "Leader", onClose() {}, onSelect() {} }));
  };
  assert.match(render({ isPending: true }), /Finding directory profiles/);
  assert.match(render({ isError: true, error: new Error("offline") }), /Could not load this leadership directory/);
  assert.match(render({ data: page() }), /No matching profiles/);
  const html = render({ data: page([person], 121) });
  for (const pattern of [/Page 1 of 7/, /type="radio"/, /value="101"/, /A &lt;person&gt;/, /does not change account access or add group members/, /maxLength="200"/]) assert.match(html, pattern);
});

test("edit routes guard reads and keep their editor mounted after a failed background refresh with current scalar leadership IDs", () => {
  for (const [kind, route, hookPath, hookName, formPath, formName] of [["Ministry", "ministries", "@/app/modules/ministries/hooks/useMinistry", "useMinistry", "@/app/modules/ministries/components/MinistryForm", "MinistryForm"], ["Homecell", "homecells", "@/app/modules/homecells/hooks/useHomecell", "useHomecell", "@/app/modules/homecells/components/HomecellForm", "HomecellForm"]]) {
    let props; let permitted;
    const Page = sourceLoader({ "next/navigation": { useParams: () => ({ id: "7" }), useRouter: () => ({ push() {} }) }, "@/app/modules/auth/store/auth.store": { useAuthStore: (selector) => selector({ user: { roles: ["DEACON"] } }) }, [hookPath]: { [hookName]: (_id, allowed) => { permitted = allowed; return { isPending: false, isError: true, data: { data: { id: "7", ...values, leader: null, overseer: null } } }; } }, "@/lib/hooks/useDirectoryRecords": { useDeleteDirectoryRecord: () => ({ mutateAsync: async () => {} }) }, [formPath]: { [formName]: (data) => { props = data; return React.createElement("div", {}, kind + " editor remains"); } } })(`app/(dashboard)/dashboard/${route}/[id]/edit/page.tsx`).default;
    const html = renderToStaticMarkup(React.createElement(Page));
    assert.equal(permitted, true); assert.match(html, /entries are kept/); assert.match(html, new RegExp(kind + " editor remains")); assert.equal(props.initialData.leaderId, "101"); assert.equal(props.initialData.overseerId, "102");
  }
});
