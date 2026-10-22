import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { PassThrough } from "node:stream";
import { renderToPipeableStream, renderToStaticMarkup } from "react-dom/server";
import { sourceLoader } from "./helpers/load-source.mjs";

const helpers = sourceLoader()("lib/utils/public-events.ts");
const now = Date.parse("2026-10-22T09:00:00Z");
const event = {
  id: "11",
  slug: "community-gathering",
  title: "Faith & friendship",
  startTime: "2099-10-22T08:00:00Z",
  endTime: "2099-10-22T11:00:00Z",
  location: "Church hall",
  type: {
    id: "2",
    name: "Fellowship",
    deletedAt: null,
    private: "PRIVATE_TYPE",
  },
  description:
    '<h1>Welcome together</h1><p>Share <strong>friendship</strong>. <a href="javascript:bad">Read this</a></p><script>PRIVATE_SCRIPT</script>',
  ministries: [
    {
      id: "4",
      slug: "care",
      name: "Care & service",
      members: [{ phone: "PRIVATE_PHONE" }],
    },
  ],
  isCritical: true,
  createdAt: "PRIVATE_TIMESTAMP",
};
const filters = { page: 1, q: "", period: "upcoming" };
const response = (data = [event], total = data.length) => ({
  success: true,
  data,
  meta: { page: 1, limit: 6, total, totalPages: Math.ceil(total / 6) },
});
const presentation = {
  "next/link": ({ children, ...props }) =>
    React.createElement("a", props, children),
};
const navigation = {
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
  redirect: (href) => {
    throw new Error("REDIRECT " + href);
  },
  permanentRedirect: (href) => {
    throw new Error("PERMANENT " + href);
  },
};
function directoryFixture(action = async () => response()) {
  const calls = [];
  const view = sourceLoader({
    ...presentation,
    "next/navigation": navigation,
    "@/lib/public-api/events": {
      getPublicEvents: async (...args) => {
        calls.push(args);
        return action();
      },
    },
  })("components/public/events/EventDirectory.tsx");
  return { ...view, calls };
}
function detailFixture(
  result = {
    state: "ready",
    event: helpers.parsePublicEvent(event),
    checkedAt: now,
  },
) {
  return sourceLoader({
    ...presentation,
    "next/navigation": navigation,
    "@/lib/public-api/event-details": { loadPublicEvent: async () => result },
  })("components/public/events/EventDetails.tsx");
}

test("event query and return links normalize duplicate/malformed values and preserve only local event filters", () => {
  const chosen = helpers.readEventFilters({
    page: "3",
    q: " hall & friends ",
    period: "past",
  });
  assert.deepEqual(chosen, { page: 3, q: "hall & friends", period: "past" });
  const href = helpers.eventsHref(chosen);
  assert.equal(href, "/events?page=3&q=hall+%26+friends&period=past");
  assert.equal(
    helpers.eventsHref(chosen, { page: 1, q: "", period: "upcoming" }),
    "/events",
  );
  assert.equal(helpers.eventsReturnHref(href + "&admin=true"), href);
  for (const value of [
    "https://evil.test/events",
    "//evil.test/events",
    "/events/one",
    "/dashboard",
    "/events\\other",
    [href],
  ])
    assert.equal(helpers.eventsReturnHref(value), "/events");
  assert.equal(
    helpers.eventsReturnHref("/events?page=2&page=3&period=past"),
    "/events?period=past",
  );
  assert.deepEqual(
    helpers.readEventFilters({
      page: ["2", "3"],
      q: ["one", "two"],
      period: ["past", "upcoming"],
    }),
    filters,
  );
  for (const page of ["0", "-1", "1.5", "1000001", "Infinity"])
    assert.equal(helpers.readEventFilters({ page }).page, 1);
  assert.equal(helpers.readEventFilters({ q: "x".repeat(300) }).q.length, 200);
  assert.equal(
    helpers.eventHref("name / ?", href),
    "/events/name%20%2F%20%3F?" + new URLSearchParams({ from: href }),
  );
});
test("event projection removes private fields, archived relationships and duplicate ministries", () => {
  const parsed = helpers.parsePublicEvent({
    ...event,
    type: { ...event.type, deletedAt: "2026-01-01" },
    ministries: [
      { ministry: event.ministries[0] },
      event.ministries[0],
      { ...event.ministries[0], id: "5", deletedAt: "2026-01-01" },
    ],
  });
  assert.equal(parsed.type, null);
  assert.deepEqual(parsed.ministries, [
    { id: "4", name: "Care & service", slug: "care" },
  ]);
  assert.doesNotMatch(
    JSON.stringify(parsed),
    /PRIVATE_PHONE|isCritical|createdAt|members/,
  );
  assert.throws(() =>
    helpers.parsePublicEvent({ ...event, deletedAt: "2026-01-01" }),
  );
  for (const changes of [
    { startTime: "2026-02-30T08:00:00Z" },
    { startTime: "2026-10-22T08:00:00" },
    { endTime: event.startTime },
    { endTime: "2000-01-01T00:00:00Z" },
  ])
    assert.throws(() => helpers.parsePublicEvent({ ...event, ...changes }));
  assert.throws(() =>
    helpers.publicEventPage({ ...response(), success: false }),
  );
  assert.throws(() => helpers.publicEventPage({ ...response(), meta: {} }));
});
test("event status uses both exact instants, retaining ongoing events through their end boundary", () => {
  const current = helpers.parsePublicEvent({
    ...event,
    startTime: "2026-10-22T08:00:00Z",
    endTime: "2026-10-22T10:00:00Z",
  });
  assert.equal(helpers.eventState(current, now), "ongoing");
  assert.equal(
    helpers.eventState(current, Date.parse(current.startTime) - 1),
    "upcoming",
  );
  assert.equal(
    helpers.eventState(current, Date.parse(current.endTime)),
    "past",
  );
});
test("event transports forward bounded filters, abort signals and encoded individual addresses", async () => {
  const calls = [],
    signal = new AbortController().signal;
  const api = sourceLoader({
    "./client": {
      publicApi: async (...args) => {
        calls.push(args);
        return response();
      },
    },
  })("lib/public-api/events.ts");
  await api.getPublicEvents(
    { page: 2, limit: 6, search: "care & hope", period: "past" },
    { signal },
  );
  assert.equal(
    calls[0][0],
    "/events?page=2&limit=6&search=care+%26+hope&period=past",
  );
  assert.equal(calls[0][1].signal, signal);
  await api.getPublicEventBySlug("title / ?", { signal });
  assert.equal(calls[1][0], "/events/title%20%2F%20%3F");
  await api.getPublicEvent("12", { signal });
  assert.equal(calls[2][0], "/events/12");
  await api.getPublicEvents({ startDate: "2026-10-22" });
  assert.match(calls[3][0], /startDate=2026-10-22/);
});
test("event detail loading distinguishes unavailable/malformed feeds from missing and archived records", async () => {
  let action = async () => response(),
    options;
  const load = sourceLoader({
    react: { ...React, cache: (fn) => fn },
    "./events": {
      getPublicEventBySlug: async (_slug, settings) => {
        options = settings;
        return action();
      },
    },
  });
  const { loadPublicEvent } = load("lib/public-api/event-details.ts"),
    { PublicApiError } = load("lib/public-api/client.ts");
  action = async () => ({ data: event });
  const ready = await loadPublicEvent(event.slug);
  assert.equal(ready.state, "ready");
  assert.ok(Number.isFinite(ready.checkedAt));
  assert.ok(options.signal instanceof AbortSignal);
  for (const [run, state] of [
    [async () => ({ data: null }), "missing"],
    [async () => ({ data: { ...event, deletedAt: "2026-01-01" } }), "missing"],
    [
      async () => {
        throw new PublicApiError(404);
      },
      "missing",
    ],
    [
      async () => {
        throw new PublicApiError(410);
      },
      "missing",
    ],
    [async () => ({ success: false, data: event }), "unavailable"],
    [async () => ({ data: {} }), "unavailable"],
    [
      async () => {
        throw new Error("PRIVATE_ERROR");
      },
      "unavailable",
    ],
  ]) {
    action = run;
    assert.equal((await loadPublicEvent("fixture")).state, state);
  }
});
test("event results search using API totals and keep period/search across pagination and event return links", async () => {
  const fixture = directoryFixture(async () => response([event], 19));
  const chosen = { page: 2, q: "church hall", period: "past" };
  const html = renderToStaticMarkup(
    await fixture.EventResults({ filters: chosen }),
  );
  assert.match(html, /19 past events matching your search/);
  assert.match(
    html,
    /href="\/events\?page=3&amp;q=church\+hall&amp;period=past"/,
  );
  const recordLink = html.match(
    /href="(\/events\/community-gathering[^\"]*)"/,
  )[1];
  assert.equal(
    new URL(
      recordLink.replace(/&amp;/g, "&"),
      "https://church.test",
    ).searchParams.get("from"),
    "/events?page=2&q=church+hall&period=past",
  );
  assert.equal(fixture.calls[0][0].period, "past");
  assert.equal(fixture.calls[0][0].search, "church hall");
  assert.equal(fixture.calls[0][0].limit, 6);
  assert.ok(fixture.calls[0][1].signal instanceof AbortSignal);
  assert.doesNotMatch(html, /PRIVATE_|javascript:|<script/);
});
test("event empty, filtered, unavailable and out-of-range pages retain useful recovery journeys", async () => {
  for (const [action, chosen, expected] of [
    [async () => response([]), filters, /No upcoming events/],
    [
      async () => response([]),
      { ...filters, period: "past" },
      /No past events/,
    ],
    [async () => response([]), { ...filters, q: "missing" }, /No events match/],
    [
      async () => {
        throw new Error("PRIVATE_FAILURE");
      },
      { ...filters, q: "care", period: "past" },
      /event list could not load/,
    ],
  ]) {
    const fixture = directoryFixture(action);
    const html = renderToStaticMarkup(
      await fixture.EventResults({ filters: chosen }),
    );
    assert.match(html, expected);
    assert.doesNotMatch(html, /PRIVATE_FAILURE/);
    assert.match(html, /Contact the church|Talk to the church|Clear search/);
    if (/could not/.test(html)) {
      assert.match(html, /name="q" value="care"/);
      assert.match(html, /name="period" value="past"/);
    }
  }
  await assert.rejects(
    () =>
      directoryFixture(async () => response([])).EventResults({
        filters: { ...filters, page: 5, q: "care", period: "past" },
      }),
    /REDIRECT \/events\?q=care&period=past/,
  );
});
test("event cards present Malawi dates across midnight, clean excerpts, missing venues and safe independent links", () => {
  const { EventCard } = directoryFixture();
  const parsed = helpers.parsePublicEvent({
    ...event,
    location: null,
    startTime: "2026-10-22T22:30:00Z",
    endTime: "2026-10-23T01:00:00Z",
  });
  const html = renderToStaticMarkup(
    React.createElement(EventCard, { event: parsed, filters, now }),
  );
  assert.match(html, />23<\/span>/);
  assert.match(html, /Friday/);
  assert.match(html, /CAT/);
  assert.match(html, /Ask the church team about the venue/);
  assert.doesNotMatch(html, /PRIVATE_|<a\b[^>]*>(?:(?!<\/a>)[\s\S])*<a\b/);
});
test("individual event journeys sanitize server text and show real dates, ministries, sharing, calendar and enquiries", async () => {
  const view = detailFixture();
  const html = renderToStaticMarkup(
    await view.EventDetails({
      address: event.slug,
      from: "/events?page=3&q=care&period=past",
    }),
  );
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
  assert.match(html, /<h2>Welcome together<\/h2>/);
  assert.match(html, /<strong>friendship<\/strong>/);
  assert.match(html, /href="\/ministries\/care"/);
  assert.match(html, /href="\/events\/community-gathering\/calendar"/);
  assert.match(html, /All times are local to Malawi/);
  assert.match(html, /Share this event/);
  assert.match(html, /href="\/events\?page=3&amp;q=care&amp;period=past"/);
  assert.doesNotMatch(html, /PRIVATE_|javascript:|ProseMirror|<main[ >]/);
  assert.equal((await view.eventMetadata(event.slug)).title, event.title);
});
test("past events and absent descriptions or venues give honest next steps without upcoming-event actions", async () => {
  const parsed = helpers.parsePublicEvent({
    ...event,
    startTime: "2020-01-01T08:00:00Z",
    endTime: "2020-01-01T09:00:00Z",
    location: null,
    description: null,
    ministries: [],
  });
  const html = renderToStaticMarkup(
    await detailFixture({
      state: "ready",
      event: parsed,
      checkedAt: now,
    }).EventDetails({ address: parsed.slug }),
  );
  assert.match(html, /This gathering has ended/);
  assert.match(html, /A fuller description has not been added/);
  assert.match(html, /The venue has not been added/);
  assert.match(html, /Find upcoming events/);
  assert.doesNotMatch(html, /Add to calendar|Connected ministries|Don't miss/);
});
test("missing, unavailable and numeric legacy details keep separate responses and safe return destinations", async () => {
  await assert.rejects(
    () =>
      detailFixture({ state: "missing" }).EventDetails({ address: "missing" }),
    /NOT_FOUND/,
  );
  const failed = detailFixture({ state: "unavailable" });
  const html = renderToStaticMarkup(
    await failed.EventDetails({ address: "failed", from: "https://evil.test" }),
  );
  assert.match(html, /This event could not load/);
  assert.match(html, /href="\/events"/);
  assert.match(html, /Try again/);
  assert.equal((await failed.eventMetadata("failed")).robots.index, false);
  await assert.rejects(
    () =>
      detailFixture().EventDetails({
        address: event.id,
        from: "/events?page=2&period=past",
      }),
    /PERMANENT \/events\/community-gathering\?from=%2Fevents%3Fpage%3D2%26period%3Dpast/,
  );
  const url = new URL(
    helpers.eventEnquiryHref(helpers.parsePublicEvent(event)),
  );
  assert.equal(
    url.origin + url.pathname,
    sourceLoader()("config/church.ts").church.whatsappUrl,
  );
  assert.match(url.searchParams.get("text"), /Faith & friendship/);
});
test("calendar files preserve UTC instants and stable identity, escape injected lines and fold UTF-8 without splitting characters", () => {
  const { eventCalendar } = sourceLoader()("lib/utils/event-calendar.ts");
  const modified = helpers.parsePublicEvent({
    ...event,
    title: "Welcome, friends; \\ hope\r\nATTENDEE:evil " + "é🙂".repeat(50),
    location: "Hall\nBEGIN:VEVENT",
    description: "<p>Bring joy.</p><script>PRIVATE_SCRIPT</script>",
  });
  const calendar = eventCalendar(modified, now),
    unfolded = calendar.replace(/\r\n /g, "");
  assert.equal((calendar.match(/^BEGIN:VEVENT$/gm) || []).length, 1);
  assert.match(unfolded, /DTSTART:20991022T080000Z\r\nDTEND:20991022T110000Z/);
  assert.match(
    unfolded,
    /SUMMARY:Welcome\\, friends\\; \\\\ hope\\nATTENDEE:evil/,
  );
  assert.match(unfolded, /LOCATION:Hall\\nBEGIN:VEVENT/);
  assert.match(unfolded, /DESCRIPTION:Bring joy\./);
  assert.doesNotMatch(
    calendar,
    /PRIVATE_|\uFFFD|<p>|^ATTENDEE:|^BEGIN:VALARM/gm,
  );
  for (const line of calendar.split("\r\n"))
    assert.ok(Buffer.byteLength(line, "utf8") <= 75);
  assert.ok(calendar.endsWith("END:VCALENDAR\r\n"));
  const second = eventCalendar(
    { ...modified, title: "Changed title" },
    now + 10000,
  );
  assert.equal(unfolded.match(/UID:(.*)/)[1], second.match(/UID:(.*)/)[1]);
});
test("calendar route downloads the public record and returns explicit missing or temporary errors without caching", async () => {
  let result = {
      state: "ready",
      event: helpers.parsePublicEvent(event),
      checkedAt: now,
    },
    address;
  const { GET } = sourceLoader({
    "@/lib/public-api/event-details": {
      loadPublicEvent: async (slug) => {
        address = slug;
        return result;
      },
    },
  })("app/(public)/events/[id]/calendar/route.ts");
  const request = new Request("https://church.test/events/11/calendar");
  const response = await GET(request, {
    params: Promise.resolve({ id: "11" }),
  });
  assert.equal(address, "11");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/calendar/);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(
    response.headers.get("content-disposition"),
    'attachment; filename="red-cross-event.ics"',
  );
  assert.match(await response.text(), /SUMMARY:Faith & friendship/);
  for (const [state, code] of [
    ["missing", 404],
    ["unavailable", 503],
  ]) {
    result = { state };
    const failed = await GET(request, {
      params: Promise.resolve({ id: "missing" }),
    });
    assert.equal(failed.status, code);
    assert.doesNotMatch(await failed.text(), /PRIVATE_|BEGIN:VCALENDAR/);
  }
});
test("a pending event feed leaves the welcome, search, shared service schedule and visit journeys available", async () => {
  let release;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  const { EventDirectory } = directoryFixture(() => pending);
  const target = new PassThrough();
  let html = "",
    stream;
  target.on("data", (chunk) => {
    html += chunk.toString();
  });
  const finished = new Promise((resolve, reject) => {
    target.on("end", resolve);
    target.on("error", reject);
  });
  await new Promise((resolve, reject) => {
    stream = renderToPipeableStream(
      React.createElement(EventDirectory, { filters }),
      {
        onShellReady: () => {
          stream.pipe(target);
          resolve();
        },
        onShellError: reject,
        onError: reject,
      },
    );
  });
  try {
    assert.match(html, /Faith, friendship/);
    assert.match(html, /name="q"/);
    assert.match(html, /name="period"/);
    assert.match(html, /last Sunday of each month/);
    assert.match(html.replace(/<!--[\s\S]*?-->/g, ""), /Chichewa service/);
    assert.match(html, /href="\/plan-visit"/);
  } finally {
    release(response());
    await finished;
  }
  assert.match(html, /Faith &amp; friendship/);
});
