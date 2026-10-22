"use client";
import { Node } from "@tiptap/core";
export function nativeMediaSource(value: unknown) {
  if (
    typeof value !== "string" ||
    /[\u0000-\u0020\u007f]/.test(value) ||
    (!/^https?:\/\//i.test(value) && !/^\/(?!\/)/.test(value))
  )
    return null;
  try {
    const url = new URL(value, "https://content.invalid");
    return ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? value
      : null;
  } catch {
    return null;
  }
}
function mediaNode(name: "audio" | "video") {
  return Node.create({
    name,
    group: "block",
    atom: true,
    draggable: true,
    addAttributes() {
      return { src: { default: null } };
    },
    parseHTML() {
      return [
        {
          tag: name,
          getAttrs: (element: HTMLElement) => {
            const src = nativeMediaSource(
              element.getAttribute("src") ||
                element.querySelector("source")?.getAttribute("src"),
            );
            return src ? { src } : false;
          },
        },
      ];
    },
    renderHTML({ HTMLAttributes }) {
      const src = nativeMediaSource(HTMLAttributes.src);
      return src
        ? [
            name,
            {
              src,
              controls: "",
              preload: "metadata",
              style: "width:100%;max-width:100%",
            },
          ]
        : ["p", {}, "Media source unavailable."];
    },
  });
}
export const NativeAudio = mediaNode("audio");
export const NativeVideo = mediaNode("video");
