export type BroadcastWindow = {
  isLive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};

export function broadcastState(value: BroadcastWindow, now: number) {
  const start = value.startsAt ? Date.parse(value.startsAt) : NaN;
  const end = value.endsAt ? Date.parse(value.endsAt) : NaN;
  if (
    !Number.isFinite(now) ||
    (value.startsAt && !Number.isFinite(start)) ||
    (value.endsAt && !Number.isFinite(end)) ||
    (Number.isFinite(start) && Number.isFinite(end) && end <= start)
  )
    return "unavailable";
  if (end <= now) return "ended";
  if (start > now) return "scheduled";
  if (!value.isLive) return "offline";
  if (!Number.isFinite(start) || !Number.isFinite(end)) return "unavailable";
  return "live";
}
