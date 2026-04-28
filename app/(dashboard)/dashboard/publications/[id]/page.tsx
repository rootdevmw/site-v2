"use client";

import { useParams, useRouter } from "next/navigation";
import { usePublication } from "@/app/modules/publications/hooks/usePublication";
import { useUpdatePublication } from "@/app/modules/publications/hooks/useUpdatePublication";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";
import { showSuccess, showError } from "@/lib/toast";
import { useEffect } from "react";
import {
  usePublishPublication,
  useUnpublishPublication,
} from "@/app/modules/publications/hooks/usePublishPublication";

export default function PublicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading } = usePublication(id);
  const { mutate: updatePublication, isPending } = useUpdatePublication();

  const publication = data?.data;
  const { mutate: publish, isPending: isPublishing } = usePublishPublication();

  const { mutate: unpublish, isPending: isUnpublishing } =
    useUnpublishPublication();

  if (isLoading) {
    return <SpiritualLoader message="Loading publication..." />;
  }

  if (!publication) {
    return <div>Publication not found</div>;
  }

  // robust check
  const isPublished =
    publication.publishedAt !== null && publication.publishedAt !== undefined;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            {publication.title}
          </h1>

          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-[var(--text-secondary)]">
              Publication Details
            </p>

            {/*  Status Badge */}
            <span
              className={`px-2 py-1 text-xs rounded-md ${
                isPublished
                  ? "bg-green-500/10 text-green-400"
                  : "bg-yellow-500/10 text-yellow-400"
              }`}
            >
              {isPublished ? "Published" : "Draft"}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          {/*  Edit */}
          <button
            onClick={() => router.push(`/dashboard/publications/${id}/edit`)}
            className="px-4 py-2 rounded-lg text-sm bg-[var(--card-elevated)] hover:bg-[var(--card-bg)]"
          >
            Edit
          </button>

          {/*  Publish / Unpublish */}
          {!isPublished ? (
            <button
              onClick={() =>
                publish(id, {
                  onSuccess: () => showSuccess("Published"),
                  onError: () => showError("Failed to publish"),
                })
              }
              disabled={isPublishing}
              className="px-4 py-2 rounded-lg bg-[var(--main-gold)] text-black"
            >
              {isPublishing ? "Publishing..." : "Publish"}
            </button>
          ) : (
            <button
              onClick={() =>
                unpublish(id, {
                  onSuccess: () => showSuccess("Unpublished"),
                  onError: () => showError("Failed to unpublish"),
                })
              }
              disabled={isUnpublishing}
              className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400"
            >
              {isUnpublishing ? "Unpublishing..." : "Unpublish"}
            </button>
          )}

          {/* Back */}
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg text-sm bg-[var(--card-elevated)]"
          >
            Back
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-[var(--card-bg)] border rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-xs text-[var(--text-secondary)]">
            Description
          </label>
          <p className="text-sm text-[var(--text-primary)]">
            {publication.description || "—"}
          </p>
        </div>

        <div>
          <label className="text-xs text-[var(--text-secondary)]">
            Published
          </label>
          <p className="text-sm text-[var(--text-primary)]">
            {publication.publishedAt
              ? new Date(publication.publishedAt).toLocaleString()
              : "Not published"}
          </p>
        </div>
      </div>

      {/* Preview */}
      {publication.fileUrl && (
        <div className="bg-[var(--card-bg)] border rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-medium text-[var(--text-primary)]">
            Preview
          </h2>

          <div className="flex gap-4">
            <a
              href={publication.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-lg bg-[var(--main-gold)] text-black"
            >
              Open in new tab
            </a>
          </div>

          <iframe
            src={publication.fileUrl}
            className="w-full h-[600px] rounded-lg border"
          />
        </div>
      )}
    </div>
  );
}
