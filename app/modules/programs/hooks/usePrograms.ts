import { usePaginatedQuery } from "@/lib/hooks/usePaginatedQuery";
import { getPrograms } from "../api/getPrograms";
import { Program } from "../types/program.types";

export function usePrograms(params: {
  page?: number;
  limit?: number;
  date?: string;
  homecellId?: string;
}) {
  return usePaginatedQuery<Program>({
    queryKey: ["programs", params],
    queryFn: getPrograms,
    params,
  });
}
