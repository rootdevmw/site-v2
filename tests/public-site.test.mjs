import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import ts from "typescript";

async function loadHelper(path) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

const { formatChurchDate, getChurchDateInputValue } = await loadHelper("../lib/utils/church-date.ts");
const { loadHomeFeed } = await loadHelper("../lib/utils/optional-feed.ts");

test("church dates use Malawi time across the UTC midnight boundary", () => {
  const instant = new Date("2026-10-21T22:30:00Z");
  assert.equal(getChurchDateInputValue(instant), "2026-10-22");
  assert.equal(getChurchDateInputValue(new Date("2026-10-21T21:30:00Z")), "2026-10-21");
  assert.equal(formatChurchDate(instant, { day: "numeric" }), "22");
  assert.equal(formatChurchDate(instant, { hour: "2-digit", minute: "2-digit", hour12: false }), "00:30");
  assert.equal(formatChurchDate("invalid", { day: "numeric" }), "Date to be confirmed");
});

test("one failed homepage feed does not discard the other feeds", async () => {
  const messages = [{ id: "message-1", title: "A published message" }];
  const [content, events, ministries] = await Promise.all([
    loadHomeFeed(async ({ signal }) => {
      assert.ok(signal instanceof AbortSignal, "requests must receive a deadline signal");
      assert.equal(signal.aborted, false);
      return { data: messages };
    }),
    loadHomeFeed(async () => { throw new Error("API unavailable"); }),
    loadHomeFeed(async () => ({ data: [] })),
  ]);
  assert.deepEqual(content, { data: messages, unavailable: false });
  assert.deepEqual(events, { data: null, unavailable: true });
  assert.deepEqual(ministries, { data: [], unavailable: false });
});

test("a stalled optional request is aborted instead of blocking the home response", async () => {
  const result = await loadHomeFeed(async ({ signal }) => {
    await delay(10000, null, { signal });
    return { data: [] };
  });
  assert.deepEqual(result, { data: null, unavailable: true });
});
