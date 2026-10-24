import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { sourceLoader } from "./helpers/load-source.mjs";

const load = sourceLoader();
const helpers = load("lib/utils/dashboard-overview.ts");
const { dashboardSchemas, getDashboardActions, getDashboardIntroduction, getDashboardWorkspaces } = helpers;
const generatedAt = "2026-10-21T08:30:00Z";
const care = { generatedAt, prayers: 5, urgentPrayers: 2, visitors: 3 };
const planning = { generatedAt, today: "2026-10-21", events: { total: 4, items: [{ id: "7", title: "A <gathering>", startTime: "2026-10-21T07:00:00Z", endTime: "2026-10-21T09:00:00Z", location: "Church" }] }, programs: { total: 6, items: [{ id: "8", date: "2026-10-20T22:00:00Z", location: null, type: { name: "Sunday worship" }, homecell: { name: "Test group" } }] } };
const publishing = { generatedAt, messageDrafts: 4, publicationDrafts: 0, selectedLive: { total: 1, items: [{ id: "9", title: "Sunday <broadcast>" }] } };

test("workspace routes follow the configured hierarchy and never expose ROOT or ADMIN navigation to lower roles", () => {
  const { navigation } = load("config/navigation.ts");
  const before = JSON.stringify(navigation);
  const hrefs = (roles) => getDashboardWorkspaces(roles).flatMap((group) => group.links.map((link) => link.href));
  const media = hrefs(["MEDIA"]);
  assert.ok(media.includes("/dashboard/content-types"));
  assert.ok(media.includes("/dashboard/streams"));
  assert.ok(!media.some((href) => /members|attention|programs|users|roles|audit/.test(href)));
  const admin = hrefs(["ADMIN"]);
  assert.ok(admin.includes("/dashboard/users"));
  assert.ok(admin.includes("/dashboard/audit"));
  assert.ok(!admin.includes("/dashboard/roles"));
  assert.ok(hrefs(["ROOT"]).includes("/dashboard/roles"));
  for (const role of ["MEMBER", "VISITOR"]) assert.deepEqual(hrefs([role]), ["/dashboard/settings/change-password"]);
  assert.deepEqual(hrefs(["UNKNOWN"]), []);
  assert.equal(new Set(admin).size, admin.length);
  assert.equal(JSON.stringify(navigation), before);
});

test("quick starts reflect pastoral, publishing and member journeys with valid existing routes", () => {
  assert.equal(getDashboardActions(["DEACON"])[0].href, "/dashboard/attention/prayers");
  assert.ok(getDashboardActions(["ADMIN"]).some(({ href }) => href === "/dashboard/users"));
  assert.equal(getDashboardActions(["MEDIA"])[0].href, "/dashboard/content/new");
  assert.ok(getDashboardActions(["MEDIA"]).some(({ href }) => href === "/dashboard/content?status=Draft"));
  for (const role of ["MEMBER", "VISITOR", "UNKNOWN"]) {
    assert.ok(getDashboardActions([role]).some(({ href }) => href === "/live"));
    assert.ok(!getDashboardActions([role]).some(({ href }) => /attention|content\/new|users/.test(href)));
  }
  assert.match(getDashboardIntroduction(["MEDIA"]), /resources/);
  assert.match(getDashboardIntroduction(["DEACON"]), /Care for people/);
});

test("actual summary adapters use bounded authenticated reads and strip unrelated sensitive fields before caching", async () => {
  const calls = [];
  const data = { care: { ...care, request: "fixture-private-prayer", email: "fixture-contact" }, planning: { ...planning, events: { ...planning.events, items: [{ ...planning.events.items[0], description: "fixture-long-body" }] } }, publishing: { ...publishing, selectedLive: { total: 1, items: [{ ...publishing.selectedLive.items[0], secret: "fixture-provider-key" }] } } };
  const { getDashboardSection } = sourceLoader({ "@/lib/api/client": { api: { get: async (url, options) => { calls.push([url, options]); return { data: { success: true, data: data[url.split("/").at(-1)] } }; } } } })("lib/api/dashboard-overview.ts");
  const signal = new AbortController().signal;
  for (const section of ["care", "planning", "publishing"]) assert.doesNotMatch(JSON.stringify(await getDashboardSection(section, signal)), /fixture-/);
  assert.deepEqual(calls, ["care", "planning", "publishing"].map((section) => ["/dashboard/overview/" + section, { signal, timeout: 15000, silent: true }]));
});

test("summary schemas preserve real zeroes and reject missing, impossible or unbounded responses", () => {
  assert.equal(dashboardSchemas.care.parse({ ...care, prayers: 0, urgentPrayers: 0, visitors: 0 }).prayers, 0);
  for (const invalid of [{}, { ...care, visitors: -1 }, { ...care, prayers: 1.5 }, { ...care, urgentPrayers: 6 }]) assert.equal(dashboardSchemas.care.safeParse(invalid).success, false);
  assert.equal(dashboardSchemas.planning.safeParse({ ...planning, events: { total: 4, items: Array(4).fill(planning.events.items[0]) } }).success, false);
  assert.equal(dashboardSchemas.planning.safeParse({ ...planning, programs: { total: 0, items: planning.programs.items } }).success, false);
  assert.equal(dashboardSchemas.publishing.safeParse({ ...publishing, selectedLive: { total: 0, items: publishing.selectedLive.items } }).success, false);
});

test("queries isolate accounts and roles, disable unauthorized reads and refresh summaries on return, focus and active polling", () => {
  const { useDashboardSection: queryOptions } = sourceLoader({ "@tanstack/react-query": { useQuery: (options) => options }, "@/lib/api/dashboard-overview": {} })("lib/hooks/useDashboardOverview.ts");
  for (const role of ["ROOT", "ADMIN", "PASTOR", "DEACON", "MEDIA", "MEMBER", "VISITOR", "UNKNOWN"]) {
    const user = { id: "1", roles: [role] };
    assert.equal(queryOptions("care", user).enabled, ["ROOT", "ADMIN", "PASTOR", "DEACON"].includes(role));
    assert.equal(queryOptions("planning", user).enabled, ["ROOT", "ADMIN", "PASTOR", "DEACON"].includes(role));
    assert.equal(queryOptions("publishing", user).enabled, ["ROOT", "ADMIN", "PASTOR", "DEACON", "MEDIA"].includes(role));
  }
  assert.equal(queryOptions("care", null).enabled, false);
  const query = queryOptions("care", { id: "1", roles: ["ADMIN"] });
  assert.notDeepEqual(query.queryKey, queryOptions("care", { id: "2", roles: ["ADMIN"] }).queryKey);
  assert.notDeepEqual(query.queryKey, queryOptions("care", { id: "1", roles: ["MEMBER"] }).queryKey);
  assert.equal(query.refetchOnMount, "always");
  assert.equal(query.refetchOnWindowFocus({ state: { error: null } }), "always");
  assert.equal(query.refetchInterval({ state: { error: null } }), 60000);
  for (const status of [401, 403]) {
    assert.equal(query.refetchInterval({ state: { error: { response: { status } } } }), false);
    assert.equal(query.refetchOnWindowFocus({ state: { error: { response: { status } } } }), false);
  }
  assert.equal(query.placeholderData, undefined);
  for (const status of [401, 403, 404]) assert.equal(query.retry(0, { response: { status } }), false);
  assert.equal(query.retry(0, new Error("offline")), true);
  assert.equal(query.retry(1, new Error("offline")), false);
});

test("pastoral summary distinguishes urgent subsets and genuine zero workload without exposing private request details", () => {
  const { CareSummary } = load("components/overview/OverviewSummaries.tsx");
  const html = renderToStaticMarkup(React.createElement(CareSummary, { data: care }));
  for (const pattern of [/Awaiting prayer/, /Urgent requests/, /Visitors to welcome/, /Within the open prayer requests/, /href="\/dashboard\/attention\/visitors"/]) assert.match(html, pattern);
  assert.doesNotMatch(html, /mailto:|tel:|fixture-private/);
  assert.match(renderToStaticMarkup(React.createElement(CareSummary, { data: { ...care, prayers: 0, urgentPrayers: 0, visitors: 0 } })), /No open prayer requests/);
});

test("planning previews show Malawi schedules, genuine record links and bounded totals without invented program start times", () => {
  const { PlanningSummary } = load("components/overview/OverviewSummaries.tsx");
  const html = renderToStaticMarkup(React.createElement(PlanningSummary, { data: planning }));
  for (const pattern of [/A &lt;gathering&gt;/, /In progress/, /09:00 CAT/, /21 Oct 2026/, /Test group/, /Program #8/, /4 ongoing or upcoming/, /6 from 21 Oct/, /href="\/dashboard\/events\/7"/, /href="\/dashboard\/programs\/8"/, /fromDate=2026-10-21/, /up to three records/]) assert.match(html, pattern);
  const empty = renderToStaticMarkup(React.createElement(PlanningSummary, { data: { ...planning, events: { total: 0, items: [] }, programs: { total: 0, items: [] } } }));
  assert.match(empty, /No ongoing or upcoming events/);
  assert.match(empty, /No programs are recorded/);
});

test("publishing summary distinguishes draft counts and configured live selection, including zero and multiple selections", () => {
  const { PublishingSummary } = load("components/overview/OverviewSummaries.tsx");
  const html = renderToStaticMarkup(React.createElement(PublishingSummary, { data: publishing }));
  for (const pattern of [/Sunday &lt;broadcast&gt;/, /status=Draft/, /href="\/dashboard\/streams\/9"/, /1 selected live/, /does not confirm whether/]) assert.match(html, pattern);
  assert.doesNotMatch(html, /<iframe|autoplay/);
  assert.match(renderToStaticMarkup(React.createElement(PublishingSummary, { data: { ...publishing, selectedLive: { total: 0, items: [] } } })), /No stream is selected live/);
  assert.match(renderToStaticMarkup(React.createElement(PublishingSummary, { data: { ...publishing, selectedLive: { total: 4, items: publishing.selectedLive.items } } })), /More than one stream is selected/);
});

function renderOverview({ roles = ["DEACON"], sections = {} } = {}) {
  const calls = [];
  const { DashboardOverview } = sourceLoader({
    "@/app/modules/auth/store/auth.store": { useAuthStore: (selector) => selector({ user: { id: "1", email: "long+<account>@example.test", roles } }) },
    "@/lib/hooks/useDashboardOverview": { useDashboardSection: (section, user) => { calls.push([section, user.roles]); return { isPending: false, isError: false, isFetching: false, error: null, refetch() {}, data: { care, planning, publishing }[section], ...sections[section] }; } },
  })("components/overview/DashboardOverview.tsx");
  return { html: renderToStaticMarkup(React.createElement(DashboardOverview)), calls };
}

test("overview presents only permitted work while keeping member and visitor dashboards useful", () => {
  const media = renderOverview({ roles: ["MEDIA"] }).html;
  assert.match(media, /Messages &amp; broadcasts/);
  assert.doesNotMatch(media, /Care &amp; follow-up|Prepare for gatherings|href="\/dashboard\/users"/);
  const admin = renderOverview({ roles: ["ADMIN"] }).html;
  assert.match(admin, /Care &amp; follow-up/);
  assert.match(admin, /Prepare for gatherings/);
  assert.match(admin, /href="\/dashboard\/users"/);
  assert.doesNotMatch(admin, /href="\/dashboard\/roles"/);
  assert.match(renderOverview({ roles: ["ROOT"] }).html, /href="\/dashboard\/roles"/);
  for (const role of ["MEMBER", "VISITOR"]) {
    const html = renderOverview({ roles: [role] }).html;
    assert.match(html, /Sunday at Red Cross/);
    assert.match(html, /7:00 AM/);
    assert.match(html, /last Sunday of each month/);
    assert.match(html, /long\+&lt;account&gt;@example.test/);
    assert.match(html, /href="\/dashboard\/settings\/change-password"/);
    assert.doesNotMatch(html, /Care &amp; follow-up|Messages &amp; broadcasts|href="\/dashboard\/members"/);
  }
});

test("one failed or loading panel leaves other summaries and navigation available and never displays failed data as zero", () => {
  const failed = renderOverview({ sections: { care: { isError: true, error: new Error("offline") } } }).html;
  assert.match(failed, /This summary is unavailable/);
  assert.doesNotMatch(failed, /Awaiting prayer|Visitors to welcome/);
  assert.match(failed, /A &lt;gathering&gt;/);
  assert.match(failed, /Message drafts/);
  assert.match(failed, /Your workspaces/);
  const loading = renderOverview({ sections: { care: { isPending: true, data: undefined } } }).html;
  assert.match(loading, /Loading care &amp; follow-up/);
  assert.doesNotMatch(loading, /Awaiting prayer/);
  for (const [status, label] of [[401, /Please sign in again/], [403, /Access unavailable/]]) assert.match(renderOverview({ sections: { care: { isError: true, error: { response: { status } } } } }).html, label);
  assert.match(renderOverview({ sections: { publishing: { isFetching: true } } }).html, /Refreshing · last checked/);
});
