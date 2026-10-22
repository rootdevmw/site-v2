import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { PassThrough } from "node:stream";
import { renderToPipeableStream, renderToStaticMarkup } from "react-dom/server";
import { sourceLoader } from "./helpers/load-source.mjs";

const helpers = sourceLoader()("lib/utils/public-groups.ts");
const person = {
  id: "7",
  firstName: " Test ",
  lastName: " Person ",
  imageUrl: "javascript:bad",
  bio: { bio: "<p>Prayer &amp; care.</p><script>PRIVATE_SCRIPT</script>" },
  phone: "PRIVATE_PHONE",
  userId: "PRIVATE_USER",
  location: "PRIVATE_LOCATION",
};
const event = {
  id: "21",
  slug: "community-gathering",
  title: "Community gathering",
  startTime: "2099-10-22T08:00:00Z",
  endTime: "2099-10-22T10:00:00Z",
  location: "Church hall",
};
const program = {
  id: "31",
  slug: "homecell-prayers",
  date: "2099-10-22T22:00:00Z",
  location: "Group venue",
  type: { name: "Homecell prayers" },
};
const ministry = {
  id: "2",
  slug: "care-and-service",
  name: "Care & service",
  purpose: "Growing through service",
  description:
    '<h1>Our shared purpose</h1><p>Serve <strong>together</strong>. <a href="/contact">Ask us</a>.</p><script>PRIVATE_SCRIPT</script>',
  leader: person,
  overseer: person,
  members: [{ phone: "PRIVATE_MEMBER" }],
  events: [event],
};
const homecell = {
  id: "3",
  slug: "north-group",
  name: "North group",
  location: "North area",
  leader: person,
  overseer: null,
  members: [{ phone: "PRIVATE_MEMBER" }],
  programs: [program],
};
const response = (data, total = data.length) => ({
  success: true,
  data,
  meta: { page: 1, limit: 6, total, totalPages: Math.ceil(total / 6) },
});
const Link = ({ children, ...props }) =>
  React.createElement("a", props, children);
const presentation = {
  "next/link": Link,
  "next/image": ({ src, alt, width, height }) =>
    React.createElement("img", {
      src: typeof src === "string" ? src : src.src,
      alt,
      width,
      height,
    }),
  "@/public/images/community.webp": {
    src: "/images/community.webp",
    width: 1100,
    height: 733,
  },
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

test("group filters normalize duplicate/invalid values and preserve only the correct directory's search and page", () => {
  const filters = helpers.readGroupFilters({
    page: "3",
    q: " Care & community ",
  });
  assert.deepEqual(filters, { page: 3, q: "Care & community" });
  for (const kind of ["ministry", "homecell"]) {
    const base = helpers.groupPaths[kind],
      from = helpers.groupsHref(kind, filters);
    assert.equal(from, base + "?page=3&q=Care+%26+community");
    assert.equal(
      helpers.groupsHref(kind, filters, { page: 1 }),
      base + "?q=Care+%26+community",
    );
    assert.equal(
      helpers.groupHref(kind, "name / question?", from),
      base + "/name%20%2F%20question%3F?" + new URLSearchParams({ from }),
    );
    assert.equal(helpers.groupReturnHref(kind, from + "&scope=private"), from);
    for (const invalid of [
      "https://evil.test" + base,
      "//evil.test" + base,
      "/dashboard",
      base + "/record",
      base + "\\other",
      [from],
      "/content?page=2",
    ])
      assert.equal(helpers.groupReturnHref(kind, invalid), base);
    assert.equal(
      helpers.groupReturnHref(kind, base + "?page=2&page=3&q=care"),
      base + "?q=care",
    );
  }
  for (const page of [
    "0",
    "-1",
    "1.5",
    "Infinity",
    "1000001",
    "9007199254740992",
    ["1", "2"],
  ])
    assert.equal(helpers.readGroupFilters({ page }).page, 1);
  assert.equal(helpers.readGroupFilters({ q: ["one", "two"] }).q, "");
  assert.equal(helpers.readGroupFilters({ q: "x".repeat(300) }).q.length, 200);
});

test("public group schemas remove private data and suppress archived leaders, relationships and group records", () => {
  const group = helpers.parsePublicGroup("ministry", ministry);
  assert.equal(group.kind, "ministry");
  assert.ok(!("members" in group));
  assert.doesNotMatch(
    JSON.stringify(group.leader),
    /PRIVATE_PHONE|PRIVATE_LOCATION|PRIVATE_USER/,
  );
  assert.equal(
    helpers.parsePublicGroup("homecell", {
      ...homecell,
      leader: { ...person, deletedAt: "2026-01-01" },
    }).leader,
    null,
  );
  assert.equal(
    helpers.parsePublicGroup("ministry", {
      ...ministry,
      events: [{ ...event, deletedAt: "2026-01-01" }],
    }).events.length,
    0,
  );
  for (const value of [
    null,
    [],
    { ...ministry, deletedAt: "2026-01-01" },
    { ...ministry, slug: ".." },
  ])
    assert.throws(() => helpers.parsePublicGroup("ministry", value));
  for (const value of [
    { ...response([]), success: false },
    { data: [] },
    response([ministry], 0),
  ])
    assert.throws(() => helpers.publicGroupPage("ministry", value));
});

test("group leadership uses real names, combines roles and displays biographies as text with safe portrait fallbacks", () => {
  const people = helpers.groupPeople(
    helpers.parsePublicGroup("ministry", ministry),
  );
  assert.equal(people.length, 1);
  assert.deepEqual(people[0].roles, ["Leader", "Overseer"]);
  assert.equal(people[0].name, "Test Person");
  assert.equal(people[0].bio, "Prayer & care.");
  assert.equal(people[0].imageUrl, null);
  assert.equal(people[0].initials, "TP");
  assert.deepEqual(
    helpers.groupPeople(
      helpers.parsePublicGroup("homecell", { ...homecell, leader: null }),
    ),
    [],
  );
});

test("group schedules keep ongoing events and today's calendar programs across Malawi midnight", () => {
  const now = Date.parse("2026-10-22T22:30:00Z");
  const group = helpers.parsePublicGroup("homecell", {
    ...homecell,
    programs: [
      { ...program, id: "10", date: "2026-10-22T22:00:00Z" },
      { ...program, id: "2", date: "2026-10-23" },
      { ...program, id: "1", date: "2026-10-22T00:00:00Z" },
      { ...program, id: "3", date: "2026-10-24" },
      { ...program, id: "4", date: "2026-02-30" },
    ],
  });
  assert.deepEqual(
    helpers.upcomingGroupPrograms(group, now).map((item) => item.id),
    ["2", "10", "3"],
  );
  const events = helpers.parsePublicGroup("ministry", {
    ...ministry,
    events: [
      {
        ...event,
        id: "1",
        startTime: "2026-10-22T20:00:00Z",
        endTime: "2026-10-22T23:00:00Z",
      },
      {
        ...event,
        id: "2",
        startTime: "2026-10-22T20:00:00Z",
        endTime: "2026-10-22T22:30:00Z",
      },
      { ...event, id: "3", startTime: "invalid", endTime: "invalid" },
      {
        ...event,
        id: "4",
        startTime: "2026-10-25T08:00:00Z",
        endTime: "2026-10-24T08:00:00Z",
      },
    ],
  });
  assert.deepEqual(
    helpers.upcomingGroupEvents(events, now).map((item) => item.id),
    ["1"],
  );
});

test("public group transports encode one address segment and forward search, pagination and cancellation", async () => {
  const calls = [],
    load = sourceLoader({
      "./client": {
        publicApi: async (...args) => {
          calls.push(args);
          return response([]);
        },
      },
    });
  const options = { signal: new AbortController().signal };
  const ministries = load("lib/public-api/ministries.ts"),
    homecells = load("lib/public-api/homecells.ts");
  await ministries.getPublicMinistries(
    { page: 2, limit: 6, search: "Care & service" },
    options,
  );
  await homecells.getPublicHomecells(
    { page: 3, limit: 6, search: "North area" },
    options,
  );
  await ministries.getPublicMinistryBySlug("name/with?query", options);
  await homecells.getPublicHomecellBySlug("name/with?query", options);
  assert.equal(calls[2][0], "/ministries/name%2Fwith%3Fquery");
  assert.equal(calls[3][0], "/homecells/name%2Fwith%3Fquery");
  assert.equal(
    new URL(calls[0][0], "https://church.invalid").searchParams.get("search"),
    "Care & service",
  );
  assert.equal(
    new URL(calls[1][0], "https://church.invalid").searchParams.get("page"),
    "3",
  );
  calls.forEach(([, received]) =>
    assert.equal(received.signal, options.signal),
  );
});

test("group detail requests distinguish missing and archived groups from failed or malformed responses", async () => {
  let action = async () => ({ data: ministry }),
    received;
  const load = sourceLoader({
    react: { ...React, cache: (fn) => fn },
    "./ministries": {
      getPublicMinistryBySlug: async (slug, options) => {
        received = { slug, options };
        return action();
      },
    },
  });
  const { loadPublicGroup } = load("lib/public-api/groups.ts"),
    { PublicApiError } = load("lib/public-api/client.ts");
  assert.equal(
    (await loadPublicGroup("ministry", ministry.slug)).state,
    "ready",
  );
  assert.ok(received.options.signal instanceof AbortSignal);
  for (const [run, state] of [
    [async () => ({ data: null }), "missing"],
    [
      async () => ({ data: { ...ministry, deletedAt: "2026-01-01" } }),
      "missing",
    ],
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
    [async () => ({ data: ministry, success: false }), "unavailable"],
    [async () => ({ data: { name: "Incomplete" } }), "unavailable"],
    [
      async () => {
        throw new Error("PRIVATE_ERROR");
      },
      "unavailable",
    ],
  ]) {
    action = run;
    assert.equal((await loadPublicGroup("ministry", "fixture")).state, state);
  }
});

function browseFixture(kind, result, fail = false) {
  const calls = [],
    api = async (params, options) => {
      calls.push({ params, options });
      if (fail) throw new Error("PRIVATE_FAILURE");
      return result;
    };
  const load = sourceLoader({
    ...presentation,
    "@/lib/public-api/ministries": { getPublicMinistries: api },
    "@/lib/public-api/homecells": { getPublicHomecells: api },
    "next/navigation": navigation,
  });
  return { ...load("components/public/groups/GroupDirectory.tsx"), calls };
}

test("group results use API totals and keep search in pagination, record links and return addresses", async () => {
  for (const [kind, item] of [
    ["ministry", ministry],
    ["homecell", homecell],
  ]) {
    const fixture = browseFixture(kind, response([item], 13)),
      filters = { page: 2, q: "Care & service" };
    const html = renderToStaticMarkup(
      await fixture.GroupResults({ kind, filters }),
    );
    assert.match(html, /13 (ministries|homecells) matching your search/);
    assert.match(html, /Page 2 of 3/);
    assert.match(html, /page=3&amp;q=Care\+%26\+service/);
    assert.match(html, /from=%2F(ministries|homecells)%3Fpage%3D2/);
    assert.deepEqual(fixture.calls[0].params, {
      page: 2,
      limit: 6,
      search: "Care & service",
    });
    assert.ok(fixture.calls[0].options.signal instanceof AbortSignal);
    assert.doesNotMatch(html, /PRIVATE_/);
  }
});

test("group empty, searched-empty and unavailable directories have distinct recovery and correct out-of-range navigation", async () => {
  for (const kind of ["ministry", "homecell"]) {
    const render = async (result, filters, fail) =>
      renderToStaticMarkup(
        await browseFixture(kind, result, fail).GroupResults({ kind, filters }),
      );
    assert.match(
      await render(response([]), { page: 1, q: "" }),
      /There are no (ministries|homecells) listed yet/,
    );
    assert.match(
      await render(response([]), { page: 1, q: "North" }),
      /match that search/,
    );
    const failed = await render(null, { page: 2, q: "North" }, true);
    assert.match(failed, /directory could not load/);
    assert.match(failed, /name="q" value="North"/);
    assert.match(failed, /Try again/);
    assert.doesNotMatch(
      failed,
      /0 homecells|0 ministries|PRIVATE_FAILURE|match that search/,
    );
    await assert.rejects(
      () =>
        browseFixture(kind, response([], 13)).GroupResults({
          kind,
          filters: { page: 90, q: "North" },
        }),
      new RegExp("REDIRECT " + helpers.groupPaths[kind] + "\\?page=3&q=North"),
    );
  }
});

test("homecell cards use separate group and program anchors and link to the program's real slug", () => {
  const { GroupCard } = browseFixture("homecell", response([homecell]));
  const html = renderToStaticMarkup(
    React.createElement(GroupCard, {
      group: helpers.parsePublicGroup("homecell", homecell),
      filters: { page: 1, q: "" },
    }),
  );
  assert.match(html, /href="\/homecells\/north-group"/);
  assert.match(html, /href="\/programs\/homecell-prayers"/);
  assert.doesNotMatch(html, /<a\b[^>]*>(?:(?!<\/a>)[\s\S])*<a\b/);
  assert.doesNotMatch(html, /href="\/programs\/31"/);
  const missing = renderToStaticMarkup(
    React.createElement(GroupCard, {
      group: helpers.parsePublicGroup("homecell", {
        ...homecell,
        location: null,
        programs: [],
      }),
      filters: { page: 1, q: "" },
    }),
  );
  assert.match(missing, /Ask the church team about the meeting place/);
});

function detailFixture(group, state = "ready", extra = {}) {
  return sourceLoader({
    ...presentation,
    ...extra,
    "@/lib/public-api/groups": {
      loadPublicGroup: async () =>
        state === "ready"
          ? {
              state,
              group: helpers.parsePublicGroup(group.kind || "ministry", group),
              checkedAt: Date.now(),
            }
          : { state },
    },
    "next/navigation": navigation,
  })("components/public/groups/GroupDetails.tsx");
}

test("ministry details sanitize descriptions, show real leadership and gatherings, and retain a filtered return link", async () => {
  const detail = detailFixture({ ...ministry, kind: "ministry" });
  const html = renderToStaticMarkup(
    await detail.GroupDetails({
      kind: "ministry",
      address: ministry.slug,
      from: "/ministries?page=3&q=care",
    }),
  );
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
  assert.match(html, /<h2>Our shared purpose<\/h2>/);
  assert.match(html, /<strong>together<\/strong>/);
  assert.match(html, /href="\/events\/community-gathering"/);
  assert.match(html, /href="\/ministries\?page=3&amp;q=care"/);
  assert.match(html, /Leader &amp; Overseer/);
  assert.match(html, /Prayer &amp; care\./);
  assert.doesNotMatch(html, /PRIVATE_|undefined\.|ProseMirror|<main[ >]/);
  const metadata = await detail.publicGroupMetadata("ministry", ministry.slug);
  assert.equal(metadata.title, ministry.name);
  assert.equal(metadata.description, ministry.purpose);
});

test("homecell details use the shared rhythm, current programs and transparent missing-information states", async () => {
  const config = sourceLoader()("config/church.ts"),
    replacement = {
      ...config,
      homecellGathering: {
        ...config.homecellGathering,
        day: "Friday",
        time: "5:45 PM",
      },
    };
  const detail = detailFixture(
    { ...homecell, kind: "homecell", leader: null, location: null },
    "ready",
    { "@/config/church": replacement },
  );
  const html = renderToStaticMarkup(
    await detail.GroupDetails({ kind: "homecell", address: homecell.slug }),
  );
  assert.match(html, /Fridays at 5:45 PM/);
  assert.match(html, /Please ask the church team about the meeting place/);
  assert.match(html, /Leadership details have not been added/);
  assert.match(html, /href="\/programs\/homecell-prayers"/);
  const { GroupDirectory } = sourceLoader({
    ...presentation,
    "@/config/church": replacement,
    "@/lib/public-api/homecells": {
      getPublicHomecells: async () => response([]),
    },
  })("components/public/groups/GroupDirectory.tsx");
  const directory = renderToStaticMarkup(
    React.createElement(GroupDirectory, {
      kind: "homecell",
      filters: { page: 1, q: "" },
    }),
  );
  assert.match(directory, /Fridays/);
  assert.match(directory, /5:45 PM/);
});

test("missing and failed group details stay distinct and legacy numeric addresses redirect to their stable slug", async () => {
  for (const [kind, group] of [
    ["ministry", ministry],
    ["homecell", homecell],
  ]) {
    await assert.rejects(
      () =>
        detailFixture(group, "missing").GroupDetails({
          kind,
          address: "missing",
        }),
      /NOT_FOUND/,
    );
    const detail = detailFixture(group, "unavailable");
    assert.match(
      renderToStaticMarkup(
        await detail.GroupDetails({ kind, address: "unavailable" }),
      ),
      /Try again/,
    );
    assert.equal(
      (await detail.publicGroupMetadata(kind, "unavailable")).robots.index,
      false,
    );
    await assert.rejects(
      () =>
        detailFixture({ ...group, kind }).GroupDetails({
          kind,
          address: group.id,
        }),
      /PERMANENT \/(ministries|homecells)\//,
    );
  }
});

test("joining enquiries use church contact details with encoded group context and never a personal leader contact", () => {
  const group = helpers.parsePublicGroup("ministry", {
    ...ministry,
    name: "Care & hope / questions?",
  });
  const url = new URL(helpers.groupEnquiryHref(group));
  assert.equal(
    url.origin + url.pathname,
    sourceLoader()("config/church.ts").church.whatsappUrl,
  );
  assert.equal(url.searchParams.size, 1);
  assert.match(
    url.searchParams.get("text"),
    /Care & hope \/ questions\? ministry/,
  );
  assert.doesNotMatch(url.href, /PRIVATE_/);
});

test("a stalled directory request does not block the introduction, search or church contact actions", async () => {
  let release;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  const { GroupDirectory } = sourceLoader({
    ...presentation,
    "@/lib/public-api/ministries": { getPublicMinistries: () => pending },
  })("components/public/groups/GroupDirectory.tsx");
  let html = "",
    stream;
  const target = new PassThrough();
  target.on("data", (chunk) => {
    html += chunk.toString();
  });
  const finished = new Promise((resolve, reject) => {
    target.on("end", resolve);
    target.on("error", reject);
  });
  await new Promise((resolve, reject) => {
    stream = renderToPipeableStream(
      React.createElement(GroupDirectory, {
        kind: "ministry",
        filters: { page: 1, q: "" },
      }),
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
    assert.match(html, /Put your gifts/);
    assert.match(html, /name="q"/);
    assert.match(html, /href="\/contact"/);
  } finally {
    release(response([ministry]));
    await finished;
  }
  assert.match(html, /Care &amp; service/);
  assert.doesNotMatch(html, /PRIVATE_/);
});
