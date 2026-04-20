import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ScriptureNodeView } from "./ScriptureNodeView";

export interface ScriptureOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    scripture: {
      setScripture: (attributes: {
        book: string;
        chapter: number;
        verseFrom: number;
        verseTo?: number;
      }) => ReturnType;
    };
  }
}

export const Scripture = Node.create<ScriptureOptions>({
  name: "scripture",

  group: "inline",

  inline: true,

  atom: true,

  addAttributes() {
    return {
      book: {
        default: "",
      },
      chapter: {
        default: 1,
      },
      verseFrom: {
        default: 1,
      },
      verseTo: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-scripture]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-scripture": true,
        "data-book": HTMLAttributes.book,
        "data-chapter": HTMLAttributes.chapter,
        "data-verse-from": HTMLAttributes.verseFrom,
        "data-verse-to": HTMLAttributes.verseTo || "",
        class:
          "scripture-reference text-[var(--main-gold)] font-semibold cursor-help hover:underline transition-all",
      }),
      `${HTMLAttributes.book} ${HTMLAttributes.chapter}:${HTMLAttributes.verseFrom}${HTMLAttributes.verseTo ? `-${HTMLAttributes.verseTo}` : ""}`,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ScriptureNodeView);
  },

  addCommands() {
    return {
      setScripture:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    };
  },
});
