import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import ts from "typescript";

// Compile the actual helper with the project's TypeScript dependency so the
// tests work on Next.js-supported Node versions without an experimental loader.
const source = await readFile(new URL("../lib/utils/pagination.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { getPaginationHref, getPaginationPages } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

test("page navigation keeps the current page and both endpoints in large result sets", () => {
  for (const total of [1, 2, 7, 8, 20, 100]) {
    for (let current = 1; current <= total; current++) {
      const pages = getPaginationPages(current, total);
      const numbers = pages.filter((value) => typeof value === "number");
      assert.equal(numbers[0], 1);
      assert.equal(numbers.at(-1), total);
      assert.ok(numbers.includes(current));
      assert.deepEqual(numbers, [...new Set(numbers)].sort((a, b) => a - b));
      assert.ok(pages.length <= 7, "controls must stay bounded as the result set grows");
    }
  }
});

test("empty and out-of-range result pages do not generate invalid destinations", () => {
  assert.deepEqual(getPaginationPages(1, 0), []);
  assert.ok(getPaginationPages(-5, 20).includes(1));
  assert.ok(getPaginationPages(50, 20).includes(20));
});

test("moving between message pages preserves all active filters", () => {
  const filters = { typeId: "sermon", q: "faith & hope", tags: "prayer,Chichewa" };
  for (const page of [1, 2, 20]) {
    const url = new URL(getPaginationHref("/content", page, filters), "https://example.test");
    assert.equal(url.pathname, "/content");
    assert.equal(url.searchParams.get("page"), page === 1 ? null : String(page));
    for (const [key, value] of Object.entries(filters)) assert.equal(url.searchParams.get(key), value);
  }
  assert.deepEqual(filters, { typeId: "sermon", q: "faith & hope", tags: "prayer,Chichewa" });
});

test("cleared filters and first-page navigation produce a clean URL", () => {
  assert.equal(getPaginationHref("/events", 1, { typeId: "", q: undefined }), "/events");
  assert.equal(getPaginationHref("/events", 3), "/events?page=3");
});
