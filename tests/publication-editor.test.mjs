import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { sourceLoader } from "./helpers/load-source.mjs";
const helpers = sourceLoader()("lib/utils/publication-editor.ts");
const pdf = () =>
  new File(["%PDF-1.7\nfixture"], "church-news.PDF", {
    type: "application/pdf",
  });
const initial = {
  id: "7",
  title: "Church news",
  description: "For our church family",
  publishedAt: "2026-10-22T07:00:00.123Z",
  fileUrl: "https://files.example/news.pdf",
};
const values = helpers.publicationEditorDefaults(initial);

test("publication defaults preserve the saved date in CAT and new records begin as fileless drafts", () => {
  assert.equal(values.publishedAt, "2026-10-22T09:00:00.123");
  assert.equal(values.visibility, "Published");
  assert.deepEqual(helpers.publicationEditorDefaults(), {
    title: "",
    description: "",
    visibility: "Draft",
    publishedAt: "",
    file: undefined,
  });
  const payload = helpers.publicationEditorPayload(values);
  assert.equal(payload.publishedAt, initial.publishedAt);
  assert.equal(
    helpers.publicationEditorPayload({ ...values, visibility: "Draft" })
      .publishedAt,
    null,
  );
});

test("publication validation enforces title and byte limits and real dates only for published records", () => {
  assert.equal(helpers.publicationEditorSchema.safeParse(values).success, true);
  assert.equal(
    helpers.publicationEditorSchema.safeParse({
      ...values,
      visibility: "Draft",
      publishedAt: "",
    }).success,
    true,
  );
  for (const invalid of [
    { title: " " },
    { title: "a".repeat(192) },
    { description: "\u00e9".repeat(32768) },
    { publishedAt: "2026-02-30T09:00" },
    { publishedAt: "2026-10-22T24:00" },
    { visibility: "Scheduled" },
    { file: {} },
  ])
    assert.equal(
      helpers.publicationEditorSchema.safeParse({ ...values, ...invalid })
        .success,
      false,
    );
  const native = globalThis.File;
  try {
    globalThis.File = undefined;
    assert.equal(
      helpers.publicationEditorSchema.safeParse(values).success,
      true,
    );
  } finally {
    globalThis.File = native;
  }
});

test("PDF selection checks type, size and actual header, including empty MIME and unreadable files", async () => {
  assert.equal(await helpers.validatePublicationFile(pdf()), "");
  assert.equal(
    await helpers.validatePublicationFile(new File(["%PDF-1.7"], "news.pdf")),
    "",
  );
  for (const file of [
    new File([], "empty.pdf"),
    new File(["%PDF-"], "file.html", { type: "text/html" }),
    new File(["wrong"], "fake.pdf", { type: "application/pdf" }),
  ])
    assert.ok(await helpers.validatePublicationFile(file));
  assert.match(
    helpers.publicationFileIssue({
      name: "big.pdf",
      size: helpers.PUBLICATION_FILE_LIMIT + 1,
      type: "application/pdf",
    }),
    /50 MB/,
  );
  const unreadable = pdf();
  unreadable.slice = () => ({
    text: async () => {
      throw new Error("removed file");
    },
  });
  assert.match(
    await helpers.validatePublicationFile(unreadable),
    /could not be read/,
  );
});

test("sparse publication updates preserve untouched fields and explicitly clear descriptions and publishing", () => {
  assert.deepEqual(helpers.publicationEditorPayload(values, {}), {});
  assert.deepEqual(
    helpers.publicationEditorPayload(
      { ...values, title: " Updated ", description: "", visibility: "Draft" },
      { title: true, description: true, visibility: true },
    ),
    { title: "Updated", description: "", publishedAt: null },
  );
  const file = pdf();
  assert.equal(
    helpers.publicationEditorPayload({ ...values, file }, {}).file,
    file,
  );
  assert.throws(
    () => helpers.publicationEditorPayload({ ...values, publishedAt: "" }),
    /date/,
  );
});

test("multipart saves send explicit empty values, retain the selected PDF and let the transport set its boundary", async () => {
  const calls = [],
    file = pdf();
  const api = {
    post: async (...args) => {
      calls.push(args);
      return {
        data: { success: true, data: { id: "8", title: "server data" } },
      };
    },
    patch: async (...args) => {
      calls.push(args);
      return { data: { success: true, data: { id: "7" } } };
    },
  };
  const { savePublicationEditor } = sourceLoader({
    "@/lib/api/client": { api },
  })("lib/api/publication-editor.ts");
  assert.deepEqual(
    await savePublicationEditor({
      title: "News",
      description: "",
      publishedAt: null,
      file,
    }),
    { success: true, data: { id: "8" } },
  );
  assert.equal(calls[0][1].get("description"), "");
  assert.equal(calls[0][1].get("publishedAt"), "");
  assert.equal(calls[0][1].get("file").name, file.name);
  assert.equal(await calls[0][1].get("file").text(), await file.text());
  assert.equal(calls[0][2].headers, undefined);
  assert.equal(calls[0][2].timeout, 60000);
  assert.equal(calls[0][2].silent, true);
  await savePublicationEditor({ title: "Renamed" }, "7");
  assert.equal(calls[1][0], "/publications/7");
  for (const key of ["description", "publishedAt", "file"])
    assert.equal(calls[1][1].has(key), false);
});

test("unconfirmed or mismatched save results and invalid update IDs cannot be accepted as success", async () => {
  for (const result of [
    { success: false, data: { id: "7" } },
    { success: true, data: { id: "8" } },
    { success: true, data: { id: "0" } },
    { data: null },
  ]) {
    const { savePublicationEditor } = sourceLoader({
      "@/lib/api/client": { api: { patch: async () => ({ data: result }) } },
    })("lib/api/publication-editor.ts");
    await assert.rejects(() => savePublicationEditor({}, "7"));
  }
  const { savePublicationEditor } = sourceLoader({
    "@/lib/api/client": { api: {} },
  })("lib/api/publication-editor.ts");
  for (const id of ["", "0", "7/edit"])
    await assert.rejects(
      () => savePublicationEditor({}, id),
      /valid publication/,
    );
});

test("save mutations avoid automatic retry and reconcile publication, audit and overview caches for success and uncertainty", async () => {
  const client = new QueryClient();
  let mutation;
  sourceLoader({
    "@tanstack/react-query": {
      useMutation: (options) => {
        mutation = options;
      },
      useQueryClient: () => client,
    },
  })("lib/hooks/usePublicationEditor.ts").useSavePublicationEditor();
  assert.equal(mutation.retry, false);
  for (const error of [null, new Error("response lost")]) {
    for (const key of [
      "publications",
      "publication",
      "audit-logs",
      "audit-timeline",
      "dashboard-overview",
    ])
      client.setQueryData([key, "fixture"], {});
    await mutation.onSettled(undefined, error);
    for (const key of [
      "publications",
      "publication",
      "audit-logs",
      "audit-timeline",
      "dashboard-overview",
    ])
      assert.equal(client.getQueryState([key, "fixture"]).isInvalidated, true);
  }
  client.clear();
});

function renderEditor({
  roles = ["MEDIA"],
  mode = "edit",
  data = initial,
  entries = values,
  dirty = {},
  mutate = async () => ({ data: { id: "7" } }),
} = {}) {
  let submit;
  const pushes = [],
    resets = [],
    errors = [],
    changes = [];
  const { PublicationForm } = sourceLoader({
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
        clearErrors() {},
        reset: (data) => resets.push(data),
      }),
      useWatch: () => [entries.file, entries.visibility, entries.publishedAt],
    },
    "next/navigation": {
      useRouter: () => ({ push: (href) => pushes.push(href) }),
    },
    "@/app/modules/auth/store/auth.store": {
      useAuthStore: (selector) => selector({ user: { id: "1", roles } }),
    },
    "@/lib/hooks/usePublicationEditor": {
      useSavePublicationEditor: () => ({
        isPending: false,
        mutateAsync: mutate,
      }),
    },
  })("app/modules/publications/components/PublicationForm.tsx");
  const html = renderToStaticMarkup(
    React.createElement(PublicationForm, { mode, initialData: data }),
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

test("publication workspace has associated fields, saved-document controls, selected-file context and honest publishing guidance", () => {
  const editor = renderEditor({ entries: { ...values, file: pdf() } });
  assert.equal((editor.html.match(/<form\b/g) || []).length, 1);
  for (const pattern of [
    /for="publication-title"/,
    /for="publication-description"/,
    /for="publication-file"/,
    /for="publication-visibility"/,
    /for="publication-publishedAt"/,
    /Currently saved document/,
    /Keep current document/,
    /Selected: church-news.PDF/,
    /50 MB/,
    /CAT, UTC\+2/,
    /future date does not schedule/,
    /Save published changes/,
  ])
    assert.match(editor.html, pattern);
  const draft = renderEditor({
    mode: "create",
    data: {},
    entries: { ...values, visibility: "Draft", publishedAt: "" },
  });
  assert.match(draft.html, /Save draft/);
  assert.match(draft.html, /document is optional/);
  assert.match(renderEditor({ roles: ["MEMBER"] }).html, /Access unavailable/);
});

test("overlapping publication submissions are blocked during PDF reading and navigation waits for a confirmed write", async () => {
  let complete;
  const pending = new Promise((resolve) => {
      complete = resolve;
    }),
    file = pdf(),
    writes = [];
  file.slice = () => ({ text: () => pending });
  const editor = renderEditor({
    entries: { ...values, file },
    mutate: async (input) => {
      writes.push(input);
      return { data: { id: "7" } };
    },
  });
  const first = editor.submit();
  await editor.submit();
  assert.equal(writes.length, 0);
  complete("%PDF-");
  await first;
  assert.equal(writes.length, 1);
  assert.equal(writes[0].id, "7");
  assert.equal(writes[0].data.publishedAt, undefined);
  assert.deepEqual(editor.pushes, ["/dashboard/publications/7"]);
  assert.equal(editor.resets[0].file, undefined);
});

test("invalid files, missing edit IDs, fileless publishing and insufficient roles prevent writes", async () => {
  let writes = 0;
  const mutate = async () => {
    writes++;
    return { data: { id: "7" } };
  };
  const bad = renderEditor({
    entries: { ...values, file: new File(["not a PDF"], "fake.pdf") },
    mutate,
  });
  await bad.submit();
  assert.equal(bad.errors[0][0], "file");
  const missing = renderEditor({ data: { ...initial, id: undefined }, mutate });
  await missing.submit();
  const empty = renderEditor({ data: { ...initial, fileUrl: "" }, mutate });
  await empty.submit();
  assert.match(empty.errors[0][1].message, /Attach a PDF/);
  const denied = renderEditor({ roles: ["MEMBER"], mutate });
  assert.doesNotMatch(denied.html, /<form/);
  assert.equal(writes, 0);
});

test("save failure retains entries and attachment without resetting or navigating, and explains uncertain outcomes", async () => {
  const file = pdf(),
    entries = { ...values, file };
  const editor = renderEditor({
    entries,
    mutate: async () => {
      throw new Error("response lost");
    },
  });
  await editor.submit();
  assert.deepEqual(editor.resets, []);
  assert.deepEqual(editor.pushes, []);
  assert.equal(entries.file, file);
  for (const [status, message] of [
    [401, /Sign in again/],
    [403, /permission/],
    [404, /no longer available/],
    [400, /usable attachment/],
    [413, /50 MB/],
  ])
    assert.match(
      helpers.publicationEditorFailure({ response: { status } }, true),
      message,
    );
  assert.match(
    helpers.publicationEditorFailure(new Error(), true),
    /may already have been created/,
  );
  assert.match(
    helpers.publicationEditorFailure(new Error(), false),
    /selected document are kept/,
  );
});

test("edit route preserves a cached form during a background read failure and separates initial loading/access/missing states", () => {
  const render = (query, roles = ["MEDIA"]) => {
    const Page = sourceLoader({
      "next/navigation": {
        useParams: () => ({ id: "7" }),
        useRouter: () => ({ push() {} }),
      },
      "@/app/modules/auth/store/auth.store": {
        useAuthStore: (selector) => selector({ user: { roles } }),
      },
      "@/app/modules/publications/hooks/usePublication": {
        usePublication: () => ({ isPending: false, isError: false, ...query }),
      },
      "@/app/modules/publications/hooks/useDeletePublication": {
        useDeletePublication: () => ({ mutateAsync() {} }),
      },
      "@/app/modules/publications/components/PublicationForm": {
        PublicationForm: (props) =>
          React.createElement("p", null, "Editor #" + props.initialData.id),
      },
    })("app/(dashboard)/dashboard/publications/[id]/edit/page.tsx").default;
    return renderToStaticMarkup(React.createElement(Page));
  };
  assert.match(render({ data: { data: initial }, isError: true }), /Editor #7/);
  assert.match(
    render({ data: { data: initial }, isError: true }),
    /current editor is kept/,
  );
  assert.match(render({ isPending: true }), /Loading publication editor/);
  assert.match(
    render({ isError: true, error: new Error("unavailable") }),
    /Could not load this record/,
  );
  assert.match(render({}), /Publication not found/);
  assert.match(render({}, ["MEMBER"]), /Access unavailable/);
});

test("publication deletion requires a confirmed server result and uses a bounded request", async () => {
  let config;
  const { deletePublication } = sourceLoader({
    "@/lib/api/client": {
      api: {
        delete: async (_url, options) => {
          config = options;
          return { data: { success: true, data: {} } };
        },
      },
    },
  })("app/modules/publications/api/deletePublication.ts");
  await deletePublication("7");
  assert.equal(config.timeout, 30000);
  assert.equal(config.silent, true);
  const failed = sourceLoader({
    "@/lib/api/client": {
      api: { delete: async () => ({ data: { success: false } }) },
    },
  })("app/modules/publications/api/deletePublication.ts");
  await assert.rejects(
    () => failed.deletePublication("7"),
    /could not be confirmed/,
  );
});
