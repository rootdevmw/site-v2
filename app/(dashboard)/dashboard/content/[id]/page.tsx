"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useContent } from "@/app/modules/content/hooks/useContent";
import { usePublishContent } from "@/app/modules/content/hooks/usePublishContent";
import { Info } from "@/components/ui/Info";
import { ContentViewer } from "@/components/ui/ContentViewer";
import { showSuccess, showError } from "@/lib/toast";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";

export default function ContentDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, isLoading } = useContent(id as string);
  const { mutateAsync: publishContent, isPending: isPublishing } =
    usePublishContent();

  const content = data?.data;
  const [isPreview, setIsPreview] = useState(true);

  if (isLoading || !content)
    return <SpiritualLoader message="Loading content..." />;

  const handlePublish = async () => {
    if (!content) return;

    const newStatus = content.status === "Draft" ? "Published" : "Draft";

    try {
      await publishContent({ id: content.id, status: newStatus });
      showSuccess(`Content ${newStatus.toLowerCase()} successfully`);
    } catch {
      showError(`Failed to ${newStatus.toLowerCase()} content`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            {content.title}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {content.type?.name}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/dashboard/content/${content.id}/edit`)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black hover:bg-[var(--gold-dark)] transition-all duration-200"
          >
            Edit
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--card-elevated)] text-[var(--text-primary)] hover:bg-[var(--hover-soft)] disabled:opacity-50 transition-all duration-200"
          >
            {isPublishing
              ? "Publishing..."
              : content.status === "Draft"
                ? "Publish"
                : "Unpublish"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Content
          </h2>
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="px-3 py-1 text-sm text-[var(--main-gold)] hover:underline"
          >
            {isPreview ? "Raw" : "Preview"}
          </button>
        </div>
        {isPreview ? (
          <ContentViewer content={content.body} />
        ) : (
          <p className="text-[var(--text-primary)] whitespace-pre-wrap">
            {content.body}
          </p>
        )}
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6 space-y-4">
          <Info
            label="Author"
            value={`${content.author?.firstName} ${content.author?.lastName}`}
          />
          <Info label="Status" value={content.status} />
          <Info
            label="Created"
            value={new Date(content.createdAt).toLocaleDateString()}
          />
        </div>

        {/* Right */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6 space-y-4">
          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Tags</p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {content.tags.map((tag: any, index: number) => (
                  <span
                    key={tag.id ?? index}
                    className="px-2 py-1 text-xs bg-[var(--main-gold)] text-black rounded-full"
                  >
                    {tag.tag?.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Scriptures */}
          {content.scriptures && content.scriptures.length > 0 && (
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Scriptures</p>
              <div className="space-y-1 mt-2">
                {content.scriptures.map((scripture: any, index: number) => (
                  <p key={index} className="text-sm text-[var(--text-primary)]">
                    {scripture.book} {scripture.chapter}:{scripture.verseFrom}
                    {scripture.verseTo && `-${scripture.verseTo}`}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
