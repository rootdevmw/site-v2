import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { sourceLoader } from "./helpers/load-source.mjs";
const helpers = sourceLoader()("lib/utils/event-editor.ts");
const values = { title: "Community gathering", location: "Church", description: "<p>Welcome</p>", typeId: "2", ministryIds: ["101"], startTime: "2026-12-31T23:30", endTime: "2027-01-01T01:00" };

test("Malawi datetime inputs round trip midnight, year boundaries and milliseconds independently of the device timezone", () => {
  const previous = process.env.TZ;
  try {
    for (const timezone of ["UTC", "America/Los_Angeles", "Asia/Tokyo", "Africa/Blantyre"]) {
      process.env.TZ = timezone;
      assert.equal(helpers.eventTimeToISO(values.startTime), "2026-12-31T21:30:00.000Z");
      assert.equal(helpers.eventTimeInput("2026-12-31T23:30:12.123Z"), "2027-01-01T01:30:12.123");
      assert.equal(helpers.eventTimeToISO(helpers.eventTimeInput("2026-12-31T23:30:12.123Z")), "2026-12-31T23:30:12.123Z");
      assert.equal(helpers.eventTimeToISO("2024-02-29T00:00"), "2024-02-28T22:00:00.000Z");
      assert.equal(helpers.eventTimeToISO("2026-01-01T12:30:00.1"), "2026-01-01T10:30:00.100Z");
    }
  } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
  for (const value of ["2025-02-29T12:00", "2026-04-31T12:00", "2026-01-01T24:00", "2026-01-01T12:60", "2026-01-01T12:00:60", "1000-01-01T00:00", "2026-01-01", "bad"]) assert.equal(helpers.eventTimeToISO(value), null);
  assert.equal(helpers.eventTimeInput("2026-01-01T12:00"), "");
});

test("event validation checks calendar, schedule order, text bounds and record IDs while allowing overnight and past events", () => {
  assert.equal(helpers.eventSchema.safeParse(values).success, true);
  assert.equal(helpers.eventSchema.safeParse({ ...values, startTime: "2024-02-29T08:00", endTime: "2024-02-29T09:00" }).success, true);
  for (const invalid of [{ title: " " }, { title: "x".repeat(192) }, { typeId: "" }, { typeId: "9223372036854775808" }, { ministryIds: ["bad"] }, { description: "é".repeat(32768) }, { endTime: values.startTime }, { endTime: "2026-12-31T22:00" }, { startTime: "2025-02-29T12:00" }]) assert.equal(helpers.eventSchema.safeParse({ ...values, ...invalid }).success, false);
  assert.deepEqual(helpers.eventEditorDefaults().ministryIds, []);
});

test("payloads convert church time only for changed boundaries, preserve untouched associations and explicitly clear ministry links", () => {
  const unchanged = helpers.eventEditorPayload(values, {});
  for (const key of ["typeId", "ministryIds", "startTime", "endTime"]) assert.equal(unchanged[key], undefined);
  const changed = helpers.eventEditorPayload({ ...values, ministryIds: [] }, { ministries: true, end: true });
  assert.deepEqual(changed.ministryIds, []); assert.equal(changed.endTime, "2026-12-31T23:00:00.000Z");
  assert.equal(changed.startTime, undefined);
  assert.match(helpers.eventEditorFailure(new Error("offline"), true), /may already have been created/);
  assert.match(helpers.eventEditorFailure({ response: { status: 409 } }, true, true), /already in use/);
});

test("type reads are bounded and cancellation-aware, project only relevant data and reject failed, incomplete or duplicate collections", async () => {
  const calls = []; const api = { get: async (...args) => { calls.push(args); return { data: { data: [{ id: "2", name: "Community", internal: "unneeded" }] } }; } };
  const actual = sourceLoader({ "@/lib/api/client": { api } })("lib/api/event-editor.ts");
  const signal = new AbortController().signal;
  assert.deepEqual(await actual.getEventEditorTypes(signal), [{ id: "2", name: "Community" }]);
  assert.deepEqual(calls, [["/events/types", { signal, timeout: 15000, silent: true }]]);
  for (const data of [{ success: false, data: [] }, { data: null }, { data: [{ id: "2", name: "" }] }, { data: [{ id: "2", name: "A" }, { id: "2", name: "B" }] }]) { api.get = async () => ({ data }); await assert.rejects(() => actual.getEventEditorTypes()); }
});

test("event and type writes use bounded transport and reject unconfirmed or mismatched saves", async () => {
  const calls = []; const api = Object.fromEntries(["post", "patch"].map((method) => [method, async (...args) => { calls.push([method, ...args]); return { data: { success: true, data: { id: "7", name: "Community" } } }; }]));
  const actual = sourceLoader({ "@/lib/api/client": { api } })("lib/api/event-editor.ts");
  await actual.saveEventEditor(values); await actual.saveEventEditor(values, "7"); await actual.createEventEditorType("Community");
  assert.deepEqual(calls, [["post", "/events", values, { timeout: 30000, silent: true }], ["patch", "/events/7", values, { timeout: 30000, silent: true }], ["post", "/events/types", { name: "Community" }, { timeout: 30000, silent: true }]]);
  api.patch = async () => ({ data: { data: { id: "8" } } }); await assert.rejects(() => actual.saveEventEditor(values, "7"));
  for (const data of [{ success: false, data: { id: "7", name: "Community" } }, {}, { data: { id: "bad", name: "Community" } }]) { api.post = async () => ({ data }); await assert.rejects(() => actual.saveEventEditor(values)); await assert.rejects(() => actual.createEventEditorType("Community")); }
});

test("event type queries isolate actors and roles, disable unauthorized reads, and use bounded retries", () => {
  const hooks = sourceLoader({ "@tanstack/react-query": { useQuery: (options) => options }, "@/lib/api/event-editor": {} })("lib/hooks/useEventEditor.ts");
  const actor = { id: "1", roles: ["DEACON"] }, query = hooks.useEventEditorTypes(actor);
  assert.equal(query.enabled, true); assert.equal(hooks.useEventEditorTypes(null).enabled, false); assert.equal(hooks.useEventEditorTypes({ ...actor, roles: ["MEDIA"] }).enabled, false);
  assert.notDeepEqual(query.queryKey, hooks.useEventEditorTypes({ ...actor, id: "2" }).queryKey);
  for (const status of [401, 403, 404]) assert.equal(query.retry(0, { response: { status } }), false);
});

test("event and type mutations reconcile relevant caches after success or uncertain failure without automatic write retries", async () => {
  const client = new QueryClient();
  const hooks = sourceLoader({ "@tanstack/react-query": { useQueryClient: () => client, useMutation: (options) => options }, "@/lib/api/event-editor": {} })("lib/hooks/useEventEditor.ts");
  for (const [mutation, keys] of [[hooks.useSaveEventEditor(), ["events", "event", "ministry", "audit-logs", "dashboard-overview"]], [hooks.useCreateEventEditorType(), ["eventTypes", "audit-timeline"]]]) {
    assert.equal(mutation.retry, false);
    for (const error of [null, new Error("response lost")]) { keys.forEach((key) => client.setQueryData([key, "editor"], {})); await mutation.onSettled(undefined, error); keys.forEach((key) => assert.equal(client.getQueryState([key, "editor"]).isInvalidated, true)); }
  }
  client.clear();
});

function renderEditor({ roles = ["DEACON"], mode = "edit", id = "7", dirty = {}, query = {}, mutate = async () => ({ data: { id: "7" } }) } = {}) {
  let submit, media; const pushes = [], resets = [];
  const { EventForm } = sourceLoader({
    "react-hook-form": { useForm: () => ({ control: {}, formState: { errors: {}, dirtyFields: dirty, isDirty: !!Object.keys(dirty).length, isSubmitting: false }, register: (name) => ({ name }), handleSubmit: (callback) => { submit = callback; return () => {}; }, setValue() {}, reset: (data) => resets.push(data) }), useWatch: () => [values.typeId, values.ministryIds, values.description] },
    "next/navigation": { useRouter: () => ({ push: (href) => pushes.push(href) }) },
    "@/app/modules/auth/store/auth.store": { useAuthStore: (selector) => selector({ user: { id: "1", roles } }) },
    "@/lib/hooks/useEventEditor": { useSaveEventEditor: () => ({ isPending: false, mutateAsync: mutate }), useEventEditorTypes: () => ({ data: [{ id: "2", name: "Community" }], ...query }), useCreateEventEditorType: () => ({ isPending: false }) },
    "@/lib/hooks/useMemberEditorOptions": { useMemberEditorOptions: () => ({ data: [{ id: "1001", name: "Later ministry" }], ...query }) },
    "@/components/ui/RichTextEditor": { RichTextEditor: ({ id, label, onBusyChange }) => { media = onBusyChange; return React.createElement("textarea", { id, "aria-label": label }); } },
  })("app/modules/events/components/EventForm.tsx");
  const html = renderToStaticMarkup(React.createElement(EventForm, { mode, initialData: { ...values, id }, initialMinistries: [{ id: "101", name: "Current ministry" }] }));
  return { html, submit: (data = values) => submit(data), pushes, resets, media };
}

test("event editor exposes labelled schedule and invitation sections, retained choices and distinct option states", () => {
  const html = renderEditor().html;
  for (const pattern of [/Event essentials/, /When we gather/, /Invitation and details/, /Malawi time/, /UTC\+02:00/, /type="datetime-local"/, /step="0.001"/, /for="event-startTime"/, /Current ministry/, /Later ministry/, /does not select all ministries/, /keeps the existing public web address/, /Add an event type/]) assert.match(html, pattern);
  assert.equal((html.match(/<form\b/g) || []).length, 1);
  assert.match(renderEditor({ roles: ["MEMBER"] }).html, /Access unavailable/);
  assert.match(renderEditor({ query: { isPending: true } }).html, /Loading event types/);
  assert.match(renderEditor({ query: { isError: true } }).html, /Current links are kept/);
  assert.match(renderEditor({ query: { data: [] } }).html, /No event types are available/);
});

test("pending event saves are submitted once and unchanged links and times remain omitted", async () => {
  let complete; const pending = new Promise((resolve) => { complete = resolve; }), writes = [];
  const editor = renderEditor({ mutate: (data) => { writes.push(data); return pending; } });
  const first = editor.submit(); await editor.submit(); assert.equal(writes.length, 1);
  assert.equal(writes[0].data.ministryIds, undefined); assert.equal(writes[0].data.startTime, undefined);
  complete({ data: { id: "7" } }); await first;
  assert.deepEqual(editor.pushes, ["/dashboard/events/7"]); assert.equal(editor.resets.length, 1);
  const changed = []; const explicit = renderEditor({ dirty: { ministryIds: true }, mutate: async (data) => { changed.push(data); return { data: { id: "7" } }; } });
  await explicit.submit({ ...values, ministryIds: [] }); assert.deepEqual(changed[0].data.ministryIds, []);
  const creates = []; const fresh = renderEditor({ mode: "create", mutate: async (data) => { creates.push(data); return { data: { id: "8" } }; } });
  await fresh.submit(); assert.equal(creates[0].id, undefined); assert.equal(creates[0].data.typeId, "2"); assert.equal(creates[0].data.startTime, "2026-12-31T21:30:00.000Z"); assert.deepEqual(creates[0].data.ministryIds, ["101"]); assert.deepEqual(fresh.pushes, ["/dashboard/events/8"]);
});

test("missing edit IDs, revoked access and active media uploads prevent writes; failed saves keep the draft", async () => {
  for (const options of [{ id: undefined }, { roles: ["MEDIA"] }]) {
    let writes = 0; const editor = renderEditor({ ...options, id: options.roles ? "7" : "", mutate: async () => { writes++; } }); if (options.roles) assert.doesNotMatch(editor.html, /<form\b/); else await editor.submit(); assert.equal(writes, 0);
  }
  let writes = 0; const uploading = renderEditor({ mutate: async () => { writes++; } }); uploading.media(true); await uploading.submit(); assert.equal(writes, 0);
  const failed = renderEditor({ mutate: async () => { throw new Error("response lost"); } }); await failed.submit(); assert.deepEqual(failed.pushes, []); assert.deepEqual(failed.resets, []);
});

test("inline type creation consumes Enter and prevents duplicate writes while its own request is pending", async () => {
  let state = 0, complete; const pending = new Promise((resolve) => { complete = resolve; }), writes = [], busy = [], created = [];
  const { EventTypeCreator } = sourceLoader({
    react: { ...React, useState: () => [state++ === 0 ? " Community " : "", () => {}], useRef: (initial) => ({ current: initial }) },
    "@/app/modules/auth/store/auth.store": { useAuthStore: (selector) => selector({ user: { roles: ["DEACON"] } }) },
    "@/lib/hooks/useEventEditor": { useCreateEventEditorType: () => ({ isPending: false, mutateAsync: (name) => { writes.push(name); return pending; } }) },
    "@/components/ui/RichTextEditor": { RichTextEditor: () => null },
  })("app/modules/events/components/EventForm.tsx");
  const tree = EventTypeCreator({ disabled: false, onBusyChange: (value) => busy.push(value), onCreated: (value) => created.push(value) });
  const find = (element, type) => { if (!element || typeof element !== "object") return null; if (element.type === type) return element; return React.Children.toArray(element.props?.children).map((child) => find(child, type)).find(Boolean); };
  let prevented = false; find(tree, "input").props.onKeyDown({ key: "Enter", preventDefault() { prevented = true; } }); find(tree, "button").props.onClick();
  assert.equal(prevented, true); assert.deepEqual(writes, ["Community"]); assert.deepEqual(busy, [true]);
  complete({ id: "9", name: "Community" }); await pending; await Promise.resolve();
  assert.deepEqual(created, [{ id: "9", name: "Community" }]); assert.deepEqual(busy, [true, false]);
});

test("event edit route keeps cached editors mounted on refresh failure and passes church-local times and scalar type IDs", () => {
  let props, enabled;
  const Page = sourceLoader({
    "next/navigation": { useParams: () => ({ id: "7" }), useRouter: () => ({ push() {} }) },
    "@/app/modules/auth/store/auth.store": { useAuthStore: (selector) => selector({ user: { roles: ["DEACON"] } }) },
    "@/app/modules/events/hooks/useEvent": { useEvent: (_id, allowed) => { enabled = allowed; return { isPending: false, isError: true, data: { data: { ...values, id: "7", startTime: "2026-12-31T21:30:12.123Z", endTime: "2026-12-31T23:00:00Z", ministries: [{ id: "101", name: "Current" }], type: null } } }; } },
    "@/lib/hooks/useScheduleLists": { useDeleteScheduleRecord: () => ({ mutateAsync: async () => {} }) },
    "@/app/modules/events/components/EventForm": { EventForm: (data) => { props = data; return React.createElement("div", {}, "Event editor remains"); } },
  })("app/(dashboard)/dashboard/events/[id]/edit/page.tsx").default;
  const html = renderToStaticMarkup(React.createElement(Page)); assert.equal(enabled, true); assert.match(html, /entries are kept/); assert.match(html, /Event editor remains/);
  assert.equal(props.initialData.typeId, "2"); assert.equal(props.initialData.startTime, "2026-12-31T23:30:12.123"); assert.deepEqual(props.initialData.ministryIds, ["101"]);
});
