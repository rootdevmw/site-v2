import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { sourceLoader } from "./helpers/load-source.mjs";

const styles = {
  __esModule: true,
  default: new Proxy({}, { get: (_, key) => String(key) }),
};
const presentation = {
  "next/image": ({ src, alt, width, height, className }) =>
    React.createElement("img", { src, alt, width, height, className }),
  "./sail-2027.module.css": styles,
};
const load = sourceLoader(presentation);
const { sail2027 } = load("config/sail-2027.ts");

test("SAIL registration and payment details match the supplied flyer without inventing a venue", () => {
  assert.equal(sail2027.startDate, "2027-03-26");
  assert.equal(sail2027.endDate, "2027-03-28");
  assert.equal(sail2027.deadlineDate, "2026-12-31");
  assert.deepEqual(
    sail2027.fees.map(({ price, priceCurrency }) => [price, priceCurrency]),
    [
      [60000, "MWK"],
      [1000, "ZAR"],
    ],
  );
  assert.deepEqual(sail2027.bank, {
    name: "National Bank",
    branch: "Chichiri Branch",
    accountName: "Church of Christ",
    accountNumber: "667118",
    swiftCode: "NBMAMWMW",
  });
  assert.deepEqual(
    sail2027.mobileMoney.map(({ name, number }) => [name, number]),
    [
      ["Mpamba", "440282"],
      ["Airtel Money", "427549"],
    ],
  );
  assert.equal(sail2027.mobileMoneyName, "Ausbert Khembo");
  assert.equal(sail2027.paymentContact.href, "tel:+265888862744");
  assert.deepEqual(
    sail2027.enquiries.map(({ href }) => href),
    ["tel:+265999632002", "tel:+265888207552", "tel:+265884285834"],
  );
  assert.equal(sail2027.venue, undefined);
  const flyer = readFileSync(
    new URL("../public/sail-2027/registration-flyer.pdf", import.meta.url),
  );
  assert.equal(flyer.subarray(0, 5).toString(), "%PDF-");
  assert.equal(
    sail2027.registrationUrl,
    "https://script.google.com/macros/s/AKfycbzunhpPLTb0eeS9SEbKinFOhgF8V_oE_48ueH0qzq-yo2glc_h2eyKAltvOZDGIyp_u/exec",
  );
  const logo = readFileSync(
    new URL("../public/sail-2027/logo.jpeg", import.meta.url),
  );
  assert.equal(logo.subarray(0, 2).toString("hex"), "ffd8");
});

test("SAIL page has one H1, working section destinations and accessible registration, download and contact actions", () => {
  const { Sail2027Page } = load("components/public/sail-2027/Sail2027Page.tsx");
  const html = renderToStaticMarkup(React.createElement(Sail2027Page));
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g))
    assert.ok(ids.includes(id));
  for (const content of [
    "26–28 March 2027",
    "31 December 2026",
    "60,000",
    "1,000",
    "667118",
    "NBMAMWMW",
    "440282",
    "427549",
    "0888 862 744",
    "0999 632 002",
    "0888 207 552",
    "0884 285 834",
  ])
    assert.ok(html.includes(content), content);
  const registrations = [
    ...html.matchAll(/<a[^>]+href="https:\/\/script\.google\.com[^>]+>/g),
  ];
  assert.equal(registrations.length, 4);
  registrations.forEach(([anchor]) => {
    assert.match(anchor, /target="_blank"/);
    assert.match(anchor, /rel="noopener noreferrer"/);
  });
  assert.match(html, /alt="SAIL 2027/);
  assert.match(html, /download="SAIL-2027-registration-flyer.pdf"/);
  assert.match(html, /aria-label="Copy bank account number"/);
  assert.match(html, /lang="ny"/);
  assert.doesNotMatch(
    html,
    /<form|<iframe|MUST Campus|accommodation included|meals included/i,
  );
});

test("SAIL is discoverable in the Events menu and sitemap and has dedicated social metadata", () => {
  const navigation = load("config/public-navigation.ts").publicNavigation;
  assert.ok(
    navigation
      .find(({ href }) => href === "/events")
      .children.some(({ href }) => href === "/sail-2027"),
  );
  assert.ok(
    load("app/sitemap.ts")
      .default()
      .some(({ url }) => url === "https://churchofchrist.mw/sail-2027"),
  );
  const { metadata } = load("app/(public)/sail-2027/page.tsx");
  assert.equal(metadata.alternates.canonical, "/sail-2027");
  assert.equal(metadata.openGraph.images[0].url, sail2027.logo);
  assert.match(metadata.title.absolute, /SAIL 2027/);
});

test("payment copy buttons copy only the selected value and explain clipboard failures", async () => {
  const originalNavigator = Object.getOwnPropertyDescriptor(
    globalThis,
    "navigator",
  );
  let state = "idle",
    blocked = false;
  const copied = [];
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      clipboard: {
        writeText: async (value) => {
          if (blocked) throw new Error("unavailable");
          copied.push(value);
        },
      },
    },
  });
  try {
    const { SailCopyButton } = sourceLoader({
      ...presentation,
      react: {
        ...React,
        useState: () => [
          state,
          (value) => {
            state = value;
          },
        ],
      },
    })("components/public/sail-2027/SailCopyButton.tsx");
    const props = { label: "bank account number", value: "667118" };
    let tree = SailCopyButton(props);
    await tree.props.children[0].props.onClick();
    assert.deepEqual(copied, ["667118"]);
    assert.match(
      renderToStaticMarkup(SailCopyButton(props)),
      /bank account number copied/,
    );
    blocked = true;
    state = "idle";
    tree = SailCopyButton(props);
    await tree.props.children[0].props.onClick();
    assert.match(
      renderToStaticMarkup(SailCopyButton(props)),
      /Select the number or code to copy it/,
    );
    assert.deepEqual(copied, ["667118"]);
  } finally {
    if (originalNavigator)
      Object.defineProperty(globalThis, "navigator", originalNavigator);
    else delete globalThis.navigator;
  }
});
