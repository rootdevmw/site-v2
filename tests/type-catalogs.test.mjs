import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { sourceLoader } from "./helpers/load-source.mjs";

const load = sourceLoader();
const { readCatalogFilters, catalogHref, catalogPage, catalogNameError, catalogWriteError } = load("lib/utils/type-catalogs.ts");
const filters = (query = "") => readCatalogFilters(new URLSearchParams(query));
const types = Array.from({ length: 25 }, (_, index) => ({ id: String(index + 1), name: `Sunday service ${index + 1}` }));

test("catalog search and paging use the full collection, retain URL filters and keep unavailable pages explicit", () => {
  const selected = filters("search=Sunday+%26+Care&page=3");
  assert.equal(catalogHref("content", selected), "/dashboard/content-types?search=Sunday+%26+Care&page=3");
  assert.equal(catalogHref("programs", selected), "/dashboard/program-types?search=Sunday+%26+Care&page=3");
  assert.equal(catalogPage(types, filters("page=2")).data[0].id, "11");
  assert.equal(catalogPage(types, filters("search=SERVICE+sunday")).total, 25);
  assert.deepEqual(catalogPage(types, filters("page=9")), { data: [], total: 25, limit: 10 });
  for (const page of ["-1", "1.5", "Infinity", "9007199254740992"]) assert.equal(filters("page=" + page).page, 1);
});

test("type names reject whitespace and oversize values and write errors distinguish conflicts and lost responses", () => {
  for (const value of ["", "   ", "x".repeat(101)]) assert.ok(catalogNameError(value));
  assert.equal(catalogNameError(" Sunday service "), "");
  assert.match(catalogWriteError({ response: { status: 409 } }, "delete"), /Reassign/);
  assert.match(catalogWriteError({ response: { status: 409 } }, "create"), /already exists/);
  for (const [status, label] of [[401, /Sign in/], [403, /permission/], [404, /no longer available/]]) assert.match(catalogWriteError({ response: { status } }, "rename"), label);
  assert.match(catalogWriteError(new Error("offline"), "create"), /Check the refreshed catalog/);
});

test("actual catalog reads project and sort complete collections, omit removed records and reject incomplete data", async () => {
  const calls = [];
  const api = { get: async (...args) => { calls.push(args); return { data: { data: [{ id: "2", name: "Worship", private: "not cached" }, { id: "1", name: "Bible study" }, { id: "3", name: "Removed", deletedAt: "2026-10-21" }] } }; } };
  const actual = sourceLoader({ "@/lib/api/client": { api } })("lib/api/type-catalogs.ts");
  const signal = new AbortController().signal;
  assert.deepEqual(await actual.getTypeCatalog("content", signal), [{ id: "1", name: "Bible study" }, { id: "2", name: "Worship" }]);
  await actual.getTypeCatalog("programs", signal);
  assert.deepEqual(calls, [["/content/types", { signal, timeout: 15000, silent: true }], ["/programs/types", { signal, timeout: 15000, silent: true }]]);
  for (const response of [{ data: null }, { success: false, data: [] }, { data: [{ id: "1", name: "Type" }], meta: { total: 20 } }, { data: [{ name: "Missing ID" }] }, { data: [{ id: "1", name: "First" }, { id: "1", name: "Duplicate" }] }]) {
    api.get = async () => ({ data: response });
    await assert.rejects(() => actual.getTypeCatalog("programs"));
  }
});

test("type writes use trimmed names, existing endpoints and bounded requests and reject unconfirmed responses", async () => {
  const calls = [];
  const api = Object.fromEntries(["post", "patch", "delete"].map((method) => [method, async (...args) => { calls.push([method, ...args]); return { data: { success: true, data: { id: "7", name: "Sunday" } } }; }]));
  const actual = sourceLoader({ "@/lib/api/client": { api } })("lib/api/type-catalogs.ts");
  assert.deepEqual(await actual.createCatalogType("content", { name: " Sunday " }), { data: { id: "7", name: "Sunday" } });
  await actual.createCatalogType("programs", { name: " Sunday " });
  await actual.renameCatalogProgramType("7/8", { name: " Sunday " });
  await actual.deleteCatalogProgramType("7/8");
  assert.deepEqual(calls, [["post", "/content/types", { name: "Sunday" }, { timeout: 30000, silent: true }], ["post", "/programs/types", { name: "Sunday" }, { timeout: 30000, silent: true }], ["patch", "/programs/types/7%2F8", { name: "Sunday" }, { timeout: 30000, silent: true }], ["delete", "/programs/types/7%2F8", { timeout: 30000, silent: true }]]);
  await assert.rejects(() => actual.createCatalogType("content", { name: "   " }), /type name/);
  assert.equal(calls.length, 4);
  api.post = async () => ({ data: { data: {} } });
  await assert.rejects(() => actual.createCatalogType("programs", { name: "Sunday" }), /could not be confirmed/);
  api.delete = async () => ({ data: { success: false } });
  await assert.rejects(() => actual.deleteCatalogProgramType("7"), /could not be confirmed/);
});

test("catalog queries are permission-gated, share one collection across pages and avoid option cache collisions", () => {
  const hooks = sourceLoader({ "@tanstack/react-query": { useQuery: (options) => options }, "@/lib/api/type-catalogs": {} })("lib/hooks/useTypeCatalog.ts");
  const query = hooks.useTypeCatalog("content", false);
  assert.equal(query.enabled, false);
  assert.deepEqual(query.queryKey, ["content-types", "management-catalog"]);
  assert.deepEqual(hooks.useTypeCatalog("programs", true).queryKey, ["program-types", "management-catalog"]);
  assert.equal(query.placeholderData, undefined);
  for (const status of [401, 403, 404]) assert.equal(query.retry(0, { response: { status } }), false);
});

test("create, rename and delete refresh catalog options, linked records and histories after confirmed or uncertain writes", async () => {
  const client = new QueryClient();
  const overrides = { "@tanstack/react-query": { useQueryClient: () => client, useMutation: (options) => options }, "@/lib/api/type-catalogs": {} };
  const actual = sourceLoader(overrides);
  const keys = [["program-types", "management-catalog"], ["program-types", "management-options"], ["programs", "management-list"], ["program", "7"], ["program-templates", "management-list"], ["audit-logs"], ["audit-timeline"]];
  const mutations = [actual("lib/hooks/useTypeCatalog.ts").useSaveCatalogType("programs"), actual("app/modules/programs/hooks/useCreateProgramType.ts").useCreateProgramType(), actual("app/modules/programs/hooks/useUpdateProgramType.ts").useUpdateProgramType(), actual("app/modules/programs/hooks/useDeleteProgramType.ts").useDeleteProgramType()];
  for (const mutation of mutations) for (const error of [null, new Error("response lost")]) {
    assert.equal(mutation.retry, false);
    keys.forEach((key) => client.setQueryData(key, {}));
    await mutation.onSettled(undefined, error, {});
    keys.forEach((key) => assert.equal(client.getQueryState(key).isInvalidated, true));
  }
  const contentKeys = [["content-types", "management-options"], ["content-types", "management-catalog"], ["content", "management-list"]];
  contentKeys.forEach((key) => client.setQueryData(key, {}));
  await actual("app/modules/content/hooks/useCreateContentType.ts").useCreateContentType().onSettled(undefined, new Error("response lost"));
  contentKeys.forEach((key) => assert.equal(client.getQueryState(key).isInvalidated, true));
  client.clear();
});

test("catalog rows expose supported related journeys and program management without fabricated content-type endpoints", () => {
  const { TypeCatalogList } = sourceLoader({ "@/components/directories/CatalogTypeDialog": { CatalogTypeDialog: () => React.createElement("button", {}, "Rename") } })("components/directories/TypeCatalogList.tsx");
  const props = { records: [{ id: "7", name: "Sunday <service>" }], onSaved() {}, onDelete: async () => {} };
  const content = renderToStaticMarkup(React.createElement(TypeCatalogList, { ...props, kind: "content", canViewHistory: false }));
  assert.match(content, /Sunday &lt;service&gt;/);
  assert.match(content, /href="\/dashboard\/content\?typeId=7"/);
  assert.doesNotMatch(content, /Delete|Rename|href="\/dashboard\/audit/);
  const programs = renderToStaticMarkup(React.createElement(TypeCatalogList, { ...props, kind: "programs", canViewHistory: true }));
  for (const pattern of [/href="\/dashboard\/programs\?typeId=7"/, /href="\/dashboard\/program-templates\?typeId=7"/, /href="\/dashboard\/audit\/PROGRAMTYPE\/7"/, /Rename/, /Delete unused type/, /Programs and templates are kept/]) assert.match(programs, pattern);
});

test("shared type form provides labelled stable controls and returns entered names through a protected single submission", async () => {
  const hooks = { useSaveCatalogType: () => ({ isPending: false, mutateAsync: async () => {}, error: null }) };
  const { CatalogTypeForm } = sourceLoader({ "@/lib/hooks/useTypeCatalog": hooks })("components/directories/CatalogTypeForm.tsx");
  const html = renderToStaticMarkup(React.createElement(CatalogTypeForm, { kind: "content", onCancel() {} }));
  assert.match(html, /<label for="[^"]+">Type name/);
  assert.match(html, /maxLength="100"/);
  assert.match(html, />Create type<\/button>/);
  assert.match(html, />Cancel<\/button>/);
  const calls = [];
  let resolve;
  const response = new Promise((done) => { resolve = done; });
  const Form = sourceLoader({ react: { useId: () => "type-name", useState: (initial) => [typeof initial === "string" ? " Sunday " : initial, () => {}], useRef: (current) => ({ current }) }, "@/lib/hooks/useTypeCatalog": { useSaveCatalogType: () => ({ isPending: false, mutateAsync: (data) => { calls.push(data); return response; } }) } })("components/directories/CatalogTypeForm.tsx").CatalogTypeForm;
  const saved = [];
  const tree = Form({ kind: "programs", onSuccess: (type) => saved.push(type) });
  const first = tree.props.onSubmit({ preventDefault() {} });
  await tree.props.onSubmit({ preventDefault() {} });
  assert.deepEqual(calls, [{ name: "Sunday" }]);
  resolve({ data: { id: "7", name: "Sunday" } });
  await first;
  assert.deepEqual(saved, [{ id: "7", name: "Sunday" }]);
});

function renderCatalog({ kind = "programs", roles = ["DEACON"], query = "", result = {} } = {}) {
  let enabled;
  const { TypeCatalogClient } = sourceLoader({
    "next/navigation": { useSearchParams: () => new URLSearchParams(query), useRouter: () => ({ push() {} }) },
    "@/app/modules/auth/store/auth.store": { useAuthStore: (selector) => selector({ user: { roles } }) },
    "@/lib/hooks/useTypeCatalog": { useTypeCatalog: (_kind, allowed) => { enabled = allowed; return { isPending: false, isError: false, isFetching: false, ...result }; } },
    "@/components/directories/CatalogTypeDialog": { CatalogTypeDialog: () => React.createElement("button", {}, "Add or rename type") },
    "@/app/modules/programs/hooks/useDeleteProgramType": { useDeleteProgramType: () => ({ isPending: false, reset() {}, mutateAsync: async () => {} }) },
  })("components/directories/TypeCatalogClient.tsx");
  return { html: renderToStaticMarkup(React.createElement(TypeCatalogClient, { kind })), enabled };
}

test("catalog controllers guard role-specific reads and distinguish empty, unavailable-page, session and error states", () => {
  assert.equal(renderCatalog({ roles: ["MEDIA"] }).enabled, false);
  assert.equal(renderCatalog({ kind: "content", roles: ["MEDIA"] }).enabled, true);
  assert.match(renderCatalog({ roles: ["MEMBER"] }).html, /Access unavailable/);
  assert.match(renderCatalog({ result: { isPending: true } }).html, /Loading type catalog/);
  assert.match(renderCatalog({ result: { data: [] } }).html, /No types yet/);
  assert.match(renderCatalog({ query: "search=missing", result: { data: types } }).html, /No matching types/);
  assert.match(renderCatalog({ query: "search=Sunday&page=9", result: { data: types } }).html, /search=Sunday&amp;page=3/);
  const paged = renderCatalog({ query: "search=Sunday&page=2", result: { data: types } }).html;
  assert.match(paged, /11–20 of 25 matching types/);
  assert.match(paged, /Page 2 of 3/);
  for (const [status, label] of [[401, "Please sign in again"], [403, "Access unavailable"], [500, "Could not load this catalog"]]) assert.match(renderCatalog({ result: { isError: true, error: { response: { status } } } }).html, new RegExp(label));
});

test("new program-type route guards creation and returns successfully to the private catalog", () => {
  const pushes = [];
  let formProps;
  const render = (roles) => {
    const Page = sourceLoader({ "next/navigation": { useRouter: () => ({ push: (href) => pushes.push(href) }) }, "@/app/modules/auth/store/auth.store": { useAuthStore: (selector) => selector({ user: { roles } }) }, "@/components/directories/CatalogTypeForm": { CatalogTypeForm: (props) => { formProps = props; return React.createElement("div", {}, "Creation form"); } } })("app/(dashboard)/dashboard/program-types/new/page.tsx").default;
    return renderToStaticMarkup(React.createElement(Page));
  };
  assert.match(render(["MEMBER"]), /Access unavailable/);
  assert.match(render(["DEACON"]), /Creation form/);
  formProps.onSuccess({ id: "7", name: "Sunday" });
  assert.deepEqual(pushes, ["/dashboard/program-types"]);
});
