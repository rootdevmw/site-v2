import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import React from "react";
import { PassThrough } from "node:stream";
import { renderToStaticMarkup, renderToPipeableStream } from "react-dom/server";
import { sourceLoader } from "./helpers/load-source.mjs";

test("the analytics adapter forwards only sanitized local events and removes its listeners", () => {
  const oldWindow = globalThis.window,
    oldDocument = globalThis.document;
  const listeners = new Map(),
    events = [];
  let cleanup;
  globalThis.window = {
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
    dispatchEvent: (event) => events.push(event),
  };
  globalThis.document = {
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
  };
  try {
    const { PublicJourneyEvents } = sourceLoader({
      react: {
        ...React,
        useEffect: (effect) => {
          cleanup = effect();
        },
      },
    })("components/public/PublicJourneyEvents.tsx");
    PublicJourneyEvents();
    listeners.get("church:journey")(
      new CustomEvent("church:journey", {
        detail: {
          event: "prayer_submitted",
          path: "/prayer-request?email=PRIVATE",
          request: "PRIVATE_TEXT",
        },
      }),
    );
    listeners.get("church:journey")(
      new CustomEvent("church:journey", {
        detail: { event: "visit_open", path: "/dashboard" },
      }),
    );
    assert.equal(events.length, 1);
    assert.equal(events[0].type, "church:analytics");
    assert.deepEqual(events[0].detail, {
      event: "prayer_submitted",
      path: "/prayer-request",
    });
    cleanup();
    assert.equal(listeners.size, 0);
  } finally {
    globalThis.window = oldWindow;
    globalThis.document = oldDocument;
  }
});

const load = sourceLoader();
const library = load("lib/utils/public-library.ts");
const now = Date.parse("2026-10-22T10:00:00Z");
const stream = (extra = {}) => ({
  id: "1",
  slug: "sunday",
  title: "Sunday worship",
  isLive: true,
  startsAt: "2026-10-22T09:00:00Z",
  endsAt: "2026-10-22T11:00:00Z",
  platforms: [
    { id: "1", name: "YouTube", url: "https://youtu.be/abcdefghijk" },
  ],
  ...extra,
});
const document = (extra = {}) => ({
  id: "2",
  title: "Church newsletter",
  description: "Church news",
  publishedAt: "2020-01-01T00:00:00Z",
  fileUrl: "/bulletin.pdf",
  ...extra,
});
const link = ({ children, ...props }) =>
  React.createElement("a", props, children);
function hookView(file, symbol, props = {}, overrides = {}) {
  let cursor = 0,
    tree;
  const slots = [];
  const hooks = {
    ...React,
    useState: (initial) => {
      const index = cursor++;
      if (!(index in slots))
        slots[index] = typeof initial === "function" ? initial() : initial;
      return [
        slots[index],
        (value) => {
          slots[index] =
            typeof value === "function" ? value(slots[index]) : value;
        },
      ];
    },
    useRef: (initial) => {
      const index = cursor++;
      return (slots[index] ||= { current: initial });
    },
  };
  const component = sourceLoader({
    react: hooks,
    "next/link": link,
    ...overrides,
  })(file)[symbol];
  function nodes(node, matches, found = []) {
    if (Array.isArray(node))
      node.forEach((item) => nodes(item, matches, found));
    else if (node && typeof node === "object") {
      if (matches(node)) found.push(node);
      nodes(node.props?.children, matches, found);
    }
    return found;
  }
  return {
    render() {
      cursor = 0;
      tree = component(props);
      return renderToStaticMarkup(tree);
    },
    find: (matches) => nodes(tree, matches)[0]?.props,
    all: (matches) => nodes(tree, matches).map((node) => node.props),
  };
}
async function rendered(node) {
  return new Promise((resolve, reject) => {
    let html = "";
    const output = new PassThrough();
    output.on("data", (chunk) => {
      html += chunk;
    });
    output.on("end", () => resolve(html));
    output.on("error", reject);
    const request = renderToPipeableStream(node, {
      onAllReady() {
        request.pipe(output);
      },
      onError: reject,
    });
  });
}
test("actual live state requires the flag and a valid current broadcast window", () => {
  assert.equal(library.isBroadcastLive(stream(), now), true);
  for (const extra of [
    { isLive: false },
    { startsAt: "2026-10-22T10:01:00Z" },
    { endsAt: "2026-10-22T10:00:00Z" },
  ])
    assert.equal(library.isBroadcastLive(stream(extra), now), false);
  assert.equal(
    library.broadcastLabel(stream({ isLive: false }), now),
    "Past broadcast",
  );
  assert.equal(
    library.broadcastLabel(stream({ startsAt: "2099-01-01T00:00:00Z", endsAt: "2099-01-01T02:00:00Z" }), now),
    "Scheduled",
  );
});
test("library parsing removes private fields and rejects archived, future or malformed records", () => {
  const record = library.parseBroadcast(
    stream({
      password: "PRIVATE_PASSWORD",
      platforms: [
        {
          platform: {
            id: 1,
            name: "Valid",
            url: "https://youtube.com",
            deletedAt: null,
            private: "PRIVATE",
          },
        },
        {
          id: 2,
          name: "Archived",
          url: "https://example.org",
          deletedAt: "2020-01-01",
        },
      ],
    }),
  );
  assert.equal(record.platforms.length, 1);
  assert.doesNotMatch(JSON.stringify(record), /PRIVATE|deletedAt/);
  assert.throws(() =>
    library.parseBroadcast(stream({ deletedAt: "2020-01-01" })),
  );
  assert.throws(() =>
    library.parseDocument(
      document({ publishedAt: "2099-01-01T00:00:00Z" }),
      now,
    ),
  );
  assert.throws(() =>
    library.libraryPage("publications", {
      data: [document()],
      meta: { total: 0, limit: 6 },
    }),
  );
  assert.throws(() =>
    library.libraryPage("streams", {
      success: false,
      data: [],
      meta: { total: 0, limit: 6 },
    }),
  );
});
test("only recognized YouTube video URLs become embeds and unsafe provider URLs are excluded", () => {
  assert.equal(
    library.broadcastPlayer(stream()).embed,
    "https://www.youtube-nocookie.com/embed/abcdefghijk",
  );
  for (const url of [
    "https://facebook.com/church/live",
    "https://youtube.com/@church/live",
    "https://youtube.com.evil.test/watch?v=abcdefghijk",
    "https://youtu.be/short",
    "javascript:alert(1)",
    "/some-page",
  ]) {
    assert.equal(
      library.broadcastPlayer(
        stream({ platforms: [{ id: "1", name: "Provider", url }] }),
      ),
      null,
    );
  }
  const unsafe = stream({
    platforms: [
      "javascript:alert(1)",
      "https://user:secret@example.org",
      "/local",
    ].map((url, id) => ({ id: String(id), name: "Unsafe", url })),
  });
  assert.deepEqual(library.broadcastLinks(unsafe), []);
});
test("broadcast player waits for a click, includes a titled privacy-enhanced player and retains external recovery", () => {
  const events = [],
    originalWindow = globalThis.window;
  globalThis.window = {
    dispatchEvent: (event) => events.push(event),
    location: { pathname: "/streams/sunday" },
  };
  try {
    const view = hookView(
      "components/public/BroadcastPlayer.tsx",
      "BroadcastPlayer",
      { stream: stream() },
    );
    assert.doesNotMatch(view.render(), /<iframe/);
    view.find((node) => node.type === "button").onClick();
    const html = view.render();
    assert.match(html, /<iframe[^>]*youtube-nocookie/);
    assert.match(html, /title="Sunday worship/);
    assert.match(html, /referrerPolicy="strict-origin-when-cross-origin"/i);
    assert.match(html, /If the player is blocked/);
    assert.match(html, /target="_blank" rel="noopener noreferrer"/);
    assert.equal(events[0].detail.event, "broadcast_play");
    const external = hookView(
      "components/public/BroadcastPlayer.tsx",
      "BroadcastPlayer",
      {
        stream: stream({
          platforms: [
            { id: "1", name: "Facebook", url: "https://facebook.com/church" },
          ],
        }),
      },
    );
    assert.doesNotMatch(external.render(), /iframe/);
    assert.match(external.render(), /Open Facebook/);
  } finally {
    globalThis.window = originalWindow;
  }
});
test("navigation renders grey offline/unavailable status and shares the status link across desktop and mobile", () => {
  for (const [status, expected] of [
    ["offline", /Live · Off air/],
    ["unavailable", /Live · Unavailable/],
    ["live", /Live now/],
  ]) {
    const { LiveStatusLink } = sourceLoader({
      "next/link": link,
      "@/lib/hooks/use-live-broadcast": { useLiveBroadcast: () => ({ state: status, broadcast: null, checkedAt: now }) },
    })("components/public/LiveStatusLink.tsx");
    const html = renderToStaticMarkup(
      React.createElement(LiveStatusLink, { initialSnapshot: { state: status, broadcast: null, checkedAt: now } }),
    );
    assert.match(html, expected);
    assert.match(html, status === "live" ? /is-live/ : /is-offline/);
    assert.match(html, /href="\/live"/);
  }
  const source = readFileSync(
    new URL("../components/public/PublicHeader.tsx", import.meta.url),
    "utf8",
  );
  assert.ok((source.match(/\{watchLink\}/g) || []).length >= 2);
});
test("live polling distinguishes service failure from off air and does not infer live from a schedule", async () => {
  for (const [response, expected] of [
    [{ data: null }, "offline"],
    [
      { data: stream({ startsAt: "2000-01-01T00:00:00Z", endsAt: null }) },
      "offline",
    ],
    [{ data: stream({ isLive: false }) }, "offline"],
    [{ success: false }, "unavailable"],
    [{ data: {} }, "unavailable"],
  ]) {
    const { readLiveStatus } = sourceLoader({
      "./streams": {
        getLiveStream: async (options) => {
          assert.ok(options.signal instanceof AbortSignal);
          return response;
        },
      },
    })("components/public/LiveStatusLink.tsx");
    assert.equal(await readLiveStatus(), expected);
  }
});
test("library search and return links retain filters while blocking external and private destinations", () => {
  const filters = library.readLibraryFilters({
    page: "3",
    q: " Sunday ",
    period: "past",
  });
  assert.equal(
    library.libraryHref("/broadcasts", filters),
    "/broadcasts?page=3&q=Sunday&period=past",
  );
  assert.equal(
    library.libraryReturnHref("/broadcasts", "/broadcasts?page=3&q=Sunday&period=past"),
    "/broadcasts?page=3&q=Sunday&period=past",
  );
  for (const href of [
    "//evil.test/live",
    "/dashboard",
    "https://evil.test/live",
    "/live\\evil",
  ])
    assert.equal(library.libraryReturnHref("/broadcasts", href), "/broadcasts");
  assert.equal(
    library.libraryReturnHref(
      "/publications",
      "/publications?page=2&q=news&secret=PRIVATE",
    ),
    "/publications?page=2&q=news",
  );
});
test("cached detail loaders distinguish missing and failed data and use bounded transport signals", async () => {
  const { PublicApiError } = load("lib/public-api/client.ts");
  for (const [value, expected] of [
    [document(), "ready"],
    [null, "missing"],
    [new PublicApiError(404, "Missing"), "missing"],
    [new Error("Offline"), "unavailable"],
    [document({ publishedAt: "2099-01-01T00:00:00Z" }), "unavailable"],
  ]) {
    const cached = sourceLoader({
      "@/lib/public-api/client": { PublicApiError },
      "./client": { PublicApiError },
      "./publications": {
        getPublicPublication: async (_, options) => {
          assert.ok(options.signal instanceof AbortSignal);
          if (value instanceof Error) throw value;
          return { data: value };
        },
      },
    })("lib/public-api/library.ts");
    assert.equal((await cached.loadDocument("2")).state, expected);
  }
});
test("library listings retain their welcome, search and service information when feeds fail", async () => {
  const { LibraryListing } = sourceLoader({
    "next/link": link,
    "@/lib/public-api/library": {
      loadLiveBroadcast: async () => ({ state: "unavailable" }),
    },
    "@/lib/public-api/streams": {
      getPublicStreams: async () => {
        throw new Error("Offline");
      },
    },
    "@/lib/public-api/publications": {
      getPublicPublications: async () => {
        throw new Error("Offline");
      },
    },
  })("components/public/OnlineLibrary.tsx");
  for (const kind of ["streams", "publications"]) {
    const html = await rendered(
      React.createElement(LibraryListing, {
        kind,
        filters: { page: 1, q: "Sunday", period: "past" },
      }),
    );
    assert.match(html, /Plan your first visit/);
    assert.match(html, /role="search"/);
    assert.match(html, /Sunday/);
    assert.match(html, /Try again/i);
  }
});
test("publication details offer safe document links and canonical metadata without embedding arbitrary files", async () => {
  for (const fileUrl of ["/bulletin.pdf", "javascript:alert(1)"]) {
    const { OnlineDetails, onlineMetadata } = sourceLoader({
      "next/link": link,
      "@/lib/public-api/library": {
        loadDocument: async () => ({
          state: "ready",
          data: document({ fileUrl }),
        }),
      },
    })("components/public/OnlineLibrary.tsx");
    const html = renderToStaticMarkup(
      await OnlineDetails({ kind: "publications", address: "2" }),
    );
    assert.doesNotMatch(html, /iframe|javascript:/);
    assert.match(
      html,
      fileUrl.startsWith("/") ? /Open PDF/ : /document link is unavailable/,
    );
    assert.equal(
      (await onlineMetadata("publications", "2")).alternates.canonical,
      "/publications/2",
    );
  }
});
function prayerView(submit = async () => ({ success: true })) {
  return hookView(
    "components/public/PrayerForm.tsx",
    "PrayerForm",
    {},
    {
      "@/lib/public-api/attention": {
        usePrayerRequest: () => ({
          submitPrayerRequest: submit,
          isSubmitting: false,
        }),
      },
    },
  );
}
function change(view, name, value) {
  view
    .find(
      (node) =>
        node.props?.name === name &&
        (name !== "shareWithElders" || node.props.value === value),
    )
    .onChange({ target: { value, checked: value } });
  view.render();
}
test("personal prayer does not submit, preserves the words and uses the public form typography", async () => {
  let calls = 0;
  const view = prayerView(async () => {
    calls++;
  });
  const html = view.render();
  assert.match(html, /method="post"/);
  assert.match(html, /public-input/);
  change(view, "request", "PRIVATE_PRAYER_TEXT");
  change(view, "shareWithElders", "No");
  const original = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = () => 0;
  try {
    await view
      .find((node) => node.type === "form")
      .onSubmit({ preventDefault() {} });
    assert.equal(calls, 0);
    assert.match(view.render(), /Your prayer was not sent/);
    view.find((node) => node.type === "button").onClick();
    assert.match(view.render(), /PRIVATE_PRAYER_TEXT/);
  } finally {
    globalThis.requestAnimationFrame = original;
  }
});
test("shared prayer prevents duplicate submissions and emits only a safe completion event", async () => {
  const originalWindow = globalThis.window,
    originalFrame = globalThis.requestAnimationFrame;
  const events = [],
    calls = [];
  let release;
  globalThis.window = { dispatchEvent: (event) => events.push(event) };
  globalThis.requestAnimationFrame = () => 0;
  try {
    const view = prayerView(async (form) => {
      calls.push(form);
      return new Promise((resolve) => {
        release = resolve;
      });
    });
    view.render();
    change(view, "request", "PRIVATE_PRAYER_TEXT");
    const submit = view.find((node) => node.type === "form").onSubmit;
    const pending = submit({ preventDefault() {} });
    await submit({ preventDefault() {} });
    assert.equal(calls.length, 1);
    release({ success: true });
    await pending;
    assert.match(view.render(), /Your request has been received/);
    assert.doesNotMatch(view.render(), /PRIVATE_PRAYER_TEXT/);
    assert.deepEqual(events[0].detail, {
      event: "prayer_submitted",
      path: "/prayer-request",
    });
  } finally {
    globalThis.window = originalWindow;
    globalThis.requestAnimationFrame = originalFrame;
  }
});
test("unconfirmed prayer submission retains text and explains uncertainty without automatic retry", async () => {
  let calls = 0;
  const view = prayerView(async () => {
    calls++;
    throw new Error("Offline");
  });
  view.render();
  change(view, "request", "PRIVATE_PRAYER_TEXT");
  await view
    .find((node) => node.type === "form")
    .onSubmit({ preventDefault() {} });
  const html = view.render();
  assert.match(html, /PRIVATE_PRAYER_TEXT/);
  assert.match(html, /request may have arrived/);
  assert.equal(calls, 1);
});
test("journey events redact dynamic records, personal values and query strings and reject private routes", () => {
  const { safeJourney } = load("lib/utils/public-journeys.ts");
  assert.deepEqual(
    safeJourney({
      event: "prayer_submitted",
      path: "/prayer-request?email=PRIVATE",
      request: "PRIVATE_TEXT",
    }),
    { event: "prayer_submitted", path: "/prayer-request" },
  );
  assert.deepEqual(
    safeJourney({
      event: "broadcast_play",
      path: "/streams/PRIVATE_ID?token=PRIVATE",
    }),
    { event: "broadcast_play", path: "/streams/[record]" },
  );
  for (const value of [
    { event: "unknown", path: "/" },
    { event: "visit_open", path: "/dashboard" },
    { event: "visit_open", path: "/login" },
  ])
    assert.equal(safeJourney(value), null);
});
test("production sitemap and crawler metadata use the confirmed domain and exclude account and portal pages", () => {
  const entries = load("app/sitemap.ts").default();
  assert.equal(entries.length, 13);
  assert.ok(
    entries.every((item) => item.url.startsWith("https://churchofchrist.mw/")),
  );
  assert.ok(entries.some((item) => item.url.endsWith("/prayer-request")));
  assert.doesNotMatch(
    JSON.stringify(entries),
    /dashboard|login|register|PRIVATE/,
  );
  const robots = load("app/robots.ts").default();
  assert.equal(robots.sitemap, "https://churchofchrist.mw/sitemap.xml");
  assert.ok(robots.rules.disallow.includes("/dashboard"));
  assert.equal(load("app/(dashboard)/layout.tsx").metadata.robots.index, false);
});
