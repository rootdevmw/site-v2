"use client";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import { readLiveSnapshot, type LiveSnapshot } from "@/lib/public-api/live";
import { useLiveBroadcast } from "@/lib/hooks/use-live-broadcast";
type Status = "live" | "offline" | "unavailable";
export async function readLiveStatus(): Promise<Status> {
  return (await readLiveSnapshot()).state;
}
export function LiveStatusLink({
  initialSnapshot,
}: {
  initialSnapshot: LiveSnapshot;
}) {
  const { state: data } = useLiveBroadcast(initialSnapshot);
  const live = data === "live";
  return (
    <Link
      href="/live"
      className={
        "public-text-link public-live-link " + (live ? "is-live" : "is-offline")
      }
      title={
        live
          ? "Join the current broadcast"
          : data === "unavailable"
            ? "Live status unavailable. View broadcasts and service information."
            : "No live broadcast. View live broadcast information."
      }
    >
      <span
        aria-hidden="true"
        className={
          "size-2 shrink-0 rounded-full " +
          (live ? "bg-red-700" : "bg-stone-400")
        }
      />
      {live
        ? "Live now"
        : data === "unavailable"
          ? "Live · Unavailable"
          : "Live · Off air"}
      <FiArrowUpRight aria-hidden="true" />
    </Link>
  );
}
