import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { sourceLoader } from "./helpers/load-source.mjs";

const Link = ({ children, ...props }) =>
  React.createElement("a", props, children);
const Image = ({ src, alt, width, height, className }) =>
  React.createElement("img", {
    src: typeof src === "string" ? src : src.src,
    alt,
    width,
    height,
    className,
  });
const presentation = { "next/link": Link, "next/image": Image };
const { aboutSections, publicNavigation } = sourceLoader()(
  "config/public-navigation.ts",
);
const { getPublicLeaders } = sourceLoader()("lib/utils/public-leadership.ts");
const person = {
  id: "7",
  name: "Test Person",
  initials: "TP",
  imageUrl: null,
  bio: "A published biography.",
};

function nodes(tree) {
  if (!tree || typeof tree !== "object") return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
}

function stateful(file, name, props, overrides = {}) {
  let state = false,
    tree;
  const Component = sourceLoader({
    ...presentation,
    react: {
      ...React,
      useState: () => [
        state,
        (value) => {
          state = value;
        },
      ],
      useRef: () => ({ current: null }),
      useEffect: () => {},
    },
    ...overrides,
  })(file)[name];
  return {
    render() {
      tree = Component(props);
      return renderToStaticMarkup(tree);
    },
    find(predicate) {
      const node = nodes(tree).find(predicate);
      assert.ok(node, "Expected control was rendered");
      return node;
    },
  };
}

test("About dropdown and page navigation share real, unique, focusable section destinations", () => {
  const Page = sourceLoader({
    ...presentation,
    "@/public/images/worship.webp": {
      src: "/images/worship.webp",
      width: 1600,
      height: 1067,
    },
    "@/components/public/LeadershipProfiles": {
      LeadershipProfiles: () => null,
    },
  })("app/(public)/about/page.tsx").default;
  const html = renderToStaticMarkup(React.createElement(Page));
  const about = publicNavigation.find((item) => item.href === "/about");
  assert.equal(about.label, "About us");
  assert.deepEqual(about.children, [
    { label: "About our church", href: "/about" },
    ...aboutSections,
  ]);
  for (const { href } of aboutSections) {
    const id = href.split("#")[1];
    assert.equal(
      (html.match(new RegExp(`id="${id}"`, "g")) ?? []).length,
      1,
      href,
    );
    assert.match(html, new RegExp(`<section[^>]*id="${id}"[^>]*tabindex="-1"`));
    assert.ok(html.includes(`href="#${id}"`), href);
  }
  assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
});

test("desktop and mobile About menus expose all section links without marking every anchor as the current page", () => {
  const Header = sourceLoader({
    ...presentation,
    "next/navigation": { usePathname: () => "/about" },
  })("components/public/PublicHeader.tsx").PublicHeader;
  const html = renderToStaticMarkup(
    React.createElement(Header, { watchLink: null }),
  );
  for (const label of ["Main navigation", "Mobile website navigation"]) {
    const nav = html.match(
      new RegExp(`<nav[^>]*aria-label="${label}"[\\s\\S]*?</nav>`),
    )?.[0];
    assert.ok(nav);
    assert.match(nav, /<details[\s\S]*?<summary[^>]*>About us/);
    for (const { href } of aboutSections) {
      assert.ok(nav.includes(`href="${href}"`), href);
      assert.doesNotMatch(
        nav,
        new RegExp(`<a[^>]*href="${href}"[^>]*aria-current="page"`),
      );
    }
    assert.equal((nav.match(/aria-current="page"/g) ?? []).length, 1);
    assert.match(nav, /href="\/about" aria-current="page"/);
  }
});

test("same-page dropdown selection closes desktop details and mobile selection closes the drawer", () => {
  const view = stateful(
    "components/public/PublicHeader.tsx",
    "PublicHeader",
    { watchLink: null },
    {
      "next/navigation": { usePathname: () => "/about" },
      "@/components/ui/Dialog": {
        Dialog: ({ children }) => React.createElement("div", null, children),
      },
    },
  );
  view.render();
  const destination = "/about#our-pastors";
  const desktopLink = view.find((node) => node.props?.href === destination);
  let closed = false;
  desktopLink.props.onClick({
    currentTarget: {
      closest: (selector) => {
        assert.equal(selector, "details");
        return {
          removeAttribute: (name) => {
            assert.equal(name, "open");
            closed = true;
          },
        };
      },
    },
  });
  assert.ok(closed);
  view
    .find((node) => node.props?.["aria-label"] === "Open website navigation")
    .props.onClick();
  view.render();
  assert.equal(
    view.find((node) => node.props?.title === "Explore our church").props.open,
    true,
  );
  const mobileNav = view.find(
    (node) => node.props?.["aria-label"] === "Mobile website navigation",
  );
  nodes(mobileNav)
    .find((node) => node.props?.href === destination)
    .props.onClick();
  view.render();
  assert.equal(
    view.find((node) => node.props?.title === "Explore our church").props.open,
    false,
  );
});

const portrait = {
  LeaderPortrait: ({ initials }) => React.createElement("span", null, initials),
};
const dialog = {
  Dialog: ({ open, title, children }) =>
    open
      ? React.createElement(
          "dialog",
          { open: true, "aria-label": title },
          children,
        )
      : null,
};

test("Read biography opens the complete saved biography while the card keeps a short preview", () => {
  const bio =
    "Serving the church in prayer and teaching. ".repeat(20) +
    "\n\nFULL_BIO_END";
  const view = stateful(
    "components/public/LeadershipProfileCard.tsx",
    "LeadershipProfileCard",
    {
      person: { ...person, bio },
      role: "Pastor",
      featured: true,
    },
    { "./LeaderPortrait": portrait, "@/components/ui/Dialog": dialog },
  );
  const initial = view.render();
  assert.match(initial, /Serving the church/);
  assert.doesNotMatch(initial, /FULL_BIO_END|<dialog/);
  const button = view.find(
    (node) => node.props?.["aria-label"] === "Read biography of Test Person",
  );
  assert.equal(button.props["aria-haspopup"], "dialog");
  assert.equal(button.props["aria-expanded"], false);
  button.props.onClick();
  const opened = view.render();
  assert.match(opened, /<dialog[^>]*aria-label="Test Person"/);
  assert.match(opened, /FULL_BIO_END/);
  assert.match(
    opened,
    /role="region" tabindex="0" aria-label="Biography of Test Person"/,
  );
  assert.ok(opened.includes(bio));
  assert.match(opened, /href="\/contact"/);
  const modal = view.find((node) => node.props?.title === person.name);
  assert.equal(modal.props.size, "wide");
  modal.props.onClose();
  assert.doesNotMatch(view.render(), /FULL_BIO_END|<dialog/);
});

test("missing biographies offer a real contact path and never create an empty biography dialog", () => {
  const Card = sourceLoader({
    ...presentation,
    "./LeaderPortrait": portrait,
    "@/components/ui/Dialog": dialog,
  })("components/public/LeadershipProfileCard.tsx").LeadershipProfileCard;
  const html = renderToStaticMarkup(
    React.createElement(Card, {
      person: { ...person, bio: null },
      role: "Elder",
    }),
  );
  assert.match(html, /Biography not yet published/);
  assert.match(html, /href="\/contact"/);
  assert.doesNotMatch(html, /Read biography|<button|<dialog/);
});

test("client biography cards receive only public profile fields and keep encoded HTML inert when opened", async () => {
  const raw = {
    id: "7",
    firstName: "Test",
    lastName: "Person",
    bio: {
      bio: "<p>Welcome &lt;img src=x onerror=alert(1)&gt;</p><script>PRIVATE_SCRIPT</script>",
    },
    phone: "PRIVATE_PHONE",
    email: "PRIVATE_EMAIL",
    user: { password: "PRIVATE_HASH" },
  };
  let received;
  const Profiles = sourceLoader({
    "@/lib/public-api/members": {
      getPublicPastors: async () => ({ data: [raw] }),
    },
    "./LeadershipProfileCard": {
      LeadershipProfileCard: ({ person }) => {
        received = person;
        return null;
      },
    },
  })("components/public/LeadershipProfiles.tsx").LeadershipProfiles;
  renderToStaticMarkup(await Profiles({ role: "Pastor" }));
  assert.deepEqual(received, getPublicLeaders([raw])[0]);
  assert.deepEqual(Object.keys(received).sort(), [
    "bio",
    "id",
    "imageUrl",
    "initials",
    "name",
  ]);
  const view = stateful(
    "components/public/LeadershipProfileCard.tsx",
    "LeadershipProfileCard",
    { person: received, role: "Pastor" },
    {
      "./LeaderPortrait": portrait,
      "@/components/ui/Dialog": dialog,
    },
  );
  view.render();
  view
    .find((node) => node.props?.["aria-haspopup"] === "dialog")
    .props.onClick();
  const html = view.render();
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(html, /<img|PRIVATE_|<script/);
});
