import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { sourceLoader } from "./helpers/load-source.mjs";

const helpers = sourceLoader()("lib/utils/attention-queues.ts");
const { readAttentionQueueFilters, attentionQueueHref, attentionQueueFilterError } = helpers;
const filters = (kind = "prayers", query = "") => readAttentionQueueFilters(kind, new URLSearchParams(query));
const prayer = { id: "7", name: "A <person>", createdAt: "2026-10-21T08:30:00Z", status: "PENDING", prayerFor: "Family & care", requestPreview: "A <request>", hasMoreRequest: true, requestType: "Family", isUrgent: true, shareWithElders: false };
const visitor = { id: "8", name: "A <visitor>", createdAt: prayer.createdAt, status: "PENDING", phone: "+265 1234567", email: "fixture@example.test", visitDate: "2026-10-20T22:00:00Z", groupSize: "Family", language: "English", hasSpecialNeeds: true };
const page = (data = [], total = data.length, canRecord = true) => ({ data, total, limit: 10, canRecord });

test("queue links default to open work and preserve search, explicit false urgency, history and paging", () => {
  assert.equal(attentionQueueHref("prayers", filters()), "/dashboard/attention/prayers");
  assert.equal(filters("visitors", "status=PENDING").status, "open");
  assert.equal(filters("visitors").sort, "oldest");
  const selected = filters("prayers", "search=Care+%26+family&status=PRAYED_FOR&urgent=false&from=2026-10-20&to=2026-10-21&sort=newest&page=3");
  const href = attentionQueueHref("prayers", selected);
  assert.equal(href, "/dashboard/attention/prayers?search=Care+%26+family&status=PRAYED_FOR&urgent=false&from=2026-10-20&to=2026-10-21&sort=newest&page=3");
  assert.deepEqual(filters("prayers", href.split("?")[1]), selected);
  for (const value of ["-1", "0", "1.5", "Infinity", "9007199254740992"]) assert.equal(filters("prayers", "page=" + value).page, 1);
  assert.equal(helpers.attentionQueueOrderLabel("visitors", "newest"), "Latest visit dates first");
});

test("invalid calendar dates, reversed ranges, statuses, urgency and order are blocked before transport", async () => {
  const actual = sourceLoader({ "@/lib/api/client": { api: { get: () => assert.fail("Invalid filters must not send a request") } } })("lib/api/attention-queues.ts");
  for (const query of ["from=2026-02-30", "to=invalid", "from=2026-10-22&to=2026-10-21", "status=UNKNOWN", "urgent=yes", "sort=unknown", "search=" + "x".repeat(201)]) {
    const selected = filters("prayers", query);
    assert.ok(attentionQueueFilterError("prayers", selected));
    await assert.rejects(() => actual.getAttentionQueue("prayers", selected));
  }
  assert.equal(attentionQueueFilterError("prayers", filters("prayers", "from=2028-02-29&to=2028-02-29")), "");
  assert.ok(attentionQueueFilterError("visitors", filters("visitors", "sort=priority")));
});

test("queue adapters read bounded server pages with cancellation and discard unrelated private fields", async () => {
  const calls = [];
  const api = { get: async (url, options) => { calls.push([url, options]); return { data: { data: [{ ...(url.endsWith("prayers") ? prayer : visitor), request: "private-full-request", specialNeedsDetails: "private-support-note", password: "private-credential" }], meta: { page: 2, limit: 10, total: 11, canRecord: false } } }; } };
  const { getAttentionQueue } = sourceLoader({ "@/lib/api/client": { api } })("lib/api/attention-queues.ts");
  const signal = new AbortController().signal;
  for (const kind of ["prayers", "visitors"]) {
    const result = await getAttentionQueue(kind, filters(kind, "status=all&page=2"), signal);
    assert.equal(result.canRecord, false);
    assert.equal(result.total, 11);
    assert.doesNotMatch(JSON.stringify(result), /private-/);
  }
  assert.deepEqual(calls, ["prayers", "visitors"].map((kind) => ["/attention/queues/" + kind, { params: { status: "all", page: 2, limit: 10 }, signal, timeout: 15000, silent: true }]));
  for (const response of [{ data: [], meta: { total: 1, limit: 10, canRecord: true } }, { data: [prayer], meta: { total: 1, limit: 10 } }, { success: false, data: [], meta: { total: 0, limit: 10, canRecord: true } }, { data: [{ ...prayer, requestPreview: "x".repeat(241) }], meta: { total: 1, limit: 10, canRecord: true } }]) {
    api.get = async () => ({ data: response });
    await assert.rejects(() => getAttentionQueue("prayers", filters()));
  }
});

test("queue queries isolate authenticated roles and accounts, avoid stale placeholder rows and forward cancellation", async () => {
  const reads = [];
  const hooks = sourceLoader({ "@tanstack/react-query": { useQuery: (options) => options }, "@/lib/api/attention-queues": { getAttentionQueue: (...args) => reads.push(args) } })("lib/hooks/useAttentionQueue.ts");
  const actor = { id: "1", roles: ["DEACON"] };
  const query = hooks.useAttentionQueue("prayers", filters(), actor);
  assert.equal(query.enabled, true);
  assert.equal(hooks.useAttentionQueue("prayers", filters(), null).enabled, false);
  assert.equal(hooks.useAttentionQueue("prayers", filters(), { ...actor, roles: ["MEDIA"] }).enabled, false);
  assert.equal(hooks.useAttentionQueue("prayers", filters("prayers", "status=invalid"), actor).enabled, false);
  assert.notDeepEqual(query.queryKey, hooks.useAttentionQueue("prayers", filters(), { ...actor, id: "2" }).queryKey);
  assert.notDeepEqual(query.queryKey, hooks.useAttentionQueue("prayers", filters(), { ...actor, roles: ["ROOT"] }).queryKey);
  assert.equal(query.placeholderData, undefined);
  assert.equal(query.refetchOnMount, "always");
  for (const status of [401, 403, 404]) assert.equal(query.retry(0, { response: { status } }), false);
  const signal = new AbortController().signal;
  await query.queryFn({ signal });
  assert.deepEqual(reads, [["prayers", filters(), signal]]);
});

function renderList(kind, records, canRecord = true) {
  const { AttentionQueueList } = sourceLoader({ "@/components/records/RecordActionDialog": { RecordActionDialog: ({ label, title }) => React.createElement("button", { title }, label) } })("components/directories/AttentionQueueList.tsx");
  return renderToStaticMarkup(React.createElement(AttentionQueueList, { kind, records, canRecord, busy: false, onRecord: async () => {} }));
}

test("queue rows preserve identity, escaped text, Malawi dates, sharing preferences and state-appropriate actions", () => {
  const html = renderList("prayers", [prayer]);
  for (const pattern of [/Family &amp; care/, /A &lt;person&gt;/, /A &lt;request&gt;/, /Sharing not requested/, /Urgent/, /Malawi time/, /CAT/, /Read the full request/, /href="\/dashboard\/attention\/7\/prayers"/, /Mark as prayed/]) assert.match(html, pattern);
  assert.doesNotMatch(renderList("prayers", [{ ...prayer, status: "PRAYED_FOR" }]), /<button/);
  assert.doesNotMatch(renderList("prayers", [{ ...prayer, status: "FUTURE_STATUS" }]), /<button/);
  assert.doesNotMatch(renderList("prayers", [prayer], false), /<button/);
  const visits = renderList("visitors", [visitor]);
  for (const pattern of [/21 Oct 2026/, /Support requested/, /href="tel:\+2651234567"/, /href="mailto:fixture%40example.test"/, /Acknowledge/, /href="\/dashboard\/attention\/8\/visitors"/]) assert.match(visits, pattern);
  for (const status of ["CONFIRMED", "COMPLETED", "FUTURE_STATUS"]) assert.doesNotMatch(renderList("visitors", [{ ...visitor, status }]), /<button/);
});

test("queue filters have labelled bounded controls and distinguish received and visit dates", () => {
  const { AttentionQueueFilters } = sourceLoader()("components/directories/AttentionQueueFilters.tsx");
  const render = (kind) => renderToStaticMarkup(React.createElement(AttentionQueueFilters, { kind, filters: filters(kind), pending: false, onApply() {}, onReset() {} }));
  const html = render("prayers");
  for (const pattern of [/for="queue-search"/, /maxLength="200"/, /for="queue-status"/, /for="queue-urgent"/, /Received from/, /CAT/, /Prayed for/, /value="false"/]) assert.match(html, pattern);
  const visits = render("visitors");
  assert.match(visits, /Visit date from/);
  assert.match(visits, /Completed/);
  assert.doesNotMatch(visits, /queue-urgent/);
});

function renderQueue({ kind = "prayers", roles = ["DEACON"], query = "", result = {}, overrides = {} } = {}) {
  const { AttentionQueueClient } = sourceLoader({
    "next/navigation": { useSearchParams: () => new URLSearchParams(query), useRouter: () => ({ push() {} }) },
    "@/app/modules/auth/store/auth.store": { useAuthStore: (selector) => selector({ user: { id: "1", roles } }) },
    "@/lib/hooks/useAttentionQueue": { useAttentionQueue: () => ({ isPending: false, isError: false, isFetching: false, ...result }) },
    "@/app/modules/attention/hooks/useAttentionActions": { useAttentionActions: () => ({ markPrayer: { isPending: false }, markVisitor: { isPending: false } }) },
    ...overrides,
  })("components/directories/AttentionQueueClient.tsx");
  return renderToStaticMarkup(React.createElement(AttentionQueueClient, { kind }));
}

test("queue controllers distinguish permissions, loading, empty, filtered, session and server errors", () => {
  assert.match(renderQueue({ roles: ["MEMBER"] }), /Access unavailable/);
  assert.match(renderQueue({ result: { isPending: true } }), /Loading follow-up queue/);
  assert.match(renderQueue({ result: { data: page() } }), /No requests awaiting prayer/);
  assert.match(renderQueue({ kind: "visitors", result: { data: page() } }), /No visits awaiting welcome/);
  assert.match(renderQueue({ query: "search=missing", result: { data: page() } }), /No matching records/);
  assert.match(renderQueue({ query: "status=invalid" }), /Check your filters/);
  assert.match(renderQueue({ result: { data: page([], 0, false) } }), /link your account to a directory profile/);
  for (const [status, label] of [[401, /Please sign in again/], [403, /Access unavailable/], [500, /Could not load this queue/]]) assert.match(renderQueue({ result: { isError: true, error: { response: { status } } } }), label);
});

test("queue page controls retain filters after records leave open work and never silently clamp unavailable pages", () => {
  const html = renderQueue({ query: "status=all&search=Care&page=2", result: { data: page([prayer], 21) } });
  assert.match(html, /Page 2 of 3/);
  assert.match(html, /search=Care&amp;status=all&amp;page=3/);
  const unavailable = renderQueue({ query: "status=all&search=Care&page=4", result: { data: page([], 21) } });
  assert.match(unavailable, /This page is no longer available/);
  assert.match(unavailable, /search=Care&amp;status=all&amp;page=3/);
});

test("follow-up adapters bound writes and reject mismatched, unsuccessful or unconfirmed status responses", async () => {
  const calls = [];
  const api = { post: async (url, body, options) => { calls.push([url, body, options]); return { data: { success: true, data: { id: "7/8", status: url.endsWith("prayed") ? "PRAYED_FOR" : "COMPLETED" } } }; } };
  const load = sourceLoader({ "@/lib/api/client": { api } });
  const { markPrayer } = load("app/modules/attention/api/markPrayer.ts");
  const { markVisitor } = load("app/modules/attention/api/markVisitor.ts");
  await markPrayer("7/8");
  await markVisitor("7/8");
  assert.deepEqual(calls, [["/attention/prayers/7%2F8/prayed", undefined, { timeout: 30000, silent: true }], ["/attention/visitors/7%2F8/ack", undefined, { timeout: 30000, silent: true }]]);
  for (const data of [{ success: false }, { data: { id: "other", status: "PRAYED_FOR" } }, { data: { id: "7/8", status: "PENDING" } }]) {
    api.post = async () => ({ data });
    await assert.rejects(() => markPrayer("7/8"));
    await assert.rejects(() => markVisitor("7/8"));
  }
});

test("follow-up success and uncertain failures refresh queue, details, dashboard, notifications and history without automatic retries", async () => {
  const client = new QueryClient();
  const hooks = sourceLoader({ "@tanstack/react-query": { useMutation: (options) => options, useQueryClient: () => client }, "../api/markPrayer": {}, "../api/markVisitor": {} })("app/modules/attention/hooks/useAttentionActions.ts");
  const mutations = hooks.useAttentionActions();
  for (const [kind, mutation, key] of [["prayers", mutations.markPrayer, "prayer"], ["visitors", mutations.markVisitor, "visitor"]]) {
    assert.equal(mutation.retry, false);
    const keys = [[kind, "attention-queue", "actor"], [key, "7"], ["attention-overview"], ["attention", "notifications"], ["dashboard-overview", "care", "actor"], ["audit-logs"], ["audit-timeline"]];
    for (const callback of [() => mutation.onSuccess({ data: { id: "7" } }, "7"), () => mutation.onError(new Error("response lost"), "7")]) {
      keys.forEach((queryKey) => client.setQueryData(queryKey, {}));
      await callback();
      keys.forEach((queryKey) => assert.equal(client.getQueryState(queryKey).isInvalidated, true));
    }
  }
  client.clear();
});
