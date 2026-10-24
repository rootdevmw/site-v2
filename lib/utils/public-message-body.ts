import sanitizeHtml from "sanitize-html";
import { getWebUrl, getYouTubePreview } from "@/lib/utils/editorial-records";
import { publicScriptureReference } from "@/lib/utils/public-messages";

export type MessageMedia = {
  kind: "Audio" | "Video" | "YouTube";
  href: string;
};
function articleLink(value = "") {
  if (
    /^(?:mailto|tel):[^\s<>]+$/i.test(value) &&
    !/[\u0000-\u001f\u007f]/.test(value)
  )
    return value;
  return getWebUrl(value);
}
function videoSource(value: string) {
  const base = getYouTubePreview(value);
  if (!base) return null;
  const start = new URL(value).searchParams.get("start") || "";
  return (
    base +
    (/^\d+$/.test(start) &&
    Number.isSafeInteger(Number(start)) &&
    Number(start) > 0
      ? "?start=" + Number(start)
      : "")
  );
}

/** Restrict editor HTML on the server before it enters a public document. */
export function prepareMessageBody(body: string) {
  const media = new Map<string, MessageMedia>();
  const scriptures = new Map<string, { label: string; query: string }>();
  const html = sanitizeHtml(body, {
    allowedTags: [
      "p",
      "div",
      "span",
      "br",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "del",
      "blockquote",
      "ul",
      "ol",
      "li",
      "hr",
      "pre",
      "code",
      "a",
      "img",
      "figure",
      "figcaption",
      "audio",
      "video",
      "source",
      "iframe",
      "table",
      "thead",
      "tbody",
      "tfoot",
      "tr",
      "th",
      "td",
      "caption",
    ],
    allowedAttributes: {
      a: ["href", "title", "rel"],
      img: ["src", "alt", "width", "height", "loading", "decoding"],
      ol: ["start"],
      audio: ["src", "controls", "preload"],
      video: ["src", "controls", "preload", "playsinline"],
      source: ["src", "type"],
      iframe: [
        "src",
        "title",
        "loading",
        "allow",
        "allowfullscreen",
        "referrerpolicy",
      ],
      table: ["tabindex"],
      th: ["scope", "colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      img: ["http", "https"],
      iframe: ["https"],
      audio: ["http", "https"],
      video: ["http", "https"],
      source: ["http", "https"],
    },
    allowedIframeHostnames: ["www.youtube-nocookie.com"],
    allowIframeRelativeUrls: false,
    allowProtocolRelative: false,
    nonTextTags: [
      "script",
      "style",
      "textarea",
      "option",
      "noscript",
      "svg",
      "math",
      "template",
    ],
    nestingLimit: 60,
    transformTags: {
      h1: "h2",
      table: () => ({ tagName: "table", attribs: { tabindex: "0" } }),
      span: (_tag, attrs): sanitizeHtml.Tag => {
        if (!("data-scripture" in attrs))
          return { tagName: "span", attribs: {} };
        const reference = publicScriptureReference({
          book: attrs["data-book"] || attrs.book || "",
          chapter: Number(attrs["data-chapter"] || attrs.chapter),
          verseFrom: Number(attrs["data-verse-from"] || attrs.versefrom),
          verseTo: Number(attrs["data-verse-to"] || attrs.verseto),
        });
        if (!reference) return { tagName: "span", attribs: {} };
        scriptures.set(reference.label, reference);
        return {
          tagName: "a",
          attribs: { href: "#message-scriptures" },
          text: reference.label,
        };
      },
      a: (_tag, attrs) => {
        const href = articleLink(attrs.href);
        return {
          tagName: "a",
          attribs: {
            ...(href ? { href } : {}),
            ...(attrs.title ? { title: attrs.title } : {}),
            rel: "noopener noreferrer",
          },
        };
      },
      img: (_tag, attrs) => {
        const src = getWebUrl(attrs.src);
        const dimension = (name: string) =>
          /^[1-9]\d{0,4}$/.test(attrs[name] || "")
            ? { [name]: attrs[name] }
            : {};
        return {
          tagName: "img",
          attribs: {
            ...(src ? { src } : {}),
            alt: attrs.alt || "",
            loading: "lazy",
            decoding: "async",
            ...dimension("width"),
            ...dimension("height"),
          },
        };
      },
      iframe: (_tag, attrs): sanitizeHtml.Tag => {
        const src = videoSource(attrs.src || "");
        if (!src)
          return {
            tagName: "p",
            attribs: {},
            text: "This video is unavailable.",
          };
        const href =
          "https://www.youtube.com/watch?v=" +
          new URL(src).pathname.split("/").pop() +
          (new URL(src).search
            ? "&t=" + new URL(src).searchParams.get("start") + "s"
            : "");
        media.set(href, { kind: "YouTube", href });
        return {
          tagName: "iframe",
          attribs: {
            src,
            title: "YouTube video player",
            loading: "lazy",
            allow: "encrypted-media; picture-in-picture; fullscreen",
            allowfullscreen: "",
            referrerpolicy: "strict-origin-when-cross-origin",
          },
        };
      },
      "*": (tagName, attrs) => {
        if (!["audio", "video", "source"].includes(tagName))
          return { tagName, attribs: attrs };
        const src = getWebUrl(attrs.src);
        if (src && tagName !== "source")
          media.set(src, {
            kind: tagName === "audio" ? "Audio" : "Video",
            href: src,
          });
        return {
          tagName,
          attribs: {
            ...(src ? { src } : {}),
            ...(tagName !== "source"
              ? {
                  controls: "",
                  preload: "none",
                  ...(tagName === "video" ? { playsinline: "" } : {}),
                }
              : {}),
          },
        };
      },
    },
    exclusiveFilter: (frame) =>
      frame.tag === "a" && !frame.attribs.href
        ? "excludeTag"
        : frame.tag === "img" && !frame.attribs.src,
  });
  const text = sanitizeHtml(html, {
    allowedTags: ["p", "br", "h2", "h3", "h4", "li", "tr", "blockquote"],
    allowedAttributes: {},
    nonTextTags: ["iframe", "audio", "video", "script", "style"],
  })
    .replace(/<br\s*\/?>|<\/(?:p|h[2-6]|li|tr|blockquote)>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(
      /&(amp|lt|gt|quot|#39);/g,
      (entity) =>
        ({
          "&amp;": "&",
          "&lt;": "<",
          "&gt;": ">",
          "&quot;": '"',
          "&#39;": "'",
        })[entity] || entity,
    )
    .replace(/\s+/g, " ")
    .trim();
  return {
    html,
    text,
    hasContent: Boolean(text || /<(?:img|audio|video|iframe)\b/i.test(html)),
    media: [...media.values()],
    scriptures: [...scriptures.values()],
  };
}
export function messageExcerpt(text: string, length = 180) {
  if (text.length <= length) return text;
  const trimmed = text.slice(0, length).replace(/\s+\S*$/, "");
  return (trimmed || text.slice(0, length)) + "…";
}
