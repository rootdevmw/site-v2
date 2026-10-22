import { cache } from "react";
import { PublicApiError } from "./client";
import { getPublicEventBySlug } from "./events";
import { parsePublicEvent, type PublicEvent } from "@/lib/utils/public-events";
type EventResult =
  | { state: "ready"; event: PublicEvent; checkedAt: number }
  | { state: "missing" }
  | { state: "unavailable" };
export const loadPublicEvent = cache(
  async (address: string): Promise<EventResult> => {
    try {
      const result = await getPublicEventBySlug(address, {
        signal: AbortSignal.timeout(8000),
      });
      if (result.success === false) return { state: "unavailable" };
      const value: unknown = result.data;
      if (
        !value ||
        (typeof value === "object" && "deletedAt" in value && value.deletedAt)
      )
        return { state: "missing" };
      return {
        state: "ready",
        event: parsePublicEvent(value),
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
