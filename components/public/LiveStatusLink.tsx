"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FiArrowUpRight } from "react-icons/fi";
import { getLiveStream } from "@/lib/public-api/streams";
import { parseBroadcast, isBroadcastLive } from "@/lib/utils/public-library";
type Status = "live" | "offline" | "unavailable";
export async function readLiveStatus(): Promise<Status> {
  try {
    const res = await getLiveStream({ signal: AbortSignal.timeout(3500) });
    if (res.success === false) throw new Error();
    return res.data && isBroadcastLive(parseBroadcast(res.data), Date.now())
      ? "live"
      : "offline";
  } catch {
    return "unavailable";
  }
}
export function LiveStatusLink({ initialStatus }: { initialStatus: Status }) {
  const { data } = useQuery({
    queryKey: ["public-live-status"],
    queryFn: readLiveStatus,
    initialData: initialStatus,
    staleTime: 20000,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: false,
  });
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
            : "No live broadcast. View scheduled and past broadcasts."
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
