import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { sourceLoader } from "./helpers/load-source.mjs";

const load = sourceLoader(),
  filters = load("lib/utils/public-messages.ts"),
  body = load("lib/utils/public-message-body.ts");
const Link = ({ children, ...props }) =>
  React.createElement("a", props, children);
const presentation = { "next/link": Link };
const message = {
  id: "21",
  title: "Faith & care",
  slug: "faith-and-care",
  status: "Published",
  body: '<h2>Growing together</h2><p>Faith &amp; hope for our <strong>community</strong>.</p><p><a href="/contact">Keep talking</a>.</p>',
  createdAt: "2026-10-20T21:30:00Z",
  publishedAt: "2026-10-21T22:30:00Z",
  type: { id: "2", name: "Teaching" },
  author: {
    id: "3",
    firstName: " Test ",
    lastName: " Author ",
    phone: "PRIVATE_PHONE",
    userId: "PRIVATE_USER",
  },
  tags: [{ tag: { id: "4", name: "Faith & hope" } }],
  scriptures: [
    {
      id: "5",
      book: "1_JOHN",
      chapter: 3,
      verseFrom: 1,
      verseTo: 2,
      version: null,
    },
  ],
};
const response = (data = [message], total = data.length) => ({
  success: true,
  data,
  meta: { total, limit: 6, page: 1, totalPages: Math.ceil(total / 6) },
});
const cleanMessage = () => filters.publicMessageSchema.parse(message);

test("message filters reject duplicate/invalid values and retain relevant choices across result, topic and return links", () => {
  const selected = filters.readMessageFilters({
    page: "3",
    q: " Faith & care ",
    typeId: "2",
    tags: "Faith & hope",
  });
  assert.equal(
    filters.messagesHref(selected),
    "/content?page=3&q=Faith+%26+care&typeId=2&tags=Faith+%26+hope",
  );
  assert.equal(
    filters.messagesHref(selected, { page: 1, tags: "" }),
    "/content?q=Faith+%26+care&typeId=2",
  );
  for (const page of [
    "0",
    "-1",
    "1.5",
    "Infinity",
    "9007199254740992",
    "1000001",
    ["1", "2"],
  ])
    assert.equal(filters.readMessageFilters({ page }).page, 1);
  for (const typeId of ["-1", "2/edit", "9223372036854775808", ["2", "3"]])
    assert.equal(filters.readMessageFilters({ typeId }).typeId, "");
  assert.equal(
    filters.readMessageFilters({ q: ["one", "two"], tags: ["x", "y"] }).q,
    "",
  );
  assert.equal(
    filters.readMessageFilters({ q: "a".repeat(300) }).q.length,
    200,
  );
  const from = filters.messagesHref(selected);
  assert.equal(filters.messagesReturnHref(from + "&scope=private"), from);
  assert.equal(
    filters.messageHref("faith & care?", from),
    "/content/faith%20%26%20care%3F?" + new URLSearchParams({ from }),
  );
  for (const value of [
    "https://evil.test/content",
    "//evil.test/content",
    "/dashboard",
    "/content/21",
    "/content\\elsewhere",
    [from],
    "/content\u0000",
  ])
    assert.equal(filters.messagesReturnHref(value), "/content");
  assert.equal(
    filters.messagesReturnHref("/content?page=2&page=3&q=hope"),
    "/content?q=hope",
  );
});

test("public message projections exclude private author fields and keep reliable dates and scripture ranges", () => {
  const page = filters.messagePage(response());
  assert.equal(page.totalPages, 1);
  assert.equal(filters.messageAttribution(page.data[0]), "Test Author");
  assert.deepEqual(filters.messageScriptures(page.data[0]), ["1 John 3:1–2"]);
  assert.equal(filters.messageDate(page.data[0]), message.publishedAt);
  assert.equal(
    filters.messageDate({ ...page.data[0], publishedAt: "invalid" }),
    message.createdAt,
  );
  assert.equal(
    filters.messageDate({
      ...page.data[0],
      publishedAt: null,
      createdAt: "invalid",
    }),
    null,
  );
  assert.deepEqual(
    filters.messageScriptures({
      ...page.data[0],
      scriptures: [
        { book: "JOHN", chapter: 3, verseFrom: 16, verseTo: -1 },
        { book: "", chapter: 0, verseFrom: 1 },
      ],
    }),
    ["John 3:16"],
  );
  assert.doesNotMatch(JSON.stringify(page.data), /PRIVATE_/);
  for (const payload of [
    { ...response(), success: false },
    response([{ ...message, status: "Draft" }]),
    { data: [] },
    response([{ ...message, slug: ".." }]),
  ])
    assert.throws(() => filters.messagePage(payload));
});

test("the public reader preserves prose and decodes excerpts while removing executable markup and extra page headings", () => {
  const prepared = body.prepareMessageBody(
    '<h1>Faith &amp; care</h1><p>Love <strong>one</strong> another &copy;.</p><ol start="3"><li>Listen</li></ol><table><caption>Notes</caption><tr><th>Topic</th><td>Hope</td></tr></table><script>PRIVATE_SCRIPT</script><style>PRIVATE_STYLE</style><svg><script>PRIVATE_SVG</script></svg><p onclick="evil()" style="position:fixed">Stay</p>',
  );
  assert.match(prepared.html, /<h2>Faith &amp; care<\/h2>/);
  assert.match(prepared.html, /<strong>one<\/strong>/);
  assert.match(prepared.html, /<ol start="3">/);
  assert.match(prepared.html, /<caption>Notes<\/caption>/);
  assert.match(prepared.text, /Faith & care Love one another ©/);
  assert.doesNotMatch(
    prepared.html + prepared.text,
    /PRIVATE_|onclick|position:fixed|<h1|<script|<style|<svg/,
  );
  assert.equal(body.messageExcerpt("A short reflection"), "A short reflection");
  assert.match(
    body.messageExcerpt("A long teaching reflection with more words", 20),
    /…$/,
  );
});

test("article links and images reject executable, encoded, credentialed and protocol-relative destinations", () => {
  for (const url of [
    "javascript:alert(1)",
    "jav&#x61;script:alert(1)",
    "//evil.test/x",
    "https://user:password@evil.test/x",
    "data:text/html,secret",
    "https://good.test/&#10;bad",
  ]) {
    const prepared = body.prepareMessageBody(
      `<p><a href="${url}" target="_blank">Words stay readable</a><img src="${url}" onerror="evil()"></p>`,
    );
    assert.match(prepared.html, /Words stay readable/);
    assert.doesNotMatch(prepared.html, /href=|<img|onerror|target=/);
  }
  const prepared = body.prepareMessageBody(
    '<a href="/contact">Contact</a><a href="mailto:church@example.test">Email</a><img src="/uploads/photo.webp" width="800" height="600" alt="Church community">',
  );
  assert.match(prepared.html, /href="\/contact"/);
  assert.match(prepared.html, /href="mailto:church@example.test"/);
  assert.match(prepared.html, /loading="lazy" decoding="async"/);
  assert.match(prepared.html, /width="800" height="600"/);
});

test("message media uses controlled players and canonical YouTube links without autoplay or arbitrary frames", () => {
  const prepared = body.prepareMessageBody(
    '<div data-youtube-video><iframe src="https://www.youtube.com/embed/abcdefghijk?start=20&autoplay=1" srcdoc="bad" allow="camera"></iframe></div><audio src="/audio.mp3" autoplay loop></audio><video src="https://media.example.test/video.mp4" autoplay></video><video><source src="/legacy.mp4"></video><iframe src="https://evil.test/embed/abcdefghijk"></iframe>',
  );
  assert.match(
    prepared.html,
    /https:\/\/www.youtube-nocookie.com\/embed\/abcdefghijk\?start=20/,
  );
  assert.match(prepared.html, /title="YouTube video player" loading="lazy"/);
  assert.match(
    prepared.html,
    /<audio src="\/audio.mp3" controls preload="none"/,
  );
  assert.match(prepared.html, /<source src="\/legacy.mp4"/);
  assert.match(prepared.html, /This video is unavailable/);
  assert.doesNotMatch(prepared.html, /autoplay|srcdoc|camera|evil.test| loop/);
  assert.deepEqual(
    prepared.media.map((media) => media.kind),
    ["YouTube", "Audio", "Video"],
  );
  assert.equal(
    prepared.media[0].href,
    "https://www.youtube.com/watch?v=abcdefghijk&t=20s",
  );
});

test("message transports encode one slug segment, forward deadlines and expose safe typed HTTP failures", async () => {
  const calls = [];
  const api = sourceLoader({
    "./client": {
      publicApi: async (...args) => {
        calls.push(args);
        return response();
      },
    },
  })("lib/public-api/content.ts");
  const options = { signal: new AbortController().signal };
  await api.getPublicContentBySlug("faith/hope?typeId=2", options);
  await api.getContentTypes(options);
  await api.getPublishedContent(
    { page: 2, typeId: "2", tags: "Faith & hope", search: "care" },
    options,
  );
  assert.equal(calls[0][0], "/content/faith%2Fhope%3FtypeId%3D2");
  assert.equal(calls[1][0], "/content/types");
  assert.equal(
    new URL(calls[2][0], "https://church.invalid").searchParams.get("tags"),
    "Faith & hope",
  );
  calls.forEach(([, received]) =>
    assert.equal(received.signal, options.signal),
  );
  const originalFetch = globalThis.fetch,
    originalBase = process.env.NEXT_PUBLIC_API_URL;
  try {
    process.env.NEXT_PUBLIC_API_URL = "https://fixture.invalid/api";
    globalThis.fetch = async () => ({ ok: false, status: 404 });
    const client = sourceLoader()("lib/public-api/client.ts");
    await assert.rejects(
      () => client.publicApi("/private-route"),
      (error) =>
        error instanceof client.PublicApiError &&
        error.status === 404 &&
        !error.message.includes("fixture.invalid"),
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalBase === undefined) delete process.env.NEXT_PUBLIC_API_URL;
    else process.env.NEXT_PUBLIC_API_URL = originalBase;
  }
});

test("message detail loading distinguishes missing and draft records from unavailable or malformed responses", async () => {
  let action = async () => ({ data: message }),
    received;
  const reader = sourceLoader({
    react: { ...React, cache: (fn) => fn },
    "./content": {
      getPublicContentBySlug: async (slug, options) => {
        received = { slug, options };
        return action();
      },
    },
  });
  const api = reader("lib/public-api/messages.ts"),
    { PublicApiError } = reader("lib/public-api/client.ts");
  assert.equal((await api.loadPublicMessage(message.slug)).state, "ready");
  assert.ok(received.options.signal instanceof AbortSignal);
  for (const [run, expected] of [
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
    [async () => ({ data: { status: "Draft" } }), "missing"],
    [async () => ({ data: null }), "missing"],
    [async () => ({ data: message, success: false }), "unavailable"],
    [async () => ({ data: { title: "Incomplete" } }), "unavailable"],
    [
      async () => {
        throw new Error("PRIVATE_ERROR");
      },
      "unavailable",
    ],
  ]) {
    action = run;
    assert.equal((await api.loadPublicMessage("fixture")).state, expected);
  }
});

function browseFixture({
  result = response(),
  types = { data: [{ id: "2", name: "Teaching" }] },
  failure = false,
} = {}) {
  const calls = [];
  const api = {
    getPublishedContent: async (query, options) => {
      calls.push({ query, options });
      if (failure) throw new Error("PRIVATE_FAILURE");
      return result;
    },
    getContentTypes: async () => {
      if (types instanceof Error) throw types;
      return types;
    },
  };
  const { MessageBrowse } = sourceLoader({
    ...presentation,
    "@/lib/public-api/content": api,
    "next/navigation": {
      redirect: (href) => {
        throw new Error("REDIRECT " + href);
      },
    },
  })("components/public/MessageBrowse.tsx");
  return { MessageBrowse, calls };
}

test("message results retain usable search when the optional type catalog fails and keep all filters in links", async () => {
  const fixture = browseFixture({
    types: new Error("Types unavailable"),
    result: response([message], 13),
  });
  const selected = filters.readMessageFilters({
    page: "2",
    q: "care",
    typeId: "2",
    tags: "Faith & hope",
  });
  const html = renderToStaticMarkup(
    await fixture.MessageBrowse({ filters: selected }),
  );
  assert.match(html, /Message types could not load/);
  assert.match(html, /Faith &amp; care/);
  assert.match(html, /name="tags" value="Faith &amp; hope"/);
  assert.match(html, /Page 2 of 3/);
  assert.match(
    html,
    /<time dateTime="2026-10-21T22:30:00.000Z">22 October 2026/,
  );
  assert.match(html, /from=%2Fcontent%3Fpage%3D2/);
  assert.match(html, /q=care&amp;typeId=2&amp;tags=Faith\+%26\+hope/);
  assert.ok(fixture.calls[0].options.signal instanceof AbortSignal);
  assert.deepEqual(fixture.calls[0].query, {
    page: 2,
    limit: 6,
    search: "care",
    typeId: "2",
    tags: "Faith & hope",
  });
  assert.doesNotMatch(html, /PRIVATE_/);
});

test("message empty, filtered-empty and failed reads offer different recovery and out-of-range pages preserve filters", async () => {
  const plain = renderToStaticMarkup(
    await browseFixture({ result: response([]) }).MessageBrowse({
      filters: filters.readMessageFilters({}),
    }),
  );
  assert.match(plain, /More messages are on the way/);
  const filtered = filters.readMessageFilters({ tags: "Faith" });
  const empty = renderToStaticMarkup(
    await browseFixture({ result: response([]) }).MessageBrowse({
      filters: filtered,
    }),
  );
  assert.match(empty, /No messages match those filters/);
  assert.match(empty, /Browse all messages/);
  const unavailable = renderToStaticMarkup(
    await browseFixture({ failure: true }).MessageBrowse({ filters: filtered }),
  );
  assert.match(unavailable, /temporarily unavailable/);
  assert.match(unavailable, /Try again/);
  assert.doesNotMatch(
    unavailable,
    /0 messages|No messages match|PRIVATE_FAILURE/,
  );
  await assert.rejects(
    () =>
      browseFixture({ result: response([], 13) }).MessageBrowse({
        filters: { ...filtered, page: 90 },
      }),
    /REDIRECT \/content\?page=3&tags=Faith/,
  );
});

function detailFixture(result = { state: "ready", message: cleanMessage() }) {
  return sourceLoader({
    ...presentation,
    "@/lib/public-api/messages": { loadPublicMessage: async () => result },
    "next/navigation": {
      notFound: () => {
        throw new Error("NOT_FOUND");
      },
      permanentRedirect: (href) => {
        throw new Error("PERMANENT " + href);
      },
    },
  })("app/(public)/content/[slug]/page.tsx");
}
const props = (slug = message.slug, from = "/content?page=2&q=hope") => ({
  params: Promise.resolve({ slug }),
  searchParams: Promise.resolve({ from }),
});

test("message details include article text, usable links, all-device scripture references and a safe return journey in initial markup", async () => {
  const detail = detailFixture(),
    html = renderToStaticMarkup(await detail.default(props()));
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
  assert.match(html, /<h2>Growing together<\/h2>/);
  assert.match(html, /href="\/contact" rel="noopener noreferrer">Keep talking/);
  assert.match(html, /id="message-scriptures"/);
  assert.match(html, /1 John 3:1–2/);
  assert.match(html, /href="\/content\?page=2&amp;q=hope"/);
  assert.match(html, /22 October 2026/);
  assert.match(html, /href="\/plan-visit"/);
  assert.doesNotMatch(html, /PRIVATE_|Loading\.\.\.|ProseMirror|<main[ >]/);
  const metadata = await detail.generateMetadata(props());
  assert.equal(metadata.title, message.title);
  assert.match(metadata.description, /Faith & hope for our community/);
  assert.equal(metadata.openGraph.type, "article");
});

test("missing messages use not-found, temporary failures remain recoverable and legacy addresses redirect to the stable slug", async () => {
  await assert.rejects(
    () => detailFixture({ state: "missing" }).default(props()),
    /NOT_FOUND/,
  );
  const unavailable = detailFixture({ state: "unavailable" });
  const html = renderToStaticMarkup(await unavailable.default(props()));
  assert.match(html, /This message could not load/);
  assert.match(html, /Try again/);
  assert.equal(
    (await unavailable.generateMetadata(props())).robots.index,
    false,
  );
  await assert.rejects(
    () => detailFixture().default(props("21")),
    /PERMANENT \/content\/faith-and-care\?from=/,
  );
});

function shareFixture(navigatorValue) {
  let cursor = 0,
    state = [],
    button;
  const busy = { current: false };
  const { ShareButton } = sourceLoader({
    react: {
      ...React,
      useId: () => "share-link",
      useRef: () => busy,
      useState: (initial) => {
        const index = cursor++;
        if (!(index in state)) state[index] = initial;
        return [
          state[index],
          (value) => {
            state[index] = value;
          },
        ];
      },
    },
  })("components/public/ShareButton.tsx");
  const previous = {
    navigator: Object.getOwnPropertyDescriptor(globalThis, "navigator"),
    window: Object.getOwnPropertyDescriptor(globalThis, "window"),
  };
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: navigatorValue,
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: {
        origin: "https://church.test",
        href: "https://church.test/content/faith-and-care?from=private",
      },
    },
  });
  return {
    render: (
      props = {
        title: message.title,
        path: "/content/faith-and-care",
        label: "Share message",
      },
    ) => {
      cursor = 0;
      const tree = ShareButton(props);
      button = tree.props.children[0].props;
      return renderToStaticMarkup(tree);
    },
    click: () => button.onClick(),
    button: () => button,
    restore: () => {
      for (const key of Object.keys(previous))
        if (previous[key])
          Object.defineProperty(globalThis, key, previous[key]);
        else delete globalThis[key];
    },
  };
}

test("message sharing uses the clean article URL, prevents duplicate requests and handles native cancellation without copying", async () => {
  const calls = [];
  let release;
  const fixture = shareFixture({
    share: async (input) => {
      calls.push(input);
      await new Promise((resolve) => {
        release = resolve;
      });
    },
  });
  try {
    assert.match(fixture.render(), /type="button"/);
    const pending = fixture.click();
    fixture.click();
    assert.match(fixture.render(), /disabled=""/);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "https://church.test/content/faith-and-care");
    release();
    await pending;
    assert.match(fixture.render(), /role="status"[^>]*>Link shared/);
  } finally {
    fixture.restore();
  }
  let copied = false;
  const cancelled = shareFixture({
    share: async () => {
      throw new DOMException("Cancelled", "AbortError");
    },
    clipboard: {
      writeText: async () => {
        copied = true;
      },
    },
  });
  try {
    cancelled.render();
    await cancelled.click();
    assert.equal(copied, false);
    assert.doesNotMatch(cancelled.render(), /Copy the link below|Link copied/);
  } finally {
    cancelled.restore();
  }
});

test("sharing falls back to copying or a labelled selectable URL and keeps a generic label for event consumers", async () => {
  let copied;
  const fixture = shareFixture({
    share: async () => {
      throw new Error("Not allowed");
    },
    clipboard: {
      writeText: async (value) => {
        copied = value;
      },
    },
  });
  try {
    fixture.render();
    await fixture.click();
    assert.equal(copied, "https://church.test/content/faith-and-care");
    assert.match(fixture.render(), /Link copied/);
  } finally {
    fixture.restore();
  }
  const manual = shareFixture({});
  try {
    manual.render();
    await manual.click();
    const html = manual.render();
    assert.match(html, /label for="share-link"/);
    assert.match(html, /id="share-link"[^>]*readOnly=""/);
    assert.match(html, /Copy the link below/);
    assert.match(manual.render({ title: "An event" }), />Share<\/button>/);
  } finally {
    manual.restore();
  }
});
