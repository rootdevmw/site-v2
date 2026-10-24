import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { sourceLoader } from "./helpers/load-source.mjs";

const load = sourceLoader();
const { normalizeGroupMembers, getHomecellMove, collectMemberDirectory } = load("lib/utils/group-members.ts");
const { parseMemberCsv, matchMemberCsv, assignImportedMembers } = load("lib/utils/ministry-import.ts");
const { getVisitorState } = load("lib/utils/record-details.ts");
const person = (id, firstName = "Test", lastName = "Person") => ({ id, firstName, lastName });

test("group rosters use real member identities and exclude removed, duplicate, and empty joins", () => {
  const member = person("2");
  const payload = [{ ministryId: "9", memberId: "2", member }, { member: null }, member, { ...person("3"), deletedAt: "2026-01-01" }];
  assert.deepEqual(normalizeGroupMembers(payload), [member]);
  assert.deepEqual(normalizeGroupMembers({ members: [member] }), [member]);
  assert.deepEqual(normalizeGroupMembers(null), []);
  const normalizeMinistry = load("app/modules/ministries/utils/ministry-details.ts").normalizeMinistryDetails;
  const normalizeHomecell = load("app/modules/homecells/utils/homecell-details.ts").normalizeHomecellDetails;
  assert.equal(normalizeMinistry({ id: "9", members: payload }).members[0].id, "2");
  assert.equal(normalizeHomecell({ id: "8", members: payload }).members.length, 1);
});

test("a homecell assignment identifies an existing homecell move before submission", () => {
  assert.deepEqual(getHomecellMove({ ...person("2"), homecell: { id: "old", name: "Previous group" } }, "new"), { fromId: "old", fromName: "Previous group" });
  assert.equal(getHomecellMove({ ...person("2"), homecellId: "new" }, "new"), null);
  assert.equal(getHomecellMove(person("2"), "new"), null);
});

test("the import directory includes people beyond the first hundred and rejects partial pagination", async () => {
  const calls = [];
  const directory = await collectMemberDirectory(async (page) => {
    calls.push(page);
    const count = page < 3 ? 100 : 2;
    return { data: Array.from({ length: count }, (_, index) => person(String((page - 1) * 100 + index + 1))), meta: { total: 202, limit: 100 } };
  });
  assert.deepEqual(calls, [1, 2, 3]);
  assert.equal(directory.at(-1).id, "202");
  await assert.rejects(() => collectMemberDirectory(async () => ({ data: [person("1")], meta: { total: 2, limit: 1 } })), /complete member directory/);
  await assert.rejects(() => collectMemberDirectory(async () => ({ data: [], meta: { total: 2, limit: 1 } })), /complete member directory/);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(() => collectMemberDirectory(async () => { throw new Error("must not be requested"); }, controller.signal), { name: "AbortError" });
});

test("CSV names preserve quoted columns and never auto-select ambiguous or duplicate people", () => {
  assert.deepEqual(parseMemberCsv('\uFEFFlast_name,first_name\r\nSurname,"Test, First"\r\n'), [{ firstName: "Test, First", lastName: "Surname" }]);
  assert.throws(() => parseMemberCsv('firstName,lastName\n"Unclosed,Person'), /unclosed quote/);
  const directory = [person("1", "Unique", "Person"), person("2", "Assigned", "Person"), person("3", "Same", "Name"), person("4", "Same", "Name")];
  const rows = parseMemberCsv("firstName,lastName\nUnique,Person\nUnique,Person\nAssigned,Person\nSame,Name\nMissing,Person");
  const matches = matchMemberCsv(rows, directory, new Set(["2"]));
  assert.deepEqual(matches.map((entry) => entry.state), ["ready", "duplicate", "assigned", "ambiguous", "missing"]);
  assert.equal(matches.filter((entry) => entry.state === "ready").length, 1);
  assert.equal(matches.find((entry) => entry.state === "ambiguous").member, undefined);
});

test("bulk assignment awaits partial failures and submits each selected identity once", async () => {
  const calls = [];
  const result = await assignImportedMembers(["1", "2", "1", "3"], async (id) => {
    calls.push(id);
    if (id === "2") throw new Error("Test transport failure");
  });
  assert.deepEqual(calls, ["1", "2", "3"]);
  assert.deepEqual(result, { assignedIds: ["1", "3"], failedIds: ["2"] });
});

test("membership changes invalidate both homecells and the affected member profile", async () => {
  const client = new QueryClient();
  const keys = [["homecell", "old"], ["homecell", "new"], ["homecell-members", "old"], ["homecell-members", "new"], ["homecells"], ["members"], ["member", "2"]];
  keys.forEach((key) => client.setQueryData(key, { fixture: true }));
  client.setQueryData(["ministry", "unrelated"], { fixture: true });
  const { refreshGroupMembership } = load("lib/utils/group-membership-cache.ts");
  await refreshGroupMembership(client, "homecell", "new", ["2"]);
  keys.forEach((key) => assert.equal(client.getQueryState(key).isInvalidated, true));
  assert.equal(client.getQueryState(["ministry", "unrelated"]).isInvalidated, false);
  client.clear();
});

test("detail reads use individual visitor and group endpoints and scope program requests to the homecell", async () => {
  const calls = [];
  const transport = { get: async (url, options) => {
    calls.push({ url, options });
    if (url === "/programs") return { data: { data: [], meta: { total: 0 } } };
    return { data: { data: { id: "9", members: [{ member: person("2") }] } } };
  } };
  const loadApi = sourceLoader({ "@/lib/api/client": { api: transport } });
  const signal = new AbortController().signal;
  assert.equal((await loadApi("app/modules/ministries/api/getMinistry.ts").getMinistry("9", signal)).data.members[0].id, "2");
  assert.equal((await loadApi("app/modules/homecells/api/getHomecell.ts").getHomecell("8", signal)).data.members[0].id, "2");
  await loadApi("app/modules/attention/api/getVisitor.ts").getVisitor("7", signal);
  await loadApi("lib/api/group-records.ts").getHomecellPrograms("8", 2, signal);
  assert.deepEqual(calls.map((call) => call.url), ["/ministries/9", "/homecells/8", "/attention/visitors/7", "/programs"]);
  assert.deepEqual(calls.at(-1).options.params, { homecellId: "8", page: 2, limit: 5 });
  calls.forEach((call) => assert.equal(call.options.signal, signal));
});

test("visitor acknowledgement updates cached state and prevents repeated follow-up actions", () => {
  assert.equal(getVisitorState("PENDING").canAcknowledge, true);
  for (const status of ["CONFIRMED", "COMPLETED", "UNKNOWN"]) assert.equal(getVisitorState(status).canAcknowledge, false);
  const client = new QueryClient();
  client.setQueryData(["visitor", "7"], { id: "7", status: "PENDING" });
  const queueKeys = [["visitors"], ["attention-overview"], ["attention", "notifications"]];
  queueKeys.forEach((key) => client.setQueryData(key, { fixture: true }));
  const loadHook = sourceLoader({ "@tanstack/react-query": { useQueryClient: () => client, useMutation: (options) => options }, "@/lib/api/client": { api: {} } });
  const actions = loadHook("app/modules/attention/hooks/useAttentionActions.ts").useAttentionActions();
  actions.markVisitor.onSuccess({ data: { id: "7", status: "CONFIRMED" } }, "7");
  assert.equal(client.getQueryData(["visitor", "7"]).status, "CONFIRMED");
  queueKeys.forEach((key) => assert.equal(client.getQueryState(key).isInvalidated, true));
  actions.markVisitor.onError(new Error("Response lost"), "7");
  assert.equal(client.getQueryState(["visitor", "7"]).isInvalidated, true);
  client.clear();
});

test("group and visitor views render meaningful leadership links, visit ranges, and support preferences", () => {
  const { MinistryRecordView } = load("components/records/MinistryRecordView.tsx");
  const { HomecellRecordView } = load("components/records/HomecellRecordView.tsx");
  const { VisitorRecordView } = load("components/records/VisitorRecordView.tsx");
  const ministry = { id: "9", name: "Test ministry", slug: "test-ministry", purpose: "Test service", leader: person("2"), members: [person("3")], events: [{ id: "6", title: "Test gathering", startTime: "2026-10-21T07:00:00Z" }] };
  const ministryHtml = renderToStaticMarkup(React.createElement(MinistryRecordView, { ministry, membership: null }));
  assert.match(ministryHtml, /href="\/dashboard\/members\/2"/);
  assert.match(ministryHtml, /href="\/dashboard\/ministries\/9\/edit"/);
  assert.match(ministryHtml, /href="\/dashboard\/events\/6"/);
  assert.match(ministryHtml, /No overseer assigned/);
  const homecellHtml = renderToStaticMarkup(React.createElement(HomecellRecordView, { homecell: { id: "8", name: "Test homecell", slug: "test-homecell", members: [], overseer: person("4") }, membership: null, programs: null }));
  assert.match(homecellHtml, /href="\/dashboard\/members\/4"/);
  assert.match(homecellHtml, /href="\/dashboard\/homecells\/8\/edit"/);
  assert.match(homecellHtml, /No leader assigned/);
  const visitorHtml = renderToStaticMarkup(React.createElement(VisitorRecordView, { visitor: { id: "7", name: "Test visitor", visitDate: "2026-10-21T22:30:00Z", groupSize: "6–10", status: "CONFIRMED", hasSpecialNeeds: false, specialNeedsDetails: "Old hidden note", message: "<script>test</script>", createdAt: "2026-10-20T07:00:00Z" }, followUpAction: null }));
  assert.match(visitorHtml, /Acknowledged/);
  assert.match(visitorHtml, /22 October 2026/);
  assert.match(visitorHtml, /6–10/);
  assert.match(visitorHtml, /&lt;script&gt;test&lt;\/script&gt;/);
  assert.doesNotMatch(visitorHtml, /Old hidden note/);
  assert.match(visitorHtml, /No preference given/);
});
