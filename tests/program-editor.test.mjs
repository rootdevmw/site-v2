import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import * as jsx from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { sourceLoader } from "./helpers/load-source.mjs";
const helpers = sourceLoader()("lib/utils/program-editor.ts");
const values = {
  name: "Sunday outline",
  date: "2026-10-22",
  location: "Church",
  typeId: "2",
  homecellId: "9",
  items: [
    {
      id: "11",
      title: "Welcome",
      description: "Welcome everyone",
      time: "09:00",
      responsibleId: "101",
    },
    {
      id: "12",
      title: "Message",
      description: "Study together",
      time: "After the welcome",
      responsibleId: "",
    },
  ],
};

test("program and template schemas require their own identity fields, validate calendars and normalize clock conflicts while preserving timing instructions", () => {
  for (const kind of ["program", "template"]) {
    assert.equal(
      helpers.programEditorSchema(kind).safeParse(values).success,
      true,
    );
    assert.equal(
      helpers.programEditorSchema(kind).safeParse({ ...values, items: [] })
        .success,
      true,
    );
    for (const invalid of [
      { typeId: "" },
      { homecellId: "9223372036854775808" },
      { items: [{ title: " " }] },
      { items: [{ title: "A", time: "24:00" }] },
      {
        items: [
          { title: "A", time: "9:30" },
          { title: "B", time: "09:30:00" },
        ],
      },
      { items: [{ title: "A", description: "é".repeat(32768) }] },
    ])
      assert.equal(
        helpers.programEditorSchema(kind).safeParse({ ...values, ...invalid })
          .success,
        false,
      );
    assert.equal(
      helpers.programEditorSchema(kind).safeParse({
        ...values,
        items: [
          { title: "A", time: "After prayer" },
          { title: "B", time: "After prayer" },
        ],
      }).success,
      true,
    );
  }
  assert.equal(
    helpers
      .programEditorSchema("program")
      .safeParse({ ...values, date: "2026-02-29" }).success,
    false,
  );
  assert.equal(
    helpers
      .programEditorSchema("template")
      .safeParse({ ...values, name: " ", date: "" }).success,
    false,
  );
  assert.equal(
    helpers.programEditorSchema("template").safeParse({ ...values, date: "" })
      .success,
    true,
  );
});

test("defaults retain partial homecell context and activity identities, sparse payloads preserve associations, and template copies discard item IDs and program-only fields", () => {
  assert.equal(
    helpers.programEditorDefaults({ homecellId: "9" }).homecellId,
    "9",
  );
  assert.equal(
    helpers.programEditorDefaults({ date: "2026-10-21T22:30:00Z" }).date,
    "2026-10-22",
  );
  const unchanged = helpers.programEditorPayload("program", values, {});
  assert.equal(unchanged.items, undefined);
  assert.equal(unchanged.date, undefined);
  assert.equal(unchanged.typeId, undefined);
  assert.equal(unchanged.homecellId, undefined);
  const changed = helpers.programEditorPayload(
    "template",
    { ...values, homecellId: "", items: [values.items[1], values.items[0]] },
    { homecell: true, items: true },
  );
  assert.equal(changed.homecellId, "");
  assert.deepEqual(
    changed.items.map((item) => [item.id, item.sequence]),
    [
      ["12", 1],
      ["11", 2],
    ],
  );
  const copy = helpers.programEditorPayload(
    "template",
    helpers.templateDraft(values, "Copy"),
  );
  assert.equal(copy.date, undefined);
  assert.equal(copy.location, undefined);
  assert.equal(copy.items[0].id, undefined);
  assert.equal(copy.items[0].description, values.items[0].description);
  assert.equal(copy.items[0].responsibleId, "101");
  assert.deepEqual(
    helpers.programFieldErrors({
      items: [{ title: { message: "Title required", ref: {} } }],
    }),
    [{ path: "items.0.title", message: "Title required" }],
  );
});

test("template selection reaches later bounded server pages, cancels reads and projects only identity/name", async () => {
  const calls = [],
    signal = new AbortController().signal;
  const api = {
    get: async (...args) => {
      calls.push(args);
      return {
        data: {
          data: [{ id: "101", name: "Later outline", internal: "private" }],
          meta: { page: 11, limit: 10, total: 101 },
        },
      };
    },
  };
  const actual = sourceLoader({ "@/lib/api/client": { api } })(
    "lib/api/program-editor.ts",
  );
  const result = await actual.getProgramTemplateChoices(
    { page: 11, search: "outline" },
    signal,
  );
  assert.deepEqual(result.data, [{ id: "101", name: "Later outline" }]);
  assert.doesNotMatch(JSON.stringify(result), /private/);
  assert.deepEqual(calls, [
    [
      "/program-templates",
      {
        params: { page: 11, search: "outline", limit: 10 },
        signal,
        timeout: 15000,
        silent: true,
      },
    ],
  ]);
  await assert.rejects(() =>
    actual.getProgramTemplateChoices({ page: 0, search: "" }),
  );
  api.get = async () => ({ data: { success: false, data: [] } });
  await assert.rejects(() =>
    actual.getProgramTemplateChoices({ page: 1, search: "" }),
  );
});

test("template previews validate identity and ordered full activities without leaking unrelated fields", async () => {
  const api = {
    get: async () => ({
      data: {
        data: {
          id: "7",
          name: "Outline",
          type: { id: "2", name: "Service" },
          homecellId: "9",
          items: values.items
            .slice()
            .reverse()
            .map((item, index) => ({
              ...item,
              sequence: 2 - index,
              responsibleId: item.responsibleId || null,
            })),
          hidden: "private",
        },
      },
    }),
  };
  const actual = sourceLoader({ "@/lib/api/client": { api } })(
    "lib/api/program-editor.ts",
  );
  const result = await actual.getProgramEditorTemplate("7");
  assert.deepEqual(
    result.items.map((item) => item.id),
    ["11", "12"],
  );
  assert.equal(result.items[0].description, "Welcome everyone");
  assert.equal(result.hidden, undefined);
  await assert.rejects(() => actual.getProgramEditorTemplate("8"));
});

test("both editor transports use bounded writes and reject failed, missing and mismatched save confirmations", async () => {
  const calls = [];
  const api = Object.fromEntries(
    ["post", "patch"].map((method) => [
      method,
      async (...args) => {
        calls.push([method, ...args]);
        return { data: { success: true, data: { id: "7" } } };
      },
    ]),
  );
  const actual = sourceLoader({ "@/lib/api/client": { api } })(
    "lib/api/program-editor.ts",
  );
  for (const kind of ["program", "template"]) {
    await actual.saveProgramEditor(kind, values);
    await actual.saveProgramEditor(kind, values, "7");
  }
  assert.deepEqual(
    calls.map((call) => [call[0], call[1], call[3]]),
    ["programs", "program-templates"].flatMap((path) => [
      ["post", "/" + path, { timeout: 30000, silent: true }],
      ["patch", "/" + path + "/7", { timeout: 30000, silent: true }],
    ]),
  );
  api.patch = async () => ({ data: { data: { id: "8" } } });
  await assert.rejects(() => actual.saveProgramEditor("program", values, "7"));
  for (const data of [
    { success: false, data: { id: "7" } },
    {},
    { data: {} },
  ]) {
    api.post = async () => ({ data });
    await assert.rejects(() => actual.saveProgramEditor("template", values));
  }
});

test("editor option/preview queries isolate principals, roles and pages and guard unauthorized reads", () => {
  const hooks = sourceLoader({
    "@tanstack/react-query": { useQuery: (options) => options },
    "@/lib/api/program-editor": {},
    "@/lib/api/type-catalogs": {},
  })("lib/hooks/useProgramEditor.ts");
  const actor = { id: "1", roles: ["DEACON"] },
    filters = { page: 1, search: "" };
  const queries = [
    hooks.useProgramEditorTypes(actor),
    hooks.useProgramTemplateChoices(filters, actor),
    hooks.useProgramEditorTemplate("7", actor),
  ];
  queries.forEach((query) => {
    assert.equal(query.enabled, true);
    assert.equal(query.placeholderData, undefined);
    assert.equal(query.retry(0, { response: { status: 403 } }), false);
  });
  assert.equal(hooks.useProgramEditorTypes(null).enabled, false);
  assert.equal(
    hooks.useProgramTemplateChoices(filters, { ...actor, roles: ["MEDIA"] })
      .enabled,
    false,
  );
  assert.equal(hooks.useProgramEditorTemplate("", actor).enabled, false);
  assert.notDeepEqual(
    queries[1].queryKey,
    hooks.useProgramTemplateChoices({ page: 11, search: "" }, actor).queryKey,
  );
  assert.notDeepEqual(
    queries[0].queryKey,
    hooks.useProgramEditorTypes({ ...actor, id: "2" }).queryKey,
  );
});

test("program/template saves reconcile related schedule, homecell, member and history caches on either outcome without automatic retries", async () => {
  const client = new QueryClient();
  const hooks = sourceLoader({
    "@tanstack/react-query": {
      useQueryClient: () => client,
      useMutation: (options) => options,
    },
    "@/lib/api/program-editor": {},
    "@/lib/api/type-catalogs": {},
  })("lib/hooks/useProgramEditor.ts");
  const keys = [
    "program",
    "programs",
    "program-template",
    "program-templates",
    "homecell",
    "member",
    "audit-timeline",
    "dashboard-overview",
  ];
  for (const kind of ["program", "template"]) {
    const mutation = hooks.useSaveProgramEditor(kind);
    assert.equal(mutation.retry, false);
    for (const error of [null, new Error("response lost")]) {
      keys.forEach((key) => client.setQueryData([key, "editor"], {}));
      await mutation.onSettled(undefined, error);
      keys.forEach((key) =>
        assert.equal(client.getQueryState([key, "editor"]).isInvalidated, true),
      );
    }
  }
  client.clear();
});

function renderEditor({
  kind = "program",
  roles = ["DEACON"],
  mode = "edit",
  id = "7",
  dirty = {},
  query = {},
  pending = false,
  mutate = async () => ({ data: { id: "7" } }),
} = {}) {
  let submit, fieldOptions, drag;
  const pushes = [],
    resets = [],
    moves = [],
    buttons = [];
  const capture = (base) => (type, props, key) => {
    if (type === "button") buttons.push(props);
    return base(type, props, key);
  };
  const { ProgramEditor } = sourceLoader({
    "react/jsx-runtime": {
      ...jsx,
      jsx: capture(jsx.jsx),
      jsxs: capture(jsx.jsxs),
    },
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
        getValues: () => values,
        setValue() {},
        reset: (data) => resets.push(data),
      }),
      useWatch: () => [values.items, values.typeId, values.homecellId],
      useFieldArray: (options) => {
        fieldOptions = options;
        return {
          fields: values.items.map((item) => ({
            ...item,
            editorKey: "draft-" + item.id,
          })),
          append() {},
          remove() {},
          replace() {},
          move: (...args) => moves.push(args),
        };
      },
    },
    "@dnd-kit/core": {
      DndContext: ({ children, onDragEnd }) => {
        drag = onDragEnd;
        return React.createElement("div", {}, children);
      },
      useSensors: () => [],
      useSensor: () => ({}),
      PointerSensor() {},
      KeyboardSensor() {},
    },
    "@dnd-kit/sortable": {
      SortableContext: ({ children }) => children,
      useSortable: () => ({ attributes: {}, listeners: {} }),
    },
    "next/navigation": {
      useRouter: () => ({ push: (href) => pushes.push(href) }),
    },
    "@/app/modules/auth/store/auth.store": {
      useAuthStore: (selector) => selector({ user: { id: "1", roles } }),
    },
    "@/lib/hooks/useProgramEditor": {
      useSaveProgramEditor: () => ({ isPending: pending, mutateAsync: mutate }),
      useProgramEditorTypes: () => ({
        data: [{ id: "2", name: "Service" }],
        ...query,
      }),
    },
    "@/lib/hooks/useMemberEditorOptions": {
      useMemberEditorOptions: () => ({
        data: [{ id: "9", name: "Current homecell" }],
        ...query,
      }),
    },
    "@/app/modules/programs/components/ProgramTypeForm": {
      ProgramTypeForm: () => null,
    },
  })("components/records/ProgramEditor.tsx");
  const html = renderToStaticMarkup(
    React.createElement(ProgramEditor, {
      kind,
      mode,
      initialData: { ...values, id },
      initialPeople: [{ id: "101", name: "Assigned person" }],
    }),
  );
  return {
    html,
    fieldOptions,
    pushes,
    resets,
    moves,
    buttons,
    drag: (event) => drag(event),
    submit: (data = values) => submit(data),
  };
}

test("both editors render labelled notes, responsibility controls, reorder alternatives, and recoverable lookups without nested forms", () => {
  const program = renderEditor();
  assert.equal(program.fieldOptions.keyName, "editorKey");
  for (const pattern of [
    /Gathering details/,
    /Malawi time/,
    /for="program-date"/,
    /for="program-items-0-description"/,
    /Assigned person/,
    /Move up/,
    /Move down/,
    /Drag activity 1/,
    /Start from a template/,
    /Save a template copy/,
    /keeps the existing public web address/,
  ])
    assert.match(program.html, pattern);
  assert.equal((program.html.match(/<form\b/g) || []).length, 1);
  const template = renderEditor({ kind: "template" }).html;
  assert.match(template, /Template details/);
  assert.match(template, /Template name/);
  assert.doesNotMatch(template, /for="program-date"|Save a template copy/);
  assert.match(
    renderEditor({ query: { isError: true } }).html,
    /current assignment is kept/,
  );
  assert.match(
    renderEditor({ query: { isPending: true } }).html,
    /Loading program types/,
  );
  assert.match(renderEditor({ roles: ["MEDIA"] }).html, /Access unavailable/);
});

test("pending submissions write once, edit payloads retain unchanged activities, and explicit clearing persists with confirmed-record navigation", async () => {
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
  assert.equal(writes[0].data.items, undefined);
  assert.equal(writes[0].data.homecellId, undefined);
  complete({ data: { id: "7" } });
  await first;
  assert.deepEqual(editor.pushes, ["/dashboard/programs/7"]);
  const changed = [];
  const template = renderEditor({
    kind: "template",
    dirty: { homecellId: true, items: true },
    mutate: async (data) => {
      changed.push(data);
      return { data: { id: "7" } };
    },
  });
  await template.submit({ ...values, homecellId: "", items: [] });
  assert.equal(changed[0].data.homecellId, "");
  assert.deepEqual(changed[0].data.items, []);
  assert.deepEqual(template.pushes, ["/dashboard/program-templates/7"]);
  let attempted = false;
  const missing = renderEditor({
    id: "",
    mutate: async () => {
      attempted = true;
    },
  });
  await missing.submit();
  assert.equal(attempted, false);
  const failed = renderEditor({
    mutate: async () => {
      throw new Error("lost response");
    },
  });
  await failed.submit();
  assert.deepEqual(failed.resets, []);
  assert.deepEqual(failed.pushes, []);
});

test("move buttons and dedicated drag ordering use field identities, ignore unknown targets and stop while saving", () => {
  const editor = renderEditor();
  editor.buttons
    .find((button) => button["aria-label"] === "Move activity 1 down")
    .onClick();
  editor.drag({ active: { id: "draft-12" }, over: { id: "draft-11" } });
  editor.drag({ active: { id: "unknown" }, over: { id: "draft-11" } });
  editor.drag({ active: { id: "draft-11" }, over: null });
  assert.deepEqual(editor.moves, [
    [0, 1],
    [1, 0],
  ]);
  const blocked = renderEditor({ pending: true });
  blocked.drag({ active: { id: "draft-11" }, over: { id: "draft-12" } });
  assert.deepEqual(blocked.moves, []);
});

test("template selection distinguishes loading, error, empty and later-page results and states exactly what applying replaces", () => {
  const render = (result) => {
    const { ProgramTemplatePicker } = sourceLoader({
      "@/lib/hooks/useProgramEditor": {
        useProgramTemplateChoices: () => ({
          isPending: false,
          isError: false,
          isFetching: false,
          ...result,
        }),
        useProgramEditorTemplate: () => ({}),
      },
    })("components/records/ProgramTemplatePicker.tsx");
    return renderToStaticMarkup(
      React.createElement(ProgramTemplatePicker, {
        actor: { id: "1", roles: ["DEACON"] },
        onClose() {},
        onApply() {},
      }),
    );
  };
  assert.match(render({ isPending: true }), /Finding templates/);
  assert.match(
    render({ isError: true, error: new Error("offline") }),
    /Could not load this template directory/,
  );
  assert.match(
    render({ data: { data: [], total: 0, limit: 10 } }),
    /No matching templates/,
  );
  const html = render({
    data: {
      data: [{ id: "101", name: "Later outline" }],
      total: 101,
      limit: 10,
    },
  });
  for (const pattern of [
    /Page 1 of 11/,
    /replaces the current activities, program type and homecell/,
    /date and location stay/,
    /Apply selected template/,
    /Keep current activities/,
  ])
    assert.match(html, pattern);
});

test("both edit routes retain cached drafts after background failures and forward existing activity identities", () => {
  for (const [route, queryPath, hookName, formPath, formName] of [
    [
      "programs",
      "@/app/modules/programs/hooks/useProgram",
      "useProgram",
      "@/app/modules/programs/components/ProgramForm",
      "ProgramForm",
    ],
    [
      "program-templates",
      "@/app/modules/programTemplates/hooks/useProgramTemplate",
      "useProgramTemplate",
      "@/app/modules/programTemplates/components/ProgramTemplateForm",
      "ProgramTemplateForm",
    ],
  ]) {
    let props, permitted;
    const Page = sourceLoader({
      "next/navigation": {
        useParams: () => ({ id: "7" }),
        useRouter: () => ({ push() {} }),
      },
      "@/app/modules/auth/store/auth.store": {
        useAuthStore: (selector) => selector({ user: { roles: ["DEACON"] } }),
      },
      [queryPath]: {
        [hookName]: (_id, allowed) => {
          permitted = allowed;
          return {
            isPending: false,
            isError: true,
            data: {
              data: {
                ...values,
                id: "7",
                type: { id: "2", name: "Service" },
                items: values.items.map((item, index) => ({
                  ...item,
                  sequence: index + 1,
                })),
              },
            },
          };
        },
      },
      "@/lib/hooks/useScheduleLists": {
        useDeleteScheduleRecord: () => ({ mutateAsync: async () => {} }),
      },
      [formPath]: {
        [formName]: (data) => {
          props = data;
          return React.createElement("div", {}, "Editor remains");
        },
      },
    })(`app/(dashboard)/dashboard/${route}/[id]/edit/page.tsx`).default;
    const html = renderToStaticMarkup(React.createElement(Page));
    assert.equal(permitted, true);
    assert.match(html, /entries are kept/);
    assert.match(html, /Editor remains/);
    assert.equal(props.initialData.items[0].id, "11");
  }
});
