import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { createFormControl } from "react-hook-form";
import { sourceLoader } from "./helpers/load-source.mjs";
const helpers = sourceLoader()("lib/utils/stream-editor.ts");
const platform = {
  id: "4",
  name: "YouTube service",
  url: "https://youtu.be/dQw4w9WgXcQ",
};
const initial = {
  id: "7",
  title: "Sunday service",
  slug: "stable-address",
  isLive: false,
  startsAt: "2099-10-22T07:00:00.123Z",
  endsAt: null,
  platforms: [platform],
};
const values = helpers.streamEditorDefaults(initial);

test("stream defaults retain precise Malawi times, existing selections and truthful unselected defaults", () => {
  assert.deepEqual(helpers.streamEditorDefaults(), {
    title: "",
    isLive: false,
    startsAt: "",
    endsAt: "",
    platformIds: [],
  });
  assert.equal(values.startsAt, "2099-10-22T09:00:00.123");
  assert.deepEqual(values.platformIds, ["4"]);
  assert.equal(helpers.streamEditorPayload(values).startsAt, initial.startsAt);
});

test("stream schema validates booleans, date order, real dates and live prerequisites", () => {
  assert.equal(helpers.streamEditorSchema.safeParse(values).success, true);
  assert.equal(
    helpers.streamEditorSchema.safeParse({
      ...values,
      startsAt: "",
      platformIds: [],
    }).success,
    true,
  );
  for (const invalid of [
    { title: " " },
    { title: "x".repeat(192) },
    { isLive: "false" },
    { startsAt: "2099-02-30T09:00" },
    { endsAt: "2099-10-22T08:00" },
    { startsAt: "", endsAt: "2099-10-22T10:00" },
    { isLive: true, startsAt: "" },
    { isLive: true, platformIds: [] },
    { platformIds: ["9223372036854775808"] },
  ])
    assert.equal(
      helpers.streamEditorSchema.safeParse({ ...values, ...invalid }).success,
      false,
    );
});

test("stream payloads preserve omissions and explicitly clear times, live selection and connections", () => {
  assert.deepEqual(helpers.streamEditorPayload(values, {}), {});
  assert.deepEqual(
    helpers.streamEditorPayload(
      {
        ...values,
        title: " Updated ",
        isLive: false,
        startsAt: "",
        endsAt: "",
        platformIds: [],
      },
      {
        title: true,
        isLive: true,
        startsAt: true,
        endsAt: true,
        platformIds: true,
      },
    ),
    {
      title: "Updated",
      isLive: false,
      startsAt: null,
      endsAt: null,
      platformIds: [],
    },
  );
  assert.deepEqual(
    helpers.streamEditorPayload({ ...values, platformIds: ["4", "4"] })
      .platformIds,
    ["4"],
  );
  assert.throws(
    () => helpers.streamEditorPayload({ ...values, startsAt: "invalid" }),
    /schedule/,
  );
});

test("shared platform validation accepts public canonical URLs and rejects credentials or database overflow", () => {
  assert.equal(
    helpers.streamPlatformUrl(" https://video.example "),
    "https://video.example/",
  );
  for (const url of [
    "javascript:alert(1)",
    "//video.example",
    "/local",
    "https://user:secret@example.com",
    "https://example.com/" + "x".repeat(180),
    "https://example.com/\\bad",
    "https://example.com/\nsecret",
  ])
    assert.equal(helpers.streamPlatformUrl(url), null);
  assert.equal(
    helpers.streamPlatformSchema.safeParse({
      name: "",
      url: "https://example.com",
    }).success,
    false,
  );
  assert.equal(
    helpers.streamPlatformSchema.safeParse({
      name: "Channel",
      url: "https://example.com",
    }).success,
    true,
  );
});

test("platform search reaches later pages, matches names/URLs and recovers a removed page", () => {
  const records = Array.from({ length: 113 }, (_, index) => ({
    id: String(index + 1),
    name: "Service " + (index + 1),
    url: "https://video.example/" + (index + 1),
  }));
  const page = helpers.streamPlatformPage(records, "", 12);
  assert.equal(page.total, 113);
  assert.equal(page.data[0].id, "111");
  assert.equal(
    helpers.streamPlatformPage(records, "video.example/113", 1).data[0].id,
    "113",
  );
  assert.equal(
    helpers.streamPlatformPage(records.slice(0, 10), "", 12).page,
    1,
  );
  assert.equal(helpers.streamPlatformPage(records, "missing", 1).total, 0);
});

test("platform reads are cancellable, bounded and projected to IDs/names/URLs with malformed results rejected", async () => {
  let config;
  const signal = new AbortController().signal;
  const actual = sourceLoader({
    "@/lib/api/client": {
      api: {
        get: async (_url, options) => {
          config = options;
          return {
            data: {
              success: true,
              data: [{ ...platform, private: "discard" }],
            },
          };
        },
      },
    },
  })("lib/api/stream-editor.ts");
  assert.deepEqual(await actual.getStreamEditorPlatforms(signal), [platform]);
  assert.equal(config.signal, signal);
  assert.equal(config.timeout, 15000);
  assert.equal(config.silent, true);
  for (const data of [
    { success: false, data: [] },
    { data: [platform, platform] },
    { data: [{ id: "4" }] },
  ]) {
    const api = sourceLoader({
      "@/lib/api/client": { api: { get: async () => ({ data }) } },
    })("lib/api/stream-editor.ts");
    await assert.rejects(() => api.getStreamEditorPlatforms());
  }
});

test("stream saves send sparse JSON with nulls and false intact and require matching confirmed identities", async () => {
  const calls = [],
    payload = { isLive: false, startsAt: null, platformIds: [] };
  const actual = sourceLoader({
    "@/lib/api/client": {
      api: {
        post: async (...args) => {
          calls.push(args);
          return { data: { success: true, data: { id: "8" } } };
        },
        patch: async (...args) => {
          calls.push(args);
          return { data: { data: { id: "7" } } };
        },
      },
    },
  })("lib/api/stream-editor.ts");
  await actual.saveStreamEditor({ title: "News" });
  await actual.saveStreamEditor(payload, "7");
  assert.equal(calls[1][0], "/streams/7");
  assert.deepEqual(calls[1][1], payload);
  assert.equal(calls[1][2].timeout, 30000);
  assert.equal(calls[1][2].silent, true);
  for (const data of [
    { success: false, data: { id: "7" } },
    { data: { id: "8" } },
    { data: { id: "0" } },
  ]) {
    const api = sourceLoader({
      "@/lib/api/client": { api: { patch: async () => ({ data }) } },
    })("lib/api/stream-editor.ts");
    await assert.rejects(() => api.saveStreamEditor({}, "7"));
  }
});

test("shared platform saves canonicalize addresses, validate responses and keep update identity explicit", async () => {
  const calls = [],
    response = { ...platform, url: "https://video.example/" };
  const actual = sourceLoader({
    "@/lib/api/client": {
      api: {
        patch: async (...args) => {
          calls.push(args);
          return { data: { success: true, data: response } };
        },
      },
    },
  })("lib/api/stream-editor.ts");
  assert.deepEqual(
    (
      await actual.saveStreamPlatform(
        { name: " Channel ", url: "https://video.example" },
        "4",
      )
    ).data,
    response,
  );
  assert.equal(calls[0][0], "/streams/platforms/4");
  assert.deepEqual(calls[0][1], {
    name: "Channel",
    url: "https://video.example/",
  });
  assert.equal(calls[0][2].timeout, 30000);
  await assert.rejects(() =>
    actual.saveStreamPlatform({ name: "Channel", url: "javascript:bad" }),
  );
  await assert.rejects(
    () =>
      actual.saveStreamPlatform(
        { name: "Channel", url: "https://video.example" },
        "5",
      ),
    /could not be confirmed/,
  );
});

test("editor hooks scope private lookups by actor/roles and reconcile all affected streams and platforms without retries", async () => {
  const client = new QueryClient();
  let query;
  const mutations = [];
  const hooks = sourceLoader({
    "@tanstack/react-query": {
      useQuery: (options) => {
        query = options;
      },
      useMutation: (options) => {
        mutations.push(options);
      },
      useQueryClient: () => client,
    },
  })("lib/hooks/useStreamEditor.ts");
  hooks.useStreamEditorPlatforms({ id: "2", roles: ["MEDIA"] });
  assert.equal(query.enabled, true);
  assert.equal(query.queryKey[2], "2");
  hooks.useStreamEditorPlatforms({ id: "3", roles: ["MEMBER"] });
  assert.equal(query.enabled, false);
  hooks.useSaveStreamEditor();
  hooks.useSaveStreamPlatform();
  for (const mutation of mutations) {
    assert.equal(mutation.retry, false);
    for (const error of [null, new Error("response lost")]) {
      for (const key of [
        "stream",
        "streams",
        "audit-logs",
        "audit-timeline",
        "dashboard-overview",
      ])
        client.setQueryData([key, "fixture"], {});
      await mutation.onSettled(undefined, error);
      for (const key of [
        "stream",
        "streams",
        "audit-logs",
        "audit-timeline",
        "dashboard-overview",
      ])
        assert.equal(
          client.getQueryState([key, "fixture"]).isInvalidated,
          true,
        );
    }
  }
  client.setQueryData(["platforms", "fixture"], {});
  await mutations[1].onSettled();
  assert.equal(
    client.getQueryState(["platforms", "fixture"]).isInvalidated,
    true,
  );
  client.clear();
});

function renderEditor({
  roles = ["MEDIA"],
  mode = "edit",
  data = initial,
  entries = values,
  dirty = {},
  query = {},
  mutate = async () => ({ data: { id: "7" } }),
} = {}) {
  let submit;
  const pushes = [],
    resets = [],
    errors = [],
    changes = [];
  const { StreamForm } = sourceLoader({
    "react-hook-form": {
      useForm: () => ({
        control: {},
        formState: {
          errors: {},
          dirtyFields: dirty,
          isDirty: !!Object.keys(dirty).length,
          isSubmitting: false,
        },
        register: (name) => ({ name }),
        handleSubmit: (callback) => {
          submit = callback;
          return () => {};
        },
        getValues: (key) => entries[key],
        setValue: (...args) => changes.push(args),
        setError: (...args) => errors.push(args),
        reset: (data) => resets.push(data),
      }),
      useWatch: () => [entries.platformIds, entries.isLive],
    },
    "next/navigation": {
      useRouter: () => ({ push: (href) => pushes.push(href) }),
    },
    "@/app/modules/auth/store/auth.store": {
      useAuthStore: (selector) => selector({ user: { id: "1", roles } }),
    },
    "@/lib/hooks/useStreamEditor": {
      useSaveStreamEditor: () => ({ isPending: false, mutateAsync: mutate }),
      useStreamEditorPlatforms: () => ({
        data: [platform],
        isPending: false,
        isError: false,
        ...query,
      }),
    },
  })("app/modules/streams/components/StreamForm.tsx");
  const html = renderToStaticMarkup(
    React.createElement(StreamForm, { mode, initialData: data }),
  );
  return {
    html,
    pushes,
    resets,
    errors,
    changes,
    submit: (input = entries) => submit(input),
  };
}

test("stream workspace has clear labels, shared-platform impact, independent lookup states and honest live guidance", () => {
  const editor = renderEditor();
  assert.equal((editor.html.match(/<form\b/g) || []).length, 1);
  for (const pattern of [
    /for="stream-title"/,
    /for="stream-startsAt"/,
    /for="stream-endsAt"/,
    /for="stream-platform-search"/,
    /for="stream-isLive"/,
    /Stream pages are public once saved/,
    /Renaming keeps/,
    /CAT, UTC\+2/,
    /Edit shared platform/,
    /shared by all streams/,
    /does not start or stop a broadcast/,
    /Preview YouTube service/,
  ])
    assert.match(editor.html, pattern);
  assert.match(
    renderEditor({ query: { isPending: true, data: undefined } }).html,
    /Loading platforms/,
  );
  assert.match(
    renderEditor({ query: { isError: true } }).html,
    /Current selections are kept/,
  );
  assert.match(
    renderEditor({ query: { data: [] }, data: {} }).html,
    /No platforms have been added/,
  );
  assert.match(renderEditor({ roles: ["MEMBER"] }).html, /Access unavailable/);
});

test("pending stream saves happen once, retain untouched relationships/status and navigate only on confirmation", async () => {
  let complete;
  const pending = new Promise((resolve) => {
      complete = resolve;
    }),
    writes = [];
  const editor = renderEditor({
    mutate: (data) => {
      writes.push(data);
      return pending;
    },
  });
  const first = editor.submit();
  await editor.submit();
  assert.equal(writes.length, 1);
  assert.deepEqual(writes[0], { id: "7", data: {} });
  complete({ data: { id: "7" } });
  await first;
  assert.deepEqual(editor.pushes, ["/dashboard/streams/7"]);
  const clears = [];
  const explicit = renderEditor({
    dirty: { startsAt: true, endsAt: true, isLive: true, platformIds: [true] },
    mutate: async (data) => {
      clears.push(data);
      return { data: { id: "7" } };
    },
  });
  await explicit.submit({
    ...values,
    startsAt: "",
    endsAt: "",
    isLive: false,
    platformIds: [],
  });
  assert.deepEqual(clears[0].data, {
    startsAt: null,
    endsAt: null,
    isLive: false,
    platformIds: [],
  });
});

test("new live selection waits for confirmation, while missing edit IDs or unusable destinations cannot write", async () => {
  let writes = 0;
  const mutate = async () => {
    writes++;
    return { data: { id: "7" } };
  };
  const live = renderEditor({ entries: { ...values, isLive: true }, mutate });
  await live.submit();
  assert.equal(writes, 0);
  assert.match(live.html, /Save this as the live selection/);
  assert.match(live.html, /switched off when you save/);
  const missing = renderEditor({ data: { ...initial, id: undefined }, mutate });
  await missing.submit();
  const broken = renderEditor({
    data: {
      ...initial,
      isLive: true,
      platforms: [{ ...platform, url: "javascript:bad" }],
    },
    entries: { ...values, isLive: true },
    query: { data: [] },
    mutate,
  });
  await broken.submit();
  assert.equal(broken.errors[0][0], "platformIds");
  assert.equal(writes, 0);
});

test("failed stream saves retain form entries and navigation and explain uncertain or conflicting results", async () => {
  const editor = renderEditor({
    mutate: async () => {
      throw new Error("response lost");
    },
  });
  await editor.submit();
  assert.deepEqual(editor.resets, []);
  assert.deepEqual(editor.pushes, []);
  for (const [status, message] of [
    [401, /Sign in again/],
    [403, /permission/],
    [400, /Live selection needs/],
    [409, /overlapped/],
  ])
    assert.match(
      helpers.streamEditorFailure({ response: { status } }, false),
      message,
    );
  assert.match(
    helpers.streamEditorFailure(new Error(), true),
    /may already have been created/,
  );
  assert.match(
    helpers.streamEditorFailure({ response: { status: 409 } }, true, true),
    /platform name is already in use/,
  );
});

test("shared platform dialog owns one form, explains global changes and blocks overlapping writes while retaining failed entries", async () => {
  let submit,
    finish,
    rejectSave = false;
  const pending = new Promise((resolve) => {
      finish = resolve;
    }),
    writes = [],
    busy = [],
    saved = [],
    resets = [];
  const Component = sourceLoader({
    "react-hook-form": {
      useForm: () => ({
        formState: { errors: {}, isSubmitting: false, isDirty: true },
        register: (name) => ({ name }),
        handleSubmit: (callback) => {
          submit = callback;
          return () => {};
        },
        reset: (data) => resets.push(data),
      }),
    },
    "@/lib/hooks/useStreamEditor": {
      useSaveStreamPlatform: () => ({
        isPending: false,
        mutateAsync: (data) => {
          writes.push(data);
          return rejectSave
            ? Promise.reject(new Error("response lost"))
            : pending;
        },
      }),
    },
  })("components/records/StreamPlatformEditor.tsx").StreamPlatformEditor;
  const html = renderToStaticMarkup(
    React.createElement(Component, {
      platform,
      onSaved: (data) => saved.push(data),
      onClose() {},
      onBusyChange: (value) => busy.push(value),
    }),
  );
  assert.equal((html.match(/<form\b/g) || []).length, 1);
  assert.match(html, /every stream that uses it/);
  assert.match(html, /Save shared changes/);
  assert.match(html, /for="stream-platform-url"/);
  const first = submit({ name: "Channel", url: "https://video.example" });
  await submit({ name: "Again", url: "https://video.example" });
  assert.equal(writes.length, 1);
  finish({ data: platform });
  await first;
  assert.deepEqual(busy, [true, false]);
  assert.deepEqual(saved, [platform]);
  assert.equal(resets.length, 1);
  rejectSave = true;
  await submit({ name: "New text", url: "https://video.example/new" });
  assert.equal(resets.length, 1);
  assert.equal(saved.length, 1);
  assert.deepEqual(busy, [true, false, true, false]);
});

test("live eligibility gives actionable start/end/link guidance while allowing a future selected service", () => {
  const now = Date.parse("2099-10-22T06:00Z");
  assert.equal(helpers.streamLiveSelectionIssue(initial, now), "");
  assert.match(
    helpers.streamLiveSelectionIssue({ ...initial, startsAt: null }, now),
    /start time/,
  );
  assert.match(
    helpers.streamLiveSelectionIssue(
      { ...initial, endsAt: "2099-10-22T05:00Z" },
      now,
    ),
    /end time/,
  );
  assert.match(
    helpers.streamLiveSelectionIssue({ ...initial, platforms: [] }, now),
    /watch link/,
  );
});

test("edit route keeps a cached form after a background read failure and separates loading/missing/access states", () => {
  const render = (query, roles = ["MEDIA"]) => {
    const Page = sourceLoader({
      "next/navigation": {
        useParams: () => ({ id: "7" }),
        useRouter: () => ({ push() {} }),
      },
      "@/app/modules/auth/store/auth.store": {
        useAuthStore: (selector) => selector({ user: { roles } }),
      },
      "@/app/modules/streams/hooks/useStream": {
        useStream: () => ({ isPending: false, isError: false, ...query }),
      },
      "@/app/modules/streams/hooks/useDeleteStream": {
        useDeleteStream: () => ({ mutateAsync() {} }),
      },
      "@/app/modules/streams/components/StreamForm": {
        StreamForm: (props) =>
          React.createElement("p", null, "Editor #" + props.initialData.id),
      },
    })("app/(dashboard)/dashboard/streams/[id]/edit/page.tsx").default;
    return renderToStaticMarkup(React.createElement(Page));
  };
  assert.match(render({ data: { data: initial }, isError: true }), /Editor #7/);
  assert.match(
    render({ data: { data: initial }, isError: true }),
    /current editor is kept/,
  );
  assert.match(render({ isPending: true }), /Loading stream editor/);
  assert.match(render({}), /Stream not found/);
  assert.match(render({}, ["MEMBER"]), /Access unavailable/);
});

test("stream deletion requires an explicit success result and bounds its request", async () => {
  let config;
  const api = sourceLoader({
    "@/lib/api/client": {
      api: {
        delete: async (_url, options) => {
          config = options;
          return { data: { success: true, data: {} } };
        },
      },
    },
  })("app/modules/streams/api/deleteStream.ts");
  await api.deleteStream("7");
  assert.equal(config.timeout, 30000);
  assert.equal(config.silent, true);
  const failed = sourceLoader({
    "@/lib/api/client": {
      api: { delete: async () => ({ data: { success: false } }) },
    },
  })("app/modules/streams/api/deleteStream.ts");
  await assert.rejects(
    () => failed.deleteStream("7"),
    /could not be confirmed/,
  );
});

test("actual form-library dirty state saves changed platform arrays, including explicit disconnection", async () => {
  for (const platformIds of [[], ["5"]]) {
    const control = createFormControl({ defaultValues: values });
    control.setValue("platformIds", platformIds, { shouldDirty: true });
    const writes = [];
    const editor = renderEditor({
      dirty: control.control._formState.dirtyFields,
      mutate: async (data) => {
        writes.push(data);
        return { data: { id: "7" } };
      },
    });
    await editor.submit({ ...values, platformIds });
    assert.equal(writes.length, 1);
    assert.deepEqual(writes[0].data.platformIds, platformIds);
    assert.deepEqual(editor.pushes, ["/dashboard/streams/7"]);
  }
});
