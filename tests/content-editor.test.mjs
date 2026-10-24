import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { sourceLoader } from "./helpers/load-source.mjs";
const helpers = sourceLoader()("lib/utils/content-editor.ts");
const values = {
  title: "A welcome",
  body: '<p>Welcome</p><audio src="/uploads/audio.mp3"></audio>',
  typeId: "2",
  authorId: "101",
  tags: ["Faith"],
  scriptures: [
    {
      id: "41",
      book: "John",
      chapter: 3,
      verseFrom: 16,
      verseTo: 18,
      version: "ESV",
    },
  ],
};

test("message validation rejects empty rich text and invalid reference numbers/ranges while allowing media and optional authors", () => {
  assert.equal(helpers.contentEditorSchema.safeParse(values).success, true);
  assert.equal(
    helpers.contentEditorSchema.safeParse({
      ...values,
      authorId: "",
      body: '<audio src="/uploads/audio.mp3"></audio>',
    }).success,
    true,
  );
  for (const invalid of [
    { title: " " },
    { body: "<p>&nbsp;<br></p>" },
    { body: "<script>hidden</script>" },
    { typeId: "9223372036854775808" },
    { tags: [""] },
    { scriptures: [{ book: "John", chapter: 3.5, verseFrom: 16 }] },
    { scriptures: [{ book: "John", chapter: 3, verseFrom: 18, verseTo: 16 }] },
  ])
    assert.equal(
      helpers.contentEditorSchema.safeParse({ ...values, ...invalid }).success,
      false,
    );
  assert.equal(
    helpers.contentEditorSchema.safeParse({
      ...values,
      scriptures: [
        { book: "John", chapter: 3, verseFrom: 16, verseTo: undefined },
      ],
    }).success,
    true,
  );
});

test("editor mapping retains scalar IDs, scripture identity/version and defaults without posting publishing state or series", () => {
  const mapped = helpers.contentEditorValues({
    ...values,
    id: "7",
    type: null,
    author: null,
    typeId: "2",
    authorId: "101",
    tags: [{ tag: { name: "Faith" } }],
    scriptures: [{ ...values.scriptures[0], verseTo: null }],
  });
  assert.equal(mapped.typeId, "2");
  assert.equal(mapped.authorId, "101");
  assert.equal(mapped.scriptures[0].id, "41");
  assert.equal(mapped.scriptures[0].version, "ESV");
  assert.equal(mapped.scriptures[0].verseTo, undefined);
  const unchanged = helpers.contentEditorPayload(values, {});
  for (const key of [
    "body",
    "authorId",
    "typeId",
    "tags",
    "scriptures",
    "status",
    "seriesId",
  ])
    assert.equal(unchanged[key], undefined);
  const cleared = helpers.contentEditorPayload(
    { ...values, authorId: "", tags: [], scriptures: [] },
    { author: true, tags: true, scriptures: true },
  );
  assert.equal(cleared.authorId, "");
  assert.deepEqual(cleared.tags, []);
  assert.deepEqual(cleared.scriptures, []);
  assert.deepEqual(helpers.contentEditorDefaults({}).scriptures, []);
});

test("tags trim and deduplicate names, range clearing is explicit, and save failures explain conflict/session/uncertain outcomes", () => {
  assert.deepEqual(helpers.addContentTag(["Faith"], " Prayer "), {
    tags: ["Faith", "Prayer"],
    error: "",
  });
  assert.match(helpers.addContentTag(["Faith"], "faith").error, /already/);
  assert.match(helpers.addContentTag([], " ").error, /Enter a tag/);
  const payload = helpers.contentEditorPayload({
    ...values,
    tags: ["Faith", "faith"],
    scriptures: [{ ...values.scriptures[0], verseTo: undefined }],
  });
  assert.equal(payload.tags.length, 1);
  assert.equal(payload.scriptures[0].verseTo, null);
  assert.equal(payload.scriptures[0].version, "ESV");
  for (const [status, message] of [
    [401, /Sign in again/],
    [403, /permission/],
    [409, /public address/],
    [413, /too large/],
  ])
    assert.match(
      helpers.contentEditorFailure({ response: { status } }, true),
      message,
    );
  assert.match(
    helpers.contentEditorFailure(new Error("response lost"), true),
    /may already have been created/,
  );
});

test("author reads reach later pages with cancellation and bounded requests while projecting only names and IDs", async () => {
  const calls = [],
    signal = new AbortController().signal;
  const api = {
    get: async (...args) => {
      calls.push(args);
      return {
        data: {
          data: [
            {
              id: "101",
              firstName: "A",
              lastName: "Writer",
              phone: "private",
              location: "private",
            },
          ],
          meta: { page: 6, limit: 20, total: 101 },
        },
      };
    },
  };
  const actual = sourceLoader({ "@/lib/api/client": { api } })(
    "lib/api/content-editor.ts",
  );
  const result = await actual.getContentAuthorOptions(
    { page: 6, search: "Writer" },
    signal,
  );
  assert.deepEqual(result.data, [{ id: "101", name: "A Writer" }]);
  assert.doesNotMatch(JSON.stringify(result), /private/);
  assert.deepEqual(calls, [
    [
      "/content/author-options",
      {
        params: { page: 6, search: "Writer", limit: 20 },
        signal,
        timeout: 15000,
        silent: true,
      },
    ],
  ]);
  api.get = async () => ({ data: { success: false, data: [] } });
  await assert.rejects(() =>
    actual.getContentAuthorOptions({ page: 1, search: "" }),
  );
  await assert.rejects(() =>
    actual.getContentAuthorOptions({ page: 0, search: "" }),
  );
});

test("message writes use bounded transport and reject missing, failed or mismatched confirmations", async () => {
  const calls = [],
    api = Object.fromEntries(
      ["post", "patch"].map((method) => [
        method,
        async (...args) => {
          calls.push([method, ...args]);
          return { data: { success: true, data: { id: "7" } } };
        },
      ]),
    );
  const actual = sourceLoader({ "@/lib/api/client": { api } })(
    "lib/api/content-editor.ts",
  );
  await actual.saveContentEditor(values);
  await actual.saveContentEditor(values, "7");
  assert.deepEqual(
    calls.map((call) => [call[0], call[1], call[3]]),
    [
      ["post", "/content", { timeout: 30000, silent: true }],
      ["patch", "/content/7", { timeout: 30000, silent: true }],
    ],
  );
  api.patch = async () => ({ data: { data: { id: "8" } } });
  await assert.rejects(() => actual.saveContentEditor(values, "7"));
  for (const data of [{}, { success: false, data: { id: "7" } }]) {
    api.post = async () => ({ data });
    await assert.rejects(() => actual.saveContentEditor(values));
  }
});

test("MEDIA author/type reads isolate account, role and page keys and stop unauthorized requests", () => {
  const hooks = sourceLoader({
    "@tanstack/react-query": { useQuery: (options) => options },
    "@/lib/api/content-editor": {},
    "@/lib/api/type-catalogs": {},
  })("lib/hooks/useContentEditor.ts");
  const actor = { id: "1", roles: ["MEDIA"] },
    filters = { page: 1, search: "" },
    query = hooks.useContentAuthors(filters, actor);
  assert.equal(query.enabled, true);
  assert.equal(hooks.useContentEditorTypes(actor).enabled, true);
  assert.equal(query.refetchOnMount, "always");
  assert.equal(hooks.useContentAuthors(filters, null).enabled, false);
  assert.equal(
    hooks.useContentAuthors(filters, { ...actor, roles: ["MEMBER"] }).enabled,
    false,
  );
  assert.notDeepEqual(
    query.queryKey,
    hooks.useContentAuthors({ ...filters, page: 6 }, actor).queryKey,
  );
  assert.notDeepEqual(
    query.queryKey,
    hooks.useContentAuthors(filters, { ...actor, id: "2" }).queryKey,
  );
  for (const status of [401, 403, 404])
    assert.equal(query.retry(0, { response: { status } }), false);
});

test("message saves refresh content, type, history and overview caches on success or uncertainty without automatic write retries", async () => {
  const client = new QueryClient(),
    hooks = sourceLoader({
      "@tanstack/react-query": {
        useQueryClient: () => client,
        useMutation: (options) => options,
      },
      "@/lib/api/content-editor": {},
      "@/lib/api/type-catalogs": {},
    })("lib/hooks/useContentEditor.ts");
  const mutation = hooks.useSaveContentEditor();
  assert.equal(mutation.retry, false);
  for (const error of [null, new Error("response lost")]) {
    for (const key of [
      "content",
      "content-types",
      "audit-timeline",
      "dashboard-overview",
    ])
      client.setQueryData([key, "editor"], {});
    await mutation.onSettled(undefined, error);
    for (const key of [
      "content",
      "content-types",
      "audit-timeline",
      "dashboard-overview",
    ])
      assert.equal(client.getQueryState([key, "editor"]).isInvalidated, true);
  }
  client.clear();
});

function renderEditor({
  roles = ["MEDIA"],
  mode = "edit",
  id = "7",
  dirty = {},
  status = "Draft",
  query = {},
  mutate = async () => ({ data: { id: "7" } }),
} = {}) {
  let submit, media, fieldOptions;
  const pushes = [],
    resets = [];
  const { ContentForm } = sourceLoader({
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
        getValues: (key) => (key ? values[key] : values),
        setValue() {},
        reset: (data) => resets.push(data),
      }),
      useWatch: () => [
        values.body,
        values.authorId,
        values.typeId,
        values.tags,
        values.title,
      ],
      useFieldArray: (options) => {
        fieldOptions = options;
        return {
          fields: values.scriptures.map((entry) => ({
            ...entry,
            editorKey: "draft-" + entry.id,
          })),
          append() {},
          remove() {},
        };
      },
    },
    "next/navigation": {
      useRouter: () => ({ push: (href) => pushes.push(href) }),
    },
    "@/app/modules/auth/store/auth.store": {
      useAuthStore: (selector) => selector({ user: { id: "1", roles } }),
    },
    "@/lib/hooks/useContentEditor": {
      useSaveContentEditor: () => ({ isPending: false, mutateAsync: mutate }),
      useContentEditorTypes: () => ({
        data: [{ id: "2", name: "Teaching" }],
        ...query,
      }),
    },
    "@/components/ui/RichTextEditor": {
      RichTextEditor: ({ id, label, onBusyChange }) => {
        media = onBusyChange;
        return React.createElement("textarea", { id, "aria-label": label });
      },
    },
  })("app/modules/content/components/ContentForm.tsx");
  const html = renderToStaticMarkup(
    React.createElement(ContentForm, {
      mode,
      initialData: { ...values, id },
      status,
      initialAuthor: { id: "101", name: "Assigned writer" },
    }),
  );
  return {
    html,
    fieldOptions,
    pushes,
    resets,
    media,
    submit: (data = values) => submit(data),
  };
}

test("content workspace has clear writing/publishing guidance, labelled tags/references, current author and distinct lookup states", () => {
  const editor = renderEditor();
  assert.equal(editor.fieldOptions.keyName, "editorKey");
  for (const pattern of [
    /Message details/,
    /Write your message/,
    /saved as drafts/,
    /Assigned writer/,
    /for="content-tag-input"/,
    /for="content-scriptures-0-verseTo"/,
    /Version \(optional\)/,
    /index reference does not rewrite inline scripture/,
    /Save draft changes/,
    /keeps the existing public web address/,
  ])
    assert.match(editor.html, pattern);
  assert.equal((editor.html.match(/<form\b/g) || []).length, 1);
  assert.match(
    renderEditor({ status: "Published" }).html,
    /update the published message immediately/,
  );
  assert.match(
    renderEditor({ status: "Published" }).html,
    /Save published changes/,
  );
  assert.match(
    renderEditor({ query: { isPending: true } }).html,
    /Loading content types/,
  );
  assert.match(
    renderEditor({ query: { isError: true } }).html,
    /current choice is kept/,
  );
  assert.match(renderEditor({ roles: ["MEMBER"] }).html, /Access unavailable/);
});

test("pending content submissions happen once, preserve omitted relationships and navigate only after a confirmed save", async () => {
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
  for (const key of ["body", "authorId", "typeId", "tags", "scriptures"])
    assert.equal(writes[0].data[key], undefined);
  complete({ data: { id: "7" } });
  await first;
  assert.deepEqual(editor.pushes, ["/dashboard/content/7"]);
  const changed = [];
  const explicit = renderEditor({
    dirty: { authorId: true, tags: true, scriptures: true },
    mutate: async (data) => {
      changed.push(data);
      return { data: { id: "7" } };
    },
  });
  await explicit.submit({ ...values, authorId: "", tags: [], scriptures: [] });
  assert.equal(changed[0].data.authorId, "");
  assert.deepEqual(changed[0].data.scriptures, []);
});

test("uploads and missing record IDs prevent writes; save failures preserve draft values and navigation", async () => {
  let writes = 0;
  const upload = renderEditor({
    mutate: async () => {
      writes++;
    },
  });
  upload.media(true);
  await upload.submit();
  assert.equal(writes, 0);
  const missing = renderEditor({
    id: "",
    mutate: async () => {
      writes++;
    },
  });
  await missing.submit();
  assert.equal(writes, 0);
  const failed = renderEditor({
    mutate: async () => {
      throw new Error("response lost");
    },
  });
  await failed.submit();
  assert.deepEqual(failed.resets, []);
  assert.deepEqual(failed.pushes, []);
});

test("author selector distinguishes loading, failure, empty results and later pages without requiring the full member directory", () => {
  const render = (result) => {
    const { ContentAuthorSearch } = sourceLoader({
      "@/lib/hooks/useContentEditor": {
        useContentAuthors: () => ({
          isPending: false,
          isError: false,
          isFetching: false,
          ...result,
        }),
      },
    })("components/records/ContentAuthorPicker.tsx");
    return renderToStaticMarkup(
      React.createElement(ContentAuthorSearch, {
        actor: { id: "1", roles: ["MEDIA"] },
        onClose() {},
        onSelect() {},
      }),
    );
  };
  assert.match(render({ isPending: true }), /Finding authors/);
  assert.match(
    render({ isError: true, error: new Error("offline") }),
    /Could not load this author directory/,
  );
  assert.match(
    render({ data: { data: [], total: 0, limit: 20 } }),
    /No matching profiles/,
  );
  const html = render({
    data: { data: [{ id: "101", name: "A writer" }], total: 101, limit: 20 },
  });
  assert.match(html, /Page 1 of 6/);
  assert.match(html, /Only profile names and IDs/);
  assert.match(html, /Use selected author/);
});

test("content edit route keeps cached drafts after a background failure and retains scalar author/reference identities", () => {
  let props, allowed;
  const Page = sourceLoader({
    "next/navigation": {
      useParams: () => ({ id: "7" }),
      useRouter: () => ({ push() {} }),
    },
    "@/app/modules/auth/store/auth.store": {
      useAuthStore: (selector) => selector({ user: { roles: ["MEDIA"] } }),
    },
    "@/app/modules/content/hooks/useContent": {
      useContent: (_id, enabled) => {
        allowed = enabled;
        return {
          isPending: false,
          isError: true,
          data: {
            data: {
              ...values,
              id: "7",
              author: null,
              type: { id: "2", name: "Teaching" },
              status: "Published",
              tags: [{ tag: { name: "Faith" } }],
            },
          },
        };
      },
    },
    "@/lib/hooks/useEditorialLists": {
      useDeleteEditorialRecord: () => ({ mutateAsync: async () => {} }),
    },
    "@/app/modules/content/components/ContentForm": {
      ContentForm: (data) => {
        props = data;
        return React.createElement("div", {}, "Writer remains");
      },
    },
  })("app/(dashboard)/dashboard/content/[id]/edit/page.tsx").default;
  const html = renderToStaticMarkup(React.createElement(Page));
  assert.equal(allowed, true);
  assert.match(html, /entries are kept/);
  assert.match(html, /Writer remains/);
  assert.equal(props.initialData.authorId, "101");
  assert.equal(props.initialData.scriptures[0].id, "41");
  assert.equal(props.status, "Published");
});

test("native audio/video nodes retain direct or source-child URLs and YouTube rendering uses known player/watch destinations", () => {
  const actual = sourceLoader()("components/ui/NativeMediaExtension.ts");
  for (const node of [actual.NativeAudio, actual.NativeVideo]) {
    const rule = node.config.parseHTML()[0];
    const attrs = rule.getAttrs({
      getAttribute: () => null,
      querySelector: () => ({ getAttribute: () => "/uploads/audio.mp3" }),
    });
    assert.equal(attrs.src, "/uploads/audio.mp3");
    const dom = node.config.renderHTML({ HTMLAttributes: attrs });
    assert.equal(dom[0], node.name);
    assert.equal(dom[1].controls, "");
    assert.equal(dom[1].src, attrs.src);
    assert.equal(
      rule.getAttrs({
        getAttribute: () => "javascript:alert(1)",
        querySelector: () => null,
      }),
      false,
    );
  }
  const { SafeYoutube } = sourceLoader()(
    "components/ui/SafeYoutubeExtension.ts",
  );
  const markup = JSON.stringify(
    SafeYoutube.config.renderHTML({
      HTMLAttributes: { src: "https://youtu.be/abcdefghijk" },
    }),
  );
  assert.match(markup, /youtube-nocookie.com\/embed\/abcdefghijk/);
  assert.match(markup, /www.youtube.com\/watch\?v=abcdefghijk/);
  assert.equal(
    SafeYoutube.config.renderHTML({
      HTMLAttributes: {
        src: "https://evil.test/?youtube.com/embed/abcdefghijk",
      },
    })[0],
    "p",
  );
});

test("rich-text insertion uses bounded dialogs and non-submit controls, keeps invalid links open and inserts validated links", () => {
  const state = [],
    refs = [],
    links = [];
  let cursor = 0,
    refCursor = 0;
  const editor = {
    isActive: () => false,
    state: { selection: { from: 0, to: 0 } },
    chain: () => ({
      focus() {
        return this;
      },
      setLink({ href }) {
        links.push(href);
        return this;
      },
      run() {},
    }),
  };
  const { RichTextEditor } = sourceLoader({
    react: {
      ...React,
      useState: (initial) => {
        const index = cursor++;
        if (!(index in state)) state[index] = initial;
        return [
          state[index],
          (value) => {
            state[index] =
              typeof value === "function" ? value(state[index]) : value;
          },
        ];
      },
      useRef: (initial) => {
        const index = refCursor++;
        return (refs[index] ||= { current: initial });
      },
      useMemo: (factory) => factory(),
      useCallback: (fn) => fn,
      useEffect() {},
      useId: () => "test-rich",
      useImperativeHandle() {},
    },
    "@tiptap/react": { useEditor: () => editor, EditorContent: () => null },
    "tiptap-extension-resize-image": { configure: () => ({}) },
    "./ScriptureExtension": { Scripture: {} },
    "@/app/modules/content/hooks/useUploadMedia": {
      useUploadMedia: () => ({ mutateAsync: async () => ({ url: "/file" }) }),
    },
  })("components/ui/RichTextEditor.tsx");
  const render = () => {
    cursor = 0;
    refCursor = 0;
    return RichTextEditor.render({ id: "writer", label: "Body" }, null);
  };
  const all = (element) =>
    !element || typeof element !== "object"
      ? []
      : [
          element,
          ...React.Children.toArray(element.props?.children).flatMap(all),
        ];
  let tree = render();
  all(tree)
    .find((entry) => entry.props?.title === "Add Link")
    .props.onClick();
  tree = render();
  assert(all(tree).some((entry) => entry.props?.title === "Insert a link"));
  for (const button of all(tree).filter((entry) => entry.type === "button"))
    assert.equal(button.props.type, "button");
  all(tree)
    .find((entry) => entry.props?.id === "writer-insert-url")
    .props.onChange({ target: { value: "javascript:alert(1)" } });
  tree = render();
  all(tree)
    .find(
      (entry) => entry.type === "button" && entry.props.children === "Insert",
    )
    .props.onClick();
  tree = render();
  assert.deepEqual(links, []);
  assert(all(tree).some((entry) => entry.props?.role === "alert"));
  all(tree)
    .find((entry) => entry.props?.id === "writer-insert-url")
    .props.onChange({ target: { value: "https://church.test/welcome" } });
  tree = render();
  all(tree)
    .find(
      (entry) => entry.type === "button" && entry.props.children === "Insert",
    )
    .props.onClick();
  assert.deepEqual(links, ["https://church.test/welcome"]);
});
