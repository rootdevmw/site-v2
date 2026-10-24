import { cache } from "react";
import { PublicApiError } from "./client";
import { getPublicMinistryBySlug } from "./ministries";
import { getPublicHomecellBySlug } from "./homecells";
import {
  parsePublicGroup,
  type PublicGroup,
  type PublicGroupKind,
} from "@/lib/utils/public-groups";
type GroupResult =
  | { state: "ready"; group: PublicGroup; checkedAt: number }
  | { state: "missing" }
  | { state: "unavailable" };
export const loadPublicGroup = cache(
  async (kind: PublicGroupKind, slug: string): Promise<GroupResult> => {
    try {
      const options = { signal: AbortSignal.timeout(8000) };
      const response = await (kind === "ministry"
        ? getPublicMinistryBySlug(slug, options)
        : getPublicHomecellBySlug(slug, options));
      if (response.success === false) return { state: "unavailable" };
      const value: unknown = response.data;
      if (
        !value ||
        (typeof value === "object" && "deletedAt" in value && value.deletedAt)
      )
        return { state: "missing" };
      return {
        state: "ready",
        group: parsePublicGroup(kind, value),
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
