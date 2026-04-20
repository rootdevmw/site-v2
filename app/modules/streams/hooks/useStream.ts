import { useQuery } from "@tanstack/react-query";
import { getStream } from "../api/getStream";
import { Stream } from "../types/stream.types";

export function useStream(id: string) {
  return useQuery({
    queryKey: ["stream", id],
    queryFn: () => getStream(id),
    enabled: !!id,
  });
}
