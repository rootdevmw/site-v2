import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { sourceLoader } from "./helpers/load-source.mjs";

const load = sourceLoader();
const helpers = load("lib/utils/editorial-lists.ts");
const { readEditorialFilters, editorialHref, editorialParams, contentListEntry, publicationListEntry, streamListEntry } = helpers;
const filters = (kind, query = "") => readEditorialFilters(kind, new URLSearchParams(query));
const now = new Date("2026-10-21T07:00:00Z");
const content = { id: "21", title: "A <message>", slug: "a-message", status: "Draft", body: "<p>Full private body</p>", type: { id: "2", name: "Teaching" }, author: { id: "3", firstName: "Test", lastName: "Author", phone: "not cached" }, tags: [{ tag: { name: "Faith" } }], scriptures: [{ book: "John", chapter: 3, verseFrom: 16, verseTo: 18 }], createdAt: "2026-10-20T22:30:00Z" };
const publication = { id: "22", title: "Church & community", fileUrl: "https://church.example/resource.pdf", description: "News for our community", publishedAt: null, createdAt: content.createdAt };
const stream = { id: "23", title: "Sunday gathering", slug: "sunday", isLive: false, startsAt: "2026-10-22T07:00:00Z", endsAt: null, platforms: [{ id: "4", name: "Video channel", url: "https://video.example/church" }], createdAt: content.createdAt };

test("editorial URLs preserve relevant choices, false live selection and filters through pagination", () => {
  const query = "search=Faith+%26+Care&status=Draft&typeId=2&platformId=4&isLive=false&page=3";
  assert.equal(editorialHref("content", filters("content", query)), "/dashboard/content?search=Faith+%26+Care&status=Draft&typeId=2&page=3");
  assert.equal(editorialHref("publications", filters("publications", query)), "/dashboard/publications?search=Faith+%26+Care&status=Draft&page=3");
  const selected = filters("streams", query);
  assert.equal(editorialHref("streams", selected), "/dashboard/streams?search=Faith+%26+Care&isLive=false&platformId=4&page=3");
  assert.deepEqual(filters("streams", editorialParams("streams", selected).toString()), selected);
  for (const page of ["0", "-1", "1.5", "Infinity", "9007199254740992"]) assert.equal(filters("content", "page=" + page).page, 1);
  assert.equal(filters("content", "status=ROOT&typeId=javascript:alert(1)").status, "");
  assert.equal(filters("content", "typeId=2%2Fedit").typeId, "");
  assert.equal(filters("streams", "isLive=scheduled&platformId=-1").isLive, "");
});

test("list projections retain useful metadata without bodies, private profile fields or unsafe destination URLs", () => {
  const message = contentListEntry(content);
  assert.deepEqual(message.author, { id: "3", name: "Test Author" });
  assert.ok(!("body" in message));
  assert.deepEqual(message.scriptures, ["John 3:16–18"]);
  assert.deepEqual(message.tags, ["Faith"]);
  assert.equal(publicationListEntry(publication).status, "Draft");
  assert.equal(publicationListEntry({ ...publication, publishedAt: "2027-01-01T00:00:00Z" }).status, "Published");
  const invalid = publicationListEntry({ ...publication, fileUrl: "javascript:alert(1)" });
  assert.equal(invalid.file.href, null);
  assert.equal(invalid.hasFileValue, true);
  const broadcast = streamListEntry({ ...stream, platforms: [{ platform: stream.platforms[0] }, stream.platforms[0], { id: "5", name: "Unsafe", url: "https://user:password@example.test" }, { id: "6", name: "Removed", url: "https://example.test", deletedAt: "2026-01-01" }] });
  assert.deepEqual(broadcast.platforms, [{ id: "4", name: "Video channel", href: "https://video.example/church" }, { id: "5", name: "Unsafe", href: null }]);
  assert.equal(streamListEntry({ ...stream, platforms: undefined }).platforms, undefined);
  assert.deepEqual(streamListEntry({ ...stream, platforms: [] }).platforms, []);
});

test("private list and choice reads use the correct endpoints, filters, cancellation and bounded requests", async () => {
  const calls = [];
  const api = { get: async (url, options) => { calls.push([url, options]); return { data: { success: true, data: [url === "/content" ? content : url === "/publications" ? publication : stream], meta: { total: 31, limit: 10 } } }; } };
  const actual = sourceLoader({ "@/lib/api/client": { api } })("lib/api/editorial-lists.ts");
  const signal = new AbortController().signal;
  await actual.getEditorialList("content", filters("content", "search=Faith&status=Draft&typeId=2&page=2"), signal);
  assert.deepEqual(calls[0], ["/content", { params: { search: "Faith", status: "Draft", typeId: "2", page: 2, limit: 10 }, signal, timeout: 15000, silent: true }]);
  const drafts = await actual.getEditorialList("publications", filters("publications", "status=Draft"), signal);
  assert.equal(drafts.data[0].status, "Draft");
  assert.deepEqual(calls[1][1].params, { status: "Draft", page: 1, limit: 10 });
  await actual.getEditorialList("streams", filters("streams", "search=Sunday&isLive=false&platformId=4"), signal);
  assert.deepEqual(calls[2][1].params, { search: "Sunday", isLive: "false", platformId: "4", page: 1, limit: 10 });
  const choiceApi = sourceLoader({ "@/lib/api/client": { api: { get: async (...args) => { calls.push(args); return { data: { data: [{ id: "2", name: "Teaching", url: "not cached" }] } }; } } } })("lib/api/editorial-lists.ts");
  assert.deepEqual(await choiceApi.getEditorialOptions("content", signal), [{ id: "2", name: "Teaching" }]);
  await choiceApi.getEditorialOptions("streams", signal);
  assert.deepEqual(calls.slice(3), [["/content/types", { signal, timeout: 15000, silent: true }], ["/streams/platforms", { signal, timeout: 15000, silent: true }]]);
});

test("incomplete pages and unconfirmed delete responses fail explicitly without automatic write retry", async () => {
  const api = { get: async () => ({ data: { success: true, data: [], meta: { total: 10, limit: 10 } } }), delete: async (...args) => { api.deleted = args; return { data: { success: false } }; } };
  const actual = sourceLoader({ "@/lib/api/client": { api } })("lib/api/editorial-lists.ts");
  await assert.rejects(() => actual.getEditorialList("content", filters("content")), /inconsistent page/);
  await assert.rejects(() => actual.deleteEditorialRecord("publications", "22/23"), /could not be confirmed/);
  assert.deepEqual(api.deleted, ["/publications/22%2F23", { timeout: 30000, silent: true }]);
  api.get = async () => ({ data: { data: [], meta: {} } });
  await assert.rejects(() => actual.getEditorialList("streams", filters("streams")), /incomplete page/);
});

test("queries guard permissions, separate filters and choice response shapes, and avoid stale placeholder rows", () => {
  const hooks = sourceLoader({ "@tanstack/react-query": { useQuery: (options) => options }, "@/lib/api/editorial-lists": {} })("lib/hooks/useEditorialLists.ts");
  assert.equal(hooks.useEditorialList("publications", filters("publications"), false).enabled, false);
  assert.equal(hooks.useEditorialOptions("publications", true).enabled, false);
  assert.equal(hooks.useEditorialOptions("streams", false).enabled, false);
  assert.deepEqual(hooks.useEditorialOptions("content", true).queryKey, ["content-types", "management-options"]);
  const drafts = hooks.useEditorialList("publications", filters("publications", "status=Draft"), true);
  const published = hooks.useEditorialList("publications", filters("publications", "status=Published"), true);
  assert.notDeepEqual(drafts.queryKey, published.queryKey);
  assert.equal(drafts.placeholderData, undefined);
  for (const status of [401, 403, 404]) assert.equal(drafts.retry(0, { response: { status } }), false);
  assert.equal(drafts.retry(0, new Error("offline")), true);
  assert.equal(drafts.retry(1, new Error("offline")), false);
});

test("deletion and existing publishing transitions refresh the new list caches after uncertain writes", async () => {
  const client = new QueryClient();
  const keys = [["content", "management-list", filters("content")], ["content", "21"], ["publications", "management-list", filters("publications")], ["publication", "22"], ["streams", "management-list", filters("streams")], ["stream", "23"], ["audit-timeline", "PUBLICATION", "22"], ["audit-logs"]];
  const mutationLoad = sourceLoader({ "@tanstack/react-query": { useQueryClient: () => client, useMutation: (options) => options }, "@/lib/api/editorial-lists": {}, "@/lib/api/client": { api: {} } });
  const deletion = mutationLoad("lib/hooks/useEditorialLists.ts").useDeleteEditorialRecord("publications");
  assert.equal(deletion.retry, false);
  for (const error of [null, new Error("Response lost")]) {
    keys.forEach((key) => client.setQueryData(key, { fixture: true }));
    await deletion.onSettled(undefined, error, "22");
    keys.forEach((key) => assert.equal(client.getQueryState(key).isInvalidated, true));
  }
  for (const [file, name, key, variables] of [["app/modules/content/hooks/usePublishContent.ts", "usePublishContent", keys[0], { id: "21", status: "Published" }], ["app/modules/publications/hooks/usePublishPublication.ts", "useUnpublishPublication", keys[2], "22"], ["app/modules/streams/hooks/useSetLiveStream.ts", "useSetLiveStream", keys[4], "23"]]) {
    client.setQueryData(key, { fixture: true });
    await mutationLoad(file)[name]().onSettled(undefined, new Error("Response lost"), variables);
    assert.equal(client.getQueryState(key).isInvalidated, true);
  }
  client.clear();
});

test("content cards escape text and respect MEDIA viewers' directory-link permissions", () => {
  const { EditorialList } = load("components/directories/EditorialList.tsx");
  const props = { kind: "content", records: [contentListEntry(content)], now, onDelete: async () => {} };
  const media = renderToStaticMarkup(React.createElement(EditorialList, props));
  assert.match(media, /A &lt;message&gt;/);
  assert.match(media, /Review &amp; publish/);
  assert.match(media, /Test Author/);
  assert.match(media, /John 3:16–18/);
  assert.doesNotMatch(media, /href="\/dashboard\/members\//);
  assert.doesNotMatch(media, /Full private body|<iframe|<script/);
  assert.match(media, /Delete A &lt;message&gt; · message #21\?/);
  const permitted = renderToStaticMarkup(React.createElement(EditorialList, { ...props, authorLinkAllowed: true }));
  assert.match(permitted, /href="\/dashboard\/members\/3"/);
});

test("publication cards distinguish drafts, published dates and missing or unusable files", () => {
  const { EditorialList } = load("components/directories/EditorialList.tsx");
  const html = renderToStaticMarkup(React.createElement(EditorialList, { kind: "publications", records: [publicationListEntry(publication), publicationListEntry({ ...publication, id: "24", fileUrl: "", publishedAt: "2026-10-20T22:30:00Z" }), publicationListEntry({ ...publication, id: "25", fileUrl: "javascript:alert(1)" })], now, onDelete: async () => {} }));
  assert.match(html, /href="\/dashboard\/publications\/22"/);
  assert.match(html, /Review &amp; publish/);
  assert.match(html, /href="https:\/\/church.example\/resource.pdf"/);
  assert.match(html, /No file attached/);
  assert.match(html, /File link unavailable/);
  assert.match(html, /21 Oct 2026, 00:30 CAT/);
  assert.doesNotMatch(html, /href="javascript:|<iframe/);
});

test("stream cards distinguish selected live, scheduled, ended and unscheduled records without autoplay", () => {
  const { EditorialList } = load("components/directories/EditorialList.tsx");
  const html = renderToStaticMarkup(React.createElement(EditorialList, { kind: "streams", records: [streamListEntry(stream), streamListEntry({ ...stream, id: "24", isLive: true }), streamListEntry({ ...stream, id: "25", startsAt: null, endsAt: "2026-10-20T07:00:00Z" }), streamListEntry({ ...stream, id: "26", startsAt: null, platforms: [] })], now, onDelete: async () => {} }));
  for (const message of ["Selected live", "Scheduled", "Ended", "Not scheduled", "No end time recorded", "No platforms connected"]) assert.match(html, new RegExp(message));
  assert.match(html, /href="https:\/\/video.example\/church"/);
  assert.match(html, /does not stop the broadcast on its platform/);
  assert.doesNotMatch(html, /1970|<iframe|autoplay/);
});

function renderController({ kind = "publications", query = "", roles = ["MEDIA"], result = {}, options = {} } = {}) {
  const guards = {};
  const controller = sourceLoader({
    "next/navigation": { useSearchParams: () => new URLSearchParams(query), useRouter: () => ({ push() {} }) },
    "@/app/modules/auth/store/auth.store": { useAuthStore: (selector) => selector({ user: { roles } }) },
    "@/lib/hooks/useEditorialLists": {
      useEditorialList: (_kind, _filters, enabled) => { guards.list = enabled; return { isPending: false, isError: false, isFetching: false, refetch() {}, ...result }; },
      useEditorialOptions: (_kind, enabled) => { guards.options = enabled; return { data: [], isPending: false, isError: false, isFetching: false, error: null, refetch() {}, ...options }; },
      useDeleteEditorialRecord: () => ({ mutateAsync: async () => {}, isPending: false }),
    },
  })("components/directories/EditorialClient.tsx");
  return { html: renderToStaticMarkup(React.createElement(controller.EditorialClient, { kind })), guards };
}

test("all publishing controllers distinguish MEDIA access, loading, session, error, empty and unavailable-page states", () => {
  for (const kind of ["content", "publications", "streams"]) {
    const forbidden = renderController({ kind, roles: ["MEMBER"] });
    assert.deepEqual(forbidden.guards, { list: false, options: false });
    assert.match(forbidden.html, /Access unavailable/);
    assert.equal(renderController({ kind }).guards.list, true);
    assert.match(renderController({ kind, result: { isPending: true } }).html, /Loading/);
    const empty = { data: { data: [], total: 0, limit: 10 } };
    assert.match(renderController({ kind, result: empty }).html, /yet<\/h2>/);
    assert.match(renderController({ kind, query: "search=Missing", result: empty }).html, /No matching/);
    const expired = renderController({ kind, query: "search=Faith&page=9", result: { data: { data: [], total: 11, limit: 10 } } }).html;
    assert.match(expired, /This page is no longer available/);
    assert.match(expired, /search=Faith&amp;page=2/);
  }
  for (const [status, message] of [[401, "Please sign in again"], [403, "Access unavailable"], [500, "Could not load this list"]]) assert.match(renderController({ result: { isError: true, error: { response: { status } } } }).html, new RegExp(message));
});

test("failed choices keep selected IDs, successfully loaded records and filtered paging intact", () => {
  const html = renderController({ kind: "streams", query: "search=Sunday&isLive=false&platformId=4&page=2", result: { data: { data: [streamListEntry(stream)], total: 21, limit: 10 } }, options: { isError: true, error: new Error("offline") } }).html;
  assert.match(html, /value="4" selected="">Selected platform #4/);
  assert.match(html, /Choices could not be refreshed/);
  assert.match(html, /Sunday gathering/);
  assert.match(html, /Page 2 of 3/);
  assert.match(html, /search=Sunday&amp;isLive=false&amp;platformId=4&amp;page=3/);
  assert.match(renderController({ query: "search=News" }).html, /search=News&amp;status=Draft/);
});
