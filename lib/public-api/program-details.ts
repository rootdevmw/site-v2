import { cache } from "react";
import { PublicApiError } from "./client";
import { getPublicProgramBySlug } from "./programs";
import {
  parsePublicProgram,
  type PublicProgram,
} from "@/lib/utils/public-programs";
type ProgramResult =
  | { state: "ready"; program: PublicProgram; checkedAt: number }
  | { state: "missing" }
  | { state: "unavailable" };
export const loadPublicProgram = cache(
  async (address: string): Promise<ProgramResult> => {
    try {
      const result = await getPublicProgramBySlug(address, {
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
        program: parsePublicProgram(value),
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
