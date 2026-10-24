"use client";

import { Node } from "@tiptap/core";
import { getYouTubePreview } from "@/lib/utils/editorial-records";

export const SafeYoutube = Node.create({
  name: "youtube",

  group: "block",

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      start: {
        default: 0,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "iframe[src*='youtube-nocookie.com']",
        getAttrs: (dom: HTMLElement) => ({ src: dom.getAttribute("src") }),
      },
      {
        tag: "div[data-youtube-video]",
        getAttrs: (dom: HTMLElement) => {
          const iframe = dom.querySelector("iframe");
          return {
            src: iframe?.getAttribute("src") || null,
          };
        },
      },
      {
        tag: "iframe[src*='youtube.com/embed/']",
        getAttrs: (dom: HTMLElement) => {
          const iframe = dom as HTMLIFrameElement;
          return {
            src: iframe.getAttribute("src") || null,
          };
        },
      },
      {
        tag: "iframe[src*='youtube.com']",
        getAttrs: (dom: HTMLElement) => {
          const iframe = dom as HTMLIFrameElement;
          return {
            src: iframe.getAttribute("src") || null,
          };
        },
      },
      {
        tag: "iframe[src*='youtu.be']",
        getAttrs: (dom: HTMLElement) => {
          const iframe = dom as HTMLIFrameElement;
          return {
            src: iframe.getAttribute("src") || null,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src } = HTMLAttributes;

    if (!src || typeof src !== "string") {
      return [
        "div",
        { class: "text-red-500 text-sm p-3 rounded-lg bg-[#fee2e2]" },
        "Invalid YouTube video",
      ];
    }

    let embedUrl = getYouTubePreview(src);
    if (!embedUrl) return ["p", {}, "Invalid YouTube video"];
    const start =
      new URL(src).searchParams.get("start") ||
      String(HTMLAttributes.start || "");
    if (
      /^\d+$/.test(start) &&
      Number.isSafeInteger(Number(start)) &&
      Number(start) > 0
    )
      embedUrl += "?start=" + Number(start);
    const watchUrl =
      "https://www.youtube.com/watch?v=" +
      new URL(embedUrl).pathname.split("/").pop();

    return [
      "div",
      {
        "data-youtube-video": "",
        class:
          "w-full rounded-lg overflow-hidden border border-[var(--border-soft)] bg-[var(--card-bg)]",
      },
      [
        "iframe",
        {
          src: embedUrl,
          width: "640",
          height: "360",
          frameborder: "0",
          allowfullscreen: "",
          class: "w-full aspect-video",
        },
      ],
      [
        "div",
        { class: "p-3 bg-[var(--card-elevated)] text-right" },
        [
          "a",
          {
            href: watchUrl,
            target: "_blank",
            rel: "noreferrer noopener",
            class:
              "inline-flex items-center rounded bg-[#ff0000] px-3 py-1 text-xs font-semibold text-white hover:bg-[#d60000]",
          },
          "Watch on YouTube",
        ],
      ],
    ];
  },
});
