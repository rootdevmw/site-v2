import { getLiveStream } from "./streams";
import {
  broadcastLinks,
  isBroadcastLive,
  parseBroadcast,
  type PublicBroadcast,
} from "@/lib/utils/public-library";

export type LiveSnapshot = {
  state: "live" | "offline" | "unavailable";
  broadcast: PublicBroadcast | null;
  checkedAt: number;
};
export const liveQueryKey = ["public-live-broadcast"] as const;
export const liveFreshnessMs = 65000;

export function resolveLiveSnapshot(
  value: LiveSnapshot,
  now: number,
): LiveSnapshot {
  if (
    !Number.isFinite(value.checkedAt) ||
    now - value.checkedAt >= liveFreshnessMs
  )
    return { ...value, state: "unavailable", broadcast: null };
  if (value.state !== "live") return { ...value, broadcast: null };
  if (
    !value.broadcast ||
    !isBroadcastLive(value.broadcast, now) ||
    !broadcastLinks(value.broadcast).length
  )
    return { ...value, state: "offline", broadcast: null };
  return value;
}

export async function readLiveSnapshot(): Promise<LiveSnapshot> {
  try {
    const response = await getLiveStream({ signal: AbortSignal.timeout(3500) });
    if (response.success === false) throw new Error("Live status unavailable");
    const broadcast = response.data ? parseBroadcast(response.data) : null;
    const checkedAt = Date.now();
    return resolveLiveSnapshot(
      { state: broadcast ? "live" : "offline", broadcast, checkedAt },
      checkedAt,
    );
  } catch {
    return { state: "unavailable", broadcast: null, checkedAt: Date.now() };
  }
}
