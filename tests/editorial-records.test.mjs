import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { sourceLoader } from "./helpers/load-source.mjs";

const load = sourceLoader();
const { getContentState, getStreamState, getWebUrl, getPublicationFile, getYouTubePreview } = load("lib/utils/editorial-records.ts");
const now = Date.parse("2026-10-21T07:00:00Z");
const stream = { id: "8", title: "Sunday gathering", slug: "sunday", isLive: false, startsAt: null, platforms: [], createdAt: "2026-10-20T22:30:00Z" };
const publication = { id: "7", title: "Church news", description: null, fileUrl: "https://church.example/news.PDF?download=1", publishedAt: null, createdAt: "2026-10-20T22:30:00Z" };
const content = { id: "6", title: "A message", slug: "a-message", status: "Draft", body: "", author: { id: "2", firstName: "Test", lastName: "Author" }, type: { id: "1", name: "Teaching" }, tags: [{ id: "3", tag: { id: "4", name: "<Faith>" } }], scriptures: [{ book: "John", chapter: 3, verseFrom: 16, verseTo: 18 }], createdAt: "2026-10-20T22:30:00Z" };

test("editorial states use the live flag and actual schedule without inventing live or scheduled states", () => {
  assert.equal(getContentState("Published").next, "Draft");
  assert.equal(getContentState("Draft").next, "Published");
  assert.equal(getContentState("Unexpected").next, null);
  assert.equal(getStreamState(stream, now).label, "Not live");
  assert.equal(getStreamState({ ...stream, startsAt: "2026-10-22T07:00:00Z" }, now).label, "Scheduled");
  assert.equal(getStreamState({ ...stream, startsAt: "2026-10-20T07:00:00Z" }, now).label, "Not live");
  assert.equal(getStreamState({ ...stream, endsAt: "2026-10-21T07:00:00Z" }, now).label, "Ended");
  assert.equal(getStreamState({ ...stream, isLive: true, endsAt: "2026-10-20T07:00:00Z" }, now).label, "Ended");
  assert.equal(getStreamState({ ...stream, startsAt: "invalid", endsAt: "invalid" }, now).label, "Unavailable");
});

test("player previews accept real YouTube video destinations and reject lookalike hosts or arbitrary embeds", () => {
  const id = "dQw4w9WgXcQ";
  for (const url of [`https://youtu.be/${id}?si=test`, `https://www.youtube.com/watch?v=${id}&t=12`, `https://m.youtube.com/live/${id}`, `https://youtube.com/shorts/${id}`, `https://www.youtube-nocookie.com/embed/${id}`]) {
    assert.equal(getYouTubePreview(url), `https://www.youtube-nocookie.com/embed/${id}`);
    assert.doesNotMatch(getYouTubePreview(url), /autoplay/);
  }
  for (const url of [`https://youtube.com.evil.example/watch?v=${id}`, `https://example.com/watch?v=${id}`, "https://youtube.com/channel/example", "https://youtu.be/invalid", "javascript:alert(1)", "/uploads/video", "not a URL"]) assert.equal(getYouTubePreview(url), null);
  assert.equal(getWebUrl("//evil.example/file"), null);
  assert.equal(getWebUrl("/\\evil.example/file"), null);
  assert.equal(getWebUrl("https://user:secret@example.com"), null);
  assert.equal(getWebUrl("data:text/html,test"), null);
});

test("only PDF attachments offer inline document previews and upload paths remain usable", () => {
  assert.deepEqual(getPublicationFile(publication.fileUrl), { href: publication.fileUrl, format: "PDF", canPreview: true });
  assert.equal(getPublicationFile("/uploads/publications/news.pdf").canPreview, true);
  assert.equal(getPublicationFile("https://church.example/file.docx").canPreview, false);
  assert.equal(getPublicationFile("https://church.example/file.pdf.exe").canPreview, false);
  assert.equal(getPublicationFile("https://church.example/download?id=7").format, "Document");
  assert.equal(getPublicationFile("javascript:alert(1)").href, null);
  assert.equal(getPublicationFile("").href, null);
});

test("editorial reads and writes use the existing endpoint contracts with bounded requests", async () => {
  const calls = [];
  const api = Object.fromEntries(["get", "post", "patch"].map((method) => [method, async (...args) => { calls.push({ method, args }); return { data: { data: { id: "9" } } }; }]));
  const apiLoad = sourceLoader({ "@/lib/api/client": { api } });
  const signal = new AbortController().signal;
  await apiLoad("app/modules/content/api/getContent.ts").getContent("9", signal);
  await apiLoad("app/modules/publications/api/getPublication.ts").getPublication("9", signal);
  await apiLoad("app/modules/streams/api/getStream.ts").getStream("9", signal);
  for (const call of calls) assert.deepEqual(call.args[1], { signal, timeout: 15000, silent: true });
  assert.deepEqual(calls.map((call) => call.args[0]), ["/content/9", "/publications/9", "/streams/9"]);
  await apiLoad("app/modules/content/api/publishContent.ts").publishContent("9", "Draft");
  const publications = apiLoad("app/modules/publications/api/publishPublication.ts");
  await publications.publishPublication("9");
  await publications.unpublishPublication("9");
  await apiLoad("app/modules/streams/api/setLiveStream.ts").setLiveStream("9");
  assert.deepEqual(calls.slice(3).map((call) => [call.method, call.args[0]]), [["post", "/content/9/publish"], ["patch", "/publications/9/publish"], ["patch", "/publications/9/unpublish"], ["post", "/streams/9/live"]]);
  assert.deepEqual(calls[3].args[1], { status: "Draft" });
  calls.slice(3).forEach((call) => assert.deepEqual(call.args[2], { timeout: 30000, silent: true }));
});

function mutationLoader(client) {
  return sourceLoader({ "@tanstack/react-query": { useQueryClient: () => client, useMutation: (options) => options }, "@/lib/api/client": { api: {} } });
}

test("publishing a message preserves its related data and refreshes state even after a lost response", async () => {
  const client = new QueryClient();
  client.setQueryData(["content", content.id], { data: content });
  client.setQueryData(["content"], { data: [content] });
  const options = mutationLoader(client)("app/modules/content/hooks/usePublishContent.ts").usePublishContent();
  await options.onMutate({ id: content.id, status: "Published" });
  options.onSuccess({ data: { id: content.id, status: "Published" } }, { id: content.id });
  const cached = client.getQueryData(["content", content.id]).data;
  assert.equal(cached.status, "Published");
  assert.deepEqual(cached.author, content.author);
  assert.deepEqual(cached.tags, content.tags);
  await options.onSettled(undefined, new Error("Response lost"), { id: content.id });
  assert.equal(client.getQueryState(["content", content.id]).isInvalidated, true);
  assert.equal(client.getQueryState(["content"]).isInvalidated, true);
  client.clear();
});

test("publication transitions update the detail immediately and recover both detail and list after uncertainty", async () => {
  for (const hook of ["usePublishPublication", "useUnpublishPublication"]) {
    const client = new QueryClient();
    client.setQueryData(["publication", publication.id], { data: publication });
    client.setQueryData(["publications"], { data: [] });
    client.setQueryData(["publication", "unrelated"], { data: { id: "unrelated" } });
    const options = mutationLoader(client)("app/modules/publications/hooks/usePublishPublication.ts")[hook]();
    const updated = { ...publication, publishedAt: hook === "usePublishPublication" ? "2026-10-21T07:00:00Z" : null };
    options.onSuccess({ data: updated }, publication.id);
    assert.deepEqual(client.getQueryData(["publication", publication.id]).data, updated);
    await options.onSettled(undefined, new Error("Response lost"), publication.id);
    assert.equal(client.getQueryState(["publication", publication.id]).isInvalidated, true);
    assert.equal(client.getQueryState(["publications"]).isInvalidated, true);
    assert.equal(client.getQueryState(["publication", "unrelated"]).isInvalidated, false);
    client.clear();
  }
});

test("changing the live broadcast refreshes other cached stream details on success and failure", async () => {
  const client = new QueryClient();
  const keys = [["stream", stream.id], ["stream", "previous-live"], ["streams"]];
  const options = mutationLoader(client)("app/modules/streams/hooks/useSetLiveStream.ts").useSetLiveStream();
  for (const error of [null, new Error("Response lost")]) {
    keys.forEach((key) => client.setQueryData(key, { data: stream }));
    if (!error) options.onSuccess({ data: { ...stream, isLive: true, platforms: [{ id: "1", name: "YouTube", url: "https://youtu.be/dQw4w9WgXcQ" }] } }, stream.id);
    if (!error) assert.equal(client.getQueryData(["stream", stream.id]).data.platforms[0].name, "YouTube");
    await options.onSettled(undefined, error, stream.id);
    keys.forEach((key) => assert.equal(client.getQueryState(key).isInvalidated, true));
  }
  client.clear();
});

test("detail queries can be disabled for restricted accounts and never automatically retry access failures", () => {
  const queryLoad = sourceLoader({ "@tanstack/react-query": { useQuery: (options) => options }, "@/lib/api/client": { api: {} } });
  for (const [folder, name] of [["content", "Content"], ["publications", "Publication"], ["streams", "Stream"]]) {
    const hook = queryLoad(`app/modules/${folder}/hooks/use${name}.ts`)[`use${name}`];
    assert.equal(hook("9", false).enabled, false);
    assert.equal(hook("").enabled, false);
    const options = hook("9", true);
    assert.equal(options.enabled, true);
    for (const status of [401, 403, 404]) assert.equal(options.retry(0, { response: { status } }), false);
    assert.equal(options.retry(0, new Error("Network failure")), true);
    assert.equal(options.retry(1, new Error("Network failure")), false);
  }
});

test("message, publication, and stream views render reading context and defer all external players", () => {
  const { ContentRecordView } = load("components/records/ContentRecordView.tsx");
  const renderContent = (record, allowed = false) => renderToStaticMarkup(React.createElement(ContentRecordView, { content: record, publishingAction: null, authorLinkAllowed: allowed }));
  const draftHtml = renderContent(content, true);
  assert.match(draftHtml, /href="\/dashboard\/members\/2"/);
  assert.match(draftHtml, /href="\/dashboard\/content\/6\/edit"/);
  assert.match(draftHtml, /John 3:16–18/);
  assert.doesNotMatch(renderContent({ ...content, scriptures: [{ book: "John", chapter: 3, verseFrom: 16, verseTo: -1 }] }), /16–-1/);
  assert.match(draftHtml, /&lt;Faith&gt;/);
  assert.match(draftHtml, /There is no message body yet/);
  assert.doesNotMatch(draftHtml, /href="\/content\/a-message"/);
  assert.doesNotMatch(renderContent(content), /href="\/dashboard\/members\/2"/);
  assert.match(renderContent({ ...content, status: "Published" }), /href="\/content\/a-message"/);
  const sourceHtml = renderContent({ ...content, body: '<p data-test="source">A & B</p>' });
  assert.match(sourceHtml, /&lt;p data-test=&quot;source&quot;&gt;A &amp; B&lt;\/p&gt;/);

  const { PublicationRecordView } = load("components/records/PublicationRecordView.tsx");
  const publicationHtml = renderToStaticMarkup(React.createElement(PublicationRecordView, { publication, publishingAction: null }));
  assert.match(publicationHtml, /Load PDF preview/);
  assert.match(publicationHtml, /21 October 2026/);
  assert.match(publicationHtml, /Not published/);
  assert.doesNotMatch(publicationHtml, /<iframe/);
  const missingFileHtml = renderToStaticMarkup(React.createElement(PublicationRecordView, { publication: { ...publication, fileUrl: "javascript:alert(1)" }, publishingAction: null }));
  assert.match(missingFileHtml, /No usable document is attached/);
  assert.doesNotMatch(missingFileHtml, /href="javascript:/);

  const { StreamRecordView } = load("components/records/StreamRecordView.tsx");
  const streamHtml = renderToStaticMarkup(React.createElement(StreamRecordView, { stream: { ...stream, startsAt: "2099-10-21T07:00:00Z", platforms: [{ id: "1", name: "YouTube", url: "https://youtu.be/dQw4w9WgXcQ" }, { id: "2", name: "Other", url: "javascript:alert(1)" }] } }));
  assert.match(streamHtml, /Scheduled/);
  assert.match(streamHtml, /9:00 am/);
  assert.match(streamHtml, /Preview YouTube/);
  assert.match(streamHtml, /href="\/dashboard\/streams\/8\/edit"/);
  assert.match(streamHtml, /href="\/streams\/sunday"/);
  assert.doesNotMatch(streamHtml, /<iframe|href="javascript:/);
});
