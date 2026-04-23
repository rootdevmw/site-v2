"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useMemo,
} from "react";

import {
  FaBold,
  FaItalic,
  FaStrikethrough,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaImage,
  FaLink,
  FaYoutube,
  FaBook,
  FaMusic,
  FaVideo,
} from "react-icons/fa";

import { FormField } from "./FormField";
import { Scripture } from "./ScriptureExtension";
import { SafeYoutube } from "./SafeYoutubeExtension";
import { showError } from "@/lib/toast";
import { useUploadMedia } from "@/app/modules/content/hooks/useUploadMedia";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export const RichTextEditor = forwardRef<any, RichTextEditorProps>(
  ({ value, onChange, label, error, disabled = false }, ref) => {
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const audioInputRef = useRef<HTMLInputElement | null>(null);
    const videoInputRef = useRef<HTMLInputElement | null>(null);

    const { mutateAsync: uploadMedia, isPending: isUploading } =
      useUploadMedia();

    const [modal, setModal] = useState<null | "link" | "youtube" | "scripture">(
      null,
    );

    const [input, setInput] = useState<{
      url?: string;
      book?: string;
      chapter?: number;
      verseFrom?: number;
      verseTo?: number;
    }>({});

    const extensions = useMemo(
      () => [
        StarterKit.configure({ link: false }),
        Underline,
        Image.configure({
          HTMLAttributes: {
            class: "max-w-full h-auto rounded-lg",
          },
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "text-blue-600 underline",
          },
        }),
        SafeYoutube,
        Scripture,
      ],
      [],
    );

    const editor = useEditor({
      extensions,
      content: value || "",
      onUpdate: ({ editor }) => {
        onChange?.(editor.getHTML());
      },
      editable: !disabled,
      immediatelyRender: false,
    });

    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML(),
      setContent: (content: string) => editor?.commands.setContent(content),
    }));

    // IMAGE UPLOAD HANDLER
    const handleImageSelect = async (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      try {
        const res = await uploadMedia(file);
        editor.chain().focus().setImage({ src: res.url }).run();
      } catch {
        showError("Image upload failed");
      }

      // Reset input
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    };

    // AUDIO UPLOAD HANDLER
    const handleAudioSelect = async (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      try {
        const res = await uploadMedia(file);
        editor
          .chain()
          .focus()
          .insertContent(
            `<audio controls src="${res.url}" style="width: 100%;"></audio>`,
          )
          .run();
      } catch {
        showError("Audio upload failed");
      }

      // Reset input
      if (audioInputRef.current) {
        audioInputRef.current.value = "";
      }
    };

    // VIDEO UPLOAD HANDLER
    const handleVideoSelect = async (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      try {
        const res = await uploadMedia(file);
        editor
          .chain()
          .focus()
          .insertContent(
            `<video controls src="${res.url}" style="width: 100%; max-width: 640px;"></video>`,
          )
          .run();
      } catch {
        showError("Video upload failed");
      }

      // Reset input
      if (videoInputRef.current) {
        videoInputRef.current.value = "";
      }
    };

    const handleInsert = () => {
      if (!editor) return;

      try {
        if (modal === "link" && input.url) {
          editor.chain().focus().setLink({ href: input.url }).run();
        }

        if (modal === "youtube" && input.url) {
          const videoId = input.url.match(
            /(?:youtube\.com.*v=|youtu\.be\/)([^&\n?#]+)/,
          )?.[1];

          if (!videoId) {
            return showError("Invalid YouTube URL");
          }

          editor
            .chain()
            .focus()
            .insertContent({
              type: "youtube",
              attrs: {
                src: `https://www.youtube.com/embed/${videoId}`,
              },
            })
            .run();
        }

        if (
          modal === "scripture" &&
          input.book &&
          input.chapter &&
          input.verseFrom
        ) {
          editor.commands.setScripture({
            book: input.book,
            chapter: input.chapter,
            verseFrom: input.verseFrom,
            verseTo: input.verseTo,
          });
        }

        setModal(null);
        setInput({});
      } catch {
        showError("Failed to insert content");
      }
    };

    if (!editor) return null;

    return (
      <FormField label={label!} error={error}>
        <div className="border border-[var(--border-soft)] rounded-lg overflow-hidden">
          {/* File Inputs (Hidden) */}
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            className="hidden"
            onChange={handleImageSelect}
          />
          <input
            type="file"
            accept="audio/*"
            ref={audioInputRef}
            className="hidden"
            onChange={handleAudioSelect}
          />
          <input
            type="file"
            accept="video/*"
            ref={videoInputRef}
            className="hidden"
            onChange={handleVideoSelect}
          />

          {/* Toolbar */}
          {!disabled && (
            <div className="bg-[var(--card-elevated)] border-b p-2 flex flex-wrap gap-1">
              <ToolbarButton
                title="Bold (Ctrl+B)"
                active={editor.isActive("bold")}
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <FaBold />
              </ToolbarButton>

              <ToolbarButton
                title="Italic (Ctrl+I)"
                active={editor.isActive("italic")}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <FaItalic />
              </ToolbarButton>
              <ToolbarButton
                title="Underline (Ctrl+U)"
                active={editor.isActive("underline")}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
              >
                <FaUnderline />
              </ToolbarButton>
              <ToolbarButton
                title="Strikethrough"
                active={editor.isActive("strike")}
                onClick={() => editor.chain().focus().toggleStrike().run()}
              >
                <FaStrikethrough />
              </ToolbarButton>

              <Divider />

              <ToolbarButton
                title="Bullet List"
                active={editor.isActive("bulletList")}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                <FaListUl />
              </ToolbarButton>

              <ToolbarButton
                title="Numbered List"
                active={editor.isActive("orderedList")}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >
                <FaListOl />
              </ToolbarButton>

              <Divider />

              {/* IMAGE BUTTON */}
              <ToolbarButton
                title={isUploading ? "Uploading..." : "Upload Image"}
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploading}
              >
                <FaImage />
              </ToolbarButton>

              {/* AUDIO BUTTON */}
              <ToolbarButton
                title={isUploading ? "Uploading..." : "Upload Audio"}
                onClick={() => audioInputRef.current?.click()}
                disabled={isUploading}
              >
                <FaMusic />
              </ToolbarButton>

              {/* VIDEO BUTTON */}
              <ToolbarButton
                title={isUploading ? "Uploading..." : "Upload Video"}
                onClick={() => videoInputRef.current?.click()}
                disabled={isUploading}
              >
                <FaVideo />
              </ToolbarButton>

              <ToolbarButton title="Add Link" onClick={() => setModal("link")}>
                <FaLink />
              </ToolbarButton>

              <ToolbarButton
                title="Embed YouTube"
                onClick={() => setModal("youtube")}
              >
                <FaYoutube />
              </ToolbarButton>

              <ToolbarButton
                title="Add Scripture Reference"
                onClick={() => {
                  if (!editor) return;
                  const { from, to } = editor.state.selection;
                  if (from !== to) {
                    const selected = editor.state.doc.textBetween(from, to, " ");
                    const parsed = parseVerseRef(selected);
                    if (parsed) {
                      editor.chain().focus().deleteSelection().setScripture(parsed).run();
                      return;
                    }
                  }
                  setModal("scripture");
                }}
              >
                <FaBook />
              </ToolbarButton>
            </div>
          )}

          {/* Editor */}
          <div
            onClick={() => {
              if (!editor) return;
              editor.chain().focus().run();
            }}
            className="h-[400px] flex flex-col
              bg-[var(--card-bg)]
              focus-within:ring-2 focus-within:ring-[var(--main-gold)]
              cursor-text
            "
          >
            <div
              className="flex-1 overflow-y-auto p-4
              prose prose-sm max-w-none dark:prose-invert

              [&_.ProseMirror_ul]:list-disc
              [&_.ProseMirror_ul]:pl-5

              [&_.ProseMirror_ol]:list-decimal
              [&_.ProseMirror_ol]:pl-5

              [&_.ProseMirror_li]:my-1

              [&_.ProseMirror]:h-full
              [&_.ProseMirror]:min-h-full
              [&_.ProseMirror]:outline-none
              [&_.ProseMirror]:cursor-text
            "
            >
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        {/* Modal */}
        {modal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[var(--card-bg)] p-4 rounded-xl w-full max-w-md space-y-3">
              <h3 className="font-semibold capitalize">{modal}</h3>

              {modal !== "scripture" ? (
                <input
                  placeholder="Enter URL"
                  value={input.url || ""}
                  onChange={(e) => setInput({ ...input, url: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--card-elevated)]"
                />
              ) : (
                <>
                  <input
                    placeholder="Book"
                    onChange={(e) =>
                      setInput({ ...input, book: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[var(--card-elevated)]"
                  />
                  <input
                    type="number"
                    placeholder="Chapter"
                    onChange={(e) =>
                      setInput({
                        ...input,
                        chapter: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[var(--card-elevated)]"
                  />
                  <input
                    type="number"
                    placeholder="Verse From"
                    onChange={(e) =>
                      setInput({
                        ...input,
                        verseFrom: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[var(--card-elevated)]"
                  />
                  <input
                    type="number"
                    placeholder="Verse To (optional)"
                    onChange={(e) => {
                      const value = e.target.value;
                      setInput({
                        ...input,
                        verseTo: value === "" ? undefined : Number(value),
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--card-elevated)]"
                  />
                </>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setModal(null)}
                  className="text-sm text-[var(--text-secondary)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInsert}
                  className="bg-[var(--main-gold)] px-3 py-1 rounded text-sm text-black"
                >
                  Insert
                </button>
              </div>
            </div>
          </div>
        )}
      </FormField>
    );
  },
);

function ToolbarButton({
  children,
  onClick,
  active,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-2 py-1 rounded text-sm flex items-center justify-center transition-colors
        ${
          active
            ? "bg-[var(--main-gold)] text-black"
            : "hover:bg-[var(--hover-soft)]"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-[var(--border-soft)] mx-1" />;
}

function parseVerseRef(text: string) {
  const m = text
    .trim()
    .match(/^((?:[1-3]\s+)?[A-Za-z]+(?:\s+[A-Za-z]+){0,3})\s+(\d+):(\d+)(?:-(\d+))?$/);
  if (!m) return null;
  return {
    book: m[1].trim(),
    chapter: parseInt(m[2], 10),
    verseFrom: parseInt(m[3], 10),
    verseTo: m[4] ? parseInt(m[4], 10) : undefined,
  };
}

RichTextEditor.displayName = "RichTextEditor";
