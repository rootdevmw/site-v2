import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { setTimeout as pause } from "node:timers/promises";
import { fileURLToPath } from "node:url";

// Read-only checks against an owned temporary production frontend. No form POSTs.
const root = fileURLToPath(new URL("../", import.meta.url));
const socket = net.createServer();
await new Promise((resolve) => socket.listen(0, "127.0.0.1", resolve));
const port = socket.address().port;
await new Promise((resolve) => socket.close(resolve));
const origin = `http://127.0.0.1:${port}`;
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "-H",
    "127.0.0.1",
    "-p",
    String(port),
  ],
  {
    cwd: root,
    windowsHide: true,
    stdio: "ignore",
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  },
);
const stop = () => child.kill();
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
const checks = [];
async function get(route) {
  const response = await fetch(origin + route, {
    signal: AbortSignal.timeout(20000),
    headers: { "User-Agent": "facebookexternalhit/1.1" },
  });
  return { response, html: await response.text() };
}
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null)
      throw new Error("Temporary frontend stopped before readiness.");
    try {
      ready = (
        await fetch(origin + "/robots.txt", {
          signal: AbortSignal.timeout(500),
        })
      ).ok;
    } catch {
      /* Wait for the owned server. */
    }
    if (ready) break;
    await pause(300);
  }
  assert.ok(ready, "Temporary frontend did not become ready.");
  const routes = [
    "/",
    "/about",
    "/plan-visit",
    "/contact",
    "/ministries",
    "/homecells",
    "/content",
    "/events",
    "/programs",
    "/publications",
    "/live",
    "/prayer-request",
  ];
  let socialImage, twitterImage, documentPath, broadcastPath;
  for (const route of routes) {
    const { response, html } = await get(route);
    assert.equal(response.status, 200, route);
    assert.match(html, /<main[^>]*id="public-content"/);
    const canonical = html.match(
      /<link[^>]*rel="canonical"[^>]*href="([^"]+)"/,
    )?.[1];
    assert.ok(canonical, `${route}: canonical present`);
    assert.equal(
      new URL(canonical).href,
      new URL(route, "https://churchofchrist.mw").href,
      `${route}: canonical`,
    );
    assert.match(html, /Skip to content/);
    if (route === "/") {
      socialImage = html.match(/property="og:image" content="([^"]+)"/)?.[1];
      twitterImage = html.match(/name="twitter:image" content="([^"]+)"/)?.[1];
      assert.ok(socialImage, "Open Graph image metadata");
      assert.ok(twitterImage, "Twitter image metadata");
    }
    if (route === "/live") {
      assert.match(html, /Current broadcast/);
      assert.match(html, /Broadcast library/);
      assert.doesNotMatch(
        html,
        /<iframe[^>]+src="https:\/\/(?:www\.)?facebook/,
      );
      broadcastPath = html.match(/href="(\/streams\/[^"?]+)/)?.[1];
    }
    if (route === "/publications")
      documentPath = html.match(/href="(\/publications\/\d+)/)?.[1];
    if (route === "/prayer-request") {
      assert.match(html, /Prayer request/);
      assert.match(html, /method="post"/);
    }
    const libraryFeed = ["/live", "/publications"].includes(route)
      ? /(?:Broadcasts|Publications)\s+could not load/.test(
          html.replace(/<[^>]+>/g, " "),
        )
        ? "unavailable-recovery"
        : "responded"
      : undefined;
    checks.push({
      route,
      status: response.status,
      canonical: true,
      libraryFeed,
    });
    console.log(
      `${route}: 200, canonical and public landmarks${libraryFeed ? `, feed: ${libraryFeed}` : ""}`,
    );
  }
  const robots = await get("/robots.txt");
  assert.match(robots.html, /Disallow: \/dashboard/);
  assert.match(
    robots.html,
    /Sitemap: https:\/\/churchofchrist\.mw\/sitemap.xml/,
  );
  const sitemap = await get("/sitemap.xml");
  assert.equal(sitemap.response.status, 200);
  assert.equal((sitemap.html.match(/<loc>/g) || []).length, 12);
  assert.doesNotMatch(sitemap.html, /dashboard|login|register|127\.0\.0\.1/);
  checks.push(
    { route: "/robots.txt", status: robots.response.status },
    { route: "/sitemap.xml", status: sitemap.response.status },
  );
  const homeAlias = await fetch(origin + "/home", { redirect: "manual" });
  assert.ok([307, 308].includes(homeAlias.status));
  assert.equal(
    new URL(homeAlias.headers.get("location"), origin).pathname,
    "/",
  );
  checks.push({ route: "/home", status: homeAlias.status, homeAlias: true });
  for (const route of [
    "/login",
    "/register",
    "/set-password",
    "/reset-password",
    "/dashboard",
    "/dashboard/members",
    "/dashboard/users",
  ]) {
    const { response, html } = await get(route);
    assert.equal(response.status, 200, route);
    assert.match(html, /name="robots" content="noindex/);
    checks.push({ route, status: response.status, noIndex: true });
    console.log(`${route}: 200, indexing disabled`);
  }
  for (const route of [documentPath, broadcastPath].filter(Boolean)) {
    const { response, html } = await get(route);
    assert.equal(response.status, 200);
    assert.match(html, /<h1/);
    assert.match(html, /Share/);
    checks.push({ route, status: response.status, populatedDetail: true });
    console.log(`${route}: populated detail 200`);
  }
  for (const route of [
    "/streams/__validation_missing_record__",
    "/publications/9223372036854775807",
  ]) {
    const { response, html } = await get(route);
    assert.ok([200, 404].includes(response.status));
    assert.match(html, /name="robots" content="noindex/);
    assert.match(html, /Contact the church/);
    checks.push({ route, status: response.status, recovery: true });
  }
  await mkdir(path.join(root, ".next/validation"), { recursive: true });
  for (const [name, address] of [
    ["opengraph", socialImage],
    ["twitter", twitterImage],
  ]) {
    const url = new URL(address.replaceAll("&amp;", "&"));
    assert.equal(url.origin, "https://churchofchrist.mw");
    const response = await fetch(origin + url.pathname + url.search, {
      signal: AbortSignal.timeout(20000),
    });
    assert.equal(response.status, 200, `${name} image`);
    assert.match(response.headers.get("content-type"), /image\/png/);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.readUInt32BE(16), 1200);
    assert.equal(bytes.readUInt32BE(20), 630);
    if (name === "opengraph")
      await writeFile(
        path.join(root, ".next/validation/opengraph-image.png"),
        bytes,
      );
    checks.push({
      route: url.pathname,
      status: 200,
      image: name,
      bytes: bytes.length,
      width: 1200,
      height: 630,
    });
    console.log(`${name} image: 200, 1200 x 630, ${bytes.length} bytes`);
  }
  await writeFile(
    path.join(root, ".next/validation/http-results.json"),
    JSON.stringify({ checkedAt: new Date().toISOString(), checks }, null, 2) +
      "\n",
  );
  console.log(`Passed ${checks.length} read-only production HTTP checks.`);
} finally {
  stop();
  process.removeListener("SIGINT", stop);
  process.removeListener("SIGTERM", stop);
}
