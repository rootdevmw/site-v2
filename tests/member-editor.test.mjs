import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { sourceLoader } from "./helpers/load-source.mjs";
const helpers = sourceLoader()("lib/utils/member-editor.ts");
const values = { firstName: "A", lastName: "Person", prefix: "BROTHER", status: "MEMBER", phone: "", location: "Area", isBaptized: true, baptismDate: "2026-10-21", homecellId: "2", ministryIds: ["3"], bio: "<p>A story</p>", imageUrl: "/uploads/photo.webp" };

test("Pastor is the single selectable title and historical Elder imports become Pastor", () => {
  const { memberSchema } = sourceLoader()("app/modules/members/types/member.types.ts");
  assert.equal(memberSchema.safeParse({ ...values, prefix: "PASTOR" }).success, true);
  assert.equal(memberSchema.safeParse({ ...values, prefix: "ELDER" }).success, false);
  const { parseCsv } = sourceLoader({
    "next/navigation": {}, "../hooks/useBulkCreateMembers": {},
  })("app/modules/members/components/CsvMemberImport.tsx");
  const [legacy, current] = parseCsv("firstName,lastName,phone,status,prefix,location\nA,Person,123,MEMBER,ELDER,Area\nB,Person,123,MEMBER,PASTOR,Area");
  assert.equal(legacy.prefix, "PASTOR");
  assert.equal(current.prefix, "PASTOR");
  assert.deepEqual(legacy.issues, []);
  assert.deepEqual(current.issues, []);
});

test("editor defaults merge empty initial data, retain biography/assignments and normalize baptism dates to the Malawi day", () => {
  const defaults = helpers.memberEditorDefaults({});
  assert.deepEqual(defaults.ministryIds, []);
  assert.equal(defaults.isBaptized, false);
  const initial = helpers.memberEditorDefaults({ ...values, baptismDate: "2026-10-20T22:00:00Z" });
  assert.equal(initial.baptismDate, "2026-10-21");
  assert.equal(initial.bio, values.bio);
  assert.deepEqual(initial.ministryIds, ["3"]);
  assert.equal(helpers.memberEditorDefaults({ ...values, isBaptized: false }).baptismDate, "");
});

test("member validation trims names, permits missing phone, and rejects blank names and impossible calendar dates", () => {
  const { memberSchema } = sourceLoader()("app/modules/members/types/member.types.ts");
  assert.equal(memberSchema.parse({ ...values, firstName: " A ", phone: undefined }).firstName, "A");
  for (const invalid of [{ firstName: "   " }, { lastName: "" }, { baptismDate: "2026-02-30" }, { prefix: "UNKNOWN" }, { status: "UNKNOWN" }, { imageUrl: "x".repeat(192) }, { bio: "é".repeat(32768) }]) assert.equal(memberSchema.safeParse({ ...values, ...invalid }).success, false);
  assert.equal(memberSchema.safeParse({ ...values, baptismDate: "" }).success, true);
});

test("save payloads distinguish unchanged connections from explicit clearing and never send a hidden stale baptism date", () => {
  const kept = helpers.memberEditorPayload(values, {});
  assert.equal(kept.homecellId, undefined);
  assert.equal(kept.ministryIds, undefined);
  const cleared = helpers.memberEditorPayload({ ...values, homecellId: "", ministryIds: [], isBaptized: false }, { homecell: true, ministries: true });
  assert.equal(cleared.homecellId, "");
  assert.deepEqual(cleared.ministryIds, []);
  assert.equal(cleared.baptismDate, "");
  assert.deepEqual(helpers.memberEditorPayload({ ...values, ministryIds: ["3", "3"] }, { ministries: true }).ministryIds, ["3"]);
  assert.equal(values.baptismDate, "2026-10-21");
});

test("connection options collect every ministry page, project names, reject incomplete/repeated pages and forward cancellation", async () => {
  const calls = [];
  const api = { get: async (url, options) => { calls.push([url, options]); return { data: { data: url === "/homecells" ? [{ id: "9", name: "Homecell", secret: "private" }] : options.params.page === 1 ? [{ id: "1", name: "Worship", secret: "private" }] : [{ id: "2", name: "Care" }], meta: { page: options.params?.page, limit: 1, total: 2 } } }; } };
  const actual = sourceLoader({ "./client": { api } })("lib/api/member-editor.ts");
  const signal = new AbortController().signal;
  assert.deepEqual(await actual.getMemberEditorOptions("ministries", signal), [{ id: "2", name: "Care" }, { id: "1", name: "Worship" }]);
  assert.deepEqual(await actual.getMemberEditorOptions("homecells", signal), [{ id: "9", name: "Homecell" }]);
  assert.deepEqual(calls, [["/ministries", { params: { page: 1, limit: 100 }, signal, timeout: 15000, silent: true }], ["/ministries", { params: { page: 2, limit: 100 }, signal, timeout: 15000, silent: true }], ["/homecells", { signal, timeout: 15000, silent: true }]]);
  api.get = async () => ({ data: { data: [{ id: "1", name: "Repeated" }], meta: { total: 2, limit: 1 } } });
  await assert.rejects(() => actual.getMemberEditorOptions("ministries"), /repeated/);
  api.get = async () => ({ data: { data: [], meta: { total: 2, limit: 100 } } });
  await assert.rejects(() => actual.getMemberEditorOptions("ministries"));
  const controller = new AbortController(); controller.abort();
  await assert.rejects(() => actual.getMemberEditorOptions("homecells", controller.signal));
});

test("photo validation rejects unsupported/large files and upload uses bounded multipart transport with a confirmed URL", async () => {
  assert.ok(helpers.memberPhotoError({ type: "image/svg+xml", size: 20 }));
  assert.ok(helpers.memberPhotoError({ type: "image/jpeg", size: 6 * 1024 * 1024 }));
  assert.equal(helpers.memberPhotoError({ type: "image/webp", size: 1024 }), "");
  let sent;
  const api = { post: async (...args) => { sent = args; return { data: { data: { url: "/uploads/photo.webp" } } }; } };
  const actual = sourceLoader({ "./client": { api } })("lib/api/member-editor.ts");
  const file = new File(["fixture"], "photo.webp", { type: "image/webp" });
  assert.equal(await actual.uploadMemberPhoto(file), "/uploads/photo.webp");
  assert.equal(sent[0], "/content/upload");
  assert.equal(sent[1].get("file").name, "photo.webp");
  assert.deepEqual(sent[2], { timeout: 60000, silent: true });
  for (const url of [undefined, "javascript:alert(1)", "//untrusted.test/photo", "https://example.test/" + "x".repeat(192)]) {
    api.post = async () => ({ data: { data: { url } } });
    await assert.rejects(() => actual.uploadMemberPhoto(file));
  }
});

test("member writes retain API contracts, bound transport and reject unsuccessful or mismatched saves", async () => {
  const calls = [];
  const api = { post: async (...args) => { calls.push(["post", ...args]); return { data: { success: true, data: { id: "7" } } }; }, patch: async (...args) => { calls.push(["patch", ...args]); return { data: { success: true, data: { id: "7" } } }; } };
  const load = sourceLoader({ "@/lib/api/client": { api }, "./client": { api } });
  const { createMember } = load("app/modules/members/api/createMember.ts");
  const { updateMember } = load("app/modules/members/api/updateMember.ts");
  await createMember(values); await updateMember("7", values);
  assert.deepEqual(calls, [["post", "/members", values, { timeout: 30000, silent: true }], ["patch", "/members/7", values, { timeout: 30000, silent: true }]]);
  api.patch = async () => ({ data: { success: true, data: { id: "8" } } });
  await assert.rejects(() => updateMember("7", values));
  api.post = async () => ({ data: { success: false } });
  await assert.rejects(() => createMember(values));
  assert.match(helpers.memberSaveError(new Error("response lost"), true), /may already have been created/);
});

test("member writes refresh linked directories, profiles, prayer-team names and history after confirmed or uncertain saves", async () => {
  const client = new QueryClient();
  const load = sourceLoader({ "@tanstack/react-query": { useQueryClient: () => client, useMutation: (options) => options }, "../api/createMember": {}, "../api/updateMember": {} });
  const mutations = [load("app/modules/members/hooks/useCreateMember.ts").useCreateMember(), load("app/modules/members/hooks/useUpdateMember.ts").useUpdateMember()];
  const keys = [["member", "7"], ["members", "directory"], ["homecell-members", "2"], ["ministry-members", "3"], ["prayer-team", "roster"], ["user", "4"], ["program", "5"], ["audit-timeline"]];
  for (const mutation of mutations) for (const error of [null, new Error("audit failed")]) {
    assert.equal(mutation.retry, false);
    keys.forEach((key) => client.setQueryData(key, {}));
    await mutation.onSettled(undefined, error);
    keys.forEach((key) => assert.equal(client.getQueryState(key).isInvalidated, true));
  }
  client.clear();
});

function setupForm({ roles = ["DEACON"], dirty = {}, optionsError = false, mutate = async () => ({ data: { id: "7" } }) } = {}) {
  let onSubmit;
  let config;
  const pushes = [];
  const { MemberForm } = sourceLoader({
    "react-hook-form": { useForm: (configuration) => { config = configuration; return { register: (name) => ({ name }), control: {}, formState: { errors: {}, isDirty: !!Object.keys(dirty).length, dirtyFields: dirty, isSubmitting: false }, handleSubmit: (callback) => { onSubmit = callback; return () => {}; }, setValue() {}, getValues: (key) => values[key], reset() {} }; }, useWatch: () => [true, values.imageUrl, "A", "Person", ["3"], "2", values.bio] },
    "next/navigation": { useRouter: () => ({ push: (href) => pushes.push(href) }) },
    "@/app/modules/auth/store/auth.store": { useAuthStore: (selector) => selector({ user: { id: "1", roles } }) },
    "../hooks/useCreateMember": { useCreateMember: () => ({ isPending: false, mutateAsync: mutate }) },
    "../hooks/useUpdateMember": { useUpdateMember: () => ({ isPending: false, mutateAsync: mutate }) },
    "@/lib/hooks/useMemberEditorOptions": { useMemberEditorOptions: () => ({ isPending: false, isError: optionsError, data: optionsError ? undefined : [{ id: "2", name: "Homecell" }, { id: "3", name: "Care" }] }) },
    "@/components/ui/RichTextEditor": { RichTextEditor: (props) => React.createElement("textarea", { id: props.id, defaultValue: props.value, "aria-label": props.label }) },
    "@/components/records/RecordAvatar": { RecordAvatar: () => React.createElement("span", {}, "Portrait") },
  })("app/modules/members/components/MemberForm.tsx");
  const html = renderToStaticMarkup(React.createElement(MemberForm, { mode: "edit", initialData: { ...values, id: "7" } }));
  return { html, submit: (data = values) => onSubmit(data), config, pushes };
}

test("member editor exposes grouped labelled controls, full-width biography, native dates and safe lookup-failure fallbacks", () => {
  const { html, config } = setupForm();
  for (const pattern of [/Personal details/, /Church life/, /Church connections/, /Photograph/, /Biography/, /for="member-firstName"/, /for="member-status"/, /type="date"/, /type="radio"/, /type="checkbox"/, /Choose photograph/, /Save changes/, /may appear on public leadership pages/]) assert.match(html, pattern);
  assert.equal(config.defaultValues.bio, values.bio);
  const failed = setupForm({ optionsError: true }).html;
  assert.match(failed, /Current assignments are kept/);
  assert.match(failed, /Current ministry #3/);
  assert.match(failed, /Current homecell #2/);
  assert.match(setupForm({ roles: ["MEDIA"] }).html, /Access unavailable/);
});

test("save waits for one pending submission, preserves unchanged assignments and returns to the confirmed profile", async () => {
  const calls = [];
  let resolve;
  const response = new Promise((done) => { resolve = done; });
  const form = setupForm({ mutate: (data) => { calls.push(data); return response; } });
  const first = form.submit();
  await form.submit();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].data.homecellId, undefined);
  assert.equal(calls[0].data.ministryIds, undefined);
  resolve({ data: { id: "7" } }); await first;
  assert.deepEqual(form.pushes, ["/dashboard/members/7"]);
  const blocked = setupForm({ dirty: { ministryIds: true }, optionsError: true, mutate: () => assert.fail("Do not replace assignments after a failed options read") });
  await blocked.submit();
});

test("member options queries are account/role scoped and cannot load for unauthorized accounts", () => {
  const hooks = sourceLoader({ "@tanstack/react-query": { useQuery: (options) => options }, "@/lib/api/member-editor": {} })("lib/hooks/useMemberEditorOptions.ts");
  const allowed = hooks.useMemberEditorOptions("ministries", { id: "1", roles: ["DEACON"] });
  assert.equal(allowed.enabled, true);
  assert.equal(hooks.useMemberEditorOptions("homecells", { id: "1", roles: ["MEMBER"] }).enabled, false);
  assert.equal(hooks.useMemberEditorOptions("homecells", null).enabled, false);
  assert.notDeepEqual(allowed.queryKey, hooks.useMemberEditorOptions("ministries", { id: "2", roles: ["DEACON"] }).queryKey);
});
