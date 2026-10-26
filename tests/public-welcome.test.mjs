import assert from "node:assert/strict";
import { test } from "node:test";
import { PassThrough } from "node:stream";
import React from "react";
import { renderToPipeableStream, renderToStaticMarkup } from "react-dom/server";
import { sourceLoader } from "./helpers/load-source.mjs";

const { getPublicLeaders } = sourceLoader()("lib/utils/public-leadership.ts");
const { church, sundayServices, combinedService } =
  sourceLoader()("config/church.ts");
const member = {
  id: "7",
  firstName: " Test ",
  lastName: " Person ",
  imageUrl: "/uploads/leader.webp",
  bio: { id: "9", bio: "A published biography." },
  phone: "PRIVATE_PHONE",
  userId: "PRIVATE_USER",
  location: "PRIVATE_LOCATION",
  baptismDate: "PRIVATE_DATE",
};
const Image = ({ src, alt, width, height, onError }) =>
  React.createElement("img", {
    src: typeof src === "string" ? src : src.src,
    alt,
    width,
    height,
    onError,
  });
const Link = ({ children, ...props }) =>
  React.createElement("a", props, children);
const presentation = {
  "next/image": Image,
  "next/link": Link,
  "@/public/images/worship.webp": {
    src: "/images/worship.webp",
    width: 1600,
    height: 1067,
  },
  "@/public/images/welcome.webp": {
    src: "/images/welcome.webp",
    width: 1100,
    height: 733,
  },
};
const renderProfiles = async (data, extra = {}) => {
  const { LeadershipProfiles } = sourceLoader({
    ...presentation,
    "@/lib/public-api/members": {
      getPublicPastors: async () => ({ data, ...extra }),
    },
  })("components/public/LeadershipProfiles.tsx");
  return renderToStaticMarkup(await LeadershipProfiles());
};

test("public profile projection trims names, skips unusable duplicates and excludes member administration fields", () => {
  assert.deepEqual(
    getPublicLeaders([
      member,
      { ...member, firstName: "Duplicate" },
      null,
      { id: "8", firstName: " " },
      { id: 9, firstName: " One " },
    ]),
    [
      {
        id: "7",
        name: "Test Person",
        initials: "TP",
        imageUrl: "/uploads/leader.webp",
        bio: "A published biography.",
      },
      { id: "9", name: "One", initials: "O", imageUrl: null, bio: null },
    ],
  );
  assert.throws(() => getPublicLeaders({ data: [] }), /Invalid leadership/);
  assert.throws(
    () => getPublicLeaders([null, { firstName: "No identity" }]),
    /No readable/,
  );
  assert.deepEqual(getPublicLeaders([]), []);
});

test("rich-text biographies become readable words and paragraph breaks without inserting HTML", async () => {
  const bio =
    "<p>Prayer &amp; fellowship &#x1f64f;</p><p>Christ&rsquo;s love<br>Teaching &#39;hope&#39;</p><script>PRIVATE_SCRIPT</script><!--PRIVATE_COMMENT-->";
  const [person] = getPublicLeaders([{ ...member, bio: { bio } }]);
  assert.equal(
    person.bio,
    "Prayer & fellowship 🙏\nChrist’s love\nTeaching 'hope'",
  );
  assert.equal(
    getPublicLeaders([{ ...member, bio: { bio: "<p>&nbsp;</p>" } }])[0].bio,
    null,
  );
  const html = await renderProfiles([
    { ...member, bio: { bio: "&lt;img src=x onerror=alert(1)&gt;" } },
  ]);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(html, /<img src="x"|PRIVATE_SCRIPT|PRIVATE_COMMENT/);
});

test("leadership photos accept web and local media paths and reject executable, credentialed and malformed sources", () => {
  for (const imageUrl of [
    "javascript:alert(1)",
    "data:image/svg+xml,secret",
    "//external.test/a.jpg",
    "https://user:password@external.test/a.jpg",
    "https://external.test/\u0000a.jpg",
    "\\external.test\\a.jpg",
    "not a url",
  ])
    assert.equal(getPublicLeaders([{ ...member, imageUrl }])[0].imageUrl, null);
  for (const imageUrl of [
    "/uploads/photo.webp",
    "https://media.example.test/photo.webp",
    "http://localhost:3001/photo.webp",
  ])
    assert.equal(
      getPublicLeaders([{ ...member, imageUrl }])[0].imageUrl,
      imageUrl,
    );
});

test("public member transports preserve cancellation options for each leadership endpoint", async () => {
  const calls = [],
    options = { signal: new AbortController().signal };
  const api = sourceLoader({
    "./client": {
      publicApi: async (...args) => {
        calls.push(args);
        return { data: [] };
      },
    },
  })("lib/public-api/members.ts");
  await api.getPublicPastors(options);
  await api.getPublicElders(options);
  await api.getPublicMembersByPrefix("deacon", options);
  assert.deepEqual(
    calls.map(([path]) => path),
    ["/members/pastors", "/members/elders", "/members/DEACON"],
  );
  calls.forEach(([, received]) =>
    assert.equal(received.signal, options.signal),
  );
});

test("a failed shared leadership feed offers contact without disclosing request errors", async () => {
  const { LeadershipProfiles } = sourceLoader({
    ...presentation,
    "@/lib/public-api/members": {
      getPublicPastors: async ({ signal }) => {
        assert.ok(signal instanceof AbortSignal);
        throw new Error("PRIVATE_ERROR");
      },
    },
  })("components/public/LeadershipProfiles.tsx");
  const failed = renderToStaticMarkup(await LeadershipProfiles());
  assert.match(failed, /temporarily unavailable/);
  assert.match(failed, /href="\/contact"/);
  assert.doesNotMatch(failed, /PRIVATE_/);
  const populated = await renderProfiles([member]);
  assert.match(populated, /<ul/);
  assert.match(populated, /<h4[^>]*>Test Person<\/h4>/);
  assert.match(populated, /A published biography/);
});

test("unpublished leadership and malformed or unsuccessful responses have distinct useful fallbacks", async () => {
  assert.match(await renderProfiles([]), /have not been published/);
  for (const [data, extra] of [
    [null, {}],
    [{ records: [] }, {}],
    [[], { success: false }],
    [[{ id: "7" }], {}],
  ]) {
    const html = await renderProfiles(data, extra);
    assert.match(html, /temporarily unavailable/);
    assert.match(html, /href="\/contact"/);
    assert.doesNotMatch(html, /have not been published/);
  }
});

test("a missing or failed portrait shows initials and a new photo source can recover", () => {
  let state, imageProps;
  const { LeaderPortrait } = sourceLoader({
    react: {
      ...React,
      useState: () => [
        state,
        (value) => {
          state = value;
        },
      ],
    },
    "next/image": (props) => {
      imageProps = props;
      return Image(props);
    },
  })("components/public/LeaderPortrait.tsx");
  const render = (imageUrl) =>
    renderToStaticMarkup(
      React.createElement(LeaderPortrait, { imageUrl, initials: "TP" }),
    );
  assert.match(render(null), />TP<\/span>/);
  assert.match(render("/uploads/old.webp"), /<img/);
  assert.equal(imageProps.loading, "lazy");
  assert.equal(imageProps.unoptimized, true);
  imageProps.onError();
  assert.doesNotMatch(render("/uploads/old.webp"), /<img/);
  assert.match(render("/uploads/new.webp"), /src="\/uploads\/new.webp"/);
});

test("About streams its essential welcome and beliefs before stalled profiles resolve", async () => {
  let releasePastors;
  const pendingPastors = new Promise((resolve) => {
    releasePastors = resolve;
  });
  const Page = sourceLoader({
    ...presentation,
    "@/lib/public-api/members": {
      getPublicPastors: () => pendingPastors,
    },
  })("app/(public)/about/page.tsx").default;
  let html = "",
    stream;
  const destination = new PassThrough();
  destination.on("data", (chunk) => {
    html += chunk.toString();
  });
  const completed = new Promise((resolve, reject) => {
    destination.on("end", resolve);
    destination.on("error", reject);
  });
  await new Promise((resolve, reject) => {
    stream = renderToPipeableStream(React.createElement(Page), {
      onShellReady: () => {
        stream.pipe(destination);
        resolve();
      },
      onShellError: reject,
      onError: reject,
    });
  });
  try {
    assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
    assert.match(html, /href="\/plan-visit"/);
    assert.match(html, /Matthew 28:19/);
    assert.match(html, /immersion baptism for the forgiveness of sins/);
    assert.match(html, /The Lord’s Supper/);
    assert.doesNotMatch(html, /&amp;apos;|<main[ >]|PRIVATE_/);
  } finally {
    releasePastors({ data: [member] });
    await completed;
  }
  assert.match(html, /Test Person/);
  assert.doesNotMatch(html, /Our elders|Elder profiles/);
  assert.doesNotMatch(html, /PRIVATE_/);
});

test("Contact exposes direct church channels, directions, prayer and invitation-only access help", () => {
  const { default: Page } = sourceLoader(presentation)(
    "app/(public)/contact/page.tsx",
  );
  const html = renderToStaticMarkup(React.createElement(Page));
  for (const href of [
    church.phoneUrl,
    `mailto:${church.email}`,
    church.whatsappUrl,
    church.mapsUrl.replaceAll("&", "&amp;"),
    church.facebookUrl,
    church.youtubeUrl,
    church.tiktokUrl,
    "/plan-visit",
    "/prayer-request",
    "/ministries",
    "/homecells",
    "/login",
    "/login?mode=forgot",
    "/register",
  ])
    assert.ok(html.includes(`href="${href}"`), href);
  assert.match(html, /id="portal-help"/);
  assert.match(html, /accounts are arranged by the church team/);
  assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
  assert.doesNotMatch(html, /<form|<main[ >]|<iframe|IMGL\d+/);
});

test("About and Contact use the shared schedule, including service languages, local time and the combined Sunday exception", async () => {
  const altered = {
    ...sourceLoader()("config/church.ts"),
    sundayServices: [
      { language: "Fixture language", time: "6:45 AM", endTime: "8:45 AM" },
    ],
    combinedService: {
      time: "9:15 AM",
      note: "Fixture combined service at 9:15 AM.",
    },
  };
  for (const route of ["about", "contact"]) {
    const load = sourceLoader({
      ...presentation,
      "@/config/church": altered,
      "@/components/public/LeadershipProfiles": {
        LeadershipProfiles: () => null,
      },
    });
    const Page = load(`app/(public)/${route}/page.tsx`).default;
    const html = renderToStaticMarkup(React.createElement(Page));
    assert.match(html, /Fixture language service/);
    assert.match(html, /6:45 AM/);
    assert.match(html, /Fixture combined service at 9:15 AM/);
    assert.match(html, /All times are local to Malawi/);
  }
  const Times = sourceLoader()(
    "components/public/ServiceTimes.tsx",
  ).ServiceTimes;
  const html = renderToStaticMarkup(React.createElement(Times));
  sundayServices.forEach((service) => {
    assert.ok(html.includes(service.language));
    assert.ok(html.includes(service.time));
  });
  assert.ok(html.includes(combinedService.note));
});
