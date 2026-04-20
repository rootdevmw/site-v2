import { useQuery } from "@tanstack/react-query";
import { getEventTypes } from "../api/getEventTypes";
import { EventType } from "../types/event.types";

export function useEventTypes() {
  return useQuery({
    queryKey: ["eventTypes"],
    queryFn: getEventTypes,
  });
}
