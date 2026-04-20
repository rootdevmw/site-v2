import { usePaginatedQuery } from "@/lib/hooks/usePaginatedQuery";
import { getStreams, StreamFilters } from "../api/getStreams";
import { Stream } from "../types/stream.types";

export function useStreams(filters: StreamFilters) {
  return usePaginatedQuery<Stream>({
    queryKey: ["streams"],
    queryFn: getStreams,
    params: filters,
  });
}
