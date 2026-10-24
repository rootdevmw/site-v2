import { cache } from "react";
import { PublicApiError } from "./client";
import { getPublicContentBySlug } from "./content";
import {
  publicMessageSchema,
  type PublicMessage,
} from "@/lib/utils/public-messages";

type MessageResult =
  | { state: "ready"; message: PublicMessage }
  | { state: "missing" }
  | { state: "unavailable" };

export const loadPublicMessage = cache(
  async (slug: string): Promise<MessageResult> => {
    try {
      const response = await getPublicContentBySlug(slug, {
        signal: AbortSignal.timeout(8000),
      });
      if (response.success === false) return { state: "unavailable" as const };
      const data: unknown = response.data;
      if (
        !data ||
        (typeof data === "object" &&
          "status" in data &&
          data.status === "Draft")
      )
        return { state: "missing" as const };
      const message = publicMessageSchema.parse(response.data);
      return { state: "ready" as const, message };
    } catch (error) {
      return {
        state:
          error instanceof PublicApiError && [404, 410].includes(error.status)
            ? ("missing" as const)
            : ("unavailable" as const),
      };
    }
  },
);
