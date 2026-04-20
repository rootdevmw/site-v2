"use client";

import { useParams, useRouter } from "next/navigation";
import { StreamForm } from "@/app/modules/streams/components/StreamForm";
import { useStream } from "@/app/modules/streams/hooks/useStream";
import { useDeleteStream } from "@/app/modules/streams/hooks/useDeleteStream";
import { showSuccess, showError } from "@/lib/toast";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";

export default function EditStreamPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, isLoading } = useStream(id as string);
  const { mutateAsync: deleteStream } = useDeleteStream();

  if (isLoading) return <SpiritualLoader message="Loading Stream details..." />;

  const stream = data?.data;

  // Transform stream data to match form values
  const formData = stream
    ? {
        ...stream,
        platformIds: stream.platforms?.map((p: any) => p.id) || [],
      }
    : undefined;

  const handleDelete = async () => {
    try {
      await deleteStream(id as string);
      showSuccess("Stream deleted successfully");
      router.push("/dashboard/streams");
    } catch {
      showError("Failed to delete stream");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Edit Stream
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Update stream details
        </p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6">
        <StreamForm
          mode="edit"
          initialData={formData}
          onSuccess={() => router.push("/dashboard/streams")}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
