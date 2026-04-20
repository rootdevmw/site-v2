"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useMemo } from "react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { SafeYoutube } from "./SafeYoutubeExtension";
import { Scripture } from "./ScriptureExtension";

interface ContentViewerProps {
  content: string;
}

export function ContentViewer({ content }: ContentViewerProps) {
  const extensions = useMemo(
    () => [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      SafeYoutube,
      Scripture,
    ],
    [],
  );

  const editor = useEditor({
    extensions,
    content: content,
    editable: false,
    immediatelyRender: false,
  });

  if (!editor) {
    return <div className="text-[var(--text-secondary)]">Loading...</div>;
  }

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <EditorContent editor={editor} />
    </div>
  );
}
