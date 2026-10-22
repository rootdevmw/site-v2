import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { PassThrough } from "node:stream";
import { renderToPipeableStream, renderToStaticMarkup } from "react-dom/server";
import { sourceLoader } from "./helpers/load-source.mjs";

const helpers = sourceLoader()("lib/utils/public-programs.ts");
const now = Date.parse("2026-10-22T22:30:00Z");
const person = {
  id: "7",
  firstName: "Test",
  lastName: "Person",
  prefix: "BROTHER",
  phone: "PRIVATE_PHONE",
  userId: "PRIVATE_USER",
  deletedAt: null,
};
const activity = (id, sequence, extra = {}) => ({
  id: String(id),
  sequence,
  title: `Activity ${id}`,
  description:
    "<p>Pray <strong>together</strong>.</p><script>PRIVATE_SCRIPT</script>",
  time: "7:30",
  responsible: person,
  responsibleId: "7",
  ...extra,
});
const program = {
  id: "11",
  slug: "sunday-program",
  date: "2099-10-22T22:00:00Z",
  location: "Church hall",
  type: { id: "2", name: "Sunday worship", private: "PRIVATE_TYPE" },
  homecell: {
    id: "3",
    slug: "north-group",
    name: "North group",
    members: ["PRIVATE_MEMBER"],
    leaderId: "PRIVATE_LEADER",
  },
  items: [
    activity(10, 4),
    activity(9, 3),
    activity(8, 2),
    activity(7, 1),
    activity(11, 5),
  ],
  createdAt: "PRIVATE_TIMESTAMP",
  typeId: "2",
  homecellId: "3",
};
const filters = {
  page: 1,
  q: "",
  typeId: "",
  homecellId: "",
  period: "upcoming",
};
const response = (data = [program], total = data.length) => ({
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
function browseFixture(
  action = async () => response(),
  typeAction = async () => ({ data: [program.type] }),
) {
  const calls = [];
  const view = sourceLoader({
    ...presentation,
    "next/navigation": navigation,
    "@/lib/public-api/programs": {
      getPublicPrograms: async (...args) => {
        calls.push(args);
        return action();
      },
      getProgramTypes: typeAction,
    },
  })("components/public/programs/ProgramDirectory.tsx");
  return { ...view, calls };
}
function detailFixture(
  result = {
    state: "ready",
    program: helpers.parsePublicProgram(program),
    checkedAt: now,
  },
) {
  return sourceLoader({
    ...presentation,
    "next/navigation": navigation,
    "@/lib/public-api/program-details": {
      loadPublicProgram: async () => result,
    },
  })("components/public/programs/ProgramDetails.tsx");
}
test("program filters and return links retain search/type/homecell/period while rejecting duplicate and unsafe values", () => {
  const chosen = helpers.readProgramFilters({
    page: "3",
    q: " North & worship ",
    typeId: "2",
    homecellId: "3",
    period: "past",
  });
  const href =
    "/programs?page=3&q=North+%26+worship&typeId=2&homecellId=3&period=past";
  assert.equal(helpers.programsHref(chosen), href);
  assert.equal(helpers.programsReturnHref(href + "&admin=true"), href);
  assert.equal(
    helpers.programsHref(chosen, {
      page: 1,
      q: "",
      typeId: "",
      homecellId: "",
      period: "upcoming",
    }),
    "/programs",
  );
  for (const value of [
    "https://evil.test/programs",
    "//evil.test/programs",
    "/programs/item",
    "/dashboard",
    "/programs\\other",
    [href],
  ])
    assert.equal(helpers.programsReturnHref(value), "/programs");
  assert.equal(
    helpers.programsReturnHref("/programs?page=2&page=3&typeId=2&period=past"),
    "/programs?typeId=2&period=past",
  );
  assert.deepEqual(
    helpers.readProgramFilters({
      page: ["2", "3"],
      q: ["one", "two"],
      typeId: ["2", "3"],
      period: ["past", "upcoming"],
    }),
    filters,
  );
  for (const value of ["0", "-1", "1.5", "9223372036854775808"])
    assert.equal(
      helpers.readProgramFilters({ typeId: value, homecellId: value }).typeId,
      "",
    );
  assert.equal(
    helpers.readProgramFilters({ page: "1000001", q: "x".repeat(300) }).page,
    1,
  );
  assert.equal(
    helpers.readProgramFilters({ q: "x".repeat(300) }).q.length,
    200,
  );
  assert.equal(
    helpers.programHref("name / ?", href),
    "/programs/name%20%2F%20%3F?" + new URLSearchParams({ from: href }),
  );
});
test("public program projection strips private fields, archived relationships and activities and orders ties by identity", () => {
  const parsed = helpers.parsePublicProgram({
    ...program,
    type: { ...program.type, deletedAt: "2026-01-01" },
    homecell: { ...program.homecell, deletedAt: "2026-01-01" },
    items: [
      activity(9, 2),
      activity(8, 2),
      activity(7, 1, { responsible: { ...person, deletedAt: "2026-01-01" } }),
      activity(6, 1, { deletedAt: "2026-01-01" }),
    ],
  });
  assert.equal(parsed.type, null);
  assert.equal(parsed.homecell, null);
  assert.equal(parsed.items[0].responsible, null);
  assert.deepEqual(
    parsed.items.map((item) => item.id),
    ["7", "8", "9"],
  );
  assert.doesNotMatch(
    JSON.stringify(parsed),
    /PRIVATE_PHONE|PRIVATE_USER|PRIVATE_TIMESTAMP|responsibleId|typeId|homecellId|deletedAt/,
  );
  assert.throws(() =>
    helpers.parsePublicProgram({ ...program, deletedAt: "2026-01-01" }),
  );
  for (const date of ["2026-02-30", "2026-10-22T08:00:00", "wrong"])
    assert.throws(() => helpers.parsePublicProgram({ ...program, date }));
  assert.throws(() =>
    helpers.publicProgramPage({ ...response(), success: false }),
  );
  assert.throws(() => helpers.publicProgramPage({ ...response(), meta: {} }));
});
test("program dates keep the Malawi calendar day and clock/descriptive times and names remain honest", () => {
  const parsed = helpers.parsePublicProgram({
    ...program,
    date: "2026-10-22T22:00:00Z",
  });
  assert.equal(parsed.date, "2026-10-23");
  assert.match(helpers.programDateLabel(parsed), /Friday,? 23 October 2026/);
  assert.deepEqual(helpers.publicProgramTime("7:30"), {
    label: "07:30",
    dateTime: "07:30",
  });
  assert.deepEqual(helpers.publicProgramTime("After the teaching"), {
    label: "After the teaching",
    dateTime: null,
  });
  assert.deepEqual(helpers.publicProgramTime(""), {
    label: "Time to confirm",
    dateTime: null,
  });
  assert.equal(
    helpers.publicProgramPerson(parsed.items[0]),
    "Brother Test Person",
  );
  assert.equal(
    helpers.publicProgramPerson({ ...parsed.items[0], responsible: null }),
    "",
  );
  assert.equal(
    helpers.programLabel(
      helpers.parsePublicProgram({ ...program, type: null, homecell: null }),
    ),
    "Church program",
  );
});
test("public program transport retains legacy date filters and forwards new filters, signals and encoded addresses", async () => {
  const calls = [],
    signal = new AbortController().signal;
  const api = sourceLoader({
    "./client": {
      publicApi: async (...args) => {
        calls.push(args);
        return response();
      },
    },
  })("lib/public-api/programs.ts");
  await api.getPublicPrograms(
    {
      page: 2,
      limit: 6,
      search: "North & worship",
      typeId: "2",
      homecellId: "3",
      period: "past",
      date: "2026-10-22",
      fromDate: "2026-10-20",
    },
    { signal },
  );
  const url = new URL("https://church.test" + calls[0][0]);
  for (const [key, value] of Object.entries({
    page: "2",
    limit: "6",
    search: "North & worship",
    typeId: "2",
    homecellId: "3",
    period: "past",
    date: "2026-10-22",
    fromDate: "2026-10-20",
  }))
    assert.equal(url.searchParams.get(key), value);
  assert.equal(calls[0][1].signal, signal);
  await api.getPublicProgramBySlug("name / ?", { signal });
  assert.equal(calls[1][0], "/programs/name%20%2F%20%3F");
  await api.getPublicProgram("11", { signal });
  assert.equal(calls[2][0], "/programs/11");
  await api.getProgramTypes({ signal });
  assert.equal(calls[3][0], "/programs/types");
  assert.equal(calls[3][1].signal, signal);
});
test("program detail loading distinguishes missing/archived records from failed or malformed reads", async () => {
  let action = async () => ({ data: program }),
    settings;
  const load = sourceLoader({
    react: { ...React, cache: (fn) => fn },
    "./programs": {
      getPublicProgramBySlug: async (_address, options) => {
        settings = options;
        return action();
      },
    },
  });
  const { loadPublicProgram } = load("lib/public-api/program-details.ts"),
    { PublicApiError } = load("lib/public-api/client.ts");
  const ready = await loadPublicProgram(program.slug);
  assert.equal(ready.state, "ready");
  assert.ok(Number.isFinite(ready.checkedAt));
  assert.ok(settings.signal instanceof AbortSignal);
  for (const [run, state] of [
    [async () => ({ data: null }), "missing"],
    [
      async () => ({ data: { ...program, deletedAt: "2026-01-01" } }),
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
    [async () => ({ data: {} }), "unavailable"],
    [async () => ({ success: false, data: program }), "unavailable"],
    [
      async () => {
        throw new Error("PRIVATE_FAILURE");
      },
      "unavailable",
    ],
  ]) {
    action = run;
    assert.equal((await loadPublicProgram("fixture")).state, state);
  }
});
test("program results use API totals and preserve all filters through paging and detail return paths", async () => {
  const fixture = browseFixture(async () => response([program], 19)),
    chosen = {
      ...filters,
      page: 2,
      q: "North",
      typeId: "2",
      homecellId: "3",
      period: "past",
    };
  const html = renderToStaticMarkup(
    await fixture.ProgramResults({ filters: chosen }),
  );
  assert.match(html, /19 programs matching your filters/);
  assert.match(
    html,
    /href="\/programs\?page=3&amp;q=North&amp;typeId=2&amp;homecellId=3&amp;period=past"/,
  );
  const link = html.match(/href="(\/programs\/sunday-program[^\"]*)"/)[1];
  assert.equal(
    new URL(
      link.replace(/&amp;/g, "&"),
      "https://church.test",
    ).searchParams.get("from"),
    "/programs?page=2&q=North&typeId=2&homecellId=3&period=past",
  );
  assert.deepEqual(fixture.calls[0][0], {
    page: 2,
    limit: 6,
    search: "North",
    period: "past",
    typeId: "2",
    homecellId: "3",
  });
  assert.ok(fixture.calls[0][1].signal instanceof AbortSignal);
  assert.doesNotMatch(html, /PRIVATE_|\/dashboard\//);
});
test("empty, filtered, unavailable and out-of-range program results keep clear next steps and filter choices", async () => {
  for (const [action, chosen, expected] of [
    [async () => response([]), filters, /No programs are listed for today/],
    [
      async () => response([]),
      { ...filters, period: "past" },
      /No past programs/,
    ],
    [
      async () => response([]),
      { ...filters, q: "missing" },
      /No programs match/,
    ],
    [
      async () => {
        throw new Error("PRIVATE_ERROR");
      },
      { ...filters, page: 2, typeId: "2", homecellId: "3", period: "past" },
      /program list could not load/,
    ],
  ]) {
    const html = renderToStaticMarkup(
      await browseFixture(action).ProgramResults({ filters: chosen }),
    );
    assert.match(html, expected);
    assert.doesNotMatch(html, /PRIVATE_ERROR/);
    if (/could not load/.test(html)) {
      assert.match(html, /name="typeId" value="2"/);
      assert.match(html, /name="homecellId" value="3"/);
      assert.match(html, /name="period" value="past"/);
      assert.match(html, /Try again/);
    }
  }
  await assert.rejects(
    () =>
      browseFixture(async () => response([])).ProgramResults({
        filters: {
          ...filters,
          page: 9,
          typeId: "2",
          homecellId: "3",
          period: "past",
        },
      }),
    /REDIRECT \/programs\?typeId=2&homecellId=3&period=past/,
  );
});
test("program cards use concise three-activity previews with real counts, safe links and missing-venue guidance", () => {
  const { ProgramCard } = browseFixture();
  const parsed = helpers.parsePublicProgram({
    ...program,
    date: "2026-10-22T22:00:00Z",
    location: null,
  });
  const html = renderToStaticMarkup(
    React.createElement(ProgramCard, { program: parsed, filters, now }),
  );
  assert.match(html, />Today<\/p>/);
  assert.match(html, /5 planned activities/);
  assert.match(html, /Plus 2 more/);
  assert.match(html, /Activity 7/);
  assert.doesNotMatch(html, /Activity 10/);
  assert.match(html, /Ask the church team about the venue/);
  assert.doesNotMatch(html, /<a\b[^>]*>(?:(?!<\/a>)[\s\S])*<a\b/);
});
test("the public agenda presents saved sequence, local times and descriptions without private person links or injected markup", () => {
  const { ProgramAgenda } = sourceLoader()(
    "components/public/programs/ProgramAgenda.tsx",
  );
  const parsed = helpers.parsePublicProgram({
    ...program,
    date: "2026-10-23",
    items: [
      activity(8, 2, { time: "After the teaching" }),
      activity(7, 1),
      activity(9, 3, { time: null, responsible: null }),
    ],
  });
  const html = renderToStaticMarkup(
    React.createElement(ProgramAgenda, { program: parsed }),
  );
  assert.match(html, /<ol aria-label="Activities in planned order"/);
  assert.ok(html.indexOf("Activity 7") < html.indexOf("Activity 8"));
  assert.match(html, /dateTime="2026-10-23T07:30\+02:00"/);
  assert.match(html, /After the teaching/);
  assert.match(html, /Time to confirm/);
  assert.match(html, /Brother Test Person/);
  assert.match(html, /Pray together/);
  assert.doesNotMatch(
    html,
    /PRIVATE_|<script|<strong|href="\/dashboard|undefined|Not assigned/,
  );
});
test("program detail pages show the correct date, real schedule and homecell journeys, metadata and clean sharing", async () => {
  const fixture = detailFixture(),
    html = renderToStaticMarkup(
      await fixture.ProgramDetails({
        address: program.slug,
        from: "/programs?page=2&typeId=2&period=past",
      }),
    );
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
  assert.match(html, /Activities in planned order/);
  assert.match(html, /href="\/homecells\/north-group"/);
  assert.match(html, /href="\/programs\?homecellId=3"/);
  assert.match(html, /Share this program/);
  assert.match(html, /href="\/programs\?page=2&amp;typeId=2&amp;period=past"/);
  assert.doesNotMatch(
    html,
    /PRIVATE_|Structured flow of today|In progress|has ended|\/dashboard\//,
  );
  const metadata = await fixture.programMetadata(program.slug);
  assert.match(metadata.title, /Sunday worship/);
  assert.match(metadata.title, /2099/);
  const enquiry = new URL(
    helpers.programEnquiryHref(helpers.parsePublicProgram(program)),
  );
  assert.equal(
    enquiry.origin + enquiry.pathname,
    sourceLoader()("config/church.ts").church.whatsappUrl,
  );
  assert.match(enquiry.searchParams.get("text"), /Sunday worship/);
});
test("past and empty programs retain honest calendar status, missing-location guidance and a readable empty schedule", async () => {
  const parsed = helpers.parsePublicProgram({
    ...program,
    date: "2020-01-01",
    items: [],
    type: null,
    homecell: null,
    location: null,
  });
  const html = renderToStaticMarkup(
    await detailFixture({
      state: "ready",
      program: parsed,
      checkedAt: now,
    }).ProgramDetails({ address: program.slug }),
  );
  assert.match(html, /This program is from a past date/);
  assert.match(html, /The schedule is still to come/);
  assert.match(html, /The venue has not been added/);
  assert.match(html, /Church program/);
  assert.doesNotMatch(
    html,
    /has ended|today’s service|Main Service|href="\/homecells\//,
  );
});
test("missing, unavailable and legacy numeric details keep distinct states and safe return addresses", async () => {
  await assert.rejects(
    () =>
      detailFixture({ state: "missing" }).ProgramDetails({
        address: "missing",
      }),
    /NOT_FOUND/,
  );
  const failed = detailFixture({ state: "unavailable" }),
    html = renderToStaticMarkup(
      await failed.ProgramDetails({
        address: "failed",
        from: "https://evil.test",
      }),
    );
  assert.match(html, /This program could not load/);
  assert.match(html, /href="\/programs"/);
  assert.match(html, /Try again/);
  assert.equal((await failed.programMetadata("failed")).robots.index, false);
  await assert.rejects(
    () =>
      detailFixture().ProgramDetails({
        address: program.id,
        from: "/programs?page=2&typeId=2",
      }),
    /PERMANENT \/programs\/sunday-program\?from=%2Fprograms%3Fpage%3D2%26typeId%3D2/,
  );
});
test("program type fields retain selections while pending or unavailable and remove archived/duplicate catalog entries", async () => {
  const parsed = helpers.publicProgramTypes({
    data: [
      program.type,
      program.type,
      { id: "9", name: "Archived", deletedAt: "2026-01-01" },
    ],
  });
  assert.deepEqual(parsed, [{ id: "2", name: "Sunday worship" }]);
  let options;
  const { ProgramTypeField, ProgramTypeLoading } = sourceLoader({
    "@/lib/public-api/programs": {
      getProgramTypes: async (settings) => {
        options = settings;
        throw new Error("PRIVATE_FAILURE");
      },
    },
  })("components/public/programs/ProgramTypeField.tsx");
  const html = renderToStaticMarkup(await ProgramTypeField({ selected: "2" }));
  assert.match(html, /Types could not load/);
  assert.match(html, /<option value="2" selected="">Selected program type/);
  assert.ok(options.signal instanceof AbortSignal);
  assert.doesNotMatch(html, /PRIVATE_FAILURE/);
  const pending = renderToStaticMarkup(
    React.createElement(ProgramTypeLoading, { selected: "2" }),
  );
  assert.match(pending, /disabled=""/);
  assert.match(pending, /name="typeId" value="2"/);
});
test("stalled type and program feeds leave the welcome, form and shared schedule usable, and results stream independently", async () => {
  let releasePrograms, releaseTypes;
  const programsPending = new Promise((resolve) => {
      releasePrograms = resolve;
    }),
    typesPending = new Promise((resolve) => {
      releaseTypes = resolve;
    });
  const { ProgramDirectory } = browseFixture(
    () => programsPending,
    () => typesPending,
  );
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
      React.createElement(ProgramDirectory, {
        filters: { ...filters, typeId: "2" },
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
    assert.match(html, /Follow the service/);
    assert.match(html, /name="q"/);
    assert.match(html, /name="period"/);
    assert.match(html, /name="typeId" value="2"/);
    assert.match(html, /last Sunday of each month/);
    assert.match(html, /href="\/plan-visit"/);
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        target.off("data", onData);
        reject(
          new Error(
            "Program results did not stream independently of the type catalog.",
          ),
        );
      }, 2000);
      const onData = () => {
        if (!html.includes("Read the program")) return;
        clearTimeout(timeout);
        target.off("data", onData);
        resolve();
      };
      target.on("data", onData);
      releasePrograms(response());
    });
    assert.match(html, /Read the program/);
    assert.doesNotMatch(html, /Types could not load/);
  } finally {
    releasePrograms(response());
    releaseTypes({ success: false, data: [] });
    await finished;
  }
  assert.match(html, /Types could not load/);
  assert.match(html, /Read the program/);
});
