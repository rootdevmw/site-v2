import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { setImmediate as tick } from "node:timers/promises";
import { renderToStaticMarkup } from "react-dom/server";
import { sourceLoader } from "./helpers/load-source.mjs";

const reference = { label: "John 3:16 (KJV)", query: "John 3:16" };
function fixture() {
  let cursor = 0,
    states = [],
    cleanup,
    mounted = false,
    buttons;
  const request = { current: null };
  const { ScripturePassage } = sourceLoader({
    react: {
      ...React,
      useId: () => "passage",
      useRef: () => request,
      useEffect: (effect) => {
        if (!mounted) {
          cleanup = effect();
          mounted = true;
        }
      },
      useState: (initial) => {
        const index = cursor++;
        if (!(index in states)) states[index] = initial;
        return [
          states[index],
          (value) => {
            states[index] = value;
          },
        ];
      },
    },
  })("components/public/ScripturePassages.tsx");
  function controls(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(controls);
      return;
    }
    if (node.type === "button") buttons.push(node.props);
    controls(node.props?.children);
  }
  return {
    render: () => {
      cursor = 0;
      buttons = [];
      const tree = ScripturePassage({ reference });
      controls(tree);
      return renderToStaticMarkup(tree);
    },
    click: (index = 0) => buttons[index].onClick(),
    dispose: () => cleanup?.(),
  };
}

test("inline editor scripture nodes become readable keyboard links and share the same optional preview list", () => {
  const load = sourceLoader(),
    prepare = load("lib/utils/public-message-body.ts").prepareMessageBody;
  const prepared = prepare(
    '<p>Read <span data-scripture="true" data-book="JOHN" data-chapter="3" data-verse-from="16" data-verse-to="-1">JOHN 3:16</span> with us.</p>',
  );
  assert.match(prepared.html, /<a href="#message-scriptures">John 3:16<\/a>/);
  assert.deepEqual(prepared.scriptures, [
    { query: "John 3:16", label: "John 3:16" },
  ]);
  assert.equal(
    load("lib/utils/public-messages.ts").publicScriptureReference({
      book: "JOHN",
      chapter: 3,
      verseFrom: 16,
      verseTo: 18,
    }).query,
    "John 3:16-18",
  );
  const { ScripturePassages } = load("components/public/ScripturePassages.tsx");
  const html = renderToStaticMarkup(
    React.createElement(ScripturePassages, { references: prepared.scriptures }),
  );
  assert.match(html, /John 3:16/);
  assert.match(html, /type="button"[^>]*aria-expanded="false"/);
  assert.match(html, /Read passage: John 3:16/);
  assert.doesNotMatch(
    prepare(
      '<span data-scripture data-book="JOHN" data-chapter="0">Original words</span>',
    ).html,
    /href=/,
  );
});

test("passage previews load on demand, cancel closed requests, ignore late results and identify the provider translation", async () => {
  const originalFetch = globalThis.fetch,
    calls = [];
  let release;
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return new Promise((resolve) => {
      release = resolve;
    });
  };
  const view = fixture();
  try {
    assert.match(view.render(), /aria-expanded="false"/);
    assert.equal(calls.length, 0);
    view.click();
    assert.match(view.render(), /Loading passage/);
    assert.equal(calls[0].url, "https://bible-api.com/John%203%3A16");
    assert.equal(calls[0].options.referrerPolicy, "no-referrer");
    view.click();
    assert.equal(calls[0].options.signal.aborted, true);
    release({
      ok: true,
      json: async () => ({ text: "STALE_PASSAGE", translation_name: "Old" }),
    });
    await tick();
    assert.doesNotMatch(view.render(), /STALE_PASSAGE/);
    view.click();
    view.render();
    release({
      ok: true,
      json: async () => ({
        text: "God so loved the world. <script>words</script>",
        translation_name: "World English Bible",
      }),
    });
    await tick();
    const html = view.render();
    assert.match(html, /Preview: World English Bible/);
    assert.match(html, /&lt;script&gt;words&lt;\/script&gt;/);
    view.click();
    view.render();
    view.click();
    view.render();
    assert.equal(
      calls.length,
      2,
      "reopening a loaded preview should use its current cached text",
    );
  } finally {
    view.dispose();
    globalThis.fetch = originalFetch;
  }
});

test("failed and malformed passage responses retain the reference and offer an explicit retry", async () => {
  const originalFetch = globalThis.fetch,
    view = fixture();
  let attempt = 0;
  globalThis.fetch = async () => {
    attempt++;
    return {
      ok: attempt > 1,
      json: async () =>
        attempt === 2
          ? { text: "" }
          : {
              text: "A passage preview",
              translation_name: "Provider translation",
            },
    };
  };
  try {
    view.render();
    view.click();
    await tick();
    assert.match(view.render(), /passage preview could not load/);
    view.click(1);
    await tick();
    assert.match(view.render(), /Try again/);
    view.click(1);
    await tick();
    const html = view.render();
    assert.match(html, /A passage preview/);
    assert.match(html, /John 3:16 \(KJV\)/);
    assert.match(html, /Preview: Provider translation/);
    assert.doesNotMatch(html, /could not load/);
  } finally {
    view.dispose();
    globalThis.fetch = originalFetch;
  }
});
