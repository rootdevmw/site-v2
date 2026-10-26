import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { sourceLoader } from "./helpers/load-source.mjs";

const load = sourceLoader();
const { getEventPhase, getPrayerState, getRecordFailure, retryRecordRequest } = load("lib/utils/record-details.ts");
const { normalizeMemberDetails } = load("app/modules/members/utils/member-details.ts");

test("member detail payloads preserve biography, baptism, and real ministry identities", () => {
  const payload = {
    id: "11", firstName: "Test", lastName: "Member", status: "MEMBER", prefix: "BROTHER",
    bio: { bio: "<p>A recorded biography.</p>" }, baptized: true, baptismDate: "2020-01-01T00:00:00Z",
    homecell: { id: "4", name: "Test homecell" },
    ministries: [{ memberId: "11", ministryId: "7", ministry: { id: "7", name: "Test ministry" } }, { ministry: null }],
  };
  const member = normalizeMemberDetails(payload);
  assert.equal(member.bio, "<p>A recorded biography.</p>");
  assert.equal(member.isBaptized, true);
  assert.deepEqual(member.ministries, [{ id: "7", name: "Test ministry" }]);
  assert.equal(member.homecell.id, "4");
  assert.equal(payload.bio.bio, "<p>A recorded biography.</p>");
  assert.deepEqual(normalizeMemberDetails({ ...payload, bio: null, baptized: false, ministries: null }).ministries, []);
  assert.equal(normalizeMemberDetails({ ...payload, baptized: false }).isBaptized, false);
  assert.equal(normalizeMemberDetails({ ...payload, prefix: "ELDER" }).prefix, "PASTOR");
});

test("private detail reads use individual endpoints and normalize nested event relationships", async () => {
  const calls = [];
  const transport = { get: async (url, options) => {
    calls.push({ url, options });
    if (url.startsWith("/attention/prayers/")) return { data: { data: { id: "21", request: "Test request", isUrgent: true, shareWithElders: false } } };
    if (url.startsWith("/members/")) return { data: { data: { id: "11", bio: { bio: "<p>Test biography</p>" }, baptized: true, ministries: [] } } };
    return { data: { data: { id: "31", ministries: [{ eventId: "31", ministry: { id: "8", name: "Test ministry" } }] } } };
  } };
  const loadApi = sourceLoader({ "@/lib/api/client": { api: transport } });
  const signal = new AbortController().signal;
  const prayer = await loadApi("app/modules/attention/api/getPrayer.ts").getPrayer("21", signal);
  const member = await loadApi("app/modules/members/api/getMember.ts").getMember("11", signal);
  const event = await loadApi("app/modules/events/api/getEvent.ts").getEvent("31", signal);
  assert.deepEqual(calls.map(({ url }) => url), ["/attention/prayers/21", "/members/11", "/events/31"]);
  assert.equal(prayer.shareWithElders, false);
  assert.equal(prayer.isUrgent, true);
  assert.equal(member.data.bio, "<p>Test biography</p>");
  assert.deepEqual(event.data.ministries, [{ id: "8", name: "Test ministry" }]);
  for (const { options } of calls) assert.equal(options.signal, signal);
});

test("event state follows start/end boundaries and rejects incomplete schedules", () => {
  const start = "2026-10-21T07:00:00Z";
  const end = "2026-10-21T09:00:00Z";
  assert.equal(getEventPhase(start, end, Date.parse(start) - 1).label, "Upcoming");
  assert.equal(getEventPhase(start, end, Date.parse(start)).label, "In progress");
  assert.equal(getEventPhase(start, end, Date.parse(end)).label, "Past event");
  assert.equal(getEventPhase(end, start).label, "Date to confirm");
  assert.equal(getEventPhase("", end).label, "Date to confirm");
});

test("completed or unknown prayer statuses cannot be marked as prayed again", () => {
  assert.equal(getPrayerState("PENDING").canMarkPrayed, true);
  assert.equal(getPrayerState("REVIEWED").canMarkPrayed, true);
  assert.equal(getPrayerState("PRAYED_FOR").label, "Prayed for");
  assert.equal(getPrayerState("PRAYED_FOR").canMarkPrayed, false);
  assert.equal(getPrayerState("UNRECOGNIZED").canMarkPrayed, false);
});

test("record errors distinguish unavailable, missing, and unauthorized data", () => {
  assert.equal(getRecordFailure({ response: { status: 404 } }), "missing");
  assert.equal(getRecordFailure({ response: { status: 403 } }), "forbidden");
  assert.equal(getRecordFailure({ response: { status: 401 } }), "session");
  assert.equal(getRecordFailure(new Error("Connection refused")), "error");
  for (const status of [401, 403, 404]) assert.equal(retryRecordRequest(0, { response: { status } }), false);
  assert.equal(retryRecordRequest(0, new Error("Network")), true);
  assert.equal(retryRecordRequest(1, new Error("Network")), false);
});

test("prayer completion updates the record and invalidates queue/notification caches", () => {
  const client = new QueryClient();
  const pending = { id: "21", status: "PENDING" };
  client.setQueryData(["prayer", "21"], pending);
  client.setQueryData(["prayers"], [pending]);
  client.setQueryData(["attention-overview"], { prayers: [pending] });
  client.setQueryData(["attention", "notifications"], { prayers: [pending] });
  const loadHook = sourceLoader({
    "@tanstack/react-query": { useQueryClient: () => client, useMutation: (options) => options },
    "@/lib/api/client": { api: {} },
  });
  const actions = loadHook("app/modules/attention/hooks/useAttentionActions.ts").useAttentionActions();
  const completed = { ...pending, status: "PRAYED_FOR" };
  actions.markPrayer.onSuccess({ data: completed }, "21");
  assert.deepEqual(client.getQueryData(["prayer", "21"]), completed);
  for (const key of [["prayers"], ["attention-overview"], ["attention", "notifications"]]) assert.equal(client.getQueryState(key).isInvalidated, true);
  actions.markPrayer.onError(new Error("Response lost"), "21");
  assert.equal(client.getQueryState(["prayer", "21"]).isInvalidated, true);
  client.clear();
});

test("record views render related links, correct edit routes, and private request preferences", () => {
  const { MemberRecordView } = load("components/records/MemberRecordView.tsx");
  const { EventRecordView } = load("components/records/EventRecordView.tsx");
  const { PrayerRecordView } = load("components/records/PrayerRecordView.tsx");
  const member = normalizeMemberDetails({ id: "11", firstName: "Test", lastName: "Member", status: "MEMBER", prefix: "BROTHER", homecell: { id: "4", name: "Test homecell" }, ministries: [{ ministry: { id: "7", name: "Test ministry" } }] });
  const memberHtml = renderToStaticMarkup(React.createElement(MemberRecordView, { member }));
  assert.match(memberHtml, /href="\/dashboard\/members\/11\/edit"/);
  assert.match(memberHtml, /href="\/dashboard\/homecells\/4"/);
  assert.match(memberHtml, /href="\/dashboard\/ministries\/7"/);
  assert.match(memberHtml, /No biography has been added/);
  const eventHtml = renderToStaticMarkup(React.createElement(EventRecordView, { event: { id: "31", title: "Test gathering", slug: "test-gathering", startTime: "2026-10-21T07:00:00Z", endTime: "2026-10-21T09:00:00Z" }, now: Date.parse("2026-10-20T00:00:00Z") }));
  assert.match(eventHtml, /href="\/dashboard\/events\/31\/edit"/);
  assert.match(eventHtml, /href="\/events\/test-gathering"/);
  assert.match(eventHtml, /Upcoming/);
  assert.match(eventHtml, /Malawi \(CAT\)/);
  assert.match(eventHtml, /No ministries are linked/);
  const prayerHtml = renderToStaticMarkup(React.createElement(PrayerRecordView, { prayer: { id: "21", name: "", prayerFor: "MYSELF", request: "Please pray.\n<script>alert('test')</script>", status: "PENDING", isUrgent: true, shareWithElders: false, createdAt: "2026-10-21T22:30:00Z" }, followUpAction: null }));
  assert.match(prayerHtml, /Anonymous request/);
  assert.match(prayerHtml, /Urgent/);
  assert.match(prayerHtml, /Share with elders<\/dt><dd>No<\/dd>/);
  assert.match(prayerHtml, /22 October 2026/);
  assert.ok(prayerHtml.includes("&lt;script&gt;"));
  assert.ok(!prayerHtml.includes("<script>"));
  assert.match(prayerHtml, /No contact information was shared/);
});
