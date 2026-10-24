import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { sourceLoader } from "./helpers/load-source.mjs";

const load = sourceLoader();
const { getProgramDateValue, isProgramDate, getProgramDayState, getOrderedProgramItems, getProgramTime, getProgramPerson, getProgramSummary, getProgramEditorValues, getTemplateEditorValues, getTemplateCreationInput } = load("lib/utils/program-records.ts");
const person = { id: "3", firstName: "Test", lastName: "Leader", prefix: "Bro." };
const activities = [
  { id: "2", sequence: 2, title: "Message", description: "A message\nfor the congregation", time: "09:30:00", responsibleId: "3", responsible: person },
  { id: "1", sequence: 1, title: "<Welcome>", description: null, time: null, responsibleId: null, responsible: null },
];
const program = { id: "7", date: "2026-10-20T22:30:00Z", location: "Church hall", slug: "sunday-program", type: { id: "1", name: "Sunday service" }, homecellId: "9", homecell: { id: "9", name: "Test homecell" }, createdAt: "2026-10-19T22:30:00Z", items: activities };
const template = { id: "8", name: "Sunday template", type: program.type, homecellId: "9", homecell: program.homecell, createdAt: program.createdAt, items: activities };

test("program state follows the Malawi calendar day without inventing progress or completion", () => {
  const now = new Date("2026-10-20T22:30:00Z");
  assert.equal(getProgramDateValue(program.date), "2026-10-21");
  assert.equal(getProgramDateValue("2026-10-21"), "2026-10-21");
  assert.equal(getProgramDayState(program.date, now).label, "Today");
  assert.equal(getProgramDayState("2026-10-20", now).label, "Past program");
  assert.equal(getProgramDayState("2026-10-22", now).label, "Upcoming");
  assert.equal(getProgramDayState("invalid", now).label, "Date to confirm");
  assert.equal(getProgramDateValue("2026-02-30"), "");
  assert.equal(getProgramDateValue(null), "");
  assert.equal(isProgramDate("2024-02-29"), true);
  assert.equal(isProgramDate("2026-02-29"), false);
});

test("activity order is stable without mutating the record, and planning counts reflect actual assignments", () => {
  const originalIds = activities.map((item) => item.id);
  const ordered = getOrderedProgramItems([...activities, { id: "3", sequence: 2, title: "Closing", time: "After the message", responsibleId: "4" }, { id: "4", sequence: NaN, title: "Extra" }]);
  assert.deepEqual(ordered.map((item) => item.id), ["1", "2", "3", "4"]);
  assert.deepEqual(activities.map((item) => item.id), originalIds);
  assert.deepEqual(getProgramSummary(activities), { total: 2, timed: 1, unassigned: 1 });
  assert.equal(getProgramPerson(activities[0]).name, "Bro. Test Leader");
  assert.deepEqual(getProgramPerson({ responsibleId: "4" }), { id: "4", name: "Assigned member", assigned: true });
  assert.equal(getProgramPerson({ responsible: null }).name, "Not assigned");
  assert.deepEqual(getOrderedProgramItems(null), []);
  assert.deepEqual(getProgramSummary(undefined), { total: 0, timed: 0, unassigned: 0 });
});

test("activity clock times stay local and legacy instructions are preserved as text", () => {
  assert.deepEqual(getProgramTime("09:30:00"), { label: "09:30", dateTime: "09:30:00" });
  assert.deepEqual(getProgramTime("23:59"), { label: "23:59", dateTime: "23:59" });
  assert.deepEqual(getProgramTime("After the message"), { label: "After the message", dateTime: null });
  assert.equal(getProgramTime("25:90").dateTime, null);
  assert.equal(getProgramTime(null).label, "Time to confirm");
});

test("program editor values retain the type, location, descriptions, assignments, and local calendar date", () => {
  const values = getProgramEditorValues(program);
  assert.equal(values.date, "2026-10-21");
  assert.deepEqual(values.type, program.type);
  assert.equal(values.location, "Church hall");
  assert.equal(values.homecellId, "9");
  assert.equal(values.items[1].description, activities[0].description);
  assert.deepEqual(values.items[1].responsible, person);
  const optional = getProgramEditorValues({ ...program, location: null, homecellId: null, homecell: null, items: [{ sequence: 1, title: "Prayer", description: null, time: null, responsibleId: "4" }] });
  assert.equal(optional.location, "");
  assert.equal(optional.homecellId, undefined);
  assert.equal(optional.items[0].description, "");
  assert.equal(optional.items[0].time, "");
  assert.equal(optional.items[0].responsible.id, "4");
  assert.equal(program.date, "2026-10-20T22:30:00Z");
});

test("template editor values translate relation fields into the form DTO and preserve assignment identities", () => {
  const values = getTemplateEditorValues(template);
  assert.equal(values.typeId, "1");
  assert.equal(values.homecellId, "9");
  assert.equal(values.items[1].responsibleId, "3");
  assert.equal(values.items[1].description, activities[0].description);
  assert.equal(values.items[0].description, "");
  const schema = load("app/modules/programTemplates/validation/programTemplate.schema.ts").programTemplateSchema;
  assert.equal(schema.parse(values).items[1].responsibleId, "3");
  assert.equal(getTemplateEditorValues({ ...template, homecellId: null, homecell: null, items: [] }).homecellId, "");
});

test("program and template reads use individual endpoints, cancellation, and bounded requests", async () => {
  const calls = [];
  const api = { get: async (url, options) => { calls.push({ url, options }); return { data: { data: url.startsWith("/programs/") ? program : template } }; } };
  const apiLoad = sourceLoader({ "@/lib/api/client": { api } });
  const signal = new AbortController().signal;
  assert.deepEqual((await apiLoad("app/modules/programs/api/getProgram.ts").getProgram("7", signal)).data, program);
  assert.deepEqual((await apiLoad("app/modules/programTemplates/api/getProgramTemplate.ts").getProgramTemplate("8", signal)).data, template);
  assert.deepEqual(calls.map((call) => call.url), ["/programs/7", "/program-templates/8"]);
  calls.forEach((call) => assert.deepEqual(call.options, { signal, timeout: 15000, silent: true }));
});

test("template creation sends the supported contract and unwraps the actual new program identity", async () => {
  const calls = [];
  const api = { post: async (...args) => { calls.push(args); return { data: { success: true, data: program, meta: {} } }; } };
  const apiLoad = sourceLoader({ "@/lib/api/client": { api } });
  const create = apiLoad("app/modules/programs/api/createProgramFromTemplate.ts").createProgramFromTemplate;
  const result = await create({ templateId: "8", date: "2026-10-21", items: [{ sequence: 1, responsibleId: "ignored" }] });
  assert.equal(result.data.id, "7");
  assert.deepEqual(calls[0], ["/programs/from-template", { templateId: "8", date: "2026-10-21" }, { timeout: 30000, silent: true }]);
  assert.deepEqual(getTemplateCreationInput("8", "2026-10-21"), { templateId: "8", date: "2026-10-21" });
  for (const date of ["", "2026-02-30", "2026-10-21T00:00:00Z"]) await assert.rejects(() => create({ templateId: "8", date }), /valid program date/);
  await assert.rejects(() => create({ templateId: "", date: "2026-10-21" }), /valid program date/);
  assert.equal(calls.length, 1);
  const invalidLoad = sourceLoader({ "@/lib/api/client": { api: { post: async () => ({ data: { success: true, data: {} } }) } } });
  await assert.rejects(() => invalidLoad("app/modules/programs/api/createProgramFromTemplate.ts").createProgramFromTemplate({ templateId: "8", date: "2026-10-21" }), /could not be confirmed/);
});

test("template creation refreshes all program lists after either outcome and never automatically retries a create", async () => {
  const client = new QueryClient();
  const keys = [["programs"], ["programs", { page: 2 }], ["programs", "homecell", "9", 1]];
  const hookLoad = sourceLoader({ "@tanstack/react-query": { useQueryClient: () => client, useMutation: (options) => options }, "@/lib/api/client": { api: {} } });
  const options = hookLoad("app/modules/programs/hooks/useCreateProgramFromTemplate.ts").useCreateProgramFromTemplate();
  assert.equal(options.retry, false);
  client.setQueryData(["program-template", "8"], { data: template });
  for (const error of [null, new Error("Response lost")]) {
    keys.forEach((key) => client.setQueryData(key, { data: [] }));
    await options.onMutate({ templateId: "8", date: "2026-10-21" });
    if (!error) options.onSuccess({ data: program });
    await options.onSettled(undefined, error);
    keys.forEach((key) => assert.equal(client.getQueryState(key).isInvalidated, true));
  }
  assert.deepEqual(client.getQueryData(["program", "7"]).data, program);
  assert.equal(client.getQueryState(["program-template", "8"]).isInvalidated, false);
  client.clear();
});

test("restricted detail queries stay disabled and do not retry missing, forbidden, or expired sessions", async () => {
  const calls = [];
  const queryLoad = sourceLoader({ "@tanstack/react-query": { useQuery: (options) => options }, "@/lib/api/client": { api: { get: async (...args) => { calls.push(args); return { data: { data: program } }; } } } });
  for (const [folder, name] of [["programs", "Program"], ["programTemplates", "ProgramTemplate"]]) {
    const hook = queryLoad(`app/modules/${folder}/hooks/use${name}.ts`)[`use${name}`];
    assert.equal(hook("7", false).enabled, false);
    assert.equal(hook("").enabled, false);
    const options = hook("7");
    for (const status of [401, 403, 404]) assert.equal(options.retry(0, { response: { status } }), false);
    assert.equal(options.retry(0, new Error("Network failure")), true);
    assert.equal(options.retry(1, new Error("Network failure")), false);
    const signal = new AbortController().signal;
    await options.queryFn({ signal });
    assert.equal(calls.at(-1)[1].signal, signal);
  }
});

test("program and template views render semantic activity sequences, linked context, and honest missing fields", () => {
  const { ProgramRecordView } = load("components/records/ProgramRecordView.tsx");
  const html = renderToStaticMarkup(React.createElement(ProgramRecordView, { program, now: new Date("2026-10-21T07:00:00Z") }));
  assert.match(html, /id="record-title"[^>]*>Sunday service/);
  assert.match(html, /21 October 2026/);
  assert.match(html, /Today/);
  assert.match(html, /<ol[^>]*aria-label="Activities in planned sequence"/);
  assert.ok(html.indexOf("&lt;Welcome&gt;") < html.indexOf(">Message</h3>"));
  assert.match(html, /A message\nfor the congregation/);
  assert.match(html, /Time to confirm/);
  assert.match(html, /Not assigned/);
  assert.match(html, /datetime="09:30:00"[^>]*>09:30/i);
  for (const path of ["/dashboard/members/3", "/dashboard/homecells/9", "/dashboard/programs/7/edit", "/programs/sunday-program"]) assert.ok(html.includes(`href="${path}"`));
  assert.doesNotMatch(html, /<table|2026-10-20T22:30:00Z|undefined/);
  const emptyHtml = renderToStaticMarkup(React.createElement(ProgramRecordView, { program: { ...program, date: "invalid", createdAt: null, location: null, homecellId: null, homecell: null, items: [] } }));
  assert.match(emptyHtml, /Date to be confirmed/);
  assert.match(emptyHtml, /Location to be confirmed/);
  assert.match(emptyHtml, /Creation date not recorded/);
  assert.match(emptyHtml, /Church-wide/);
  assert.match(emptyHtml, /No activities have been added/);

  const { ProgramTemplateRecordView } = load("components/records/ProgramTemplateRecordView.tsx");
  const templateHtml = renderToStaticMarkup(React.createElement(ProgramTemplateRecordView, { template, useTemplateAction: React.createElement("button", null, "Use this template") }));
  assert.match(templateHtml, /Reusable template/);
  assert.match(templateHtml, /Chosen when creating a program/);
  assert.match(templateHtml, /does not update programs already created/);
  assert.match(templateHtml, /href="\/dashboard\/program-templates\/8\/edit"/);
  assert.match(templateHtml, /href="\/dashboard\/members\/3"/);
  assert.match(templateHtml, /href="\/dashboard\/homecells\/9"/);
});

test("detail controllers distinguish access, loading, missing, session, and network states", () => {
  let user = { roles: ["MEDIA"] };
  let query = { isPending: true };
  const enabledCalls = [];
  const hook = (_id, enabled) => { enabledCalls.push(enabled); return query; };
  const controllerLoad = sourceLoader({
    "@/app/modules/auth/store/auth.store": { useAuthStore: (selector) => selector({ user }) },
    "@/app/modules/programs/hooks/useProgram": { useProgram: hook },
    "@/app/modules/programTemplates/hooks/useProgramTemplate": { useProgramTemplate: hook },
  });
  const controllers = [controllerLoad("app/(dashboard)/dashboard/programs/[id]/ProgramDetailsClient.tsx").ProgramDetailsClient, controllerLoad("app/(dashboard)/dashboard/program-templates/[id]/ProgramDetailsTemplateClient.tsx").ProgramTemplateDetailsClient];
  for (const component of controllers) {
    user = { roles: ["MEDIA"] };
    assert.match(renderToStaticMarkup(React.createElement(component, { id: "7" })), /Access unavailable/);
    assert.equal(enabledCalls.at(-1), false);
    user = { roles: ["DEACON"] };
    query = { isPending: true };
    assert.match(renderToStaticMarkup(React.createElement(component, { id: "7" })), /role="status"/);
    assert.equal(enabledCalls.at(-1), true);
    query = { isPending: false, isError: false, data: null };
    assert.match(renderToStaticMarkup(React.createElement(component, { id: "7" })), /not found/);
    query = { isPending: false, isError: true, error: { response: { status: 401 } } };
    assert.match(renderToStaticMarkup(React.createElement(component, { id: "7" })), /Please sign in again/);
    query = { isPending: false, isError: true, error: new Error("Network failure"), refetch: () => {} };
    assert.match(renderToStaticMarkup(React.createElement(component, { id: "7" })), /Try again/);
  }
});
