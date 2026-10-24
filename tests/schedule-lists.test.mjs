import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { sourceLoader } from "./helpers/load-source.mjs";

const load = sourceLoader();
const helpers = load("lib/utils/schedule-lists.ts");
const { readScheduleFilters, scheduleParams, scheduleHref, scheduleFilterError, eventListEntry, programListEntry, templateListEntry } = helpers;
const filters = (kind, query = "") => readScheduleFilters(kind, new URLSearchParams(query));
const now = new Date("2026-10-20T22:30:00Z");
const event = { id: "12", title: "Prayer <Together>", type: { id: "2", name: "Gathering" }, startTime: "2026-10-20T22:00:00Z", endTime: "2026-10-21T00:00:00Z", location: "Main hall", ministries: [{ ministry: { id: "5", name: "Care & welcome" } }] };
const items = [{ title: "Third activity", sequence: 3 }, { title: "Opening <prayer>", sequence: 1, time: "09:00", responsibleId: "6" }, { title: "Reading", sequence: 2, responsible: { id: "7", firstName: "Test", lastName: "Person" } }, { title: "Closing", sequence: 4 }];
const program = { id: "13", date: "2026-10-20T22:10:00Z", type: { id: "3", name: "Sunday service" }, homecellId: "9", homecell: { id: "9", name: "Blantyre community" }, items };
const template = { ...program, id: "14", name: "Sunday & prayer" };

test("schedule URLs retain only relevant filters and preserve all choices through paging", () => {
  const query = "search=Prayer+%26+Care&typeId=2&homecellId=9&startDate=2026-10-21&endDate=2026-10-31&date=2026-10-25&fromDate=2026-10-20&page=4";
  const events = filters("events", query);
  assert.equal(scheduleHref("events", events), "/dashboard/events?search=Prayer+%26+Care&typeId=2&startDate=2026-10-21&endDate=2026-10-31&page=4");
  const programs = filters("programs", "typeId=3&homecellId=9&fromDate=2026-10-21&search=ignored&page=2");
  assert.equal(scheduleHref("programs", programs), "/dashboard/programs?typeId=3&homecellId=9&fromDate=2026-10-21&page=2");
  const templates = filters("program-templates", query);
  assert.equal(scheduleHref("program-templates", templates), "/dashboard/program-templates?search=Prayer+%26+Care&typeId=2&homecellId=9&page=4");
  assert.deepEqual(filters("program-templates", scheduleParams("program-templates", templates).toString()), templates);
  for (const page of ["-1", "0", "1.5", "Infinity", "9007199254740992"]) assert.equal(filters("events", "page=" + page).page, 1);
  assert.equal(filters("programs", "typeId=javascript:alert(1)&homecellId=9%2Fedit").typeId, "");
  assert.equal(filters("programs", "typeId=0&homecellId=-2").homecellId, "");
});

test("invalid calendar filters and conflicting program dates are rejected before transport", async () => {
  let reads = 0;
  const actual = sourceLoader({ "@/lib/api/client": { api: { get: async () => { reads++; } } } })("lib/api/schedule-lists.ts");
  for (const [kind, query] of [["events", "startDate=2026-02-30"], ["events", "startDate=2026-10-25&endDate=2026-10-21"], ["programs", "date=bad"], ["programs", "date=2026-10-21&fromDate=2026-10-21"]]) {
    const selected = filters(kind, query);
    assert.ok(scheduleFilterError(selected));
    await assert.rejects(() => actual.getScheduleList(kind, selected));
  }
  assert.equal(scheduleFilterError(filters("events", "startDate=2024-02-29&endDate=2024-02-29")), "");
  assert.equal(reads, 0);
});

test("list projections retain actual relations and ordered activity summaries without caching full descriptions", () => {
  const events = eventListEntry({ ...event, description: "Long private description" });
  assert.deepEqual(events.ministries, [{ id: "5", name: "Care & welcome" }]);
  assert.ok(!("description" in events));
  const programs = programListEntry(program);
  assert.equal(programs.date, "2026-10-21");
  assert.deepEqual(programs.summary, { total: 4, timed: 1, unassigned: 2 });
  assert.deepEqual(programs.preview, ["Opening <prayer>", "Reading", "Third activity"]);
  assert.equal(items[0].title, "Third activity");
  assert.equal(templateListEntry({ ...template, items: undefined }).summary, undefined);
  assert.equal(templateListEntry({ ...template, items: [] }).summary.total, 0);
  assert.equal(templateListEntry({ ...template, items: [{ ...items[0], deletedAt: "2026-10-01" }] }).summary.total, 0);
  assert.equal(programListEntry({ ...program, homecell: undefined }).homecell.name, "Assigned homecell #9");
});

test("schedule transports send supported filters, cancellation and timeouts and reject inconsistent responses", async () => {
  const calls = [];
  let bad = false;
  const api = { get: async (url, options) => { calls.push([url, options]); return { data: { success: true, data: bad ? [] : [url === "/events" ? event : url === "/programs" ? program : template], meta: { total: 31, limit: 10 } } }; } };
  const actual = sourceLoader({ "@/lib/api/client": { api } })("lib/api/schedule-lists.ts");
  const signal = new AbortController().signal;
  await actual.getScheduleList("events", filters("events", "search=Prayer&typeId=2&endDate=2026-10-21&page=2"), signal);
  assert.deepEqual(calls[0], ["/events", { params: { search: "Prayer", typeId: "2", endDate: "2026-10-21", page: 2, limit: 10 }, signal, timeout: 15000, silent: true }]);
  const result = await actual.getScheduleList("programs", filters("programs", "typeId=3&homecellId=9&date=2026-10-21"), signal);
  assert.deepEqual(calls[1][1].params, { typeId: "3", homecellId: "9", date: "2026-10-21", page: 1, limit: 10 });
  assert.equal(result.data[0].summary.total, 4);
  await actual.getScheduleList("program-templates", filters("program-templates", "search=Sunday&typeId=3&homecellId=9&page=3"), signal);
  assert.deepEqual(calls[2][1].params, { search: "Sunday", typeId: "3", homecellId: "9", page: 3, limit: 10 });
  bad = true;
  await assert.rejects(() => actual.getScheduleList("events", filters("events")), /inconsistent page/);
});

test("option reads project only names and identities and deletion uses the existing encoded endpoint", async () => {
  const calls = [];
  const actual = sourceLoader({ "@/lib/api/client": { api: {
    get: async (...args) => { calls.push(args); return { data: { data: [{ id: "2", name: "Gathering", extra: "not cached" }] } }; },
    delete: async (...args) => { calls.push(args); return { data: { success: true } }; },
  } } })("lib/api/schedule-lists.ts");
  const signal = new AbortController().signal;
  assert.deepEqual(await actual.getScheduleTypes("events", signal), [{ id: "2", name: "Gathering" }]);
  assert.deepEqual(calls[0], ["/events/types", { signal, timeout: 15000, silent: true }]);
  await actual.getScheduleTypes("programs", signal);
  assert.equal(calls[1][0], "/programs/types");
  await actual.deleteScheduleRecord("program-templates", "14/15");
  assert.deepEqual(calls[2], ["/program-templates/14%2F15", { timeout: 30000, silent: true }]);
  const failed = sourceLoader({ "@/lib/api/client": { api: { delete: async () => ({ data: { success: false } }) } } })("lib/api/schedule-lists.ts");
  await assert.rejects(() => failed.deleteScheduleRecord("programs", "13"), /could not be confirmed/);
});

test("list queries guard permissions and invalid filters, isolate response shapes, and share homecell directory data", () => {
  const hooks = sourceLoader({ "@tanstack/react-query": { useQuery: (options) => options }, "@/lib/api/schedule-lists": {}, "@/lib/api/directory-records": {} })("lib/hooks/useScheduleLists.ts");
  assert.equal(hooks.useScheduleList("events", filters("events"), false).enabled, false);
  assert.equal(hooks.useScheduleList("programs", filters("programs", "date=bad"), true).enabled, false);
  const one = hooks.useScheduleList("events", filters("events", "typeId=2"), true);
  const two = hooks.useScheduleList("events", filters("events", "startDate=2026-10-21"), true);
  assert.notDeepEqual(one.queryKey, two.queryKey);
  assert.equal(one.placeholderData, undefined);
  for (const status of [401, 403, 404]) assert.equal(one.retry(0, { response: { status } }), false);
  assert.equal(one.retry(0, new Error("offline")), true);
  assert.equal(one.retry(1, new Error("offline")), false);
  assert.deepEqual(hooks.useScheduleTypes("program-templates", true).queryKey, ["program-types", "management-options"]);
  assert.deepEqual(hooks.useScheduleTypes("events", true).queryKey, ["eventTypes", "management-options"]);
  assert.deepEqual(hooks.useScheduleHomecells(false).queryKey, ["homecells", "directory"]);
  const collection = [{ id: "2", name: "Zomba", memberCount: 20 }, { id: "1", name: "Blantyre", memberCount: 10 }];
  assert.deepEqual(hooks.useScheduleHomecells(true).select({ collection }), [{ id: "1", name: "Blantyre" }, { id: "2", name: "Zomba" }]);
  assert.equal(collection[0].name, "Zomba");
});

test("deletion refreshes schedule lists, related group records and history after either outcome without retry", async () => {
  const client = new QueryClient();
  const keys = [["events", "management-list"], ["event", "12"], ["programs"], ["program", "13"], ["program-templates"], ["program-template", "14"], ["homecell", "9"], ["ministry", "5"], ["audit-timeline", "EVENT", "12"], ["audit-logs"]];
  const hooks = sourceLoader({ "@tanstack/react-query": { useQueryClient: () => client, useMutation: (options) => options }, "@/lib/api/schedule-lists": {}, "@/lib/api/directory-records": {} })("lib/hooks/useScheduleLists.ts");
  for (const kind of ["events", "programs", "program-templates"]) {
    const options = hooks.useDeleteScheduleRecord(kind);
    assert.equal(options.retry, false);
    for (const error of [null, new Error("Response lost")]) {
      keys.forEach((key) => client.setQueryData(key, { fixture: true }));
      await options.onSettled(undefined, error, "12");
      keys.forEach((key) => assert.equal(client.getQueryState(key).isInvalidated, true));
    }
  }
  client.clear();
});

test("event list markup renders Malawi start/end times, real ministry links, workflow state and escaped titles", () => {
  const { ScheduleList } = load("components/directories/ScheduleList.tsx");
  const html = renderToStaticMarkup(React.createElement(ScheduleList, { kind: "events", records: [eventListEntry(event)], now, onDelete: async () => {} }));
  assert.match(html, /Prayer &lt;Together&gt;/);
  assert.match(html, /In progress/);
  assert.match(html, /21 Oct 2026, 00:00 CAT/);
  assert.match(html, /21 Oct 2026, 02:00 CAT/);
  assert.match(html, /href="\/dashboard\/ministries\/5"/);
  assert.match(html, /href="\/dashboard\/events\/12\/edit"/);
  assert.match(html, /<summary>More actions/);
  const unlinked = renderToStaticMarkup(React.createElement(ScheduleList, { kind: "events", records: [eventListEntry({ ...event, ministries: [] })], now, onDelete: async () => {} }));
  assert.match(unlinked, /No ministry linked/);
  assert.doesNotMatch(unlinked, />All</);
});

test("program and template cards show honest planning counts, calendar dates and previews linked to the existing workflow", () => {
  const { ScheduleList } = load("components/directories/ScheduleList.tsx");
  const props = { now, onDelete: async () => {} };
  const programs = renderToStaticMarkup(React.createElement(ScheduleList, { ...props, kind: "programs", records: [programListEntry(program)] }));
  assert.match(programs, /dateTime="2026-10-21"/i);
  assert.match(programs, />Today</);
  assert.match(programs, /1 with a time/);
  assert.match(programs, /2 need a responsible person/);
  assert.match(programs, /href="\/dashboard\/homecells\/9"/);
  assert.match(programs, /Delete Sunday service · 21 Oct 2026 · program #13\?/);
  const templates = renderToStaticMarkup(React.createElement(ScheduleList, { ...props, kind: "program-templates", records: [templateListEntry(template)] }));
  assert.match(templates, /href="\/dashboard\/program-templates\/14"/);
  assert.match(templates, /Preview &amp; use/);
  assert.ok(templates.indexOf("Opening &lt;prayer&gt;") < templates.indexOf("Third activity"));
  assert.match(templates, /1 more activity in the full preview/);
  assert.doesNotMatch(templates, /type="date"/);
  const unknown = renderToStaticMarkup(React.createElement(ScheduleList, { ...props, kind: "program-templates", records: [templateListEntry({ ...template, items: undefined })] }));
  assert.match(unknown, /Count unavailable/);
  assert.match(unknown, /Activity preview unavailable/);
});

function renderController({ kind = "events", query = "", roles = ["DEACON"], result = {}, options = {} } = {}) {
  const guards = {};
  const choice = { data: [], isPending: false, isError: false, isFetching: false, error: null, refetch() {}, ...options };
  const controller = sourceLoader({
    "next/navigation": { useSearchParams: () => new URLSearchParams(query), useRouter: () => ({ push() {} }) },
    "@/app/modules/auth/store/auth.store": { useAuthStore: (selector) => selector({ user: { roles } }) },
    "@/lib/hooks/useScheduleLists": {
      useScheduleList: (_kind, _filters, enabled) => { guards.list = enabled; return { isPending: false, isError: false, isFetching: false, refetch() {}, ...result }; },
      useScheduleTypes: (_kind, enabled) => { guards.types = enabled; return choice; },
      useScheduleHomecells: (enabled) => { guards.homecells = enabled; return choice; },
      useDeleteScheduleRecord: () => ({ mutateAsync: async () => {}, isPending: false }),
    },
  })("components/directories/ScheduleClient.tsx");
  return { html: renderToStaticMarkup(React.createElement(controller.ScheduleClient, { kind })), guards };
}

test("controllers distinguish access, loading, session, error, invalid filters, empty results and unavailable pages", () => {
  for (const kind of ["events", "programs", "program-templates"]) {
    const forbidden = renderController({ kind, roles: ["MEMBER"] });
    assert.deepEqual(forbidden.guards, { list: false, types: false, homecells: false });
    assert.match(forbidden.html, /Access unavailable/);
    assert.doesNotMatch(forbidden.html, /Add event|Add program|Add template/);
    assert.match(renderController({ kind, result: { isPending: true } }).html, /Loading/);
    const empty = { data: { data: [], total: 0, limit: 10 } };
    assert.match(renderController({ kind, result: empty }).html, /yet<\/h2>/);
    const query = kind === "programs" ? "typeId=3&page=8" : "search=Missing&page=8";
    const expired = renderController({ kind, query, result: { data: { data: [], total: 11, limit: 10 } } }).html;
    assert.match(expired, /This page is no longer available/);
    assert.match(expired, /page=2/);
  }
  for (const [status, message] of [[401, "Please sign in again"], [403, "Access unavailable"], [500, "Could not load this list"]]) {
    assert.match(renderController({ result: { isError: true, error: { response: { status } } } }).html, new RegExp(message));
  }
  const invalid = renderController({ query: "startDate=bad", result: { isPending: true } }).html;
  assert.match(invalid, /Check your date filters/);
  assert.doesNotMatch(invalid, /Loading events/);
  assert.match(renderController({ query: "search=Missing", result: { data: { data: [], total: 0, limit: 10 } } }).html, /No matching events/);
});

test("failed filter options retain the selected identity and do not hide successfully loaded records or break paging", () => {
  const html = renderController({ kind: "programs", query: "typeId=3&homecellId=9&fromDate=2026-10-21&page=2", result: { data: { data: [programListEntry(program)], total: 21, limit: 10 } }, options: { isError: true, error: new Error("offline") } }).html;
  assert.match(html, /Choices could not be refreshed/);
  assert.match(html, /value="3" selected="">Selected program type #3/);
  assert.match(html, /value="9" selected="">Selected homecell #9/);
  assert.match(html, /Sunday service/);
  assert.match(html, /Page 2 of 3/);
  assert.match(html, /typeId=3&amp;homecellId=9&amp;fromDate=2026-10-21&amp;page=3/);
  assert.match(html, /Earliest date first/);
});
