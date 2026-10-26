import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { sourceLoader } from "./helpers/load-source.mjs";

const load = sourceLoader();
const helpers = load("lib/utils/directory-records.ts");
const { readDirectoryFilters, directoryHref, directoryParams, directoryPageState, paginateHomecells, groupDirectoryEntry, memberDirectoryEntry } = helpers;
const filters = (kind, query = "") => readDirectoryFilters(kind, new URLSearchParams(query));
const person = { id: "123", firstName: "Test", lastName: "Person", phone: "+265 123 456", location: "Blantyre", prefix: "ELDER", status: "MEMBER" };
const group = { id: "4", name: "Community & Care", purpose: "Serve <everyone>", location: "Blantyre", leader: person, overseer: null };

test("directory URL filters validate values and preserve applied filters across paging and exports", () => {
  const member = filters("members", "search=Test+%26+Person&status=MEMBER&prefix=ELDER&page=4&leaderId=123&limit=999");
  assert.equal(member.leaderId, "");
  assert.equal(directoryHref("members", member), "/dashboard/members?search=Test+%26+Person&status=MEMBER&prefix=PASTOR&page=4");
  assert.equal(directoryParams("members", member, false).toString(), "search=Test+%26+Person&status=MEMBER&prefix=PASTOR");
  assert.deepEqual(helpers.memberPrefixes, ["PASTOR", "DEACON", "SISTER", "BROTHER"]);
  assert.equal(memberDirectoryEntry(person).prefix, "PASTOR");
  assert.deepEqual(filters("members", directoryParams("members", member).toString()), member);
  for (const page of ["-1", "0", "1.5", "Infinity", "9007199254740992", "abc"]) assert.equal(filters("members", "page=" + page).page, 1);
  const bad = filters("ministries", "leaderId=javascript:alert(1)&overseerId=9%2Fedit&status=MEMBER");
  assert.equal(bad.leaderId, "");
  assert.equal(bad.overseerId, "");
  assert.equal(bad.status, "");
  assert.equal(filters("members", "status=ROOT&prefix=UNKNOWN").status, "");
  const ministry = filters("ministries", "leaderId=123&overseerId=200&page=2&prefix=ELDER");
  assert.equal(directoryHref("ministries", ministry), "/dashboard/ministries?leaderId=123&overseerId=200&page=2");
});

test("homecell search and pagination work on the full unpaginated response without clamping the requested page", () => {
  const records = Array.from({ length: 25 }, (_, index) => ({ id: String(index), name: "Homecell " + index, location: index % 2 ? "Blantyre" : "Zomba" }));
  const page = paginateHomecells(records, filters("homecells", "search=BLANTYRE&page=2"));
  assert.equal(page.total, 12);
  assert.deepEqual(page.data.map((entry) => entry.id), ["21", "23"]);
  assert.equal(page.limit, 10);
  assert.equal(paginateHomecells(records, filters("homecells", "search=Homecell+24")).total, 1);
  assert.equal(paginateHomecells(records, filters("homecells", "search=unknown")).total, 0);
  assert.deepEqual(paginateHomecells(records, filters("homecells", "page=9")).data, []);
  assert.deepEqual(directoryPageState(9, 25, 10), { totalPages: 3, outOfRange: true, start: 0, end: 0 });
  assert.deepEqual(directoryPageState(1, 0, 10), { totalPages: 1, outOfRange: false, start: 0, end: 0 });
  assert.equal(records.length, 25);
});

test("directory summaries use supplied relationships and counts without retaining unrelated private data", () => {
  const member = memberDirectoryEntry({ ...person, bio: { bio: "Private biography" }, homecell: group, ministries: [group] });
  assert.equal(member.name, "Test Person");
  assert.equal(member.phone, person.phone);
  assert.ok(!("bio" in member));
  assert.ok(!("homecell" in member));
  const noRoster = groupDirectoryEntry(group);
  assert.equal(noRoster.memberCount, undefined);
  assert.deepEqual(noRoster.leader, { id: "123", firstName: "Test", lastName: "Person" });
  assert.equal(groupDirectoryEntry({ ...group, members: [] }).memberCount, 0);
  assert.equal(groupDirectoryEntry({ ...group, members: [person, person, { ...person, id: "removed", deletedAt: "2026-01-01" }] }).memberCount, 1);
});

test("server-paginated directories retain endpoint, filter, cancellation, timeout and response contracts", async () => {
  const calls = [];
  let malformed = false;
  const api = { get: async (url, config) => {
    calls.push([url, config]);
    return { data: { success: true, data: url === "/members" ? [person] : [group], meta: malformed ? {} : { total: 41, limit: 10 } } };
  } };
  const actual = sourceLoader({ "@/lib/api/client": { api } })("lib/api/directory-records.ts");
  const signal = new AbortController().signal;
  const member = await actual.getDirectoryPage("members", filters("members", "search=Person&status=MEMBER&prefix=ELDER&page=2"), signal);
  assert.deepEqual(calls[0], ["/members", { params: { search: "Person", status: "MEMBER", prefix: "PASTOR", page: 2, limit: 10 }, signal, timeout: 15000, silent: true }]);
  assert.equal(member.total, 41);
  assert.equal(member.data[0].name, "Test Person");
  await actual.getDirectoryPage("ministries", filters("ministries", "leaderId=123&overseerId=456&page=4"), signal);
  assert.deepEqual(calls[1], ["/ministries", { params: { leaderId: "123", overseerId: "456", page: 4, limit: 10 }, signal, timeout: 15000, silent: true }]);
  malformed = true;
  await assert.rejects(() => actual.getDirectoryPage("members", filters("members")), /incomplete page/);
  const inconsistent = sourceLoader({ "@/lib/api/client": { api: { get: async () => ({ data: { success: true, data: [], meta: { total: 41, limit: 10 } } }) } } })("lib/api/directory-records.ts");
  await assert.rejects(() => inconsistent.getDirectoryPage("members", filters("members")), /inconsistent page/);
});

test("homecell reads request the full collection and exclude removed records, with unknown counts kept distinct", async () => {
  const calls = [];
  const actual = sourceLoader({ "@/lib/api/client": { api: { get: async (...args) => {
    calls.push(args);
    return { data: { success: true, data: [group, { ...group, id: "5", members: [] }, { ...group, id: "6", deletedAt: "2026-01-01" }], meta: {} } };
  } } } })("lib/api/directory-records.ts");
  const signal = new AbortController().signal;
  const records = await actual.getHomecellDirectory(signal);
  assert.deepEqual(calls, [["/homecells", { signal, timeout: 15000, silent: true }]]);
  assert.deepEqual(records.map((entry) => entry.memberCount), [undefined, 0]);
});

test("member export sends only applied filters and deletion uses bounded authenticated transport without automatic retries", async () => {
  const calls = [];
  const blob = new Blob(["fixture"], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const actual = sourceLoader({ "@/lib/api/client": { api: {
    get: async (...args) => { calls.push(["get", ...args]); return { data: blob }; },
    delete: async (...args) => { calls.push(["delete", ...args]); return { data: { success: true } }; },
  } } })("lib/api/directory-records.ts");
  const signal = new AbortController().signal;
  assert.equal(await actual.exportMemberDirectory(filters("members", "search=Person&prefix=ELDER&status=MEMBER&page=8"), signal), blob);
  assert.deepEqual(calls[0], ["get", "/members/export/xlsx", { params: { search: "Person", status: "MEMBER", prefix: "PASTOR" }, responseType: "blob", signal, timeout: 30000, silent: true }]);
  await actual.deleteDirectoryRecord("ministries", "4/5");
  assert.deepEqual(calls[1], ["delete", "/ministries/4%2F5", { timeout: 30000, silent: true }]);
});

test("directory queries are permission guarded, distinguish filter keys, avoid old placeholder rows and reuse the homecell collection", async () => {
  let homecellReads = 0;
  const source = sourceLoader({
    "@tanstack/react-query": { useQuery: (options) => options },
    "@/lib/api/directory-records": { getHomecellDirectory: async () => { homecellReads++; return [groupDirectoryEntry(group)]; }, getDirectoryPage: async (kind, query, signal) => ({ kind, query, signal }) },
  })("lib/hooks/useDirectoryRecords.ts");
  const member = source.useDirectoryRecords("members", filters("members", "status=MEMBER"), false);
  const title = source.useDirectoryRecords("members", filters("members", "prefix=ELDER"), true);
  assert.equal(member.enabled, false);
  assert.notDeepEqual(member.queryKey, title.queryKey);
  assert.equal(member.placeholderData, undefined);
  assert.equal(member.retry(0, { response: { status: 403 } }), false);
  assert.equal(member.retry(0, { response: { status: 401 } }), false);
  assert.equal(member.retry(0, new Error("offline")), true);
  assert.equal(member.retry(1, new Error("offline")), false);
  const signal = new AbortController().signal;
  assert.equal((await member.queryFn({ signal })).signal, signal);
  const first = source.useDirectoryRecords("homecells", filters("homecells"), true);
  const second = source.useDirectoryRecords("homecells", filters("homecells", "search=unknown&page=2"), true);
  assert.deepEqual(first.queryKey, second.queryKey);
  const cached = await first.queryFn({ signal });
  assert.equal(first.select(cached).total, 1);
  assert.equal(second.select(cached).total, 0);
  assert.equal(homecellReads, 1);
});

test("deletion refreshes directory, related details and history after either a confirmed or uncertain response", async () => {
  const client = new QueryClient();
  const keys = [["members", "directory", { page: 3 }], ["member", "123"], ["ministries"], ["ministry", "4"], ["homecells", "directory"], ["homecell", "5"], ["homecell-members", "5"], ["ministry-members", "4"], ["program", "7"], ["programs"], ["program-template", "9"], ["user", "2"], ["audit-timeline", "MEMBER", "123"], ["audit-logs"]];
  const options = sourceLoader({ "@tanstack/react-query": { useQueryClient: () => client, useMutation: (value) => value }, "@/lib/api/directory-records": {} })("lib/hooks/useDirectoryRecords.ts").useDeleteDirectoryRecord("members");
  assert.equal(options.retry, false);
  for (const error of [null, new Error("Response lost")]) {
    keys.forEach((key) => client.setQueryData(key, { fixture: true }));
    await options.onSettled(undefined, error, "123");
    keys.forEach((key) => assert.equal(client.getQueryState(key).isInvalidated, true, JSON.stringify(key)));
  }
  client.clear();
});

test("list markup provides semantic cards, real navigation/contact links, honest counts, escaped text and separate secondary actions", () => {
  const { DirectoryList } = load("components/directories/DirectoryList.tsx");
  const html = renderToStaticMarkup(React.createElement(DirectoryList, { kind: "members", records: [memberDirectoryEntry({ ...person, firstName: "<script>" })], onDelete: async () => {} }));
  assert.match(html, /aria-label="Members results"/);
  assert.match(html, /href="\/dashboard\/members\/123"/);
  assert.match(html, /href="\/dashboard\/members\/123\/edit"/);
  assert.match(html, /href="tel:\+265123456"/);
  assert.match(html, /&lt;script&gt; Person/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /<dt>Membership<\/dt>/);
  assert.match(html, /<summary>More actions/);
  const groups = renderToStaticMarkup(React.createElement(DirectoryList, { kind: "homecells", records: [groupDirectoryEntry(group), groupDirectoryEntry({ ...group, id: "5", members: [] })], onDelete: async () => {} }));
  assert.match(groups, /Count unavailable/);
  assert.match(groups, /<dd>0<\/dd>/);
  assert.match(groups, /Not assigned/);
  assert.match(groups, /href="\/dashboard\/members\/123"/);
  const ministry = renderToStaticMarkup(React.createElement(DirectoryList, { kind: "ministries", records: [groupDirectoryEntry(group)], onDelete: async () => {} }));
  assert.match(ministry, /Serve &lt;everyone&gt;/);
  assert.doesNotMatch(ministry, /Count unavailable/);
});

test("paging links preserve filters and compact boundary controls do not link beyond the result set", () => {
  const { DirectoryPager } = load("components/directories/DirectoryList.tsx");
  const html = renderToStaticMarkup(React.createElement(DirectoryPager, { kind: "members", filters: filters("members", "search=Person&status=MEMBER&page=2"), total: 21, limit: 10 }));
  assert.match(html, /href="\/dashboard\/members\?search=Person&amp;status=MEMBER"/);
  assert.match(html, /href="\/dashboard\/members\?search=Person&amp;status=MEMBER&amp;page=3"/);
  assert.match(html, /Page 2 of 3/);
  const first = renderToStaticMarkup(React.createElement(DirectoryPager, { kind: "members", filters: filters("members"), total: 11, limit: 10 }));
  assert.match(first, /aria-disabled="true">Previous/);
  assert.doesNotMatch(first, /page=0/);
});

function renderController({ kind = "members", query = "", roles = ["DEACON"], result = {}, deletion = {} } = {}) {
  let enabled;
  const controller = sourceLoader({
    "next/navigation": { useSearchParams: () => new URLSearchParams(query), useRouter: () => ({ push() {} }) },
    "@/app/modules/auth/store/auth.store": { useAuthStore: (selector) => selector({ user: { roles } }) },
    "@/lib/hooks/useDirectoryRecords": { useDirectoryRecords: (_kind, _filters, permitted) => { enabled = permitted; return { isPending: false, isError: false, isFetching: false, refetch() {}, ...result }; }, useDeleteDirectoryRecord: () => ({ isPending: false, mutateAsync: async () => {}, ...deletion }) },
    "@/lib/api/directory-records": { exportMemberDirectory: async () => new Blob() },
  })("components/directories/DirectoryClient.tsx");
  return { html: renderToStaticMarkup(React.createElement(controller.DirectoryClient, { kind })), enabled };
}

test("directory controllers distinguish loading, forbidden, session, error, empty, filtered-empty and unavailable-page states", () => {
  const forbidden = renderController({ roles: ["MEMBER"] });
  assert.equal(forbidden.enabled, false);
  assert.match(forbidden.html, /Access unavailable/);
  assert.doesNotMatch(forbidden.html, /Add member/);
  assert.match(renderController({ result: { isPending: true } }).html, /Loading members…/);
  for (const [status, message] of [[401, "Please sign in again"], [403, "Access unavailable"], [500, "Could not load this directory"]]) {
    const { html } = renderController({ query: "search=Person", result: { isError: true, error: { response: { status } } } });
    assert.match(html, new RegExp(message));
    assert.doesNotMatch(html, /directory is empty/);
    assert.match(html, /value="Person"/);
  }
  const empty = { data: { data: [], total: 0, limit: 10 } };
  assert.match(renderController({ result: empty }).html, /members directory is empty/);
  assert.match(renderController({ query: "search=Missing", result: empty }).html, /No matching members/);
  const expired = renderController({ query: "status=MEMBER&page=5", result: { data: { data: [], total: 11, limit: 10 } } }).html;
  assert.match(expired, /This page is no longer available/);
  assert.match(expired, /href="\/dashboard\/members\?status=MEMBER&amp;page=2"/);
  assert.doesNotMatch(expired, /Page 2 of 2/);
});

test("leadership filtering displays the complete directory page count and distinct read failure feedback", () => {
  let options;
  const picker = sourceLoader({ "@tanstack/react-query": { useQuery: (value) => { options = value; return { data: { data: [person], meta: { total: 121, limit: 20 } }, isPending: false, isError: false }; } } })("components/directories/DirectoryPersonFilter.tsx");
  const html = renderToStaticMarkup(React.createElement(picker.PersonPicker, { label: "Leader", onClose() {}, onSelect() {} }));
  assert.match(html, /Page 1 of 7/);
  assert.match(html, /Test Person/);
  assert.match(html, /ID 123/);
  assert.match(html, /This does not change any assignments/);
  assert.equal(options.retry(0, { response: { status: 403 } }), false);
  assert.equal(options.queryKey[1], "leadership-filter");
  const failed = sourceLoader({ "@tanstack/react-query": { useQuery: () => ({ isPending: false, isError: true, error: { response: { status: 401 } } }) } })("components/directories/DirectoryPersonFilter.tsx");
  const error = renderToStaticMarkup(React.createElement(failed.PersonPicker, { label: "Leader", onClose() {}, onSelect() {} }));
  assert.match(error, /Please sign in again/);
  assert.doesNotMatch(error, /No matching people/);
});
