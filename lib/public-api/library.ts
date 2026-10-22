import { cache } from "react";
import { PublicApiError } from "./client";
import { getLiveStream, getStreamBySlug } from "./streams";
import { getPublicPublication } from "./publications";
import {
  parseBroadcast,
  parseDocument,
  isBroadcastLive,
  type PublicBroadcast,
  type PublicDocument,
} from "@/lib/utils/public-library";
type Result<T> =
  | { state: "ready"; data: T; checkedAt: number }
  | { state: "missing" }
  | { state: "unavailable" };
export const loadLiveBroadcast = cache(
  async (): Promise<Result<PublicBroadcast | null>> => {
    try {
      const res = await getLiveStream({ signal: AbortSignal.timeout(3500) });
      if (res.success === false) throw new Error();
      const now = Date.now();
      const value = res.data ? parseBroadcast(res.data) : null;
      return {
        state: "ready",
        data: value && isBroadcastLive(value, now) ? value : null,
        checkedAt: now,
      };
    } catch {
      return { state: "unavailable" };
    }
  },
);
export const loadBroadcast = cache(
  async (address: string): Promise<Result<PublicBroadcast>> => {
    try {
      const res = await getStreamBySlug(address, {
        signal: AbortSignal.timeout(8000),
      });
      if (res.success === false) throw new Error();
      if (!res.data) return { state: "missing" };
      return {
        state: "ready",
        data: parseBroadcast(res.data),
        checkedAt: Date.now(),
      };
    } catch (error) {
      return {
        state:
          error instanceof PublicApiError && [404, 410].includes(error.status)
            ? "missing"
            : "unavailable",
      };
    }
  },
);
export const loadDocument = cache(
  async (address: string): Promise<Result<PublicDocument>> => {
    try {
      const res = await getPublicPublication(address, {
        signal: AbortSignal.timeout(8000),
      });
      if (res.success === false) throw new Error();
      if (!res.data) return { state: "missing" };
      return {
        state: "ready",
        data: parseDocument(res.data),
        checkedAt: Date.now(),
      };
    } catch (error) {
      return {
        state:
          error instanceof PublicApiError && [404, 410].includes(error.status)
            ? "missing"
            : "unavailable",
      };
    }
  },
);
