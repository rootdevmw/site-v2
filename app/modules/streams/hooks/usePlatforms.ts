import { useQuery } from "@tanstack/react-query";
import { getPlatforms } from "../api/getPlatforms";
import { Platform } from "../types/stream.types";

export function usePlatforms() {
  return useQuery({
    queryKey: ["platforms"],
    queryFn: getPlatforms,
  });
}
