import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { sourceLoader } from "./helpers/load-source.mjs";

const load = sourceLoader();
const helpers = load("lib/utils/prayer-team.ts");
const account = { userId: "101", email: "fixture@example.test", member: { id: "22", firstName: "A <person>", lastName: "Family" } };
const member = { ...account, createdAt: "2026-10-20T22:30:00Z", eligibility: "eligible" };
const filters = (query = "") => helpers.readPrayerTeamFilters(new URLSearchParams(query));
const page = (data = [], total = data.length) => ({ data, total, limit: 10 });

test("team navigation preserves search across pages, rejects oversized queries and distinguishes uncertain write errors", () => {
  assert.equal(helpers.prayerTeamHref(filters()), "/dashboard/attention/manage");
  assert.equal(helpers.prayerTeamHref(filters("search=Care+%26+family&page=12")), "/dashboard/attention/manage?search=Care+%26+family&page=12");
  for (const value of ["-1", "0", "1.5", "Infinity", "9007199254740992"]) assert.equal(filters("page=" + value).page, 1);
  assert.ok(helpers.prayerTeamFilterError(filters("search=" + "x".repeat(201))));
  for (const [status, label] of [[401, /Sign in again/], [403, /permission/], [409, /already on/], [400, /no longer eligible/], [404, /no longer eligible/]]) assert.match(helpers.prayerTeamWriteError({ response: { status } }, "add"), label);
  assert.match(helpers.prayerTeamWriteError(new Error("response lost"), "remove"), /Check the refreshed roster/);
});

test("team adapters use scoped paged endpoints with cancellation and strip credentials and unrelated profile fields", async () => {
  const calls = [];
  const api = { get: async (url, options) => { calls.push([url, options]); return { data: { data: [{ ...member, password: "private-password", member: { ...account.member, phone: "private-phone" } }], meta: { page: 12, limit: 10, total: 111 } } }; } };
  const actual = sourceLoader({ "@/lib/api/client": { api } })("lib/api/prayer-team.ts");
  const signal = new AbortController().signal;
  for (const reader of [actual.getPrayerTeam, actual.getEligiblePrayerAccounts]) assert.doesNotMatch(JSON.stringify(await reader(filters("search=Family&page=12"), signal)), /private-/);
  assert.deepEqual(calls, ["/attention/prayer-team", "/attention/prayer-team/eligible"].map((url) => [url, { params: { page: 12, limit: 10, search: "Family" }, signal, timeout: 15000, silent: true }]));
  for (const response of [{ data: [], meta: { total: 1, limit: 10 } }, { data: [member, member], meta: { total: 2, limit: 10 } }, { data: [{ ...member, member: null }], meta: { total: 1, limit: 10 } }, { success: false, data: [], meta: { total: 0, limit: 10 } }]) {
    api.get = async () => ({ data: response });
    await assert.rejects(() => actual.getEligiblePrayerAccounts(filters()));
  }
  const before = calls.length;
  await assert.rejects(() => actual.getPrayerTeam(filters("search=" + "x".repeat(201))));
  assert.equal(calls.length, before);
});

test("team writes use existing notification-membership endpoints and reject mismatched or unconfirmed responses", async () => {
  const calls = [];
  const api = { post: async (...args) => { calls.push(["post", ...args]); return { data: { success: true, data: { userId: "101" } } }; }, delete: async (...args) => { calls.push(["delete", ...args]); return { data: { success: true, data: { userId: "101/2", removed: false } } }; } };
  const actual = sourceLoader({ "@/lib/api/client": { api } })("lib/api/prayer-team.ts");
  await actual.addPrayerTeamAccount("101");
  await actual.removePrayerTeamAccount("101/2");
  assert.deepEqual(calls, [["post", "/attention/prayer-warriors", { userId: "101" }, { timeout: 30000, silent: true }], ["delete", "/attention/prayer-warriors/101%2F2", { timeout: 30000, silent: true }]]);
  for (const result of [{ success: false }, { success: true, data: { userId: "other", removed: true } }, { data: { userId: "101" } }]) {
    api.post = api.delete = async () => ({ data: result });
    await assert.rejects(() => actual.addPrayerTeamAccount("101"));
    await assert.rejects(() => actual.removePrayerTeamAccount("101"));
  }
});

test("roster and candidate queries gate pastoral access, separate actors/views/pages and forward abort signals", async () => {
  const calls = [];
  const hooks = sourceLoader({ "@tanstack/react-query": { useQuery: (options) => options }, "@/lib/api/prayer-team": { getPrayerTeam: (...args) => calls.push(args), getEligiblePrayerAccounts: (...args) => calls.push(args) } })("lib/hooks/usePrayerTeam.ts");
  const actor = { id: "1", roles: ["DEACON"] };
  const roster = hooks.usePrayerTeam(filters(), actor);
  const candidates = hooks.useEligiblePrayerAccounts(filters(), actor);
  assert.equal(roster.enabled, true);
  assert.notDeepEqual(roster.queryKey, candidates.queryKey);
  assert.notDeepEqual(roster.queryKey, hooks.usePrayerTeam(filters(), { ...actor, id: "2" }).queryKey);
  assert.notDeepEqual(roster.queryKey, hooks.usePrayerTeam(filters("page=2"), actor).queryKey);
  for (const reader of [hooks.usePrayerTeam, hooks.useEligiblePrayerAccounts]) {
    assert.equal(reader(filters(), null).enabled, false);
    assert.equal(reader(filters(), { ...actor, roles: ["MEDIA"] }).enabled, false);
    assert.equal(reader(filters("search=" + "x".repeat(201)), actor).enabled, false);
  }
  assert.equal(roster.placeholderData, undefined);
  assert.equal(candidates.refetchOnMount, "always");
  for (const status of [401, 403, 404]) assert.equal(roster.retry(0, { response: { status } }), false);
  const signal = new AbortController().signal;
  await roster.queryFn({ signal }); await candidates.queryFn({ signal });
  assert.deepEqual(calls, [[filters(), signal], [filters(), signal]]);
});

test("team mutations refresh roster, eligibility and histories after both confirmed and uncertain outcomes without automatic retries", async () => {
  const client = new QueryClient();
  const hooks = sourceLoader({ "@tanstack/react-query": { useQueryClient: () => client, useMutation: (options) => options }, "@/lib/api/prayer-team": {} })("lib/hooks/usePrayerTeam.ts");
  const mutations = hooks.usePrayerTeamActions();
  const keys = [["prayer-team", "roster", "1"], ["prayer-team", "eligible", "1"], ["audit-logs"], ["audit-timeline", "PRAYERWARRIOR", "101"]];
  for (const mutation of Object.values(mutations)) for (const error of [null, new Error("response lost")]) {
    assert.equal(mutation.retry, false);
    keys.forEach((key) => client.setQueryData(key, {}));
    await mutation.onSettled(undefined, error);
    keys.forEach((key) => assert.equal(client.getQueryState(key).isInvalidated, true));
  }
  client.clear();
});

test("team cards show joined date, account identity, active profile and eligibility without exposing admin-only links to pastoral accounts", () => {
  const { PrayerTeamList } = sourceLoader({ "@/components/records/RecordActionDialog": { RecordActionDialog: ({ title, description }) => React.createElement("button", { title }, description) } })("components/directories/PrayerTeamList.tsx");
  const render = (records, canViewAccounts = false) => renderToStaticMarkup(React.createElement(PrayerTeamList, { records, canViewAccounts, busy: false, onRemove: async () => {} }));
  const html = render([member]);
  for (const pattern of [/A &lt;person&gt; Family/, /Account #101/, /21 Oct 2026/, /Eligible for notifications/, /href="\/dashboard\/members\/22"/, /href="mailto:fixture%40example.test"/, /account, directory profile and roles are kept/]) assert.match(html, pattern);
  assert.doesNotMatch(html, /href="\/dashboard\/users\//);
  assert.match(render([member], true), /href="\/dashboard\/users\/101"/);
  const removed = render([{ ...member, eligibility: "account-unavailable", member: null }], true);
  assert.match(removed, /Needs account review/);
  assert.match(removed, /excluded from future notification recipient lookups/);
  assert.doesNotMatch(removed, /href="\/dashboard\/users\//);
});

function renderTeam({ roles = ["DEACON"], query = "", result = {} } = {}) {
  const { PrayerTeamClient } = sourceLoader({
    "next/navigation": { useSearchParams: () => new URLSearchParams(query), useRouter: () => ({ push() {} }) },
    "@/app/modules/auth/store/auth.store": { useAuthStore: (selector) => selector({ user: { id: "1", roles } }) },
    "@/lib/hooks/usePrayerTeam": { usePrayerTeam: () => ({ isPending: false, isError: false, isFetching: false, ...result }), usePrayerTeamActions: () => ({ add: { isPending: false }, remove: { isPending: false } }) },
  })("components/directories/PrayerTeamClient.tsx");
  return renderToStaticMarkup(React.createElement(PrayerTeamClient));
}

test("team controller distinguishes access, loading, empty, no matches, session, error and unavailable pages while retaining search", () => {
  assert.match(renderTeam({ roles: ["MEMBER"] }), /Access unavailable/);
  assert.doesNotMatch(renderTeam({ roles: ["MEMBER"] }), /<button[^>]*>Add to prayer team/);
  assert.match(renderTeam({ result: { isPending: true } }), /Loading prayer team/);
  assert.match(renderTeam({ result: { data: page() } }), /Build your prayer team/);
  assert.match(renderTeam({ query: "search=missing", result: { data: page() } }), /No matching team members/);
  assert.match(renderTeam({ query: "search=" + "x".repeat(201) }), /Check your search/);
  const paged = renderTeam({ query: "search=Family&page=2", result: { data: page([member], 21) } });
  assert.match(paged, /Page 2 of 3/);
  assert.match(paged, /search=Family&amp;page=3/);
  const unavailable = renderTeam({ query: "search=Family&page=5", result: { data: page([], 21) } });
  assert.match(unavailable, /This page is no longer available/);
  assert.match(unavailable, /search=Family&amp;page=3/);
  for (const [status, label] of [[401, /Please sign in again/], [403, /Access unavailable/], [500, /Could not load this prayer team/]]) assert.match(renderTeam({ result: { isError: true, error: { response: { status } } } }), label);
});

function renderPicker(result = {}) {
  const { PrayerTeamPicker } = sourceLoader({ "@/lib/hooks/usePrayerTeam": { useEligiblePrayerAccounts: () => ({ isPending: false, isError: false, isFetching: false, ...result }) } })("components/directories/PrayerTeamPicker.tsx");
  return renderToStaticMarkup(React.createElement(PrayerTeamPicker, { actor: { id: "1", roles: ["DEACON"] }, busy: false, onAdd: async () => {}, onCancel() {}, onSaved() {} }));
}

test("account picker renders readable labelled selection and explicit loading, empty and failed states", () => {
  assert.match(renderPicker({ isPending: true }), /Finding eligible accounts/);
  assert.match(renderPicker({ data: page() }), /No accounts available to add/);
  assert.match(renderPicker({ isError: true, error: new Error("offline") }), /Could not load this eligible account list/);
  const html = renderPicker({ data: page([account], 111) });
  for (const pattern of [/for="eligible-account-search"/, /maxLength="200"/, /type="radio"/, /value="101"/, /A &lt;person&gt; Family/, /Page 1 of 12/, /Team membership does not grant dashboard access/, /disabled=""[^>]*>Add selected account/]) assert.match(html, pattern);
});

test("account selection remains visible across search/pages and repeated confirmation submits only one pending addition", async () => {
  const state = [{ page: 12, search: "Family" }, account, ""];
  let stateIndex = 0;
  let done;
  const pending = new Promise((resolve) => { done = resolve; });
  const calls = [];
  let saved = 0;
  const { PrayerTeamPicker } = sourceLoader({ react: { useState: () => [state[stateIndex++], () => {}], useRef: (current) => ({ current }), useEffect() {} }, "@/lib/hooks/usePrayerTeam": { useEligiblePrayerAccounts: () => ({ isPending: false, isError: false, isFetching: false, data: page([], 111) }) } })("components/directories/PrayerTeamPicker.tsx");
  const tree = PrayerTeamPicker({ actor: { id: "1", roles: ["DEACON"] }, busy: false, onAdd: (id) => { calls.push(id); return pending; }, onSaved: () => saved++, onCancel() {} });
  const html = renderToStaticMarkup(tree);
  assert.match(html, /Selected: <strong>A &lt;person&gt; Family/);
  const confirm = tree.props.children.at(-1).props.children[0];
  confirm.props.onClick(); confirm.props.onClick();
  assert.deepEqual(calls, ["101"]);
  done();
  await pending;
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(saved, 1);
});
