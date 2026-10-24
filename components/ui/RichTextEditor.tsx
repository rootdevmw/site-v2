"use client";

import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageResize from "tiptap-extension-resize-image";

import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
  useId,
} from "react";

import {
  FaBold,
  FaBook,
  FaImage,
  FaItalic,
  FaLink,
  FaListOl,
  FaListUl,
  FaMusic,
  FaStrikethrough,
  FaUnderline,
  FaYoutube,
} from "react-icons/fa";

import { useUploadMedia } from "@/app/modules/content/hooks/useUploadMedia";
import { showError } from "@/lib/toast";
import { FormField } from "./FormField";
import { SafeYoutube } from "./SafeYoutubeExtension";
import { Scripture } from "./ScriptureExtension";
import { NativeAudio, NativeVideo } from "./NativeMediaExtension";
import { Dialog } from "./Dialog";
import { getWebUrl, getYouTubePreview } from "@/lib/utils/editorial-records";

interface UploadState {
  fileName: string;
  progress: number; // 0–100
  type: "image" | "audio";
  status: "uploading" | "done" | "error";
}

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  id?: string;
  editorHeightClassName?: string;
  onBusyChange?: (busy: boolean) => void;
}

export const RichTextEditor = forwardRef<
  {
    getHTML: () => string | undefined;
    setContent: (content: string) => boolean | undefined;
  },
  RichTextEditorProps
>(
  (
    {
      value,
      onChange,
      label,
      error,
      disabled = false,
      id: suppliedId,
      editorHeightClassName = "h-[400px]",
      onBusyChange,
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = suppliedId || generatedId;
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const audioInputRef = useRef<HTMLInputElement | null>(null);
    const uploading = useRef(false);

    const { mutateAsync: uploadMedia } = useUploadMedia();

    const [uploadState, setUploadState] = useState<UploadState | null>(null);

    const [modal, setModal] = useState<null | "link" | "youtube" | "scripture">(
      null,
    );
    const [modalError, setModalError] = useState("");

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
        ImageResize.configure({ inline: false }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { class: "text-blue-600 underline" },
        }),
        SafeYoutube,
        Scripture,
        NativeAudio,
        NativeVideo,
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
      editorProps: {
        attributes: {
          id,
          role: "textbox",
          "aria-label": label || "Rich text",
          "aria-multiline": "true",
          "aria-invalid": String(!!error),
          "aria-describedby": error ? id + "-error" : "",
        },
      },
    });

    useEffect(() => {
      editor?.setEditable(!disabled);
    }, [editor, disabled]);
    useEffect(() => {
      editor?.setOptions({
        editorProps: {
          attributes: {
            id,
            role: "textbox",
            "aria-label": label || "Rich text",
            "aria-multiline": "true",
            "aria-invalid": String(!!error),
            "aria-describedby": error ? id + "-error" : "",
          },
        },
      });
    }, [editor, id, label, error]);

    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML(),
      setContent: (content: string) => editor?.commands.setContent(content),
    }));

    /**
     * Wraps any upload with simulated progress ticks so we always show
     * meaningful feedback even if the hook doesn't expose XHR progress.
     * Replace the simulation with real XHR progress events if your
     * useUploadMedia hook supports an onProgress callback.
     */
    const runWithProgress = useCallback(
      async (
        file: File,
        type: "image" | "audio",
        onSuccess: (url: string) => void,
      ) => {
        if (uploading.current || disabled) return;
        uploading.current = true;
        onBusyChange?.(true);
        setUploadState({
          fileName: file.name,
          progress: 0,
          type,
          status: "uploading",
        });

        try {
          const res = await uploadMedia({
            file,
            onProgress: (percent) => {
              setUploadState((prev) =>
                prev ? { ...prev, progress: percent } : prev,
              );
            },
          });

          setUploadState((prev) =>
            prev ? { ...prev, progress: 100, status: "done" } : prev,
          );
          onSuccess(res.url);
          setTimeout(() => setUploadState(null), 900);
        } catch {
          setUploadState((prev) =>
            prev ? { ...prev, status: "error" } : prev,
          );
          showError(`${type === "image" ? "Image" : "Audio"} upload failed`);
          setTimeout(() => setUploadState(null), 2000);
        } finally {
          uploading.current = false;
          onBusyChange?.(false);
        }
      },
      [uploadMedia, onBusyChange, disabled],
    );

    const handleImageSelect = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editor) return;
        await runWithProgress(file, "image", (url) => {
          editor.chain().focus().setImage({ src: url }).run();
        });
        if (imageInputRef.current) imageInputRef.current.value = "";
      },
      [editor, runWithProgress],
    );

    const handleAudioSelect = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editor) return;
        await runWithProgress(file, "audio", (url) => {
          editor
            .chain()
            .focus()
            .insertContent({ type: "audio", attrs: { src: url } })
            .run();
        });
        if (audioInputRef.current) audioInputRef.current.value = "";
      },
      [editor, runWithProgress],
    );

    const handleInsert = () => {
      if (!editor || disabled) return;
      try {
        if (modal === "link") {
          const url = getWebUrl(input.url);
          if (!url) {
            setModalError("Enter a complete http or https link.");
            return;
          }
          editor.chain().focus().setLink({ href: url }).run();
        }
        if (modal === "youtube") {
          const url = getYouTubePreview(input.url || "");
          if (!url) {
            setModalError("Enter a valid YouTube video link.");
            return;
          }
          editor
            .chain()
            .focus()
            .insertContent({
              type: "youtube",
              attrs: { src: url },
            })
            .run();
        }
        if (modal === "scripture") {
          if (
            !input.book?.trim() ||
            input.book.trim().length > 191 ||
            !Number.isInteger(input.chapter) ||
            !input.chapter ||
            input.chapter < 1 ||
            !Number.isInteger(input.verseFrom) ||
            !input.verseFrom ||
            input.verseFrom < 1 ||
            (input.verseTo !== undefined &&
              (!Number.isInteger(input.verseTo) ||
                input.verseTo < input.verseFrom))
          ) {
            setModalError(
              "Enter a book, positive whole chapter and verse numbers, and a last verse at or after the first.",
            );
            return;
          }
          editor.commands.setScripture({
            book: input.book.trim(),
            chapter: input.chapter,
            verseFrom: input.verseFrom,
            verseTo: input.verseTo,
          });
        }
        setModal(null);
        setInput({});
        setModalError("");
      } catch {
        setModalError(
          "The content could not be inserted. Your entries are kept.",
        );
      }
    };

    if (!editor) return null;

    const isUploading = uploadState?.status === "uploading";

    return (
      <FormField label={label || "Rich text"} error={error} htmlFor={id}>
        <div className="border border-[var(--border-soft)] rounded-lg overflow-hidden">
          {/* Hidden file inputs */}
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

          {/* Toolbar */}
          {(!disabled || isUploading) && (
            <div className="bg-[var(--card-elevated)] border-b">
              <fieldset
                disabled={disabled}
                className="p-2 flex flex-wrap gap-1"
              >
                <legend className="sr-only">
                  Message formatting and media controls
                </legend>
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
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                >
                  <FaListUl />
                </ToolbarButton>
                <ToolbarButton
                  title="Numbered List"
                  active={editor.isActive("orderedList")}
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                >
                  <FaListOl />
                </ToolbarButton>

                <Divider />

                <ToolbarButton
                  title={isUploading ? "Uploading…" : "Upload Image"}
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <FaImage />
                </ToolbarButton>
                <ToolbarButton
                  title={isUploading ? "Uploading…" : "Upload Audio"}
                  onClick={() => audioInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <FaMusic />
                </ToolbarButton>
                <ToolbarButton
                  title="Add Link"
                  onClick={() => {
                    setModalError("");
                    setModal("link");
                  }}
                >
                  <FaLink />
                </ToolbarButton>
                <ToolbarButton
                  title="Embed YouTube"
                  onClick={() => {
                    setModalError("");
                    setModal("youtube");
                  }}
                >
                  <FaYoutube />
                </ToolbarButton>
                <ToolbarButton
                  title="Add Scripture Reference"
                  onClick={() => {
                    if (!editor) return;
                    const { from, to } = editor.state.selection;
                    if (from !== to) {
                      const selected = editor.state.doc.textBetween(
                        from,
                        to,
                        " ",
                      );
                      const parsed = parseVerseRef(selected);
                      if (parsed) {
                        editor
                          .chain()
                          .focus()
                          .deleteSelection()
                          .setScripture(parsed)
                          .run();
                        return;
                      }
                    }
                    setModalError("");
                    setModal("scripture");
                  }}
                >
                  <FaBook />
                </ToolbarButton>
              </fieldset>

              {/* ── Upload progress bar ── */}
              {uploadState && (
                <div className="px-3 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[var(--text-secondary)] truncate max-w-[70%]">
                      {uploadState.status === "error"
                        ? "Upload failed"
                        : uploadState.status === "done"
                          ? "Upload complete"
                          : `Uploading ${uploadState.type === "image" ? "image" : "audio"}…`}
                    </span>
                    <span
                      className={`text-xs font-medium tabular-nums ${
                        uploadState.status === "error"
                          ? "text-red-500"
                          : uploadState.status === "done"
                            ? "text-green-600"
                            : "text-[var(--brand-link)]"
                      }`}
                    >
                      {uploadState.status === "error"
                        ? "✕"
                        : `${uploadState.progress}%`}
                    </span>
                  </div>

                  {/* Track */}
                  <div className="w-full h-1.5 rounded-full bg-[var(--border-soft)] overflow-hidden">
                    {/* Fill */}
                    <div
                      className={`h-full rounded-full transition-all duration-200 ease-out ${
                        uploadState.status === "error"
                          ? "bg-red-500"
                          : uploadState.status === "done"
                            ? "bg-green-500"
                            : "bg-[var(--brand-orange)]"
                      }`}
                      style={{ width: `${uploadState.progress}%` }}
                    />
                  </div>

                  {/* File name hint */}
                  <p className="mt-1 text-[10px] text-[var(--text-secondary)] truncate opacity-60">
                    {uploadState.fileName}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Editor */}
          <div
            onClick={() => editor.chain().focus().run()}
            className={
              editorHeightClassName +
              " flex flex-col bg-[var(--card-bg)] focus-within:ring-2 focus-within:ring-[var(--brand-focus)] cursor-text"
            }
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
                [&_.ProseMirror]:cursor-text"
            >
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        {modal && (
          <Dialog
            open
            onClose={() => {
              setModal(null);
              setModalError("");
            }}
            title={
              modal === "scripture"
                ? "Insert scripture reference"
                : modal === "youtube"
                  ? "Embed YouTube video"
                  : "Insert a link"
            }
          >
            <div
              className="space-y-4"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleInsert();
                }
              }}
            >
              {modalError && (
                <p role="alert" className="member-form-error">
                  {modalError}
                </p>
              )}
              {modal !== "scripture" ? (
                <div>
                  <label htmlFor={id + "-insert-url"}>Link URL</label>
                  <input
                    id={id + "-insert-url"}
                    className="record-input"
                    type="url"
                    value={input.url || ""}
                    onChange={(event) =>
                      setInput({ ...input, url: event.target.value })
                    }
                    disabled={disabled}
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor={id + "-insert-book"}>Book</label>
                    <input
                      id={id + "-insert-book"}
                      className="record-input"
                      value={input.book || ""}
                      maxLength={191}
                      onChange={(event) =>
                        setInput({ ...input, book: event.target.value })
                      }
                      disabled={disabled}
                    />
                  </div>
                  {(["chapter", "verseFrom", "verseTo"] as const).map(
                    (field) => (
                      <div key={field}>
                        <label htmlFor={id + "-insert-" + field}>
                          {field === "chapter"
                            ? "Chapter"
                            : field === "verseFrom"
                              ? "First verse"
                              : "Last verse (optional)"}
                        </label>
                        <input
                          id={id + "-insert-" + field}
                          className="record-input"
                          type="number"
                          min={1}
                          step={1}
                          value={input[field] ?? ""}
                          onChange={(event) =>
                            setInput({
                              ...input,
                              [field]:
                                event.target.value === ""
                                  ? undefined
                                  : Number(event.target.value),
                            })
                          }
                          disabled={disabled}
                        />
                      </div>
                    ),
                  )}
                </>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="record-button record-button-primary"
                  onClick={handleInsert}
                  disabled={disabled}
                >
                  Insert
                </button>
                <button
                  type="button"
                  className="record-button record-button-secondary"
                  onClick={() => {
                    setModal(null);
                    setModalError("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Dialog>
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
      aria-label={title}
      aria-pressed={active}
      className={`min-h-11 min-w-11 px-2 py-1 rounded text-sm flex items-center justify-center transition-colors
        ${active ? "bg-[var(--brand-gold)] text-[var(--brand-ink)]" : "hover:bg-[var(--hover-soft)]"}
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
    .match(
      /^((?:[1-3]\s+)?[A-Za-z]+(?:\s+[A-Za-z]+){0,3})\s+(\d+):(\d+)(?:-(\d+))?$/,
    );
  if (!m) return null;
  const chapter = Number(m[2]),
    verseFrom = Number(m[3]),
    verseTo = m[4] ? Number(m[4]) : undefined;
  if (
    [chapter, verseFrom, ...(verseTo === undefined ? [] : [verseTo])].some(
      (value) => !Number.isInteger(value) || value < 1 || value > 2147483647,
    ) ||
    (verseTo !== undefined && verseTo < verseFrom) ||
    m[1].trim().length > 191
  )
    return null;
  return {
    book: m[1].trim(),
    chapter: parseInt(m[2], 10),
    verseFrom: parseInt(m[3], 10),
    verseTo: m[4] ? parseInt(m[4], 10) : undefined,
  };
}

RichTextEditor.displayName = "RichTextEditor";
