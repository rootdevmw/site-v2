"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  liveFreshnessMs,
  liveQueryKey,
  readLiveSnapshot,
  resolveLiveSnapshot,
  type LiveSnapshot,
} from "@/lib/public-api/live";

export function useLiveBroadcast(initialSnapshot: LiveSnapshot) {
  const { data } = useQuery({
    queryKey: liveQueryKey,
    queryFn: readLiveSnapshot,
    initialData: initialSnapshot,
    initialDataUpdatedAt: initialSnapshot.checkedAt,
    staleTime: 10000,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: "always",
    retry: false,
  });
  const [clock, setClock] = useState(initialSnapshot.checkedAt);
  useEffect(() => {
    const expiry = data.broadcast?.endsAt
      ? Date.parse(data.broadcast.endsAt)
      : Infinity;
    const deadline = Math.min(data.checkedAt + liveFreshnessMs, expiry);
    const timer = setTimeout(
      () => setClock(Date.now()),
      Math.max(0, deadline - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [data]);
  return resolveLiveSnapshot(data, Math.max(clock, data.checkedAt));
}
