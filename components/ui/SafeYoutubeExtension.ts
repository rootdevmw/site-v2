"use client";

import { Node } from "@tiptap/core";

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

    const embedUrl = src.includes("youtube.com/embed/")
      ? src.split("&")[0]
      : src.includes("watch?v=")
        ? src.replace("watch?v=", "embed/").split("&")[0]
        : src.includes("youtu.be/")
          ? src.replace("youtu.be/", "www.youtube.com/embed/").split("?")[0]
          : src;

    const watchUrl = embedUrl.includes("/embed/")
      ? embedUrl.replace("/embed/", "/watch?v=")
      : src;

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
