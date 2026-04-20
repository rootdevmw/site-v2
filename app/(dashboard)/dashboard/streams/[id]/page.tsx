"use client";

import { useParams, useRouter } from "next/navigation";

import { useStream } from "@/app/modules/streams/hooks/useStream";
import { useSetLiveStream } from "@/app/modules/streams/hooks/useSetLiveStream";
import { Info } from "@/components/ui/Info";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";
import { showSuccess, showError } from "@/lib/toast";

export default function StreamDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const streamId = id as string;

  const { data, isLoading } = useStream(streamId);
  const { mutateAsync: setLiveStream, isPending: isSettingLive } =
    useSetLiveStream();

  const stream = data?.data;

  if (isLoading) {
    return <SpiritualLoader message="Loading stream..." />;
  }

  if (!stream) {
    return <div>Stream not found</div>;
  }

  const handleSetLive = async () => {
    try {
      await setLiveStream(stream.id);
      showSuccess("Stream is now live");
    } catch {
      showError("Failed to set stream live");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            {stream.title}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-[var(--text-secondary)]">
              Stream details
            </p>
            <span
              className={`px-2 py-1 text-xs rounded-md ${
                stream.isLive
                  ? "bg-green-500/10 text-green-400"
                  : "bg-yellow-500/10 text-yellow-400"
              }`}
            >
              {stream.isLive ? "Live" : "Scheduled"}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/dashboard/streams/${stream.id}/edit`)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black hover:bg-[var(--gold-dark)] transition-all duration-200"
          >
            Edit
          </button>

          {!stream.isLive && (
            <button
              onClick={handleSetLive}
              disabled={isSettingLive}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--card-elevated)] text-[var(--text-primary)] hover:bg-[var(--hover-soft)] disabled:opacity-50 transition-all duration-200"
            >
              {isSettingLive ? "Setting live..." : "Set live"}
            </button>
          )}

          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg text-sm bg-[var(--card-elevated)]"
          >
            Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6 space-y-4">
          <Info label="Status" value={stream.isLive ? "Live" : "Scheduled"} />
          <Info
            label="Starts At"
            value={
              stream.startsAt
                ? new Date(stream.startsAt).toLocaleString()
                : "TBD"
            }
          />
          <Info
            label="Created"
            value={new Date(stream.createdAt).toLocaleDateString()}
          />
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6 space-y-4">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Platforms</p>
            {stream.platforms.length > 0 ? (
              <div className="flex gap-2 mt-2 flex-wrap">
                {stream.platforms.map((platform) => (
                  <a
                    key={platform.id}
                    href={platform.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1 text-xs bg-[var(--main-gold)] border border-[var(--gold-dark)] text-black rounded-full hover:bg-[var(--gold-dark)] transition-all duration-200"
                  >
                    {platform.name}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm font-medium text-[var(--text-primary)]">
                -
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
