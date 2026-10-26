import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { sourceLoader } from "./helpers/load-source.mjs";
import { QueryClient } from "@tanstack/react-query";

test("the editor requires staff to wait for the start and choose a future expiry before going live", () => {
  const load = sourceLoader();
  const { streamEditorSchema, streamEditorDefaults } = load(
    "lib/utils/stream-editor.ts",
  );
  const original = Date.now;
  Date.now = () => now;
  try {
    const current = streamEditorDefaults(broadcast());
    assert.equal(streamEditorSchema.safeParse(current).success, true);
    for (const values of [
      { ...current, endsAt: "" },
      { ...current, startsAt: "" },
      streamEditorDefaults(broadcast({ startsAt: "2026-10-26T10:01:00Z" })),
      streamEditorDefaults(broadcast({ endsAt: "2026-10-26T10:00:00Z" })),
    ])
      assert.equal(streamEditorSchema.safeParse(values).success, false);
    assert.equal(
      streamEditorSchema.safeParse(
        streamEditorDefaults(
          broadcast({
            isLive: false,
            startsAt: "2026-10-27T10:00:00Z",
            endsAt: null,
          }),
        ),
      ).success,
      true,
    );
  } finally {
    Date.now = original;
  }
});

test("end broadcast confirms the returned identity and state and never sends invalid identifiers", async () => {
  let response = { success: true, data: { ...broadcast(), isLive: false } };
  const calls = [];
  const { endLiveStream } = sourceLoader({
    "@/lib/api/client": {
      api: {
        post: async (...args) => {
          calls.push(args);
          return { data: response };
        },
      },
    },
  })("app/modules/streams/api/setLiveStream.ts");
  assert.equal((await endLiveStream("7")).data.isLive, false);
  assert.deepEqual(calls[0], [
    "/streams/7/end",
    undefined,
    { timeout: 30000, silent: true },
  ]);
  for (const value of [
    {},
    { success: false },
    { data: broadcast() },
    { data: { ...broadcast(), id: "8", isLive: false } },
  ]) {
    response = value;
    await assert.rejects(() => endLiveStream("7"), /could not be confirmed/);
  }
  const count = calls.length;
  await assert.rejects(() => endLiveStream("../other"));
  assert.equal(calls.length, count);
});

test("ending updates shared public status immediately and invalidates reads after uncertainty", async () => {
  const client = new QueryClient();
  const liveKey = ["public-live-broadcast"];
  client.setQueryData(liveKey, {
    state: "live",
    broadcast: broadcast(),
    checkedAt: now,
  });
  client.setQueryData(["stream", "7"], { data: broadcast() });
  const { useSetLiveStream } = sourceLoader({
    "@tanstack/react-query": {
      useQueryClient: () => client,
      useMutation: (options) => options,
    },
  })("app/modules/streams/hooks/useSetLiveStream.ts");
  const action = useSetLiveStream("end");
  action.onSuccess({ data: { ...broadcast(), isLive: false } }, "7");
  assert.equal(client.getQueryData(liveKey).state, "offline");
  assert.equal(client.getQueryData(["stream", "7"]).data.isLive, false);
  await action.onSettled(undefined, new Error("response lost"), "7");
  assert.equal(client.getQueryState(liveKey).isInvalidated, true);
  assert.equal(client.getQueryState(["stream", "7"]).isInvalidated, true);
  client.clear();
});

const now = Date.parse("2026-10-26T10:00:00Z");
const broadcast = (extra = {}) => ({
  id: "7",
  slug: "sunday",
  title: "Sunday worship",
  isLive: true,
  startsAt: "2026-10-26T09:00:00Z",
  endsAt: "2026-10-26T11:00:00Z",
  platforms: [
    { id: "1", name: "YouTube", url: "https://youtu.be/abcdefghijk" },
  ],
  ...extra,
});
const link = ({ children, ...props }) =>
  React.createElement("a", props, children);

test("public and portal live states reject unbounded, malformed, future and expired selections", () => {
  const load = sourceLoader();
  const { isBroadcastLive } = load("lib/utils/public-library.ts");
  const { getStreamState } = load("lib/utils/editorial-records.ts");
  for (const [extra, label] of [
    [{}, "Live now"],
    [{ startsAt: "2000-01-01T00:00:00Z", endsAt: null }, "Unavailable"],
    [{ startsAt: null }, "Unavailable"],
    [{ endsAt: null }, "Unavailable"],
    [{ startsAt: "invalid" }, "Unavailable"],
    [{ endsAt: "2026-10-26T09:00:00Z" }, "Unavailable"],
    [{ endsAt: "2026-10-26T10:00:00Z" }, "Ended"],
    [{ startsAt: "2026-10-26T10:01:00Z" }, "Scheduled"],
    [{ isLive: false }, "Not live"],
  ]) {
    const value = broadcast(extra);
    assert.equal(getStreamState(value, now).label, label);
    assert.equal(isBroadcastLive(value, now), label === "Live now");
  }
});

test("live snapshots expire at the end boundary and fail closed when status is too old", () => {
  const { resolveLiveSnapshot, liveFreshnessMs } = sourceLoader()(
    "lib/public-api/live.ts",
  );
  const value = { state: "live", broadcast: broadcast(), checkedAt: now };
  assert.equal(resolveLiveSnapshot(value, now).state, "live");
  assert.equal(
    resolveLiveSnapshot(
      {
        ...value,
        broadcast: broadcast({ endsAt: new Date(now).toISOString() }),
      },
      now,
    ).state,
    "offline",
  );
  assert.equal(
    resolveLiveSnapshot(value, now + liveFreshnessMs).state,
    "unavailable",
  );
  assert.equal(
    resolveLiveSnapshot(
      { ...value, broadcast: broadcast({ platforms: [] }) },
      now,
    ).state,
    "offline",
  );
  assert.equal(
    resolveLiveSnapshot({ ...value, state: "unavailable" }, now).broadcast,
    null,
  );
});

test("live reads replace old live data with off air or unavailable and expose only parsed public fields", async () => {
  const original = Date.now;
  Date.now = () => now;
  try {
    for (const [response, state] of [
      [{ data: broadcast({ privateToken: "PRIVATE" }) }, "live"],
      [{ data: null }, "offline"],
      [
        { data: broadcast({ startsAt: "2000-01-01T00:00:00Z", endsAt: null }) },
        "offline",
      ],
      [{ data: broadcast({ platforms: [] }) }, "offline"],
      [{ data: {} }, "unavailable"],
      [{ success: false }, "unavailable"],
      [new Error("network"), "unavailable"],
    ]) {
      const { readLiveSnapshot } = sourceLoader({
        "./streams": {
          getLiveStream: async (options) => {
            assert.ok(options.signal instanceof AbortSignal);
            if (response instanceof Error) throw response;
            return response;
          },
        },
      })("lib/public-api/live.ts");
      const result = await readLiveSnapshot();
      assert.equal(result.state, state);
      assert.doesNotMatch(JSON.stringify(result), /PRIVATE/);
      if (state !== "live") assert.equal(result.broadcast, null);
    }
  } finally {
    Date.now = original;
  }
});

test("shared live query polls, refreshes on focus and removes a broadcast at expiry without another request", () => {
  let clock = now,
    time = now,
    timer,
    delay,
    query;
  const originalNow = Date.now,
    originalTimeout = globalThis.setTimeout,
    originalClear = globalThis.clearTimeout;
  const initial = {
    state: "live",
    broadcast: broadcast({ endsAt: new Date(now + 5000).toISOString() }),
    checkedAt: now,
  };
  Date.now = () => time;
  globalThis.setTimeout = (callback, ms) => {
    timer = callback;
    delay = ms;
    return 1;
  };
  globalThis.clearTimeout = () => {};
  let cleanup;
  try {
    const { useLiveBroadcast } = sourceLoader({
      react: {
        useState: () => [
          clock,
          (value) => {
            clock = value;
          },
        ],
        useEffect: (effect) => {
          cleanup = effect();
        },
      },
      "@tanstack/react-query": {
        useQuery: (options) => {
          query = options;
          return { data: initial };
        },
      },
    })("lib/hooks/use-live-broadcast.ts");
    assert.equal(useLiveBroadcast(initial).state, "live");
    assert.deepEqual(query.queryKey, ["public-live-broadcast"]);
    assert.equal(query.refetchInterval, 30000);
    assert.equal(query.refetchOnWindowFocus, "always");
    assert.equal(query.retry, false);
    assert.equal(delay, 5000);
    time += 5000;
    timer();
    assert.equal(useLiveBroadcast(initial).state, "offline");
    cleanup();
  } finally {
    Date.now = originalNow;
    globalThis.setTimeout = originalTimeout;
    globalThis.clearTimeout = originalClear;
  }
});

test("navigation and live panel consume the same status and remove the active player when off air", () => {
  let snapshot = { state: "live", broadcast: broadcast(), checkedAt: now };
  const load = sourceLoader({
    "next/link": link,
    "@/lib/hooks/use-live-broadcast": { useLiveBroadcast: () => snapshot },
  });
  const { LiveStatusLink } = load("components/public/LiveStatusLink.tsx");
  const { LiveBroadcastPanel } = load(
    "components/public/LiveBroadcastPanel.tsx",
  );
  for (const state of ["live", "offline", "unavailable"]) {
    snapshot = {
      ...snapshot,
      state,
      broadcast: state === "live" ? broadcast() : null,
    };
    const nav = renderToStaticMarkup(
      React.createElement(LiveStatusLink, { initialSnapshot: snapshot }),
    );
    const panel = renderToStaticMarkup(
      React.createElement(LiveBroadcastPanel, { initialSnapshot: snapshot }),
    );
    assert.match(nav, state === "live" ? /is-live/ : /is-offline/);
    if (state === "live") assert.match(panel, /Play video here/);
    else assert.doesNotMatch(panel, /Play video here|iframe|Live now/);
    assert.match(panel, /href="\/broadcasts"/);
    assert.match(panel, /role="status"/);
  }
});

test("live route excludes the archive and sends old library filters to the new route", async () => {
  const redirect = (href) => {
    throw new Error("REDIRECT " + href);
  };
  const Page = sourceLoader({
    "next/link": link,
    "next/navigation": { redirect },
    "@/components/public/OnlineLibrary": {
      CurrentBroadcast: () => React.createElement("div", null, "CURRENT ONLY"),
    },
  })("app/(public)/live/page.tsx").default;
  const html = renderToStaticMarkup(
    await Page({ searchParams: Promise.resolve({}) }),
  );
  assert.match(html, /CURRENT ONLY/);
  assert.doesNotMatch(html, /role="search"|Broadcast library.*<form/);
  await assert.rejects(
    () =>
      Page({
        searchParams: Promise.resolve({
          period: "past",
          page: "2",
          q: "Sunday",
        }),
      }),
    /REDIRECT \/broadcasts\?page=2&q=Sunday&period=past/,
  );
  const helpers = sourceLoader()("lib/utils/public-library.ts");
  assert.equal(
    helpers.libraryReturnHref("/broadcasts", "/live?page=2&period=past"),
    "/broadcasts?page=2&period=past",
  );
});
